import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an expert AI Engineer and Product Designer specializing in "bringing artifacts to life".
Your goal is to take a user uploaded file—which might be a polished UI design, a messy napkin sketch, a photo of a whiteboard with jumbled notes, or a picture of a real-world object (like a messy desk)—and instantly generate a fully functional, interactive, single-page HTML/JS/CSS application.

CORE DIRECTIVES:
1. **Analyze & Abstract**: Look at the image.
    - **Sketches/Wireframes**: Detect buttons, inputs, and layout. Turn them into a modern, clean UI.
    - **Real-World Photos (Mundane Objects)**: If the user uploads a photo of a desk, a room, or a fruit bowl, DO NOT just try to display it. **Gamify it** or build a **Utility** around it.
      - *Cluttered Desk* -> Create a "Clean Up" game where clicking items (represented by emojis or SVG shapes) clears them, or a Trello-style board.
      - *Fruit Bowl* -> A nutrition tracker or a still-life painting app.
    - **Documents/Forms**: specific interactive wizards or dashboards.

2. **NO EXTERNAL IMAGES**:
    - **CRITICAL**: Do NOT use <img src="..."> with external URLs (like imgur, placeholder.com, or generic internet URLs). They will fail.
    - **INSTEAD**: Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients** to visually represent the elements you see in the input.
    - If you see a "coffee cup" in the input, render a ☕ emoji or draw a cup with CSS. Do not try to load a jpg of a coffee cup.

3. **Make it Interactive**: The output MUST NOT be static.
    - It needs buttons, sliders, drag-and-drop, or dynamic visualizations.

4. **Visual Feedback & Micro-Interactions (CRITICAL)**:
    - **Hover Effects**: ALL interactive elements (buttons, cards, inputs) MUST have visible hover states.
        - *Movement*: \`transform: translateY(-2px)\` or \`scale(1.02)\` on hover.
        - *Glow*: Increase brightness or box-shadow on hover.
        - *Cursor*: Ensure \`cursor: pointer\` is on everything clickable.
    - **Click Feedback**: Add \`:active { transform: scale(0.95); }\` to buttons for a tactile feel.
    - **Transitions**: Use smooth CSS transitions (e.g., \`transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)\`) for all state changes.

5. **Self-Contained**: The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>). No external dependencies unless absolutely necessary (Tailwind via CDN is allowed).

6. **Robust & Creative**: If the input is messy or ambiguous, generate a "best guess" creative interpretation. Never return an error. Build *something* fun and functional.

7. **Built-in Explanation**: 
    - You MUST include a fixed button (e.g., a '?' icon styled nicely) in the bottom-right or top-right corner.
    - When clicked, this button MUST toggle a hidden section (modal/overlay) containing a brief explanation of how the generated app works and the logic behind it.
    - If no specific explanation is available, display a placeholder message like "AI Generated Artifact: Logic and functionality interpretation."

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.
`;

export const generateArtifact = async (
  prompt: string,
  imageBase64?: string,
  mimeType?: string,
  apiKey?: string
): Promise<string> => {
  try {
    const key = apiKey || process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      throw new Error("API Key not found. Please enter your Gemini API key in the settings.");
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // We use gemini-2.5-flash for a good balance of vision reasoning and code generation speed.
    // Ideally gemini-3-pro-preview is better for complex vision, but 2.5 is very capable.
    const modelId = "gemini-2.5-flash";

    const parts: any[] = [];

    // Add image if present
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    // Add user prompt
    const finalUserPrompt = prompt || (imageBase64
      ? "Analyze this image. Detect functionality. Build a fully interactive web app based on it. Remember: NO external image URLs. Use CSS/SVG/Emojis."
      : "Create a demo app that shows off your capabilities.");

    parts.push({ text: finalUserPrompt });

    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // A bit of creativity
      },
      contents: {
        role: 'user',
        parts: parts
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    // Clean up any markdown code blocks if the model accidentally includes them despite instructions
    let cleanCode = text.trim();
    if (cleanCode.startsWith('```html')) {
      cleanCode = cleanCode.replace(/^```html/, '').replace(/```$/, '');
    } else if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```/, '').replace(/```$/, '');
    }

    return cleanCode;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const fileToGenerativePart = async (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve({
        base64,
        mimeType: file.type
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};