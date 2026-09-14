import { GoogleGenAI } from "@google/genai";
import type { GeneratorFormState } from "../types";

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
    5.  **Interactive Elements (CRITICAL):** 
        You MUST suggest where to place multimedia elements by using the following exact placeholder format:
        - For images: \`[Image: description of the image to generate]\`
        - For videos: \`[Video: description of the video sequence to generate]\`
        - For quizzes: \`[Quiz: the core topic or concept for a question]\`
        
        Even if the format isn't strictly 'Visual', integrate at least 2-3 of these placeholders where they add pedagogical value.

    Begin generating the content now.
  `;

    try {
      const interaction = await ai.interactions.create({
        model: "gemini-3.1-pro-preview",
        input: prompt,
        store: false,
      });
      return interaction.output_text || "No content generated";
    } catch (error) {
      console.error("Error generating content:", error);
      if (error instanceof Error) {
        return `An error occurred while generating content: ${error.message}`;
      }
      return "An unknown error occurred while generating content.";
    }
  };

  const generateImagePreview = async (prompt: string): Promise<string> => {
    try {
      const interaction = await ai.interactions.create({
        model: "gemini-3.5-lite-image",
        input: prompt,
        response_format: { type: 'image', mime_type: 'image/jpeg' },
        store: false,
      });

      const image = interaction.output_image;
      if (!image?.data) {
        throw new Error("No image data returned from Gemini");
      }

      return `data:${image.mime_type ?? 'image/jpeg'};base64,${image.data}`;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred while generating the image.");
    }
  };

  const generateQuizPreview = async (
    topic: string,
  ): Promise<{ question: string; options: string[]; answer: string }> => {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: `Generate a single, clear multiple-choice question about "${topic}". Provide one correct answer and three plausible incorrect distractors.`,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              items: { type: 'string' },
            },
            answer: {
              type: 'string',
              description: "The correct option from the options array.",
            },
          },
          required: ["question", "options", "answer"],
        },
      },
      store: false,
    });

    return JSON.parse(interaction.output_text || '{"question":"","options":[],"answer":""}');
  };

  /**
   * Generate a short video using Veo 3.1 and return a Blob URL that can be used
   * as the source for a <video> element in the browser.
   *
   * Note: Video generation can be slow and may incur additional costs. Check
   * pricing and quotas before heavy use.
   *
   * Still on the legacy `models.generateVideos` + operations-polling API. Video
   * generation is not covered by the public Interactions API docs, so this path
   * was left as-is rather than migrated on guesswork.
   */
  const generateVideoPreview = async (prompt: string): Promise<string> => {
    try {
      let operation = await ai.models.generateVideos({
        model: "veo-3.1-lite-generate-preview",
        prompt,
      });

      // Poll until the operation is complete.
      while (!operation.done) {
        // Wait ~10 seconds between polls to avoid spamming the API.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 10000));
        // eslint-disable-next-line no-await-in-loop
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const generatedVideo = operation.response?.generatedVideos?.[0];
      const uri = (generatedVideo as any)?.video?.uri as string | undefined;
      if (!uri) {
        throw new Error("No downloadable video URI returned.");
      }

      // In the browser, fetch the video bytes directly using the API key header,
      // then wrap them in a Blob and expose them as an object URL for <video>.
      const response = await fetch(uri, {
        headers: {
          "x-goog-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Video download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error generating video:", error);
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred while generating the video.");
    }
  };

  return {
    generateContent,
    generateImagePreview,
    generateQuizPreview,
    generateVideoPreview,
  };
}