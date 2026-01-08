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
      const response = await client.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: scene.imagePrompt,
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        }
      });
      const generatedImage = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (generatedImage) {
        return { ...scene, imageUrl: `data:image/jpeg;base64,${generatedImage}` };
      }
      return scene;
    } catch (error) {
      return scene;
    }
  });
  return await Promise.all(imagePromises);
};

/**
 * Helper function to decode base64 strings to Uint8Array
 */
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

  // Clean base64 if it has data URI prefix
  const pureBase64 = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  console.log("Starting video generation with prompt:", prompt.substring(0, 100) + "...");

  // Start video generation with proper image structure
  let operation = await client.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: pureBase64,
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9',
      durationSeconds: 8,
      personGeneration: 'allow_adult',
    },
  });

  console.log("Initial operation response:", JSON.stringify(operation, null, 2));

  // Poll for completion (every 10 seconds as per docs)
  let pollCount = 0;
  const maxPolls = 30; // 5 minutes max wait
  while (!operation.done && pollCount < maxPolls) {
    console.log(`Waiting for video generation... (attempt ${pollCount + 1}/${maxPolls})`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Refresh operation
    operation = await client.operations.getVideosOperation({
      operation: operation,
    });
    pollCount++;
    console.log("Poll response:", JSON.stringify(operation, null, 2));
  }

  if (pollCount >= maxPolls) {
    throw new Error("Video generation timed out after 5 minutes");
  }

  // Check for errors
  if (operation.error) {
    console.error("Video generation error:", operation.error);
    throw new Error(`Video generation failed: ${operation.error.message}`);
  }

  // Log the full response to understand its structure
  console.log("Final operation response:", JSON.stringify(operation.response, null, 2));

  // Get the generated video
  const generatedVideo = operation.response?.generatedVideos?.[0];
  if (!generatedVideo) {
    console.error("No generatedVideos in response:", operation.response);
    throw new Error("No video generated in response");
  }

  if (!generatedVideo.video) {
    console.error("No video object in generatedVideo:", generatedVideo);
    throw new Error("No video data in generated response");
  }

  // Get video URI for frontend (client-side)
  const videoUri = generatedVideo.video.uri;
  if (!videoUri) {
    console.error("No URI in video object:", generatedVideo.video);
    throw new Error("No video URI available");
  }

  console.log("Video URI:", videoUri);

  // Use the correct API key variable
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

  // Try direct URI first (some Veo responses include auth in the URI)
  let downloadUrl = videoUri;

  // If URI doesn't contain key param, add it
  if (!videoUri.includes('key=')) {
    downloadUrl = `${videoUri}${videoUri.includes('?') ? '&' : '?'}key=${apiKey}`;
  }

  console.log("Attempting download from:", downloadUrl);

  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });

    console.log("Download response status:", response.status, response.statusText);

    if (!response.ok) {
      // Log more details for debugging
      const errorText = await response.text().catch(() => 'Could not read error body');
      console.error("Download error details:", {
        status: response.status,
        statusText: response.statusText,
        url: downloadUrl,
        errorBody: errorText.substring(0, 500)
      });
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    console.log("Video blob size:", videoBlob.size, "bytes");
    return URL.createObjectURL(videoBlob);
  } catch (fetchError) {
    console.error("Fetch error:", fetchError);

    // If direct fetch fails, return the URI directly (might work in video element)
    console.log("Direct fetch failed, returning URI for video element to try:", downloadUrl);
    return downloadUrl;
  }
};


// --- Helper Functions ---

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