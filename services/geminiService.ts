import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

// Using gemini-3-flash-preview as it's the recommended multimodal model
const MODEL_NAME = "gemini-3-flash-preview";

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // Clean base64 data
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `分析食物。识别名称、热量、营养素。提供简短评价。
  必须严格返回纯 JSON，格式如下：
  {
    "name": "食物名",
    "calories": 100,
    "macros": { "protein": 10, "carbs": 20, "fat": 5 },
    "confidence": 95,
    "evaluation": "简短评价"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: data } },
          { text: prompt }
        ],
      }],
      config: {
        temperature: 0.4, // Lower temperature for more deterministic/faster output
      }
    });

    const text = response.text || "";
    // Extract JSON safely
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
        throw new Error("AI output format error");
    }
    
    const jsonStr = text.substring(start, end + 1);
    const result = JSON.parse(jsonStr);

    return {
      name: result.name || "Unknown",
      calories: Number(result.calories) || 0,
      macros: {
        protein: Number(result.macros?.protein) || 0,
        carbs: Number(result.macros?.carbs) || 0,
        fat: Number(result.macros?.fat) || 0
      },
      confidence: result.confidence || 0,
      evaluation: result.evaluation || "",
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      name: "Analysis Failed",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
      evaluation: "请检查网络连接或稍后重试。",
      timestamp: new Date(),
    };
  }
}