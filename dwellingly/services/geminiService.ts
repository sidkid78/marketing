import { GoogleGenAI } from "@google/genai";

export const generateAIResponse = async (userMessage: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "API Configuration Error: Google Gemini API Key is missing. Please enter your API key in the settings above.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const modelId = "gemini-3-flash-preview";
    const systemInstruction = `
      You are Dwellingly AI, a helpful assistant for Texas FSBO (For Sale By Owner) real estate transactions.
      
      CORE RULES:
      1. You are NOT a lawyer, broker, or agent. DO NOT represent the user.
      2. You CANNOT give legal advice, pricing opinions, or negotiation strategy.
      3. If a user asks for legal advice, explicitly state: "I cannot provide legal advice. Please consult a Texas real estate attorney."
      
      OUTPUT TEMPLATE (Strictly Follow This):
      When explaining a step, term, or document, structure your response exactly like this:
      
      **1. What it is:** [Simple definition]
      **2. What to gather:** [List of docs or info needed]
      **3. Common mistakes:** [1-2 common pitfalls]
      **4. When to escalate:** [When to call a pro]

      Keep answers specific to Texas Real Estate (TREC) contracts and forms.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the assistance service right now. Please try again later.";
  }
};