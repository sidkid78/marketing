import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryScene } from "../types";

export const analyzeStory = async (apiKey: string, story: string): Promise<StoryScene[]> => {
  if (!apiKey) throw new Error("API Key is missing. Please provide a valid API key.");
  const client = new GoogleGenAI({ apiKey });
  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: story,
      config: {
        systemInstruction: `Analyze the user's story and break it down into 1 to 4 distinct sequential scenes.
        For each scene:
        1. "text": Extract the exact segment of the original story.
        2. "imagePrompt": Write a detailed prompt for high-quality image generation. Focus on composition and lighting.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["text", "imagePrompt"]
          }
        }
      }
    });
    const rawScenes = JSON.parse(response.text || "[]");
    return rawScenes.map((s: any, i: number) => ({
      id: `scene-${Date.now()}-${i}`,
      text: s.text,
      imagePrompt: s.imagePrompt
    }));
  } catch (error) {
    throw error;
  }
};

export const generateSceneImages = async (apiKey: string, scenes: StoryScene[]): Promise<StoryScene[]> => {
  if (!apiKey) throw new Error("API Key is missing. Please provide a valid API key.");
  const client = new GoogleGenAI({ apiKey });
  const imagePromises = scenes.map(async (scene) => {
    try {
      const response = await client.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: scene.imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
      });
      const generatedImage = response.generatedImages?.[0];
      if (generatedImage?.image?.imageBytes) {
        return { ...scene, imageUrl: `data:image/jpeg;base64,${generatedImage.image.imageBytes}` };
      }
      return scene;
    } catch (error) {
      return scene;
    }
  });
  return await Promise.all(imagePromises);
};

/**
 * Generate Speech (TTS)
 */
export const generateSpeech = async (apiKey: string, text: string): Promise<Uint8Array> => {
  if (!apiKey) throw new Error("API Key is missing. Please provide a valid API key.");
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Narrate this clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  return decodeBase64(base64Audio);
};

/**
 * Animate Scene (Veo)
 */
export const animateScene = async (apiKey: string, prompt: string, imageBase64: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing. Please provide a valid API key.");
  const client = new GoogleGenAI({ apiKey });

  // Extract base64 if it has the data URI prefix
  const pureBase64 = imageBase64.split(',')[1] || imageBase64;

  let operation = await client.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Animate this scene: ${prompt}`,
    image: {
      imageBytes: pureBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await client.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Failed to generate video");

  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

// --- Helper Functions ---

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
