
import { GoogleGenAI } from "@google/genai";
import { StrategistInput, StrategistOutput } from "../types";

export const generateStrategy = async (input: StrategistInput, apiKey?: string): Promise<StrategistOutput> => {
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

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

  // Note: `propertyOrdering` was a Gemini schema extension and has no plain
  // JSON Schema equivalent, so it is dropped here.
  const interaction = await ai.interactions.create({
    model: 'gemini-3.6-flash',
    input: textPrompt,
    generation_config: { thinking_level: 'high' },
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: {
        type: 'object',
        properties: {
          thinkingProcess: { type: 'string' },
          painAnalysis: {
            type: 'object',
            properties: {
              frustration: { type: 'string' },
              storyAdvantage: { type: 'string' }
            },
            required: ["frustration", "storyAdvantage"]
          },
          professionAnalysis: {
            type: 'object',
            properties: {
              provenEconomy: { type: 'string' },
              fractionalizationStrategy: { type: 'string' }
            },
            required: ["provenEconomy", "fractionalizationStrategy"]
          },
          passionAnalysis: {
            type: 'object',
            properties: {
              obsessiveEdge: { type: 'string' },
              selfCorrection: { type: 'string' }
            },
            required: ["obsessiveEdge", "selfCorrection"]
          },
          synthesis: {
            type: 'object',
            properties: {
              concept: { type: 'string' },
              markdown: { type: 'string' }
            },
            required: ["concept", "markdown"]
          },
          unfairAdvantage: { type: 'string' }
        },
        required: ["thinkingProcess", "painAnalysis", "professionAnalysis", "passionAnalysis", "synthesis", "unfairAdvantage"]
      }
    },
    store: false,
  });

  const textOutput = interaction.output_text;
  if (!textOutput) throw new Error("No text response from AI");
  const resultData = JSON.parse(textOutput) as StrategistOutput;

  // 2. Generate a visual representation based on the strategy analysis
  try {
    const imagePrompt = `Create a professional business concept visualization that represents:
  
  CONCEPT: ${resultData.synthesis.concept}
  
  KEY ELEMENTS TO VISUALIZE:
  - The Pain Point: ${resultData.painAnalysis.frustration}
  - The Solution: ${resultData.professionAnalysis.fractionalizationStrategy}
  - The Unique Edge: ${resultData.passionAnalysis.obsessiveEdge}
  
  Style: Clean, modern, professional business illustration. Abstract representation of the concept with symbolic imagery. High quality, sharp detail, cohesive color palette. No text in the image.`;

    const imageInteraction = await ai.interactions.create({
      model: 'gemini-3.1-flash-image',
      input: imagePrompt,
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: '16:9',
      },
      store: false,
    });

    const image = imageInteraction.output_image;
    if (image?.data) {
      resultData.imageUrl = `data:${image.mime_type ?? 'image/jpeg'};base64,${image.data}`;
    }
  } catch (imageErr) {
    console.warn("Visual Core Failed: Visual synthesis bypassed.", imageErr);
  }

  return resultData;
};
