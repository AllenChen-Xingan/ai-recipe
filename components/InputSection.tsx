import React, { useState } from 'react';
import { LoadingState } from '../types';

interface InputSectionProps {
  onGenerate: (ingredients: string) => void;
  onRandom: () => void;
  loadingState: LoadingState;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, onRandom, loadingState }) => {
  const [ingredients, setIngredients] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onGenerate(ingredients);
    }
  };

  const isLoading = loadingState === LoadingState.LOADING;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl shadow-lg border border-earth-100">
        <label htmlFor="ingredients" className="block text-base font-bold text-earth-900 mb-3">
           冰箱里的 Source Code (食材)
        </label>
        <div className="relative">
            <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="例如：鸡腿 (参考老乡鸡)、豆腐、西红柿 (HowToCook风格)..."
            aria-describedby="ingredients-hint"
            className="w-full p-4 h-32 rounded-xl border border-earth-300 focus:ring-2 focus:ring-earth-600 focus:border-transparent outline-none resize-none text-gray-800 bg-earth-50 placeholder-gray-500 transition-all text-lg"
            disabled={isLoading}
            />
        </div>
        <p id="ingredients-hint" className="text-sm text-gray-600 mt-1">
            输入食材，我们将参考开源菜谱为你编译 Low-Sodium 版本。
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
                type="submit"
                disabled={isLoading || !ingredients.trim()}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-700
                    ${isLoading || !ingredients.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-earth-700 hover:bg-earth-800'}`}
                aria-busy={isLoading}
            >
                {isLoading ? '正在编译菜谱...' : '智能生成'}
            </button>
            
            <button
                type="button"
                onClick={onRandom}
                disabled={isLoading}
                className={`flex-1 py-3 px-6 rounded-xl font-bold border-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-600
                    ${isLoading ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-earth-700 text-earth-800 hover:bg-earth-50'}`}
                aria-busy={isLoading}
            >
                🎲 随机 Fork 一道
            </button>
        </div>
      </form>
    </div>
  );
};

export default InputSection;
