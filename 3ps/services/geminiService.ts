
import { GoogleGenAI, Type } from "@google/genai";
import { StrategistInput, StrategistOutput } from "../types";

export const generateStrategy = async (input: StrategistInput): Promise<StrategistOutput> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Generate the text-based strategy analysis
  const textPrompt = `
    Analyze the following user data using the 3Ps Framework.
    
    USER CONTEXT: ${input.userContext}
    TARGET AUDIENCE: ${input.targetAudience}
    OUTPUT STYLE: ${input.outputStyle}

    FRAMEWORK DEFINITIONS:
    1. PAIN (The Story Advantage): Identify the personal frustration that provides deep empathy. This is the marketing hook.
    2. PROFESSION (The Validated Shortcut): Identify where people already exchange money for this solution. Fractionalize a proven high-value service.
    3. PASSION (The Obsessive Edge): Identify granular, technical, or specific depth (the "cost of a single kernel of popcorn").

    REQUIRED STEPS:
    1. Pain Analysis (Story): Extract core frustration and draft a "Story Advantage" headline.
    2. Profession Analysis (Economy): Identify the "Proven Economy" and suggest a "Fractionalization Strategy".
    3. Passion Analysis (Edge): Dig for the "Obsessive Edge". If vague, hypothesize the "kernel of popcorn" metric.
    4. Thinking Process: Before final synthesis, critique your own assumptions and logic.
    5. Synthesis: Combine all elements into a unified concept.
  `;

  const textResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: textPrompt }] }],
    config: {
      temperature: 0.8,
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thinkingProcess: { type: Type.STRING },
          painAnalysis: {
            type: Type.OBJECT,
            properties: {
              frustration: { type: Type.STRING },
              storyAdvantage: { type: Type.STRING }
            },
            propertyOrdering: ["frustration", "storyAdvantage"]
          },
          professionAnalysis: {
            type: Type.OBJECT,
            properties: {
              provenEconomy: { type: Type.STRING },
              fractionalizationStrategy: { type: Type.STRING }
            },
            propertyOrdering: ["provenEconomy", "fractionalizationStrategy"]
          },
          passionAnalysis: {
            type: Type.OBJECT,
            properties: {
              obsessiveEdge: { type: Type.STRING },
              selfCorrection: { type: Type.STRING }
            },
            propertyOrdering: ["obsessiveEdge", "selfCorrection"]
          },
          synthesis: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              markdown: { type: Type.STRING }
            },
            propertyOrdering: ["concept", "markdown"]
          },
          unfairAdvantage: { type: Type.STRING }
        },
        required: ["thinkingProcess", "painAnalysis", "professionAnalysis", "passionAnalysis", "synthesis", "unfairAdvantage"]
      }
    }
  });

  const textOutput = textResponse.text;
  if (!textOutput) throw new Error("No text response from AI");
  const resultData = JSON.parse(textOutput) as StrategistOutput;

  // 2. Generate a visual representation of the concept with Cyberpunk aesthetic
  try {
    const imagePrompt = `A stunning cyberpunk high-tech business concept visualization titled "${resultData.synthesis.concept}". Aesthetic: Neon Cyan and Fuchsia accents, dark sleek metallic textures, holographic UI displays, futuristic office or data center landscape. Ultra-professional, sharp detail, volumetric lighting, 8k resolution, cinematic composition. No text in the image. Modern and high-leverage business vibe.`;

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    if (imageResponse.candidates && imageResponse.candidates[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          resultData.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
  } catch (imageErr) {
    console.warn("Visual Core Failed: Visual synthesis bypassed.", imageErr);
  }

  return resultData;
};
