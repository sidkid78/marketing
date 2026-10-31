
import { GoogleGenAI } from "@google/genai";
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from '../types';

const MODEL_NAME = 'gemini-3.8-flash';

// Create AI client with provided API key
function createAIClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  return new GoogleGenAI({ apiKey });
}

// The Interactions API takes plain JSON Schema (lowercase type names) rather
// than the SDK's `Type` enum.
const strategySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      goal: { type: 'string' },
      platform: { type: 'string' },
      strategy_title: { type: 'string' },
      summary: { type: 'string' },
      recommendations: { type: 'array', items: { type: 'string' } },
      rationale: { type: 'string' },
      kpis: { type: 'array', items: { type: 'string' } },
    },
    required: ['goal', 'platform', 'strategy_title', 'summary', 'recommendations', 'rationale', 'kpis'],
  },
};

const contentIdeaSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      platform: { type: 'string' },
      goal: { type: 'string' },
      ideas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            visual_direction: { type: 'string' },
            caption: { type: 'string' },
            cta: { type: 'string' },
            hashtag_suggestions: { type: 'array', items: { type: 'string' } },
          },
          required: ['headline', 'visual_direction', 'caption', 'cta', 'hashtag_suggestions'],
        },
      },
    },
    required: ['platform', 'goal', 'ideas'],
  },
};

const performanceAnalysisSchema = {
  type: 'object',
  properties: {
    goal: { type: 'string' },
    platform: { type: 'string' },
    summary: { type: 'string' },
    analysis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          metric: { type: 'string' },
          label: { type: 'string' },
          value: { type: 'number' },
          status: { type: 'string' },
          flag: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['metric', 'label', 'value', 'status', 'flag', 'message'],
      },
    },
    adjustment_recommendations: { type: 'array', items: { type: 'string' } },
  },
  required: ['goal', 'platform', 'summary', 'analysis', 'adjustment_recommendations'],
};

/** Shared JSON-mode response format. */
const jsonFormat = (schema: Record<string, unknown>) => ({
  type: 'text' as const,
  mime_type: 'application/json' as const,
  schema,
});

function buildPrompt(userInput: UserInput, task: 'strategy' | 'content' | 'analysis', performanceData?: PerformanceData): string {
  const { goals, platforms, demographics, brand_offer_details, audience_interests, campaign_budget } = userInput;
  const corePrompt = `
      You are an expert marketing agent. I need your help with a campaign.
      
      **Campaign Details:**
      - **Primary Goals:** ${goals.join(', ')}
      - **Target Platforms:** ${platforms.join(', ')}
      - **Target Audience:** Age ${demographics.age_range}, Gender: ${demographics.gender}, Location: ${demographics.location}
      - **Brand/Offer:** "${brand_offer_details}"
      - **Audience Interests:** ${audience_interests || 'Not specified'}${campaign_budget ? `\n      - **Campaign Budget:** Approximately ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(campaign_budget)}` : ''}
    `;

  switch (task) {
    case 'strategy':
      return `${corePrompt}
            Based on the details above, generate a list of actionable marketing strategies for each goal-platform combination. Consider the budget if provided.
            The output must be a JSON array of strategy objects.
            For each strategy, provide a clear title, a summary, a bulleted list of recommendations (creative, targeting, etc.), a rationale for the approach, and a list of key KPIs to monitor.`;
    case 'content':
      return `${corePrompt}
            Based on the details above, generate a list of 2-3 creative and platform-specific content ideas for each goal-platform combination. Consider the budget if provided for ad creatives.
            The output must be a JSON array of content idea objects.
            For each idea, provide a catchy headline, a direction for the more detailedvisual aspect, a suggested caption, a call-to-action (CTA), and a few relevant hashtags.`;
    case 'analysis':
      return `
              You are an expert marketing data analyst. I need you to analyze campaign performance.
              
              **Campaign Goal:** ${goals.join(', ')}
              **Current Performance Metrics:** ${JSON.stringify(performanceData?.metrics)}
              ${performanceData?.past_metrics ? `**Past Performance Metrics:** ${JSON.stringify(performanceData.past_metrics)}` : ''}

              Analyze the provided metrics against typical industry benchmarks. Your analysis should be concise and actionable.
              The output must be a single JSON object.
              Provide a brief summary of the campaign's health, a list of metric-by-metric analyses (including status and a flag for UI), and a bulleted list of concrete adjustment recommendations.
            `;
  }
}

export async function generateStrategy(userInput: UserInput, apiKey: string): Promise<Strategy[]> {
  const ai = createAIClient(apiKey);
  const prompt = buildPrompt(userInput, 'strategy');
  const interaction = await ai.interactions.create({
    model: MODEL_NAME,
    input: prompt,
    response_format: jsonFormat(strategySchema),
    store: false,
  });
  const jsonText = interaction.output_text?.trim() || '[]';
  return JSON.parse(jsonText);
}

export async function generateContentIdeas(userInput: UserInput, apiKey: string): Promise<ContentIdea[]> {
  const ai = createAIClient(apiKey);
  const prompt = buildPrompt(userInput, 'content');
  const interaction = await ai.interactions.create({
    model: MODEL_NAME,
    input: prompt,
    response_format: jsonFormat(contentIdeaSchema),
    store: false,
  });
  const jsonText = interaction.output_text?.trim() || '[]';
  return JSON.parse(jsonText);
}

export async function analyzePerformance(performanceData: PerformanceData, goal: string, apiKey: string): Promise<PerformanceAnalysis> {
  const ai = createAIClient(apiKey);
  const mockUserInput: UserInput = {
    goals: [goal as any],
    platforms: ['facebook'], // Assume a default platform for analysis context
    demographics: { age_range: '25-34', gender: 'any', location: 'global' },
    brand_offer_details: 'general campaign'
  };
  const prompt = buildPrompt(mockUserInput, 'analysis', performanceData);
  const interaction = await ai.interactions.create({
    model: MODEL_NAME,
    input: prompt,
    response_format: jsonFormat(performanceAnalysisSchema),
    store: false,
  });
  const jsonText = interaction.output_text?.trim() || '{}';
  return JSON.parse(jsonText);
}

export async function generateAdImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const ai = createAIClient(apiKey);
    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite-image",
      input: prompt,
      store: false,
    });

    const image = interaction.output_image;
    if (image?.data) {
      return `data:${image.mime_type ?? 'image/png'};base64,${image.data}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating ad image:", error);
    return null;
  }
}

/**
 * Generate a short video using Gemini Omni Flash and return a Blob URL that can
 * be used as the source for a <video> element in the browser.
 *
 * Note: Video generation can be slow (may take 1-2 minutes) and may incur additional costs.
 */
export async function generateAdVideo(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const ai = createAIClient(apiKey);
    const interaction = await ai.interactions.create({
      model: "gemini-omni-1.1-flash",
      input: prompt,
      response_format: { type: 'video', aspect_ratio: '16:9' },
      store: false,
    });

    return await videoToObjectUrl(interaction.output_video, apiKey);
  } catch (error) {
    console.error("Error generating ad video:", error);
    return null;
  }
}

/**
 * Turn an Interactions API video block into an object URL. Inline base64 data
 * is decoded directly; a URI is fetched with the API key header.
 */
async function videoToObjectUrl(
  video: { data?: string; uri?: string; mime_type?: string } | undefined,
  apiKey: string,
): Promise<string> {
  const mimeType = video?.mime_type ?? 'video/mp4';
  if (video?.data) {
    const bytes = Uint8Array.from(atob(video.data), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  }
  if (video?.uri) {
    const response = await fetch(video.uri, { headers: { "x-goog-api-key": apiKey } });
    if (!response.ok) {
      throw new Error(`Video download failed with status ${response.status}`);
    }
    return URL.createObjectURL(await response.blob());
  }
  throw new Error("No video data returned.");
}
