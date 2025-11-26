import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'zenkitchen_api_key';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // Check if API key is already stored
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      onApiKeySet(stored);
      setShowInput(false);
    } else if (!process.env.API_KEY) {
      // No API key in env and not in storage, show input
      setShowInput(true);
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEY, apiKey.trim());
      onApiKeySet(apiKey.trim());
      setShowInput(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setShowInput(true);
    onApiKeySet('');
  };

  // If API key exists in env, don't show anything
  if (process.env.API_KEY && !showInput) {
    return (
      <div className="text-xs text-gray-500 text-center mt-2">
        使用环境配置的 API Key
        <button
          onClick={() => setShowInput(true)}
          className="ml-2 text-earth-600 hover:text-earth-800 underline"
        >
          切换自定义
        </button>
      </div>
    );
  }

  if (!showInput && localStorage.getItem(STORAGE_KEY)) {
    return (
      <div className="text-xs text-gray-500 text-center mt-2">
        API Key 已配置 ✓
        <button
          onClick={handleClear}
          className="ml-2 text-earth-600 hover:text-earth-800 underline"
        >
          更换
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mb-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
      <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ 需要 API Key</h3>
      <p className="text-sm text-yellow-800 mb-4">
        此应用需要 Google Gemini API Key 才能运行。
        你可以从 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AI Studio</a> 免费获取。
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            输入你的 Gemini API Key:
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          保存并开始使用
        </button>

        <p className="text-xs text-gray-600">
          ℹ️ API Key 将安全地保存在你的浏览器本地存储中，不会发送到任何服务器。
        </p>
      </form>
    </div>
  );
};

export default ApiKeyInput;
