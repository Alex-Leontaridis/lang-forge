import React, { useState } from 'react';
import { Play, Bot, Clock, Zap, CheckCircle, AlertCircle, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Model, ModelRun } from '../types';

interface MultiModelRunnerProps {
  models: Model[];
  onRunModels: (selectedModels: string[]) => Promise<void>;
  isRunning: boolean;
  runs: ModelRun[];
}

const MultiModelRunner: React.FC<MultiModelRunnerProps> = ({
  models,
  onRunModels,
  isRunning,
  runs
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    const saved = localStorage.getItem('multiModelRunnerSelectedModels');
    return saved ? JSON.parse(saved) : ['gpt-4'];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId].slice(0, 5) // Max 5 models
    );
  };

  const handleRunSelected = () => {
    if (selectedModels.length > 0) {
      onRunModels(selectedModels);
      setIsExpanded(false); // Auto-collapse after run
    }
  };

  const getRunStatus = (modelId: string) => {
    const run = runs.find(r => r.modelId === modelId);
    if (!run) return 'idle';
    return 'completed';
  };

  const formatExecutionTime = (time: number) => {
    return `${(time / 1000).toFixed(1)}s`;
  };

  const providers = [...new Set(models.map(m => m.provider))];

  // Enhanced provider options with better categorization
  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    { value: 'OpenAI', label: 'OpenAI' },
    { value: 'Google', label: 'Google' },
    { value: 'Alibaba Cloud', label: 'Alibaba Cloud' },
    { value: 'Meta', label: 'Meta' },
    { value: 'DeepSeek', label: 'DeepSeek' },
    { value: 'Groq', label: 'Groq' },
    { value: 'OpenRouter', label: 'OpenRouter' },
    { value: 'Nvidia', label: 'Nvidia' },
    { value: 'Mistral', label: 'Mistral' },
    { value: 'MiniMax', label: 'MiniMax' },
    { value: 'Hugging Face', label: 'Hugging Face' },
    { value: 'Anthropic', label: 'Anthropic' }
  ];

  // Filter models based on provider mapping
  const getProviderCategory = (provider: string) => {
    const providerMap: Record<string, string> = {
      'OpenAI': 'OpenAI',
      'Google': 'Google',
      'Alibaba Cloud': 'Alibaba Cloud',
      'Meta': 'Meta',
      'DeepSeek': 'DeepSeek',
      'Groq': 'Groq',
      'OpenRouter': 'OpenRouter',
      'Nvidia': 'Nvidia',
      'Mistral': 'Mistral',
      'MiniMax': 'MiniMax',
      'Hugging Face': 'Hugging Face',
      'Anthropic': 'Anthropic'
    };
    
    // Map specific providers to categories
    if (provider.includes('google') || provider.includes('gemini') || provider.includes('gemma')) {
      return 'Google';
    }
    if (provider.includes('alibaba') || provider.includes('qwen')) {
      return 'Alibaba Cloud';
    }
    if (provider.includes('meta') || provider.includes('llama')) {
      return 'Meta';
    }
    if (provider.includes('deepseek')) {
      return 'DeepSeek';
    }
    if (provider.includes('mistral')) {
      return 'Mistral';
    }
    if (provider.includes('minimax')) {
      return 'MiniMax';
    }
    if (provider.includes('nvidia')) {
      return 'Nvidia';
    }
    if (provider.includes('hugging') || provider.includes('distil')) {
      return 'Hugging Face';
    }
    
    return providerMap[provider] || provider;
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = searchTerm === '' || 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvider = filterProvider === 'all' || getProviderCategory(model.provider) === filterProvider;
    
    return matchesSearch && matchesProvider;
  });

  // Mock data for testing
  const mockModels: Model[] = [
    // OpenAI models (direct API)
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Advanced reasoning and analysis',
      provider: 'OpenAI',
      logo: '/src/logo/openai.png',
      enabled: true
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient generation',
      provider: 'OpenAI',
      logo: '/src/logo/openai.png',
      enabled: true
    },
    
    // Groq models (direct API)
    {
      id: 'gemma2-9b-it',
      name: 'Gemma 2 9B IT',
      description: '8K context, 8K output - Instruction-tuned LLM',
      provider: 'Groq',
      logo: '/src/logo/google.png',
      enabled: true
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      description: '131K context, 131K output - Fast, general-purpose LLM',
      provider: 'Groq',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      description: '131K context, 32K output - High-quality generation LLM',
      provider: 'Groq',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'deepseek-r1-distill-llama-70b',
      name: 'DeepSeek R1 Distill Llama 70B',
      description: '131K context, 131K output - Distilled LLaMA LLM',
      provider: 'Groq',
      logo: '/src/logo/deepseek.png',
      enabled: true
    },
    {
      id: 'llama-4-maverick-17b-128e-instruct',
      name: 'Llama 4 Maverick 17B',
      description: '131K context, 8K output - LLaMA 4 instruct LLM',
      provider: 'Groq',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'llama-4-scout-17b-16e-instruct',
      name: 'Llama 4 Scout 17B',
      description: '131K context, 8K output - Smaller LLaMA 4 instruct LLM',
      provider: 'Groq',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'mistral-saba-24b',
      name: 'Mistral Saba 24B',
      description: '32K context, 32K output - General-purpose LLM',
      provider: 'Groq',
      logo: '/src/logo/mistral.png',
      enabled: true
    },
    {
      id: 'qwen-qwq-32b',
      name: 'Qwen QWQ 32B',
      description: '131K context, 131K output - Multilingual LLM',
      provider: 'Groq',
      logo: '/src/logo/qwen.png',
      enabled: true
    },
    {
      id: 'qwen3-32b',
      name: 'Qwen3 32B',
      description: '131K context, 40K output - Advanced multilingual LLM',
      provider: 'Groq',
      logo: '/src/logo/qwen.png',
      enabled: true
    },
    
    // OpenRouter models
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      description: '131K context - Multilingual, strong benchmark performance',
      provider: 'Meta (OpenRouter)',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'qwen/qwen-2.5-coder-32b-instruct',
      name: 'Qwen2.5 Coder 32B Instruct',
      description: '33K context - Advanced code generation and reasoning',
      provider: 'Qwen (OpenRouter)',
      logo: '/src/logo/qwen.png',
      enabled: true
    },
    {
      id: 'meta-llama/llama-3.2-11b-vision-instruct',
      name: 'Llama 3.2 11B Vision Instruct',
      description: '131K context - Multimodal model (image + text)',
      provider: 'Meta (OpenRouter)',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'meta-llama/llama-3.2-1b-instruct',
      name: 'Llama 3.2 1B Instruct',
      description: '131K context - Lightweight multilingual LLM',
      provider: 'Meta (OpenRouter)',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'qwen/qwen-2.5-72b-instruct',
      name: 'Qwen2.5 72B Instruct',
      description: '33K context - Long-text, multilingual, structured output',
      provider: 'Qwen (OpenRouter)',
      logo: '/src/logo/qwen.png',
      enabled: true
    },
    {
      id: 'meta-llama/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B Instruct',
      description: '131K context - Fast and efficient generation',
      provider: 'Meta (OpenRouter)',
      logo: '/src/logo/meta.png',
      enabled: true
    },
    {
      id: 'mistralai/mistral-nemo',
      name: 'Mistral Nemo',
      description: '131K context - Multilingual with function calling',
      provider: 'Mistral (OpenRouter)',
      logo: '/src/logo/mistral.png',
      enabled: true
    },
    {
      id: 'google/gemma-2-9b-it',
      name: 'Gemma 2 9B IT',
      description: '8K context - Versatile and efficient open-source LLM',
      provider: 'Google (OpenRouter)',
      logo: '/src/logo/google.png',
      enabled: true
    },
    {
      id: 'mistralai/mistral-7b-instruct',
      name: 'Mistral 7B Instruct',
      description: '33K context - High-performing 7B model',
      provider: 'Mistral (OpenRouter)',
      logo: '/src/logo/mistral.png',
      enabled: true
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-left"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Multi-Model Runner</span>
              <span className="text-xs sm:text-sm text-gray-500">({selectedModels.length}/5)</span>
            </button>
            
            <button
              onClick={handleRunSelected}
              disabled={selectedModels.length === 0 || isRunning}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run Selected'}</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none bg-white"
                >
                  {providerOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
            {filteredModels.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              const status = getRunStatus(model.id);
              const run = runs.find(r => r.modelId === model.id);

              return (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModelToggle(model.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleModelToggle(model.id)}
                        className="rounded border-gray-300 text-black focus:ring-black flex-shrink-0"
                      />
                      
                      {/* Logo Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={model.logo}
                          alt={`${model.provider} logo`}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            // Fallback to a default logo if image fails to load
                            (e.target as HTMLImageElement).src = '/src/logo/openai.png';
                          }}
                        />
                      </div>
                      
                      {/* Model Name */}
                      <span className="font-medium text-gray-900 text-sm truncate">{model.name}</span>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {isRunning && isSelected && (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{model.description}</p>
                  
                  {run && (
                    <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatExecutionTime(run.executionTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{run.tokenUsage.total} tokens</span>
                      </div>
                      {run.score && (
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Score: {run.score.overall}/10</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No models found matching your criteria</p>
            </div>
          )}

          {selectedModels.length === 0 && filteredModels.length > 0 && (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select at least one model to run</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiModelRunner;