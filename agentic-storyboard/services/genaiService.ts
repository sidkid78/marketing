import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryScene } from "../types";

const getClient = () => {
  // Try to get key from environment variable (standard Next.js public var)
  // or fallback to process.env.API_KEY if defined (e.g. build time)
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
  if (!apiKey) {
    console.warn("API Key is missing in environment variables.");
    // throw new Error("API Key is missing. Please check your environment variables.");
    // We might want to allow this to fail gracefully later if the user hasn't set it yet
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeStory = async (story: string): Promise<StoryScene[]> => {
  const client = getClient();
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

export const generateSceneImages = async (scenes: StoryScene[]): Promise<StoryScene[]> => {
  const client = getClient();
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
export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const client = getClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Narrate this clearly: ${text}` }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algieba' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  return decodeBase64(base64Audio);
};

/**
 * Generate a Context-Aware Video Prompt
 */
export const generateVideoPrompt = async (text: string, imageDescription: string): Promise<string> => {
  const client = getClient();
  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a precise, cinematic prompt for an AI video generator (Veo) to animate a static image.
      
      Context Story: "${text}"
      Visual Description: "${imageDescription}"
      
      Rules:
      - Focus on specific camera movements (pan, zoom, tilt) and subject motion.
      - Keep it under 40 words.
      - Output ONLY the prompt text.
      `,
  });
  return response.text || `Cinematic slow pan of ${imageDescription}`;
};

/**
 * Animate Scene (Veo)
 */
export const animateScene = async (prompt: string, imageBase64: string): Promise<string> => {
  const client = getClient();

  // Extract base64 if it has the data URI prefix
  const pureBase64 = imageBase64.split(',')[1] || imageBase64;

  let operation = await client.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: pureBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p', // Removed as it might not be supported in all versions/models or defaults are safer
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await client.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Failed to generate video");

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
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
      // Simple conversion from Int16 to Float32 usually involves dividing by 32768
      // Assuming the input data is 16-bit PCM.
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const createWavUrl = (pcmData: Uint8Array, sampleRate: number = 24000): string => {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}