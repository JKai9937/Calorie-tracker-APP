import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

// Using gemini-3-flash-preview as it's the recommended multimodal model
const MODEL_NAME = "gemini-3-flash-preview";

export async function analyzeFoodImage(base64Image: string): Promise<FoodItem> {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // Clean base64 data
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const prompt = `你是一个专业的营养分析师。请分析这张图片中的食物：
  1. 识别主要食物名称（中文）。
  2. 估算热量（kcal）和三大营养素（蛋白质、碳水、脂肪，单位克）。
  3. 提供一句简短的专业点评（20字以内）。
  
  请直接返回以下 JSON 格式，不要包含任何 Markdown 格式：
  {
    "name": "食物名称",
    "calories": 100,
    "macros": { "protein": 10, "carbs": 20, "fat": 5 },
    "confidence": 95,
    "evaluation": "点评内容"
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
    });

    const text = response.text || "";
    // Extract JSON safely
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
        throw new Error(`AI 返回了非 JSON 内容: ${text.substring(0, 100)}...`);
    }
    
    const jsonStr = text.substring(start, end + 1);
    const result = JSON.parse(jsonStr);

    return {
      name: result.name || "未知食物",
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
      evaluation: `错误详情: ${error.message || '未知 API 错误'}。请尝试减小图片尺寸或检查网络。`,
      timestamp: new Date(),
    };
  }
}