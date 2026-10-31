
import { GoogleGenAI } from "@google/genai";
import {
  PromptLevel,
  PromptAnalysis,
  GeneratedPrompt,
  GroundingSource
} from "../types";

const MODEL = 'gemini-3.8-flash';

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

const safeJsonParse = <T>(text: string | undefined | null, fallback: T): T => {
  if (!text || !text.trim()) return fallback;
  try {
    // Remove markdown blocks if present
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    if (!cleanText) return fallback;
    return JSON.parse(cleanText) as T;
  } catch (err) {
    console.error("NEURAL_PARSE_ERROR:", err);
    console.error("RAW_BUFFER_DUMP:", text);
    return fallback;
  }
};

export const analyzeTask = async (apiKey: string, query: string, complexityHint?: string): Promise<PromptAnalysis> => {
  if (!apiKey) throw new Error('API key is missing. Please provide a valid API key.');
  const ai = getAI(apiKey);
  const isAuto = !complexityHint || complexityHint === 'auto';

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: `Analyze the following task description for prompt generation:
      
      TASK DESCRIPTION:
      ${query}
      
      USER PREFERENCE: ${isAuto ? "AI-determined" : complexityHint}
      
      RESEARCH REQUIREMENT:
      If this task involves specific technologies (e.g., Next.js, Tailwind, specialized databases, APIs, or modern coding patterns), use Google Search to find the latest official documentation or best practices (2024-2025). 
      
      Provide a thorough analysis according to the schema. 
      Also recommend which Gemini model this specific prompt should be optimized for (e.g., 'gemini-3.8-flash').`,
    tools: [{ type: 'google_search' }],
    generation_config: { thinking_level: 'low' },
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: {
        type: 'object',
        properties: {
          task_summary: { type: 'string' },
          identified_requirements: { type: 'array', items: { type: 'string' } },
          recommended_level: { type: 'string', enum: Object.values(PromptLevel) },
          recommended_target_model: { type: 'string', description: "The specific model name like gemini-3.8-flash or gemini-3.8-flash" },
          suggested_tools: { type: 'array', items: { type: 'string' } },
          complexity_factors: { type: 'array', items: { type: 'string' } },
          potential_challenges: { type: 'array', items: { type: 'string' } },
        },
        required: ["task_summary", "identified_requirements", "recommended_level", "recommended_target_model", "complexity_factors", "potential_challenges"]
      }
    },
    store: false,
  });

  const analysis = safeJsonParse<PromptAnalysis>(interaction.output_text, {
    task_summary: "Parsing failed",
    identified_requirements: [],
    recommended_level: PromptLevel.SIMPLE,
    recommended_target_model: MODEL,
    complexity_factors: [],
    potential_challenges: []
  });

  // Grounding sources now arrive as `url_citation` annotations on the model's
  // text output rather than as groundingMetadata on a candidate.
  const sources: GroundingSource[] = [];
  for (const step of interaction.steps ?? []) {
    if (step.type !== 'model_output') continue;
    for (const block of step.content ?? []) {
      if (block.type !== 'text') continue;
      for (const annotation of block.annotations ?? []) {
        if (annotation.type !== 'url_citation') continue;
        if (annotation.url && annotation.title && !sources.some(s => s.uri === annotation.url)) {
          sources.push({ title: annotation.title, uri: annotation.url });
        }
      }
    }
  }
  if (sources.length > 0) {
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

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: `Generate an optimized agentic prompt based on this analysis and research:
      
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
    generation_config: { thinking_level: 'low' },
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          level: { type: 'string', enum: Object.values(PromptLevel) },
          purpose: { type: 'string' },
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                variable_type: { type: 'string' },
                description: { type: 'string' },
                required: { type: 'boolean' },
              },
              required: ["name", "variable_type", "description", "required"]
            }
          },
          workflow: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step_number: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ["step_number", "title", "description"]
            }
          },
          design_rationale: { type: 'string' },
          rendered_prompt: { type: 'string' },
          metadata: {
            type: 'object',
            properties: {
              recommended_model: { type: 'string' },
              temperature: { type: 'number' },
              thinking_budget: { type: 'number' },
            },
            required: ["recommended_model", "temperature"]
          }
        },
        required: ["title", "level", "purpose", "variables", "workflow", "design_rationale", "rendered_prompt", "metadata"]
      }
    },
    store: false,
  });

  return safeJsonParse<GeneratedPrompt>(interaction.output_text, {} as GeneratedPrompt);
};

export const reviewPrompt = async (apiKey: string, query: string, prompt: GeneratedPrompt): Promise<string> => {
  if (!apiKey) throw new Error('API key is missing. Please provide a valid API key.');
  const ai = getAI(apiKey);
  const interaction = await ai.interactions.create({
    model: MODEL,
    input: `Review this generated prompt for quality and completeness:
      
      ORIGINAL TASK:
      ${query}
      
      GENERATED PROMPT:
      \`\`\`markdown
      ${prompt.rendered_prompt}
      \`\`\`
      
      Review against: Completeness, Clarity, Variables, Workflow, Error Handling, Output Format.
      Provide: Quality assessment (1-10), issues found, suggested improvements, and final recommendation.`,
    generation_config: { thinking_level: 'minimal' },
    store: false,
  });

  return interaction.output_text || "Review unavailable.";
};
