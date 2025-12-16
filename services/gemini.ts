import { GoogleGenAI, Type, Schema } from "@google/genai";
import { 
    ContentConfig, 
    ResearchBrief, 
    ContentDraft, 
    EditSuggestions, 
    FinalContent,
    GeneratedImage
} from "../types";

// Ensure API Key is present
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';

// --- Schemas ---

const researchSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        key_points: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5-7 key points that must be covered"
        },
        target_audience_analysis: {
            type: Type.STRING,
            description: "Analysis of who the audience is and what they need"
        },
        recommended_angle: {
            type: Type.STRING,
            description: "Unique perspective or approach for the content"
        },
        seo_keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "8-12 SEO keywords"
        },
        sources_type: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Types of sources that would be credible for this topic"
        }
    },
    required: ["key_points", "target_audience_analysis", "recommended_angle", "seo_keywords", "sources_type"]
};

const draftSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        introduction: { type: Type.STRING, description: "Engaging hook and context (150-200 words)" },
        main_sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    heading: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Substantive content for this section" }
                },
                required: ["heading", "content"]
            }
        },
        conclusion: { type: Type.STRING },
        estimated_reading_time: { type: Type.NUMBER }
    },
    required: ["title", "introduction", "main_sections", "conclusion", "estimated_reading_time"]
};

const editSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        overall_score: { type: Type.NUMBER, description: "Score out of 100" },
        structure_feedback: { type: Type.STRING },
        clarity_issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    issue: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                    relevant_text_snippet: { type: Type.STRING }
                },
                required: ["issue", "suggestion", "relevant_text_snippet"]
            }
        },
        tone_consistency_check: { type: Type.STRING }
    },
    required: ["overall_score", "structure_feedback", "clarity_issues", "tone_consistency_check"]
};

const publishSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Final optimized title" },
        meta_description: { type: Type.STRING, description: "SEO meta description (150-160 chars)" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        full_markdown: { type: Type.STRING, description: "The complete, polished content in Markdown format." },
        image_prompts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 distinct, detailed image generation prompts relevant to the article sections. First prompt must be a Hero Image."
        }
    },
    required: ["title", "meta_description", "tags", "full_markdown", "image_prompts"]
};

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

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: researchSchema,
            temperature: 0.7
        }
    });

    return JSON.parse(response.text);
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

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: draftSchema,
            temperature: 0.7
        }
    });

    return JSON.parse(response.text);
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

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: editSchema,
            temperature: 0.2 // Lower temp for more critical/analytical mode
        }
    });

    return JSON.parse(response.text);
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

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: publishSchema,
            temperature: 0.5
        }
    });

    return JSON.parse(response.text);
};

export const agentGenerateImages = async (prompts: string[]): Promise<GeneratedImage[]> => {
    const images: GeneratedImage[] = [];

    // Process sequentially to avoid overwhelming rate limits in a demo
    for (const promptText of prompts) {
        if (!promptText || promptText.trim().length === 0) continue;

        try {
            // Using gemini-2.5-flash-image for efficient image generation
            const response = await ai.models.generateContent({
                model: IMAGE_MODEL_NAME,
                contents: { parts: [{ text: promptText }] },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9" // Cinematic aspect ratio suitable for blog headers
                    }
                }
            });

            // Extract the image from the response parts
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        const base64Data = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        const url = `data:${mimeType};base64,${base64Data}`;
                        images.push({ prompt: promptText, url });
                        break; // Found the image, move to next prompt
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to generate image for prompt: "${promptText}"`, error);
            // Continue to next image even if one fails
        }
    }
    
    return images;
};