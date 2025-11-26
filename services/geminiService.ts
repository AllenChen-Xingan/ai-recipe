import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Recipe } from "../types";
import { searchRecipesByIngredients, getRandomRecipe, type RecipeSource } from "./githubService";

// Initialize Gemini Client with fallback to stored API key
let ai: GoogleGenAI;

const getApiKey = (): string => {
  // Priority: process.env > localStorage
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }

  const storedKey = localStorage.getItem('zenkitchen_api_key');
  if (storedKey) {
    return storedKey;
  }

  throw new Error('No API key found. Please set your Gemini API key.');
};

const initializeAI = () => {
  const apiKey = getApiKey();
  ai = new GoogleGenAI({ apiKey });
};

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
    // Initialize AI with current API key
    initializeAI();

    // Step 1: Fetch real recipes from GitHub
    console.log('🔍 Searching GitHub repositories for recipes...');
    const githubRecipes = await searchRecipesByIngredients(ingredients, 3);

    if (githubRecipes.length === 0) {
      throw new Error('No recipes found from GitHub repositories');
    }

    // Step 2: Format GitHub recipes as context for AI
    const recipeContext = githubRecipes.map((recipe, idx) => `
### 参考食谱 ${idx + 1} (来自 ${recipe.repo})
来源: ${recipe.url}
内容:
${recipe.content}
---
`).join('\n');

    console.log(`✅ Found ${githubRecipes.length} recipes from GitHub`);

    // Step 3: Send to AI with real GitHub data
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `用户输入的食材：${ingredients}

我已经从 GitHub 开源仓库中检索到以下真实菜谱作为参考：

${recipeContext}

任务：
1. 分析以上来自 'HowToCook' 和 'CookLikeHOC' (老乡鸡) 的真实开源菜谱
2. 根据用户的食材，选择最相关的菜谱进行改良
3. 将其重构为【1人食、低钠、低糖】版本
4. 步骤中必须包含精确的量化指标（时间、重量）
5. 在 description 字段中明确说明参考了哪个具体的 GitHub 菜谱

重要：请基于上面提供的真实 GitHub 菜谱内容进行改良，而不是凭空想象。`,
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
    // Initialize AI with current API key
    initializeAI();

    // Step 1: Fetch a random real recipe from GitHub
    console.log('🎲 Fetching random recipe from GitHub repositories...');
    const githubRecipe = await getRandomRecipe();

    console.log(`✅ Found random recipe: ${githubRecipe.path} from ${githubRecipe.repo}`);

    // Step 2: Send to AI with real GitHub data
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `我从 GitHub 开源仓库中随机选择了以下真实菜谱：

### 来自 ${githubRecipe.repo}
来源: ${githubRecipe.url}
内容:
${githubRecipe.content}

任务：
1. 分析这道来自 '${githubRecipe.repo}' 的真实开源菜谱
2. 将其"Fork"并"Patch"为【1人食、低钠、低糖】改良版
3. 步骤中必须包含精确的量化指标（时间、重量）
4. 在 description 字段中明确说明参考了 GitHub 上的哪个具体菜谱
5. 保持极客精神（精准）和家常味道（好吃）的完美结合

重要：请基于上面提供的真实 GitHub 菜谱内容进行改良，而不是凭空想象。`,
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