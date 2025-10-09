
import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            For each idea, provide a catchy headline, a direction for the visual aspect, a suggested caption, a call-to-action (CTA), and a few relevant hashtags.`;
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

export async function generateStrategy(userInput: UserInput): Promise<Strategy[]> {
  const prompt = buildPrompt(userInput, 'strategy');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: strategySchema,
    },
  });
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}

export async function generateContentIdeas(userInput: UserInput): Promise<ContentIdea[]> {
  const prompt = buildPrompt(userInput, 'content');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: contentIdeaSchema,
    },
  });
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}

export async function analyzePerformance(performanceData: PerformanceData, goal: string): Promise<PerformanceAnalysis> {
    const mockUserInput: UserInput = {
        goals: [goal as any],
        platforms: ['facebook'], // Assume a default platform for analysis context
        demographics: { age_range: '25-34', gender: 'any', location: 'global' },
        brand_offer_details: 'general campaign'
    };
  const prompt = buildPrompt(mockUserInput, 'analysis', performanceData);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: performanceAnalysisSchema,
    },
  });
  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}
