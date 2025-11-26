import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isFavorite, onToggleFavorite }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up relative group">
      {/* Favorite Button */}
      <button 
        onClick={() => onToggleFavorite(recipe)}
        aria-label={isFavorite ? "取消收藏" : "收藏菜谱"}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-earth-600"
      >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isFavorite ? "#ef4444" : "none"} 
            stroke={isFavorite ? "#ef4444" : "#4b5563"} 
            className="w-6 h-6 transition-colors"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      {/* Header Image Placeholder - utilizing a deterministic random image based on title length to keep it visually stable */}
      <div className="h-48 w-full bg-earth-200 relative">
        <img 
          src={`https://picsum.photos/800/400?random=${recipe.title.length + recipe.id.length}`} 
          alt="菜品示意图" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
           <h2 className="text-3xl font-serif font-bold text-white drop-shadow-md pr-8">{recipe.title}</h2>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Meta Info - Updated colors for better contrast (WCAG) */}
        <div className="flex flex-wrap gap-4 text-earth-900 items-center">
            <span className="flex items-center gap-2 bg-earth-100 px-3 py-1 rounded-full text-sm font-bold text-earth-800">
                ⏱️ {recipe.cookingTimeMinutes} 分钟
            </span>
            <span className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                🥗 低钠
            </span>
            <span className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                📉 控糖
            </span>
            <span className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                👤 1 人食
            </span>
        </div>

        <p className="text-gray-700 italic border-l-4 border-earth-500 pl-4 text-lg">
            {recipe.description}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-earth-900 border-b border-earth-200 pb-2">食材清单</h3>
                <ul className="space-y-3" role="list">
                    {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-800">
                            <input 
                                type="checkbox" 
                                id={`ing-${idx}`}
                                aria-label={`标记 ${ing} 为已准备`}
                                className="mt-1.5 h-5 w-5 text-earth-700 rounded border-gray-300 focus:ring-earth-600 cursor-pointer" 
                            />
                            <label htmlFor={`ing-${idx}`} className="cursor-pointer select-none leading-relaxed">
                                {ing}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-earth-900 border-b border-earth-200 pb-2">烹饪步骤</h3>
                <ol className="space-y-6" role="list">
                    {recipe.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-4">
                            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-earth-800 text-white font-bold text-sm">
                                {idx + 1}
                            </span>
                            <p className="text-gray-800 leading-relaxed pt-1">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-earth-50 rounded-xl p-6 border border-earth-200 space-y-4">
             <div>
                <h4 className="font-bold text-earth-900 flex items-center gap-2 text-lg">
                    🧠 营养亮点
                </h4>
                <p className="text-gray-700 mt-2 leading-relaxed">{recipe.nutritionalHighlights}</p>
             </div>
             <div>
                <h4 className="font-bold text-earth-900 flex items-center gap-2 text-lg">
                    👨‍🍳 大厨秘籍
                </h4>
                <p className="text-gray-700 mt-2 leading-relaxed">{recipe.chefTips}</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;