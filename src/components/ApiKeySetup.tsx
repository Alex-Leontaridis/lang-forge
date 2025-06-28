import React, { useState } from 'react';
import { Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { OpenAIService } from '../services/openai';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError('OpenAI API keys should start with "sk-"');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Initialize the OpenAI service with the provided API key
      OpenAIService.initialize(apiKey);
      
      // Store the API key in localStorage (in production, use more secure storage)
      localStorage.setItem('openai_api_key', apiKey);
      
      // Update the environment variable for the current session
      (window as any).__OPENAI_API_KEY__ = apiKey;
      
      // Validate the key by making a simple API call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      onApiKeySet();
    } catch (error) {
      setError('Invalid API key. Please check and try again.');
      localStorage.removeItem('openai_api_key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup OpenAI API</h1>
          <p className="text-gray-600">
            Enter your OpenAI API key to start using PromptForge with real AI models.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              onKeyPress={(e) => e.key === 'Enter' && handleSetApiKey()}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSetApiKey}
            disabled={isValidating}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Set API Key</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>How to get your API key:</span>
          </h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Visit the OpenAI Platform</li>
            <li>Sign in to your account</li>
            <li>Go to API Keys section</li>
            <li>Create a new secret key</li>
          </ol>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-black hover:text-gray-700 text-sm font-medium mt-2"
          >
            <span>Open OpenAI Platform</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          Your API key is stored locally and never sent to our servers.
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;