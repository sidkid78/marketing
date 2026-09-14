
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
 * Generate a short video using Veo 3.1 and return a Blob URL that can be used
 * as the source for a <video> element in the browser.
 *
 * Note: Video generation can be slow (may take 1-2 minutes) and may incur additional costs.
 *
 * Still on the legacy `models.generateVideos` + operations-polling API. Video
 * generation is not covered by the public Interactions API docs, so this path
 * was left as-is rather than migrated on guesswork.
 */
export async function generateAdVideo(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const ai = createAIClient(apiKey);

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll until the operation is complete.
    while (!operation.done) {
      // Wait ~10 seconds between polls to avoid spamming the API.
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No downloadable video URI returned.");
    }

    // In the browser, fetch the video bytes directly using the API key header,
    // then wrap them in a Blob and expose them as an object URL for <video>.
    const response = await fetch(videoUri, {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Video download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating ad video:", error);
    return null;
  }
}
