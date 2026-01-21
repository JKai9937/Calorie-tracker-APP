import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

// Using the recommended model for general image tasks
const MODEL_NAME = "gemini-2.5-flash-image";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

  const prompt = `Analyze this food image. Identify the main dish. 
  1. Estimate calories and macros (protein, carbs, fat).
  2. Provide a short, 1-sentence evaluation (e.g., "High protein, great for post-workout" or "High sugar, consume in moderation").
  
  Return ONLY a raw JSON object (no markdown formatting, no code fences) with the following structure:
  {
    "name": "Food Name",
    "calories": 100,
    "macros": { "protein": 10, "carbs": 20, "fat": 5 },
    "confidence": 95,
    "evaluation": "Advice here"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: 'gemini-2.5-flash-image' does not support responseSchema/responseMimeType like the text models do.
      // We rely on the prompt to get JSON.
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Cleanup: remove markdown code blocks if the model adds them despite instructions
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);

    return {
      name: data.name || "Unknown Food",
      calories: data.calories || 0,
      macros: data.macros || { protein: 0, carbs: 0, fat: 0 },
      confidence: data.confidence || 0,
      evaluation: data.evaluation || "No evaluation provided.",
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback mock data
    return {
      name: "Detected Food",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
      evaluation: "Could not analyze image.",
      timestamp: new Date(),
    };
  }
}