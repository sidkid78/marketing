
import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from '../types';

// Create AI client with provided API key
function createAIClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  return new GoogleGenAI({ apiKey });
}

const strategySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      goal: { type: Type.STRING },
      platform: { type: Type.STRING },
      strategy_title: { type: Type.STRING },
      summary: { type: Type.STRING },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      rationale: { type: Type.STRING },
      kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['goal', 'platform', 'strategy_title', 'summary', 'recommendations', 'rationale', 'kpis'],
  },
};

const contentIdeaSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      platform: { type: Type.STRING },
      goal: { type: Type.STRING },
      ideas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            visual_direction: { type: Type.STRING },
            caption: { type: Type.STRING },
            cta: { type: Type.STRING },
            hashtag_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['headline', 'visual_direction', 'caption', 'cta', 'hashtag_suggestions'],
        },
      },
    },
    required: ['platform', 'goal', 'ideas'],
  },
};

const performanceAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    goal: { type: Type.STRING },
    platform: { type: Type.STRING },
    summary: { type: Type.STRING },
    analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          label: { type: Type.STRING },
          value: { type: Type.NUMBER },
          status: { type: Type.STRING },
          flag: { type: Type.STRING },
          message: { type: Type.STRING },
        },
        required: ['metric', 'label', 'value', 'status', 'flag', 'message'],
      },
    },
    adjustment_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['goal', 'platform', 'summary', 'analysis', 'adjustment_recommendations'],
};

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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: strategySchema,
    },
  });
  const jsonText = response.text?.trim() || '[]';
  return JSON.parse(jsonText);
}

export async function generateContentIdeas(userInput: UserInput, apiKey: string): Promise<ContentIdea[]> {
  const ai = createAIClient(apiKey);
  const prompt = buildPrompt(userInput, 'content');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: contentIdeaSchema,
    },
  });
  const jsonText = response.text?.trim() || '[]';
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: performanceAnalysisSchema,
    },
  });
  const jsonText = response.text?.trim() || '{}';
  return JSON.parse(jsonText);
}

export async function generateAdImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const ai = createAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: prompt
          }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodingString = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64EncodingString}`;
      }
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
 */
export async function generateAdVideo(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const ai = createAIClient(apiKey);

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
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
