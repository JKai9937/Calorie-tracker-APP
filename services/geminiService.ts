import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

// Helper for timeout
const timeout = (ms: number) => new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Request timed out")), ms)
);

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `Identify food. Return JSON only.
  Format: {"name": "Food Name", "calories": 100, "macros": {"protein": 10, "carbs": 20, "fat": 5}, "evaluation": "Brief comment."}`;

  try {
    // Race between API call and 15s timeout
    const response = await Promise.race([
        ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                parts: [
                { inlineData: { mimeType: "image/jpeg", data: data } },
                { text: prompt }
                ],
            }],
            config: {
                temperature: 0.3, // Lower temperature = faster, more deterministic
            }
        }),
        timeout(15000) // 15 seconds hard timeout
    ]);

    const text = (response as any).text || "";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) throw new Error("Invalid JSON");
    
    const result = JSON.parse(text.substring(start, end + 1));

    return {
      name: result.name || "Unknown Food",
      calories: Number(result.calories) || 0,
      macros: {
        protein: Number(result.macros?.protein) || 0,
        carbs: Number(result.macros?.carbs) || 0,
        fat: Number(result.macros?.fat) || 0
      },
      confidence: 1,
      evaluation: result.evaluation || "Analysis complete.",
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return {
      name: "Analysis Failed",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
      evaluation: error.message === "Request timed out" ? "Network timeout. Please retry." : "Could not identify food.",
      timestamp: new Date(),
    };
  }
}