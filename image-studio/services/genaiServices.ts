import { GoogleGenAI } from "@google/genai";

const getClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Agentic Prompt Optimization
 * Uses Gemini-2.5-Flash to expand a simple user request into a detailed image prompt.
 */
export const optimizePrompt = async (userUnput: string, apiKey: string): Promise<string> => {
  const client = getClient(apiKey);
  
  const systemInstruction = `You are an expert AI artist and prompt engineer. 
  Your task is to take a basic user idea and transform it into a highly detailed, 
  vivid, and effective image generation prompt suitable for a high-end diffusion model.
  Focus on lighting, texture, composition, camera angles, and artistic style. 
  Do not include preamble like "Here is the prompt:". Just output the prompt text directly.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userUnput,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Failed to generate optimized prompt.");
    
    return text.trim();
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw error;
  }
};

/**
 * Step 2: Image Generation
 * Uses Imagen-4.0 to generate images based on the optimized prompt.
 */
export const generateImages = async (prompt: string, apiKey: string): Promise<string[]> => {
  const client = getClient(apiKey);

  try {
    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images generated.");
    }

    // Convert raw bytes to base64 data URLs
    return response.generatedImages.map((img) => {
       return `data:image/jpeg;base64,${img.image?.imageBytes || ''}`;
    });

  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};