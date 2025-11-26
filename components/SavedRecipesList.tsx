import React from 'react';
import { Recipe } from '../types';

interface SavedRecipesListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onRemoveRecipe: (e: React.MouseEvent, recipeId: string) => void;
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({ recipes, onSelectRecipe, onRemoveRecipe }) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 opacity-70">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-serif font-bold text-earth-800 mb-2">暂无收藏</h3>
        <p className="text-gray-600">你还没有收藏任何菜谱。去生成一个吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {recipes.map((recipe) => (
        <div 
          key={recipe.id} 
          onClick={() => onSelectRecipe(recipe)}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-earth-100 group flex flex-col"
        >
          <div className="h-32 bg-earth-200 relative overflow-hidden">
             <img 
                src={`https://picsum.photos/800/400?random=${recipe.title.length + recipe.id.length}`} 
                alt={recipe.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg text-earth-900 line-clamp-2 leading-tight mb-2">
                    {recipe.title}
                </h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {recipe.description}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-earth-50">
                <span className="text-xs font-bold bg-earth-50 text-earth-700 px-2 py-1 rounded">
                    ⏱️ {recipe.cookingTimeMinutes} 分钟
                </span>
                <button
                    onClick={(e) => onRemoveRecipe(e, recipe.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="删除收藏"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.636-1.452zM12.9 8.16a.75.75 0 01-.75.75h-3.25a.75.75 0 010-1.5h3.25a.75.75 0 01.75.75zM12 12.75a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0v-4.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedRecipesList;