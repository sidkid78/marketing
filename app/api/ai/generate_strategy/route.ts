import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * Resolve the Gemini key at request time, not module load.
 *
 * Constructing the client at module scope with an empty key made this route
 * fail when the module was first imported, which surfaced as an opaque
 * "API key not set" with no indication of which key or which route.
 */
function getClient() {
    const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        '';

    if (!apiKey) {
        throw new Error(
            'Gemini API key is not set. Add GEMINI_API_KEY (server-side) or ' +
            'NEXT_PUBLIC_GEMINI_API_KEY to frontend/.env.local and restart the dev server.'
        );
    }

    return new GoogleGenAI({ apiKey });
}

// Plain JSON Schema, as expected by the Interactions API `response_format`.
const campaignStrategySchema = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Campaign name (concise, descriptive)' },
        objective: {
            type: 'string',
            enum: ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'app_installs', 'video_views']
        },
        targetAudience: {
            type: 'object',
            properties: {
                demographics: { type: 'string', description: 'Age range and gender description' },
                interests: { type: 'array', items: { type: 'string' } },
                behaviors: { type: 'array', items: { type: 'string' } },
            },
            required: ['demographics', 'interests', 'behaviors'],
        },
        channels: { type: 'array', items: { type: 'string' } },
        budget: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                allocation: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                },
            },
            required: ['total', 'allocation'],
        },
        messaging: {
            type: 'object',
            properties: {
                headlines: { type: 'array', items: { type: 'string' } },
                bodyCopy: { type: 'array', items: { type: 'string' } },
                callToActions: { type: 'array', items: { type: 'string' } },
            },
            required: ['headlines', 'bodyCopy', 'callToActions'],
        },
        timeline: {
            type: 'object',
            properties: {
                duration: { type: 'string' },
                phases: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            duration: { type: 'string' },
                        },
                        required: ['name', 'duration'],
                    },
                },
            },
            required: ['duration', 'phases'],
        },
    },
    required: ['name', 'objective', 'targetAudience', 'channels', 'budget', 'messaging', 'timeline'],
};

/**
 * Shape returned by the `parse` action. Mirrors the `ParsedStrategy` interface
 * in ad-campaigns/components/AIStrategyImport.tsx exactly - if you change one,
 * change the other.
 */
const parsedStrategySchema = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Campaign name (concise, descriptive)' },
        objective: {
            type: 'string',
            enum: ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'app_installs', 'video_views', 'catalog_sales'],
        },
        targetAudience: { type: 'string', description: 'One-line description of the target audience' },
        budget: {
            type: 'object',
            properties: {
                amount: { type: 'number' },
                type: { type: 'string', enum: ['daily', 'lifetime'] },
            },
            required: ['amount', 'type'],
        },
        platforms: {
            type: 'array',
            items: { type: 'string', enum: ['twitter', 'meta', 'google', 'linkedin', 'tiktok'] },
        },
        headlines: { type: 'array', items: { type: 'string' } },
        adCopy: { type: 'array', items: { type: 'string' } },
        keywords: { type: 'array', items: { type: 'string' } },
    },
    required: ['name', 'objective', 'targetAudience', 'budget', 'platforms', 'headlines', 'adCopy', 'keywords'],
};

export async function POST(request: NextRequest) {
    try {
        const { action, content, prompt, platforms } = await request.json();
        const client = getClient();

        // `parse` takes an existing strategy document (pasted from the marketing
        // agent or written by hand) and normalises it into ParsedStrategy.
        // `generate` (the default) writes a new strategy from a prompt.
        if (action === 'parse') {
            if (!content?.trim()) {
                return NextResponse.json(
                    { success: false, error: 'Strategy content is required' },
                    { status: 400 }
                );
            }

            const parseInteraction = await client.interactions.create({
                model: 'gemini-3.6-flash',
                input: content,
                system_instruction:
                    'You are a digital advertising strategist. Extract a structured ad campaign ' +
                    'configuration from the marketing strategy the user provides. Use only the ' +
                    'platforms twitter, meta, google, linkedin, tiktok. If the strategy does not ' +
                    'state a budget, default to 50 daily. Preserve the original headline and ' +
                    'ad copy wording wherever the strategy supplies it.',
                response_format: {
                    type: 'text',
                    mime_type: 'application/json',
                    schema: parsedStrategySchema,
                },
                store: false,
            });

            const parsed = JSON.parse(parseInteraction.output_text ?? '{}');

            // AIStrategyImport reads these fields flat off the response body.
            return NextResponse.json({ success: true, ...parsed });
        }

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `You are an expert digital marketing strategist. Generate a comprehensive marketing campaign strategy based on the user's request.

Available advertising platforms: ${platforms?.join(', ') || 'Twitter, Meta, Google Ads, LinkedIn, TikTok, Instagram'}

Make the strategy specific to the user's product/service and target audience. Be creative with headlines and copy.`;

        const interaction = await client.interactions.create({
            model: 'gemini-3.6-flash',
            input: `User request: ${prompt}`,
            system_instruction: systemPrompt,
            response_format: {
                type: 'text',
                mime_type: 'application/json',
                schema: campaignStrategySchema,
            },
            store: false,
        });

        const responseText = interaction.output_text ?? '';
        const strategy = JSON.parse(responseText);

        return NextResponse.json({
            success: true,
            ...strategy,
        });

    } catch (error) {
        console.error('Strategy generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate strategy'
            },
            { status: 500 }
        );
    }
}