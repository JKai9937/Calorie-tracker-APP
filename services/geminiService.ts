import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

const MODEL_NAME = "gemini-2.5-flash-image";

// Safely access environment variable to prevent crash in browser environments
const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Could not access process.env.API_KEY directly.");
    }
    return "";
};

const apiKey = getApiKey();

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  if (!apiKey) {
      return {
          name: "Missing API Key",
          calories: 0,
          macros: { protein: 0, carbs: 0, fat: 0 },
          confidence: 0,
          evaluation: "API_KEY not found. Please set it in your deployment environment variables (e.g. Vercel).",
          timestamp: new Date(),
      };
  }

  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

  const prompt = `Analyze this food image. Identify the main dish. 
  1. Estimate calories and macros (protein, carbs, fat).
  2. Provide a short, 1-sentence evaluation.
  Return ONLY raw JSON:
  {
    "name": "Food Name",
    "calories": 100,
    "macros": { "protein": 10, "carbs": 20, "fat": 5 },
    "confidence": 95,
    "evaluation": "Advice"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ],
      },
    });

    let text = response.text || "";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);

    return {
      name: data.name || "Unknown Food",
      calories: data.calories || 0,
      macros: data.macros || { protein: 0, carbs: 0, fat: 0 },
      confidence: data.confidence || 0,
      evaluation: data.evaluation || "",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      name: "Analysis Failed",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
      evaluation: "Error communicating with Gemini API.",
      timestamp: new Date(),
    };
  }
}