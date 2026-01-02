import { GoogleGenAI, Type } from "@google/genai";
import { TweetDraft, VisualConcept } from "../types";

// Helper to get client with correct key
const getClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
  if (!apiKey) {
    console.warn("API Key is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are the Senior Social Media Manager for HOMEase | AI, an Austin-based AgeTech company focused on aging-in-place trends, home safety, and universal design. 
Your tone is professional, knowledgeable, empathetic, and innovative.
You are targeting the Austin, TX market.
Key topics: AgeTech, AgingInPlace, SeniorLiving, HomeSafety, SmartHome, Universal Design.
`;

export const generateTweetContent = async (topic: string, format: 'single' | 'thread'): Promise<TweetDraft[]> => {
  const prompt = `
    Create content for Twitter/X about: "${topic}".
    Format: ${format === 'thread' ? 'A thread of 3 connected tweets' : 'A single punchy tweet'}.
    Include relevant hashtags like #AustinTX #AgeTech.
    Focus on thought leadership and value.
  `;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Updated model
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              type: { type: Type.STRING, enum: ['statistic', 'infographic_caption', 'reply', 'thread'] }
            }
          }
        }
      }
    });

    // FIX: Access text as property, not function, based on observed SDK behavior/error
    // If response.text is undefined, fallback to parsing candidates manually or empty string
    const text = response.text || "";

    if (!text) return [];
    return JSON.parse(text) as TweetDraft[];
  } catch (error) {
    console.error("Error generating tweets:", error);
    return [];
  }
};

export const generateVisualConcept = async (concept: string): Promise<VisualConcept | null> => {
  try {
    const ai = getClient();
    // Step 1: Generate the image description and actual image
    const imagePrompt = `A clean, modern, minimalist infographic style illustration suitable for a tech company called HOMEase | AI. The subject is: ${concept}. Use a color palette of blues, whites, and soft grays. High quality, professional vector art style.`;

    // Note: Python SDK uses imagen-3.0-generate-001, verifying JS SDK support
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Fallback to text model if image not supported directly in this SDK version or use specific image model
      contents: {
        parts: [{ text: imagePrompt }]
      }
    });

    let imageBase64: string | undefined;
    let description = "Generated visual concept for " + concept;

    // Extract image if available - API structure varies by model
    // This is a placeholder for actual image generation logic if available in JS SDK similar to Python
    // For now, ensuring no crash.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
        } else if (part.text) {
          description = part.text;
        }
      }
    }

    return {
      description,
      imageBase64
    };

  } catch (error) {
    console.error("Error generating visual:", error);
    return null;
  }
};

export const analyzeAndReply = async (incomingTweet: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      A user posted this tweet: "${incomingTweet}".
      Draft a professional, engaging reply from HOMEase | AI. 
      If it's a question, answer helpfully. If it's news, express interest or add an insight.
      Keep it under 280 characters.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    // FIX: Access text as property
    return response.text || "Could not generate reply.";
  } catch (error) {
    console.error("Error generating reply:", error);
    return "Error generating reply.";
  }
};
