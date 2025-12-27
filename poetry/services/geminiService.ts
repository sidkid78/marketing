import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArtResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an award-winning Creative Technologist and Editorial Designer specializing in 'Scrollytelling' and Kinetic Typography. Your goal is to transform a provided text message into a standalone work of digital art using only HTML, CSS, Tailwind and SVG.

WORKFLOW STEPS:
1. Sentiment & Tone Analysis: Analyze the emotional weight, rhythm, and subtext.
2. Design System Formulation: Select typography, color palette (CSS variables), layout strategy, and textures (SVG filters).
3. Implementation: Generate a single-file HTML string containing the art.

SVG FILTER & VISUAL EFFECTS GUIDANCE:
You are encouraged to use advanced SVG filters within your <style> or inline to create professional, high-end editorial aesthetics. Examples:
- TEXTURE & GRAIN: Use <feTurbulence type="fractalNoise"> combined with <feColorMatrix> to create paper textures, film grain, or cinematic noise.
- DEPTH & GLOW: Use <feGaussianBlur> and <feOffset> to create soft drop shadows, "glow" effects, or frosted glass (glassmorphism) overlays.
- ORGANIC DISTORTION: Use <feDisplacementMap> with a turbulence source to create liquid text effects, heat waves, or glitch aesthetics.
- COLOR GRADING: Use <feColorMatrix> to adjust saturation, create vintage sepia tones, or dramatic high-contrast duotone effects.
Apply these filters creatively to backgrounds, text layers, or images to achieve a unique and artistic visual style.

STRICT CONSTRAINTS:
- Verbatim Constraint: You must use the exact words provided in the input. Do not add titles, captions, or lorem ipsum.
- Image Constraint: The user may provide up to 4 images. You MUST incorporate these images into the design if provided. You must embed them as Base64 strings within <img> tags or CSS backgrounds. Frame them artistically (e.g., polaroids, vignettes, parallax layers, or masks) to match the "Hallmark card" or "Storybook" aesthetic.
- AI Imagery: If an [AI Generated Mood Image] is provided, use it as a primary atmospheric background, texture, or key visual element.
- Tech Stack: HTML5 with internal <style>. No external JavaScript libraries. Use modern CSS (Grid, Flexbox, clamp(), mix-blend-mode, @keyframes).
- Responsiveness: Must look like an art piece on mobile and desktop (vmax, vmin, %).
- Accessibility: Ensure sufficient contrast.
- Output Format: You must return a JSON object containing the 'rationale' (analysis and design thoughts) and the 'html' (the full code).
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rationale: {
      type: Type.STRING,
      description: "A concise summary of the emotional landscape, design system rationale, and how the storyboard images were used.",
    },
    html: {
      type: Type.STRING,
      description: "The complete, standalone HTML5 code block for the digital art piece.",
    },
  },
  required: ["rationale", "html"],
};

/**
 * Generates a prompt for the image model based on the user's text.
 */
async function generateImagePrompt(ai: GoogleGenAI, text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text and write a short, vivid, artistic image generation prompt that captures its mood, tone, and imagery. 
    The image will be used as a background or atmospheric element in a kinetic typography piece. 
    Keep it abstract, textural, or cinematic. 
    
    TEXT: "${text}"
    
    PROMPT:`,
  });
  return response.text || "Abstract artistic texture with soft lighting";
}

/**
 * Generates an image using Gemini 2.5 Flash Image.
 */
async function generateMoodImage(ai: GoogleGenAI, prompt: string): Promise<string | null> {
  try {
    // Using gemini-2.5-flash-image for generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.warn("Failed to generate AI image:", error);
    return null;
  }
}

export const generateKineticArt = async (apiKey: string, inputText: string, images: string[] = [], enableAiImage: boolean = false): Promise<ArtResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Generate AI Mood Image if requested
  let aiImageBase64: string | null = null;
  if (enableAiImage) {
    try {
      const imagePrompt = await generateImagePrompt(ai, inputText);
      aiImageBase64 = await generateMoodImage(ai, imagePrompt);
    } catch (e) {
      console.error("Error in AI image generation pipeline", e);
    }
  }

  // 2. Construct the content parts for the main generation
  const parts: any[] = [{ text: `INPUT Text: "${inputText}"` }];

  // Add user uploaded images
  images.forEach((img, index) => {
    const matches = img.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.push({
        inlineData: {
          data: matches[2],
          mimeType: matches[1]
        }
      });
      parts.push({ text: `[Storyboard Image ${index + 1}]` });
    }
  });

  // Add AI generated image
  if (aiImageBase64) {
    const matches = aiImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.push({
        inlineData: {
          data: matches[2],
          mimeType: matches[1]
        }
      });
      parts.push({ text: `[AI Generated Mood Image] (Use this for background or atmospheric texture)` });
    }
  }

  parts.push({ text: "\n\nGenerate the kinetic typography art based on this text. Integrate the provided images (User Storyboard and/or AI Mood Image) into the design." });

  // 3. Generate the Code
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 1.2,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response received from Gemini.");
    }

    // Log raw response for debugging
    console.log("Raw Gemini response length:", jsonText.length);
    console.log("Raw Gemini response (first 500 chars):", jsonText.substring(0, 500));
    console.log("Raw Gemini response (last 500 chars):", jsonText.substring(Math.max(0, jsonText.length - 500)));

    // Validate the response before parsing
    let result: ArtResult;
    try {
      result = JSON.parse(jsonText) as ArtResult;
    } catch (parseError: any) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse JSON. Raw response:", jsonText);

      // Try to identify the problematic area
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const position = parseInt(errorMatch[1], 10);
        const start = Math.max(0, position - 100);
        const end = Math.min(jsonText.length, position + 100);
        console.error(`Problematic area (position ${position}):`, jsonText.substring(start, end));
      }

      throw new Error(`Failed to parse Gemini response: ${parseError.message}. This may be due to a malformed response from the API. Check console for details.`);
    }

    // Validate the result has required properties
    if (!result.rationale || !result.html) {
      throw new Error("Invalid response structure: missing 'rationale' or 'html' field");
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};