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
        model: "gemini-3.8-flash",
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
        model: "gemini-3.1-flash-lite-image",
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
   * Generate a short video using Gemini Omni Flash and return a Blob URL that
   * can be used as the source for a <video> element in the browser.
   *
   * Note: Video generation can be slow and may incur additional costs. Check
   * pricing and quotas before heavy use.
   */
  const generateVideoPreview = async (prompt: string): Promise<string> => {
    try {
      const interaction = await ai.interactions.create({
        model: "gemini-omni-1.1-flash",
        input: prompt,
        response_format: { type: 'video' },
        store: false,
      });

      const video = interaction.output_video;
      const mimeType = video?.mime_type ?? "video/mp4";
      if (video?.data) {
        const bytes = Uint8Array.from(atob(video.data), (c) => c.charCodeAt(0));
        return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
      }
      if (!video?.uri) {
        throw new Error("No video data returned.");
      }

      // In the browser, fetch the video bytes directly using the API key header,
      // then wrap them in a Blob and expose them as an object URL for <video>.
      const response = await fetch(video.uri, {
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