import { GoogleGenAI } from "@google/genai";

const getClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Agentic Prompt Optimization
 * Expands a simple user request into a detailed image prompt.
 */
export const optimizePrompt = async (userInput: string, apiKey: string): Promise<string> => {
  const client = getClient(apiKey);

  const systemInstruction = `You are an expert AI artist and prompt engineer.
  Your task is to take a basic user idea and transform it into a highly detailed,
  vivid, and effective image generation prompt suitable for a high-end diffusion model.
  Focus on lighting, texture, composition, camera angles, and artistic style.
  Do not include preamble like "Here is the prompt:". Just output the prompt text directly.`;

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: userInput,
      system_instruction: systemInstruction,
      // Each call is self-contained, so opt out of server-side retention.
      store: false,
    });

    const text = interaction.output_text;
    if (!text) throw new Error("Failed to generate optimized prompt.");

    return text.trim();
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    throw error;
  }
};

/**
 * Step 2: Image Generation
 * Generates an image from the optimized prompt and returns it as a data URL.
 */
export const generateImages = async (prompt: string, apiKey: string): Promise<string[]> => {
  const client = getClient(apiKey);

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-nano-banana-2.1',
      input: prompt,
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: '16:9',
        image_size: '2K',
      },
      store: false,
    });

    // Image data arrives as inline base64 blocks on the model_output steps.
    const images: string[] = [];
    for (const step of interaction.steps ?? []) {
      if (step.type !== 'model_output') continue;
      for (const block of step.content ?? []) {
        if (block.type === 'image' && block.data) {
          images.push(`data:${block.mime_type ?? 'image/jpeg'};base64,${block.data}`);
        }
      }
    }

    // Fall back to the convenience accessor if the steps were not returned.
    if (images.length === 0 && interaction.output_image?.data) {
      const { data, mime_type } = interaction.output_image;
      images.push(`data:${mime_type ?? 'image/jpeg'};base64,${data}`);
    }

    if (images.length === 0) {
      throw new Error("No images generated.");
    }

    return images;
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};
