import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Recipe } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is automatically injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "菜品名称（如：老乡鸡风味-无水葱油焖鸡·改良版）" },
    description: { type: Type.STRING, description: "简短描述该菜谱参考了哪个开源项目（HowToCook或老乡鸡）的灵感，以及做了哪些健康改良" },
    cookingTimeMinutes: { type: Type.INTEGER, description: "总准备和烹饪时间（分钟）" },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "食材列表，包含精确的公制单位（如：鸡腿 200g），专为1人份设计"
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "分步烹饪说明。包含精确的时间（秒/分）和火候描述。"
    },
    nutritionalHighlights: { type: Type.STRING, description: "为什么这道改良菜符合低钠/低糖饮食" },
    chefTips: { type: Type.STRING, description: "源自开源社区的避坑指南或技术总结" }
  },
  required: ["title", "description", "cookingTimeMinutes", "ingredients", "steps", "nutritionalHighlights", "chefTips"]
};

// Helper to add ID
const enrichRecipe = (jsonText: string): Recipe => {
    const recipe = JSON.parse(jsonText) as Recipe;
    // Generate a simple unique ID based on timestamp and random string
    recipe.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    return recipe;
};

export const generateRecipeFromIngredients = async (ingredients: string): Promise<Recipe> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `输入食材：${ingredients}。
      任务：请搜索你知识库中 'HowToCook' (程序员做饭指南) 或 '老乡鸡' 相关的经典做法。
      1. 匹配最合适的炖菜/焖菜食谱。
      2. 将其重构为【1人食、低钠、低糖】版本。
      3. 步骤中必须包含精确的量化指标（时间、重量）。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return enrichRecipe(jsonText);
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

export const generateRandomRecipe = async (): Promise<Recipe> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `请从开源食谱项目（HowToCook 或 老乡鸡）中随机挑选一道高人气的【炖菜/焖菜】。
      将其“Fork”并“Patch”为【1人食・低钠控糖版】。
      给我一道既有极客精神（精准）又有家常味道（好吃）的惊喜料理。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return enrichRecipe(jsonText);
  } catch (error) {
    console.error("Error generating random recipe:", error);
    throw error;
  }
};