import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArtResult, ArtType } from "../types";

const SYSTEM_INSTRUCTION = `
You are an award-winning Creative Technologist and Editorial Designer specializing in 'Scrollytelling', Kinetic Typography, and Motion Graphics. Your goal is to transform text into a standalone digital art piece.

FORMAT SPECIALIZATIONS:
- CARD (Default): A single-frame, high-impact editorial piece. Focus on composition and depth.
- CAROUSEL: A multi-panel experience. Use CSS Scroll Snap or internal vanilla JS/CSS logic to allow users to swipe through "chapters" of the text. Each panel should feel like a new page in a luxury magazine.
- REEL: A vertical (9:16) auto-playing motion piece. Use complex CSS @keyframes to sequence text and images over time. It should feel cinematic and rhythmic.

SVG FILTER & VISUAL EFFECTS GUIDANCE:
You are encouraged to use advanced SVG filters to create professional, high-end editorial aesthetics. To bring these to life, integrate animations using SMIL <animate> tags synchronized with CSS @keyframes:

1. ANIMATED NOISE (Grain/Static):
   - Technique: Animate the 'seed' or 'baseFrequency' of <feTurbulence>.
   - Implementation: Insert <animate attributeName="seed" values="0;100" dur="1s" repeatCount="indefinite" /> inside the <feTurbulence> tag.
   - Usage: Apply to backgrounds for a "film grain" look or text for a "glitch" effect.

2. DYNAMIC MOTION BLUR:
   - Technique: Animate 'stdDeviation' in <feGaussianBlur> to simulate speed.
   - Implementation: Sync with CSS movement. As an element moves via CSS @keyframes (e.g., transform: translateX(-100%)), strictly coordinate an SVG <animate attributeName="stdDeviation" values="20,0; 0,0" dur="0.5s" fill="freeze" /> to blur it only during the motion.
   - Result: Cinematic, realistic motion streaks that mimic a camera shutter.

3. LIQUID / DISTORTION:
   - Technique: Use <feDisplacementMap> with an animated <feTurbulence> source.
   - Implementation: Animate 'baseFrequency' (e.g., values="0.01;0.05;0.01") to make text feel like it's underwater or radiating heat.

4. STATIC FILTERS:
   - DISTRESS: <feTurbulence type="fractalNoise"> + <feColorMatrix type="saturate" values="0"> + <feComposite> for worn, distressed textures.
   - HALFTONE: <feTurbulence> passed through a high-contrast <feColorMatrix> to create dot-grid clusters.
   - CHROMATIC ABERRATION: Split RGB channels via <feColorMatrix> and apply slight <feOffset> to each.

ACCESSIBILITY & COLOR CONTRAST:
- Readability First: Text must remain legible regardless of artistic flair. Prioritize a contrast ratio of at least 4.5:1 (WCAG AA standards).
- Contrast Strategy: When placing text over complex, textured, or animated backgrounds:
  - Use high-contrast color pairings (e.g., Deep Charcoal on Cream, Neon Lime on Black).
  - Apply protective CSS layers such as 'text-shadow', 'drop-shadow', or semi-transparent background washes (e.g., 'bg-black/30') behind the text.
  - Utilize 'mix-blend-mode: difference' or 'exclusion' where appropriate to ensure text pops against dynamic backgrounds.
  - Avoid relying on color alone to convey hierarchy; use size, weight, and spacing as well.

STRICT CONSTRAINTS:
- Verbatim Constraint: You must use the exact words provided.
- Tech Stack: HTML5, CSS (Tailwind allowed), SVG. NO external JS libraries. Internal <script> (vanilla) is allowed for carousels or simple sequencing.
- Image Constraint: Incorporate provided images artistically (User Storyboard or AI Mood Image). The user may provide up to 5 images.
- Output: Return JSON with 'rationale' and 'html'.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rationale: {
      type: Type.STRING,
      description: "A concise summary of the emotional landscape and format choice.",
    },
    html: {
      type: Type.STRING,
      description: "The complete, standalone HTML5 code block.",
    },
  },
  required: ["rationale", "html"],
};

async function generateImagePrompt(ai: GoogleGenAI, text: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following text and write a short, vivid, artistic image generation prompt for a background texture. Mood: "${text}"`,
  });
  return response.text || "Abstract artistic texture";
}

async function generateMoodImage(ai: GoogleGenAI, prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export const generateKineticArt = async (
  apiKey: string,
  inputText: string,
  images: string[] = [],
  enableAiImage: boolean = false,
  artType: ArtType = 'card'
): Promise<ArtResult> => {
  const ai = new GoogleGenAI({ apiKey });
  let aiImageBase64: string | null = null;

  if (enableAiImage) {
    const imagePrompt = await generateImagePrompt(ai, inputText);
    aiImageBase64 = await generateMoodImage(ai, imagePrompt);
  }

  const parts: any[] = [{ text: `INPUT Text: "${inputText}"` }];
  parts.push({ text: `FORMAT REQUESTED: ${artType.toUpperCase()}` });

  images.forEach((img, index) => {
    const matches = img.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      parts.push({ inlineData: { data: matches[2], mimeType: matches[1] } });
      parts.push({ text: `[User Image ${index + 1}]` });
    }
  });

  if (aiImageBase64) {
    const matches = aiImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      parts.push({ inlineData: { data: matches[2], mimeType: matches[1] } });
      parts.push({ text: `[AI Mood Image] Use as atmosphere.` });
    }
  }

  parts.push({ text: `\n\nGenerate the ${artType} art. Ensure the layout matches the ${artType} format (e.g., vertical for reels, swipeable for carousels). Use advanced SVG filters as instructed.` });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 1.0,
      },
    });

    const result = JSON.parse(response.text || '{}') as ArtResult;
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};