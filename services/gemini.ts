import { GoogleGenAI } from "@google/genai";
import {
    ContentConfig,
    ResearchBrief,
    ContentDraft,
    EditSuggestions,
    FinalContent,
    GeneratedImage
} from "../types";

// Ensure API Key is present
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-3.8-flash';
const IMAGE_MODEL_NAME = 'gemini-nano-banana-2.1';

// --- Schemas ---
// The Interactions API takes plain JSON Schema (lowercase type names) rather
// than the SDK's `Type` enum.

const researchSchema = {
    type: "object",
    properties: {
        key_points: {
            type: "array",
            items: { type: "string" },
            description: "5-7 key points that must be covered"
        },
        target_audience_analysis: {
            type: "string",
            description: "Analysis of who the audience is and what they need"
        },
        recommended_angle: {
            type: "string",
            description: "Unique perspective or approach for the content"
        },
        seo_keywords: {
            type: "array",
            items: { type: "string" },
            description: "8-12 SEO keywords"
        },
        sources_type: {
            type: "array",
            items: { type: "string" },
            description: "Types of sources that would be credible for this topic"
        }
    },
    required: ["key_points", "target_audience_analysis", "recommended_angle", "seo_keywords", "sources_type"]
};

const draftSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        introduction: { type: "string", description: "Engaging hook and context (150-200 words)" },
        main_sections: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    heading: { type: "string" },
                    content: { type: "string", description: "Substantive content for this section" }
                },
                required: ["heading", "content"]
            }
        },
        conclusion: { type: "string" },
        estimated_reading_time: { type: "number" }
    },
    required: ["title", "introduction", "main_sections", "conclusion", "estimated_reading_time"]
};

const editSchema = {
    type: "object",
    properties: {
        overall_score: { type: "number", description: "Score out of 100" },
        structure_feedback: { type: "string" },
        clarity_issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    issue: { type: "string" },
                    suggestion: { type: "string" },
                    relevant_text_snippet: { type: "string" }
                },
                required: ["issue", "suggestion", "relevant_text_snippet"]
            }
        },
        tone_consistency_check: { type: "string" }
    },
    required: ["overall_score", "structure_feedback", "clarity_issues", "tone_consistency_check"]
};

const publishSchema = {
    type: "object",
    properties: {
        title: { type: "string", description: "Final optimized title" },
        meta_description: { type: "string", description: "SEO meta description (150-160 chars)" },
        tags: { type: "array", items: { type: "string" } },
        full_markdown: { type: "string", description: "The complete, polished content in Markdown format." },
        image_prompts: {
            type: "array",
            items: { type: "string" },
            description: "4 distinct, detailed image generation prompts relevant to the article sections. First prompt must be a Hero Image."
        }
    },
    required: ["title", "meta_description", "tags", "full_markdown", "image_prompts"]
};

/** Shared JSON-mode response format for the agent pipeline. */
const jsonFormat = (schema: Record<string, unknown>) => ({
    type: 'text' as const,
    mime_type: 'application/json' as const,
    schema,
});

// --- Agent Functions ---

export const agentResearch = async (config: ContentConfig): Promise<ResearchBrief> => {
    const prompt = `
        You are a Lead Content Researcher.
        Topic: "${config.topic}"
        Type: ${config.contentType}
        Tone: ${config.tone}
        Audience: ${config.targetAudience}
        
        Create a comprehensive research brief. Focus on actionable insights.
    `;

    const interaction = await ai.interactions.create({
        model: MODEL_NAME,
        input: prompt,
        response_format: jsonFormat(researchSchema),
        store: false,
    });

    const text = interaction.output_text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text);
};

export const agentDraft = async (config: ContentConfig, brief: ResearchBrief): Promise<ContentDraft> => {
    const prompt = `
        You are a Senior Content Writer.
        Use this research brief to write a full first draft.
        
        Context:
        - Topic: ${config.topic}
        - Tone: ${config.tone}
        - Target Words: ${config.wordCountTarget}
        
        Research Brief:
        ${JSON.stringify(brief)}
        
        Instructions:
        - Write clear, engaging content structured logically.
        - IMPORTANT: If the content requires code examples, commands, or technical configuration, use Markdown code blocks with a valid language identifier (e.g. \`\`\`python ... \`\`\`).
    `;

    const interaction = await ai.interactions.create({
        model: MODEL_NAME,
        input: prompt,
        response_format: jsonFormat(draftSchema),
        store: false,
    });

    const text = interaction.output_text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text);
};

export const agentEdit = async (config: ContentConfig, draft: ContentDraft): Promise<EditSuggestions> => {
    const prompt = `
        You are a Strict Editor. Review this draft.
        
        Goals:
        - Check tone consistency (${config.tone})
        - Improve clarity and flow
        - Identify structural weaknesses
        
        Draft:
        Title: ${draft.title}
        ${draft.introduction}
        ${draft.main_sections.map(s => `## ${s.heading}\n${s.content}`).join('\n')}
        ${draft.conclusion}
    `;

    const interaction = await ai.interactions.create({
        model: MODEL_NAME,
        input: prompt,
        response_format: jsonFormat(editSchema),
        // Was temperature 0.2 for a more critical/analytical pass; the Interactions
        // API drops temperature, so lean on thinking instead.
        generation_config: { thinking_level: 'high' },
        store: false,
    });

    const text = interaction.output_text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text);
};

export const agentPublish = async (config: ContentConfig, draft: ContentDraft, edits: EditSuggestions): Promise<FinalContent> => {
    const prompt = `
        You are a Publishing Specialist. 
        Take the original draft and apply the editor's feedback to create a final, polished version.
        
        Original Draft JSON: ${JSON.stringify(draft)}
        Editor Feedback JSON: ${JSON.stringify(edits)}
        
        Tasks:
        1. Incorporate improvements.
        2. Format as clean Markdown.
        3. Ensure all code blocks are properly formatted.
        4. Generate SEO meta data.
        5. Create 4 detailed, artistic image prompts for the blog.
           - Prompt 1: Hero Image (Wide, engaging, captures the essence).
           - Prompts 2-4: Illustrative images for key sections.
           - Style: ${config.tone} / Cyberpunk / Technical / Minimalist (Choose what fits best).
    `;

    const interaction = await ai.interactions.create({
        model: MODEL_NAME,
        input: prompt,
        response_format: jsonFormat(publishSchema),
        store: false,
    });

    const text = interaction.output_text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text);
};

export const agentGenerateImages = async (prompts: string[]): Promise<GeneratedImage[]> => {
    const images: GeneratedImage[] = [];

    // Process sequentially to avoid overwhelming rate limits in a demo
    for (const promptText of prompts) {
        if (!promptText || promptText.trim().length === 0) continue;

        try {
            const interaction = await ai.interactions.create({
                model: IMAGE_MODEL_NAME,
                input: promptText,
                response_format: {
                    type: 'image',
                    mime_type: 'image/jpeg',
                    aspect_ratio: '16:9', // Cinematic aspect ratio suitable for blog headers
                },
                store: false,
            });

            const image = interaction.output_image;
            if (image?.data) {
                const url = `data:${image.mime_type ?? 'image/jpeg'};base64,${image.data}`;
                images.push({ prompt: promptText, url });
            }
        } catch (error) {
            console.error(`Failed to generate image for prompt: "${promptText}"`, error);
            // Continue to next image even if one fails
        }
    }

    return images;
};