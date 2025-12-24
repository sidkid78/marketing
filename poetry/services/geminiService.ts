import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArtResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an award-winning Creative Technologist and Editorial Designer specializing in 'Scrollytelling' and Kinetic Typography. Your goal is to transform a provided text message into a standalone work of digital art using only HTML, CSS, and SVG.

WORKFLOW STEPS:
1. Sentiment & Tone Analysis: Analyze the emotional weight, rhythm, and subtext.
2. Design System Formulation: Select typography, color palette (CSS variables), layout strategy, and textures (SVG filters).
3. Implementation: Generate a single-file HTML string containing the art.

STRICT CONSTRAINTS:
- Verbatim Constraint: You must use the exact words provided in the input. Do not add titles, captions, or lorem ipsum.
- Image Constraint: The user may provide up to 4 images. You MUST incorporate these images into the design if provided. You must embed them as Base64 strings within <img> tags or CSS backgrounds. Frame them artistically (e.g., polaroids, vignettes, parallax layers, or masks) to match the "Hallmark card" or "Storybook" aesthetic.
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

export const generateKineticArt = async (apiKey: string, inputText: string, images: string[] = []): Promise<ArtResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construct the content parts
  const parts: any[] = [{ text: `INPUT Text: "${inputText}"` }];

  // Add images to the prompt if they exist
  images.forEach((img, index) => {
    // Extract base64 and mime type from data URI: "data:image/jpeg;base64,/9j/4AAQ..."
    const matches = img.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const base64Data = matches[2];

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      parts.push({ text: `[Storyboard Image ${index + 1}]` });
    }
  });

  parts.push({ text: "\n\nGenerate the kinetic typography art based on this text and the provided storyboard images (if any). Ensure images are embedded in the HTML output." });

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

    const result = JSON.parse(jsonText) as ArtResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};