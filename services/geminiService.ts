import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

// Increased timeout to 30 seconds to prevent premature "Connection Failed"
const timeout = (ms: number) => new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Request timed out")), ms)
);

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      console.error("API Key is missing");
      throw new Error("API_KEY is missing in environment");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `Identify this food. You MUST return valid JSON.
  Structure:
  {
    "name": "Food Name",
    "calories": 100,
    "macros": { "protein": 10, "carbs": 20, "fat": 5 },
    "evaluation": "One sentence comment."
  }`;

  try {
    // Race between API call and 30s timeout
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
                temperature: 0.4,
                // CRITICAL: Force the model to output JSON. This prevents markdown errors.
                responseMimeType: "application/json", 
            }
        }),
        timeout(30000) 
    ]);

    let text = (response as any).text || "";
    
    // Safety cleanup: Remove markdown code blocks if they still exist
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
        console.error("Raw AI Output:", text);
        throw new Error("AI returned invalid format");
    }
    
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
    console.error("Gemini Error Detail:", error);
    
    // Return a structured error object that preserves the actual error message
    let errorMessage = "Could not identify food.";
    if (error.message === "Request timed out") errorMessage = "Network timeout (30s).";
    else if (error.message.includes("API_KEY")) errorMessage = "Invalid API Key.";
    else if (error.message.includes("fetch failed")) errorMessage = "Network offline.";
    
    return {
      name: "Analysis Failed",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
      evaluation: errorMessage, // Pass the real error to the UI
      timestamp: new Date(),
    };
  }
}