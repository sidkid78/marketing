import { GoogleGenAI } from "@google/genai";
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
    const interaction = await client.interactions.create({
      model: 'gemini-3.1-pro-preview',
      input: story,
      system_instruction: `Analyze the user's story and break it down into 1 to 5 distinct sequential scenes.
        For each scene:
        1. "text": Extract the exact segment of the original story.
        2. "imagePrompt": Write a rich, single-paragraph descriptive prompt for the Gemini image model (gemini-3.1-flash-image). Do NOT write it as a stitched-together list of tags or labeled fragments — write flowing prose that naturally covers:
            - Subject & action: who/what is in the scene and what they are doing.
            - Setting & background: where this takes place, and what's around the subject.
            - Lighting: be specific (e.g. "soft golden-hour rim light", "moody three-point studio lighting", "harsh overhead fluorescent").
            - Camera angle & lens: be specific (e.g. "low-angle shot with a wide 24mm lens", "close-up portrait with shallow depth of field").
            - Visual style: general or specific (painting, photograph, charcoal sketch, isometric 3D, cel-shaded, etc.), optionally referencing an artist or art movement for a particular aesthetic.

            Consistency across scenes (critical for a storyboard):
            - Establish a single consistent visual style for the whole story in scene 1, then repeat that exact style description (same wording) in every subsequent scene's imagePrompt.
            - Give any recurring characters a fixed, specific physical description (age, build, hair, clothing, distinguishing features) the first time they appear, and repeat that exact description verbatim every time they reappear in a later scene's imagePrompt — do not paraphrase or vary it between scenes.
            - If a focus on faces matters for a scene, include the word "portrait" or "close-up" to push facial detail.`,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              imagePrompt: { type: 'string' }
            },
            required: ["text", "imagePrompt"]
          }
        }
      },
      store: false,
    });
    const rawScenes = JSON.parse(interaction.output_text || "[]");
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

  // Generated sequentially (not Promise.all) and chained via previous_interaction_id
  // so each new panel is generated with the prior panel as visual context. This is
  // what keeps character appearance and art style consistent across a storyboard,
  // rather than each scene being an independent, unrelated generation.
  const results: StoryScene[] = [];
  let lastInteractionId: string | undefined;

  for (const [index, scene] of scenes.entries()) {
    try {
      const input = lastInteractionId
        ? `Maintaining the exact same characters, art style, and visual continuity as the previous image, now depict this new moment: ${scene.imagePrompt}`
        : scene.imagePrompt;

      const interaction = await client.interactions.create({
        model: 'gemini-3.1-flash-image',
        input,
        ...(lastInteractionId ? { previous_interaction_id: lastInteractionId } : {}),
        response_format: {
          type: 'image',
          mime_type: 'image/jpeg',
          aspect_ratio: '16:9',
        },
        store: false,
      });

      const image = interaction.output_image;
      if (image?.data) {
        lastInteractionId = interaction.id;
        results.push({ ...scene, imageUrl: `data:${image.mime_type ?? 'image/jpeg'};base64,${image.data}` });
      } else {
        // No image came back — keep the chain going from whatever the last
        // successful interaction was, rather than breaking continuity entirely.
        results.push(scene);
      }
    } catch (error) {
      console.warn(`Image generation failed for scene ${index}, continuing chain from last successful scene.`, error);
      results.push(scene);
    }
  }

  return results;
};

/**
 * Generate Speech (TTS)
 */
export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const client = getClient();
  const interaction = await client.interactions.create({
    model: "gemini-3.1-flash-tts-preview",
    input: `Narrate this clearly: ${text}`,
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice: 'Charon' }],
    },
    store: false,
  });

  const base64Audio = interaction.output_audio?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  return decodeBase64(base64Audio);
};

/**
 * Generate a Context-Aware Video Prompt
 */
export const generateVideoPrompt = async (text: string, imageDescription: string): Promise<string> => {
  const client = getClient();
  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash',
    input: `Write a precise, cinematic prompt for an AI video generator (Gemini Omni Flash) to animate a static image.

    Context Story: "${text}"
    Visual Description: "${imageDescription}"

    Rules:
    - Focus on specific camera movements (pan, zoom, tilt) and subject motion.
    - Keep it under 40 words.
    - Output ONLY the prompt text.
    `,
    store: false,
  });
  return interaction.output_text || `Cinematic slow pan of ${imageDescription}`;
};

// Model ID for Omni Flash video generation.
//
// NOTE: There are two different model strings floating around for this model
// right now — 'gemini-omni-1.1-flash' (what the ai.google.dev docs page uses
// in every code sample) vs 'models/gemini-omni-flash-preview' (what an
// AI-Studio-generated code snippet used). These may be a GA id vs a preview
// alias for the same underlying model, or two different models entirely.
// Going with the AI Studio snippet's id here since it's evidence of an actual
// generated request rather than doc prose — but if this 404s / model-not-found
// on your key, swap this constant to 'gemini-omni-1.1-flash' and it should
// work identically everywhere else in this file.
const OMNI_VIDEO_MODEL = 'models/gemini-omni-flash-preview';

/**
 * Pulls base64 video data out of an Omni Flash interaction response.
 * Tries the SDK convenience field first (`interaction.output_video`, per the
 * docs), then falls back to scanning the raw `steps` array (the shape shown
 * in the AI Studio snippet) — since it's unclear yet whether the convenience
 * field is populated for the preview model id.
 */
function extractVideoOutput(interaction: any): { data: string; mime_type?: string } | null {
  if (interaction?.output_video?.data) {
    return interaction.output_video;
  }
  for (const step of interaction?.steps ?? []) {
    if (step?.type === 'model_output' && step?.content) {
      for (const part of step.content) {
        if (part?.type === 'video' && part?.data) {
          return part;
        }
      }
    }
  }
  return null;
}

/**
 * Animate Scene (Gemini Omni Flash)
 *
 * Migrated off the legacy Veo `models.generateVideos` + operations-polling API.
 * Omni Flash runs through the same Interactions API as everything else in this
 * file and returns base64 video synchronously (no polling loop needed) as long
 * as the clip stays under the ~4MB inline-delivery limit.
 *
 * Audio: Omni Flash generates a synthetic audio track by default. Since these
 * clips get muted and re-narrated in post anyway, we explicitly tell it not to
 * bother generating audio.
 *
 * Duration: pinned to 10s via response_format.duration, per your Omni Flash usage.
 */
export const animateScene = async (prompt: string, imageBase64: string): Promise<string> => {
  const client = getClient();

  // Extract base64 if it has the data URI prefix
  const pureBase64 = imageBase64.split(',')[1] || imageBase64;

  const interaction = await client.interactions.create({
    model: OMNI_VIDEO_MODEL,
    input: [
      { type: 'text', text: `${prompt}\n\nDo not generate any audio, dialogue, or music for this clip — it will be silent.` },
      { type: 'image', data: pureBase64, mime_type: 'image/jpeg' },
    ],
    response_format: {
      type: 'video',
      resolution: '720p',
      aspect_ratio: '16:9',
      duration: '10s',
    },
    store: false,
  });

  const video = extractVideoOutput(interaction);
  if (!video?.data) throw new Error("Failed to generate video");

  const videoBytes = decodeBase64(video.data);
  const videoBlob = new Blob([videoBytes], { type: video.mime_type ?? 'video/mp4' });
  return URL.createObjectURL(videoBlob);
};

/**
 * Generate an in-between frame/scene bridging two existing storyboard images
 * (Gemini Omni Flash frame interpolation).
 *
 * Not currently wired into the app's flow — you mentioned you have a separate
 * setup for interpolation today — but left here since Omni Flash supports it
 * natively: give it a first and last frame and a motion prompt, and it fills
 * in the transition. Worth revisiting if you ever want an "insert a scene
 * between these two" button without leaving this pipeline.
 */
export const interpolateBetweenScenes = async (
  firstFrameBase64: string,
  lastFrameBase64: string,
  transitionPrompt: string,
): Promise<string> => {
  const client = getClient();

  const pureFirst = firstFrameBase64.split(',')[1] || firstFrameBase64;
  const pureLast = lastFrameBase64.split(',')[1] || lastFrameBase64;

  const interaction = await client.interactions.create({
    model: OMNI_VIDEO_MODEL,
    input: [
      { type: 'text', text: `${transitionPrompt}\n\nDo not generate any audio, dialogue, or music for this clip — it will be silent.` },
      { type: 'image', data: pureFirst, mime_type: 'image/jpeg' },
      { type: 'image', data: pureLast, mime_type: 'image/jpeg' },
    ],
    response_format: {
      type: 'video',
      resolution: '720p',
      aspect_ratio: '16:9',
      duration: '10s',
    },
    store: false,
  });

  const video = extractVideoOutput(interaction);
  if (!video?.data) throw new Error("Failed to generate interpolated clip");

  const videoBytes = decodeBase64(video.data);
  const videoBlob = new Blob([videoBytes], { type: video.mime_type ?? 'video/mp4' });
  return URL.createObjectURL(videoBlob);
};

// --- Helper Functions ---

function decodeBase64(base64: string): Uint8Array<ArrayBuffer> {
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
//     // Filter out thought parts (which cause the `thoughtSignature` warning on response.text)
//     const textParts = response.candidates?.[0]?.content?.parts
//       ?.filter(p => !p.thought && p.text != null)
//       .map(p => p.text)
//       .join('') ?? '[]';
//     const rawScenes = JSON.parse(textParts);
//     return rawScenes.map((s: any, i: number) => ({
//       id: `scene-${Date.now()}-${i}`,
//       text: s.text,
//       imagePrompt: s.imagePrompt
//     }));
//   } catch (error) {
//     throw error;
//   }
// };

// const IMAGE_MODELS = ['gemini-3.1-flash-image-preview', 'gemini-3.1-pro-image-preview'];

// const generateImageWithFallback = async (
//   client: GoogleGenAI,
//   prompt: string,
// ): Promise<string | null> => {
//   for (const model of IMAGE_MODELS) {
//     try {
//       console.log(`Attempting image generation with model: ${model}`);
//       const response = await client.models.generateContent({
//         model,
//         contents: prompt,
//         config: {
//           imageConfig: {
//             aspectRatio: '16:9',
//           },
//         },
//       });
//       const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
//       if (imageData) {
//         console.log(`Image generated successfully with model: ${model}`);
//         return imageData;
//       }
//     } catch (error: any) {
//       const status = error?.status ?? error?.httpStatusCode ?? '';
//       console.warn(`Image generation failed with model: ${model} (status: ${status}). Trying next...`, error?.message);
//     }
//   }
//   console.error('All image generation models failed.');
//   return null;
// };

// export const generateSceneImages = async (scenes: StoryScene[]): Promise<StoryScene[]> => {
//   const client = getClient();
//   const imagePromises = scenes.map(async (scene) => {
//     const imageData = await generateImageWithFallback(client, scene.imagePrompt);
//     if (imageData) {
//       return { ...scene, imageUrl: `data:image/jpeg;base64,${imageData}` };
//     }
//     return scene;
//   });
//   return await Promise.all(imagePromises);
// };

// /**
//  * Helper function to decode base64 strings to Uint8Array
//  */
// function decodeBase64(base64: string): Uint8Array {
//   const binaryString = atob(base64);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes;
// }

// /**
//  * Generate Speech (TTS)
//  */
// export const generateSpeech = async (text: string): Promise<Uint8Array> => {
//   const client = getClient();
//   const response = await client.models.generateContent({
//     model: "gemini-2.5-flash-preview-tts",
//     contents: [{ parts: [{ text: `Narrate this clearly: ${text}` }] }],
//     config: {
//       responseModalities: ['AUDIO'],
//       speechConfig: {
//         voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algieba' } },
//       },
//     },
//   });

//   const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
//   if (!base64Audio) throw new Error("No audio data returned");

//   return decodeBase64(base64Audio);
// };

// /**
//  * Generate a Context-Aware Video Prompt
//  */
// export const generateVideoPrompt = async (text: string, imageDescription: string): Promise<string> => {
//   const client = getClient();
//   const response = await client.models.generateContent({
//     model: 'gemini-3.5-flash',
//     contents: `Write a precise, cinematic prompt for an AI video generator (Veo) to animate a static image.
      
//       Context Story: "${text}"
//       Visual Description: "${imageDescription}"
      
//       Rules:
//       - Focus on specific camera movements (pan, zoom, tilt) and subject motion.
//       - Keep it under 40 words.
//       - Output ONLY the prompt text.
//       `,
//   });
//   return response.text || `Cinematic slow pan of ${imageDescription}`;
// };

// /**
//  * Animate Scene (Veo)
//  */
// export const animateScene = async (prompt: string, imageBase64: string): Promise<string> => {
//   const client = getClient();

//   // Clean base64 if it has data URI prefix
//   const pureBase64 = imageBase64.includes(',')
//     ? imageBase64.split(',')[1]
//     : imageBase64;

//   console.log("Starting video generation with prompt:", prompt.substring(0, 100) + "...");

//   // Start video generation with proper image structure
//   let operation = await client.models.generateVideos({
//     model: 'veo-3.1-fast-generate-preview',
//     prompt: prompt,
//     image: {
//       imageBytes: pureBase64,
//       mimeType: 'image/jpeg',
//     },
//     config: {
//       numberOfVideos: 1,
//       resolution: '720p',
//       aspectRatio: '16:9',
//       durationSeconds: 8,
//       personGeneration: 'allow_adult',
//     },
//   });

//   console.log("Initial operation response:", JSON.stringify(operation, null, 2));

//   // Poll for completion (every 10 seconds as per docs)
//   let pollCount = 0;
//   const maxPolls = 30; // 5 minutes max wait
//   while (!operation.done && pollCount < maxPolls) {
//     console.log(`Waiting for video generation... (attempt ${pollCount + 1}/${maxPolls})`);
//     await new Promise(resolve => setTimeout(resolve, 10000));

//     // Refresh operation
//     operation = await client.operations.getVideosOperation({
//       operation: operation,
//     });
//     pollCount++;
//     console.log("Poll response:", JSON.stringify(operation, null, 2));
//   }

//   if (pollCount >= maxPolls) {
//     throw new Error("Video generation timed out after 5 minutes");
//   }

//   // Check for errors
//   if (operation.error) {
//     console.error("Video generation error:", operation.error);
//     throw new Error(`Video generation failed: ${operation.error.message}`);
//   }

//   // Log the full response to understand its structure
//   console.log("Final operation response:", JSON.stringify(operation.response, null, 2));

//   // Get the generated video
//   const generatedVideo = operation.response?.generatedVideos?.[0];
//   if (!generatedVideo) {
//     console.error("No generatedVideos in response:", operation.response);
//     throw new Error("No video generated in response");
//   }

//   if (!generatedVideo.video) {
//     console.error("No video object in generatedVideo:", generatedVideo);
//     throw new Error("No video data in generated response");
//   }

//   // Get video URI for frontend (client-side)
//   const videoUri = generatedVideo.video.uri;
//   if (!videoUri) {
//     console.error("No URI in video object:", generatedVideo.video);
//     throw new Error("No video URI available");
//   }

//   console.log("Video URI:", videoUri);

//   // Use the correct API key variable
//   const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

//   // Try direct URI first (some Veo responses include auth in the URI)
//   let downloadUrl = videoUri;

//   // If URI doesn't contain key param, add it
//   if (!videoUri.includes('key=')) {
//     downloadUrl = `${videoUri}${videoUri.includes('?') ? '&' : '?'}key=${apiKey}`;
//   }

//   console.log("Attempting download from:", downloadUrl);

//   try {
//     const response = await fetch(downloadUrl, {
//       method: 'GET',
//       mode: 'cors',
//       credentials: 'omit',
//     });

//     console.log("Download response status:", response.status, response.statusText);

//     if (!response.ok) {
//       // Log more details for debugging
//       const errorText = await response.text().catch(() => 'Could not read error body');
//       console.error("Download error details:", {
//         status: response.status,
//         statusText: response.statusText,
//         url: downloadUrl,
//         errorBody: errorText.substring(0, 500)
//       });
//       throw new Error(`Download failed: ${response.status} ${response.statusText}`);
//     }

//     const videoBlob = await response.blob();
//     console.log("Video blob size:", videoBlob.size, "bytes");
//     return URL.createObjectURL(videoBlob);
//   } catch (fetchError) {
//     console.error("Fetch error:", fetchError);

//     // If direct fetch fails, return the URI directly (might work in video element)
//     console.log("Direct fetch failed, returning URI for video element to try:", downloadUrl);
//     return downloadUrl;
//   }
// };


// // --- Helper Functions ---

// export async function decodeAudioData(
//   data: Uint8Array,
//   ctx: AudioContext,
//   sampleRate: number = 24000,
//   numChannels: number = 1,
// ): Promise<AudioBuffer> {
//   const dataInt16 = new Int16Array(data.buffer);
//   const frameCount = dataInt16.length / numChannels;
//   const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

//   for (let channel = 0; channel < numChannels; channel++) {
//     const channelData = buffer.getChannelData(channel);
//     for (let i = 0; i < frameCount; i++) {
//       // Simple conversion from Int16 to Float32 usually involves dividing by 32768
//       // Assuming the input data is 16-bit PCM.
//       channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
//     }
//   }
//   return buffer;
// }

// export const createWavUrl = (pcmData: Uint8Array, sampleRate: number = 24000): string => {
//   const numChannels = 1;
//   const byteRate = sampleRate * numChannels * 2;
//   const blockAlign = numChannels * 2;
//   const dataSize = pcmData.length;
//   const buffer = new ArrayBuffer(44 + dataSize);
//   const view = new DataView(buffer);

//   // RIFF chunk descriptor
//   writeString(view, 0, 'RIFF');
//   view.setUint32(4, 36 + dataSize, true);
//   writeString(view, 8, 'WAVE');

//   // fmt sub-chunk
//   writeString(view, 12, 'fmt ');
//   view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
//   view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
//   view.setUint16(22, numChannels, true); // NumChannels
//   view.setUint32(24, sampleRate, true); // SampleRate
//   view.setUint32(28, byteRate, true); // ByteRate
//   view.setUint16(32, blockAlign, true); // BlockAlign
//   view.setUint16(34, 16, true); // BitsPerSample

//   // data sub-chunk
//   writeString(view, 36, 'data');
//   view.setUint32(40, dataSize, true);

//   // Write PCM samples
//   const pcmBytes = new Uint8Array(buffer, 44);
//   pcmBytes.set(pcmData);

//   const blob = new Blob([buffer], { type: 'audio/wav' });
//   return URL.createObjectURL(blob);
// }

// function writeString(view: DataView, offset: number, string: string) {
//   for (let i = 0; i < string.length; i++) {
//     view.setUint8(offset + i, string.charCodeAt(i));
//   }
// }