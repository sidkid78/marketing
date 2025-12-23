
import { GoogleGenAI, Type } from "@google/genai";
import {
  PromptLevel,
  PromptAnalysis,
  GeneratedPrompt,
  GroundingSource
} from "../types";

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

export const analyzeTask = async (apiKey: string, query: string, complexityHint?: string): Promise<PromptAnalysis> => {
  if (!apiKey) throw new Error('API key is missing. Please provide a valid API key.');
  const ai = getAI(apiKey);
  const isAuto = !complexityHint || complexityHint === 'auto';

  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Analyze the following task description for prompt generation:
      
      TASK DESCRIPTION:
      ${query}
      
      USER PREFERENCE: ${isAuto ? "AI-determined" : complexityHint}
      
      RESEARCH REQUIREMENT:
      If this task involves specific technologies (e.g., Next.js, Tailwind, specialized databases, APIs, or modern coding patterns), use Google Search to find the latest official documentation or best practices (2024-2025). 
      
      Provide a thorough analysis according to the schema. 
      Also recommend which Gemini model this specific prompt should be optimized for (e.g., 'gemini-3-flash-preview' for speed/simple logic or 'gemini-3-pro-preview' for deep reasoning/complex research).`,
    config: {
      thinkingConfig: { thinkingBudget: 1024 },
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          task_summary: { type: Type.STRING },
          identified_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_level: { type: Type.STRING, enum: Object.values(PromptLevel) },
          recommended_target_model: { type: Type.STRING, description: "The specific model name like gemini-3-flash-preview or gemini-3-pro-preview" },
          suggested_tools: { type: Type.ARRAY, items: { type: Type.STRING } },
          complexity_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
          potential_challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["task_summary", "identified_requirements", "recommended_level", "recommended_target_model", "complexity_factors", "potential_challenges"]
      }
    }
  });

  const analysis: PromptAnalysis = JSON.parse(response.text || "{}");

  // Extract grounding sources
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    const sources: GroundingSource[] = [];
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        if (!sources.some(s => s.uri === chunk.web.uri)) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      }
    });
    analysis.grounding_sources = sources;
  }

  return analysis;
};

export const generatePrompt = async (
  apiKey: string,
  query: string,
  analysis: PromptAnalysis,
  targetModel: string,
  includeExamples: boolean
): Promise<GeneratedPrompt> => {
  if (!apiKey) throw new Error('API key is missing. Please provide a valid API key.');
  const ai = getAI(apiKey);
  const effectiveModel = targetModel === 'auto' ? analysis.recommended_target_model : targetModel;

  const researchContext = analysis.grounding_sources?.length
    ? `RESEARCH DATA FOUND: ${JSON.stringify(analysis.grounding_sources)}`
    : "No external search data found.";

  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Generate an optimized agentic prompt based on this analysis and research:
      
      ORIGINAL TASK:
      ${query}
      
      ${researchContext}
      
      ANALYSIS RESULTS:
      ${JSON.stringify(analysis, null, 2)}
      
      GENERATION REQUIREMENTS:
      - Use the research data to ensure technical syntax (Tailwind, Next.js, etc.) is current.
      - Optimization Target Model: ${effectiveModel}
      - Include Examples: ${includeExamples}
      - Complexity Level: ${analysis.recommended_level}
      - Optimize for: Clarity, completeness, and robustness
      
      Generate a complete, production-ready prompt.`,
    config: {
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          level: { type: Type.STRING, enum: Object.values(PromptLevel) },
          purpose: { type: Type.STRING },
          variables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                variable_type: { type: Type.STRING },
                description: { type: Type.STRING },
                required: { type: Type.BOOLEAN },
              },
              required: ["name", "variable_type", "description", "required"]
            }
          },
          workflow: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step_number: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["step_number", "title", "description"]
            }
          },
          design_rationale: { type: Type.STRING },
          rendered_prompt: { type: Type.STRING },
          metadata: {
            type: Type.OBJECT,
            properties: {
              recommended_model: { type: Type.STRING },
              temperature: { type: Type.NUMBER },
              thinking_budget: { type: Type.NUMBER },
            },
            required: ["recommended_model", "temperature"]
          }
        },
        required: ["title", "level", "purpose", "variables", "workflow", "design_rationale", "rendered_prompt", "metadata"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const reviewPrompt = async (apiKey: string, query: string, prompt: GeneratedPrompt): Promise<string> => {
  if (!apiKey) throw new Error('API key is missing. Please provide a valid API key.');
  const ai = getAI(apiKey);
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Review this generated prompt for quality and completeness:
      
      ORIGINAL TASK:
      ${query}
      
      GENERATED PROMPT:
      \`\`\`markdown
      ${prompt.rendered_prompt}
      \`\`\`
      
      Review against: Completeness, Clarity, Variables, Workflow, Error Handling, Output Format.
      Provide: Quality assessment (1-10), issues found, suggested improvements, and final recommendation.`,
    config: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text || "Review unavailable.";
};
