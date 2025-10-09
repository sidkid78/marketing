import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratorFormState } from '../types';

export function createContentStudioService(apiKey: string) {
  if (!apiKey) {
    throw new Error("A Gemini API key is required");
  }
  const ai = new GoogleGenAI({ apiKey });

  const generateContent = async (formData: GeneratorFormState): Promise<string> => {
    const { contentType, targetAudience, topic, formatPreference } = formData;

  const prompt = `
    You are an expert instructional designer and content creator. Your task is to generate high-quality educational content based on the following specifications. The output must be well-structured, comprehensive, engaging, and formatted using Markdown.

    **Content Specifications:**
    - **Content Type:** ${contentType}
    - **Target Audience:** ${targetAudience}
    - **Topic/Subject:** ${topic}
    - **Format Preference:** ${formatPreference}

    **Instructions:**
    1.  **Structure:** Create a logical flow for the content. For a 'Course', this means an outline with modules and lessons. For a 'Tutorial', provide clear, numbered, step-by-step instructions. For a 'Guide', offer a comprehensive overview with distinct sections.
    2.  **Tone & Language:** Adjust the tone and complexity of the language to suit the '${targetAudience}'.
    3.  **Formatting:** Use Markdown extensively for clarity (e.g., headings, lists, bold text, code blocks).
    4.  **Content Details:** Flesh out the content with explanations, examples, and relevant details.
    5.  **Format-Specific Suggestions:**
        - If the format is 'Visual', 'Interactive', or 'Multimedia', explicitly suggest where to place elements like \`[Image: description]\`, \`[Video: description]\`, or \`[Quiz: question]\` within the content.
        - For 'Text-based' format, focus purely on high-quality written content.

    Begin generating the content now.
  `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || 'No content generated';
    } catch (error) {
      console.error("Error generating content:", error);
      if (error instanceof Error) {
        return `An error occurred while generating content: ${error.message}`;
      }
      return "An unknown error occurred while generating content.";
    }
  };

  const generateImagePreview = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes || '';
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  };

  const generateQuizPreview = async (topic: string): Promise<{ question: string; options: string[]; answer: string; }> => {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Generate a single, clear multiple-choice question about "${topic}". Provide one correct answer and three plausible incorrect distractors.`,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      question: { type: Type.STRING },
                      options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      },
                      answer: { type: Type.STRING, description: "The correct option from the options array." }
                  },
                  required: ["question", "options", "answer"]
              },
          },
      });

      return JSON.parse(response.text || '{"question":"","options":[],"answer":""}');
  };

  return { generateContent, generateImagePreview, generateQuizPreview };
}