
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("API Key is missing. Please provide a valid API key.");
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getMentorship(history: ChatMessage[], prompt: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are an expert entrepreneurial mentor based on Alex Hormozi's philosophies. Your advice is blunt, high-leverage, and narrative-driven.

          Core Frameworks to use:
          1. MERCENARY VS MISSIONARY: Features are commoditized. Mercenaries use logic/features. Missionaries use narrative/obsession. Aim for the Missionary approach to build trust and a brand premium.
          2. THE BRAND MOSAIC: A brand is built over time with tiles of content: 
             - Personal Philosophies (Values)
             - Adjacent Interests (Hobbies like fitness, art)
             - Unique Life Experiences (Struggles/Triumphs)
             - Personal Relationships (Spouse/Partners)
          3. FEAR IS THE PRISON: Use "Play It Out" to move from Amygdala (vague terror) to Prefrontal Cortex (specific logic).
          4. THE 3 P'S (PAIN, PROFESSION, PASSION): Root ideas in authentic lived experience.
          5. FOCUS: Reject the "Woman in the Red Dress." Commitment is the elimination of alternatives.

          Context History: ${JSON.stringify(history)}
          
          Current user question: ${prompt}`
          }]
        }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text;
  }

  async auditBrandStory(story: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit this brand story for the "Missionary vs Mercenary" distinction.
      Story: "${story}"
      
      Analysis requirements:
      1. Is it logic-driven (mercenary) or obsession-driven (missionary)?
      2. Suggest how to lean into the "3Ps" (Pain, Profession, Passion) more effectively.
      3. Rewrite it to be 10x more compelling by targeting the emotional centers (amygdala) rather than just functional specs.`
    });
    return response.text;
  }

  async auditCultureFeedback(feedback: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert leadership coach. Audit this employee feedback for the "Kind vs Nice" distinction based on Alex Hormozi's management principles.
      
      Feedback to audit: "${feedback}"
      
      Requirements:
      1. Distinguish if it's "Nice" (hiding the truth to save feelings) or "Kind" (telling the truth to save the person's growth).
      2. Identify any emotional "insults" (non-actionable labels like 'lazy') versus objective "criticism" (gap between targets and reality).
      3. Rewrite the feedback to be 100% "Kind", direct, and actionable.`
    });
    return response.text;
  }
}
