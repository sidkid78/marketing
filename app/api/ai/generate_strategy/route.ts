import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Define schema using SDK's Type enum
const campaignStrategySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Campaign name (concise, descriptive)' },
        objective: {
            type: Type.STRING,
            enum: ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'app_installs', 'video_views']
        },
        targetAudience: {
            type: Type.OBJECT,
            properties: {
                demographics: { type: Type.STRING, description: 'Age range and gender description' },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                behaviors: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['demographics', 'interests', 'behaviors'],
        },
        channels: { type: Type.ARRAY, items: { type: Type.STRING } },
        budget: {
            type: Type.OBJECT,
            properties: {
                total: { type: Type.NUMBER },
                allocation: {
                    type: Type.OBJECT,
                    additionalProperties: { type: Type.NUMBER },
                },
            },
            required: ['total', 'allocation'],
        },
        messaging: {
            type: Type.OBJECT,
            properties: {
                headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                bodyCopy: { type: Type.ARRAY, items: { type: Type.STRING } },
                callToActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['headlines', 'bodyCopy', 'callToActions'],
        },
        timeline: {
            type: Type.OBJECT,
            properties: {
                duration: { type: Type.STRING },
                phases: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            duration: { type: Type.STRING },
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

export async function POST(request: NextRequest) {
    try {
        const { prompt, platforms } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `You are an expert digital marketing strategist. Generate a comprehensive marketing campaign strategy based on the user's request.

Available advertising platforms: ${platforms?.join(', ') || 'Twitter, Meta, Google Ads, LinkedIn, TikTok, Instagram'}

Make the strategy specific to the user's product/service and target audience. Be creative with headlines and copy.`;

        const result = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `User request: ${prompt}`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: campaignStrategySchema,
            },
        });

        const responseText = result.text ?? '';
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