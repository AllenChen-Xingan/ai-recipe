import React, { useState, useEffect, useRef } from 'react';
import { generateRecipeFromIngredients, generateRandomRecipe } from './services/geminiService';
import { Recipe, LoadingState, ViewState } from './types';
import RecipeCard from './components/RecipeCard';
import InputSection from './components/InputSection';
import SavedRecipesList from './components/SavedRecipesList';
import ApiKeyInput from './components/ApiKeyInput';
import { APP_TITLE, APP_SUBTITLE, ERROR_MESSAGE, STORAGE_KEY_FAVORITES } from './constants';
import { playTickSound, playSuccessSound } from './utils/audio';

const App: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = () => {
      const envKey = process.env.API_KEY;
      const storedKey = localStorage.getItem('zenkitchen_api_key');
      setHasApiKey(!!(envKey || storedKey));
    };
    checkApiKey();
  }, []);

  // Load favorites on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (stored) {
      try {
        setSavedRecipes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Audio Logic: Tick when loading
  useEffect(() => {
    if (loadingState === LoadingState.LOADING) {
      // Play immediately
      playTickSound();
      // Loop
      timerRef.current = window.setInterval(() => {
        playTickSound();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (loadingState === LoadingState.SUCCESS) {
          playSuccessSound();
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadingState]);

  const toggleFavorite = (targetRecipe: Recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.some(r => r.id === targetRecipe.id);
      let newRecipes;
      if (exists) {
        newRecipes = prev.filter(r => r.id !== targetRecipe.id);
      } else {
        newRecipes = [targetRecipe, ...prev];
      }
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newRecipes));
      return newRecipes;
    });
  };

  const removeFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedRecipes(prev => {
        const newRecipes = prev.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(newRecipes));
        return newRecipes;
    });
  };

  const handleGenerate = async (ingredients: string) => {
    setLoadingState(LoadingState.LOADING);
    setViewState('HOME');
    setError(null);
    setRecipe(null);
    try {
      const result = await generateRecipeFromIngredients(ingredients);
      setRecipe(result);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      setError(ERROR_MESSAGE);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleRandom = async () => {
    setLoadingState(LoadingState.LOADING);
    setViewState('HOME');
    setError(null);
    setRecipe(null);
    try {
      const result = await generateRandomRecipe();
      setRecipe(result);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      setError(ERROR_MESSAGE);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const isCurrentRecipeFavorite = recipe ? savedRecipes.some(r => r.id === recipe.id) : false;

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-earth-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
             <div onClick={() => setViewState('HOME')} className="cursor-pointer group">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-earth-900 tracking-tight group-hover:text-earth-700 transition-colors">
                {APP_TITLE}
                </h1>
                <p className="hidden md:block text-xs text-earth-600 uppercase tracking-widest">{APP_SUBTITLE}</p>
             </div>
             
             <button 
                onClick={() => setViewState(viewState === 'HOME' ? 'FAVORITES' : 'HOME')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${viewState === 'FAVORITES' ? 'bg-earth-700 text-white' : 'bg-earth-100 text-earth-800 hover:bg-earth-200'}`}
             >
                {viewState === 'FAVORITES' ? (
                    <>🏠 返回首页</>
                ) : (
                    <>📚 我的收藏 ({savedRecipes.length})</>
                )}
             </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        
        {viewState === 'FAVORITES' ? (
             <section className="animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-earth-900 mb-8 border-l-4 border-earth-600 pl-4">我的收藏夹</h2>
                <SavedRecipesList 
                    recipes={savedRecipes} 
                    onSelectRecipe={(r) => { setRecipe(r); setViewState('HOME'); window.scrollTo({top:0, behavior:'smooth'}); }}
                    onRemoveRecipe={removeFavorite}
                />
             </section>
        ) : (
            <>
                {/* API Key Input - Show if no API key */}
                <ApiKeyInput onApiKeySet={(key) => setHasApiKey(!!key)} />

                {/* Intro Text - Only show when no recipe and idle */}
                {!recipe && loadingState === LoadingState.IDLE && (
                    <div className="text-center space-y-4 max-w-2xl mx-auto py-8 opacity-90">
                        <p className="text-xl text-earth-800 leading-relaxed font-serif font-medium">
                        "以开源精神，重构健康饮食。"
                        </p>
                        <p className="text-base text-gray-600">
                            输入食材，AI 将实时从 GitHub 仓库获取 <b>HowToCook</b> 和 <b>CookLikeHOC(老乡鸡)</b> 的真实开源菜谱，<br/>
                            并为您改良为严格符合 <b>低糖低钠</b> 标准的 1 人食健康版本。
                        </p>
                    </div>
                )}

                {/* Input Area - Hide when showing result to clean up UI, or keep it? Let's keep it but maybe compact? Keeping as is for now. */}
                <section aria-label="菜谱生成区域" className={recipe ? "hidden md:block opacity-50 hover:opacity-100 transition-opacity" : ""}>
                    <InputSection 
                        onGenerate={handleGenerate} 
                        onRandom={handleRandom} 
                        loadingState={loadingState} 
                    />
                </section>

                {/* Error Display */}
                {loadingState === LoadingState.ERROR && (
                    <div role="alert" className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center font-medium animate-bounce">
                        {error}
                    </div>
                )}

                {/* Loading Indicator */}
                {loadingState === LoadingState.LOADING && (
                    <div role="status" className="flex flex-col items-center justify-center py-12 space-y-6 animate-pulse">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-earth-200 border-t-earth-700 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">🥣</div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-earth-900 font-bold text-xl">正在编译...</p>
                            <p className="text-earth-600 text-sm">正在从 HowToCook 和 CookLikeHOC 仓库获取真实菜谱</p>
                            <p className="text-xs text-gray-400 font-mono pt-2">Fetching: github.com/Anduin2017/HowToCook</p>
                            <p className="text-xs text-gray-400 font-mono">Fetching: github.com/Gar-b-age/CookLikeHOC</p>
                        </div>
                    </div>
                )}

                {/* Result Display */}
                {recipe && loadingState === LoadingState.SUCCESS && (
                    <section aria-label="生成的菜谱" className="transition-all duration-500 ease-in-out">
                        <RecipeCard 
                            recipe={recipe} 
                            isFavorite={isCurrentRecipeFavorite}
                            onToggleFavorite={toggleFavorite}
                        />
                        
                        <div className="mt-8 text-center md:hidden">
                            <button 
                                onClick={() => {
                                    setRecipe(null);
                                    setLoadingState(LoadingState.IDLE);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-earth-700 font-bold underline px-4 py-2"
                            >
                                生成新菜谱
                            </button>
                        </div>
                    </section>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;