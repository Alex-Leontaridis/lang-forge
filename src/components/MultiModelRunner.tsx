import React, { useState } from 'react';
import { Play, Bot, Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4']);

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-900">Multi-Model Runner</span>
            <span className="text-sm text-gray-500">({selectedModels.length}/5)</span>
          </div>
          <button
            onClick={handleRunSelected}
            disabled={selectedModels.length === 0 || isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Selected'}</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((model) => {
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleModelToggle(model.id)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <img
                      src={model.logo}
                      alt={model.name + ' logo'}
                      className={
                        [
                          'object-contain',
                          model.provider === 'OpenAI' || model.provider === 'Anthropic' || model.provider === 'Meta' || model.provider === 'Alibaba'
                            ? 'h-10 w-10' // Larger for these providers
                            : 'h-7 w-7',
                          model.provider === 'OpenAI' ? '' : 'bg-white', // Remove bg for OpenAI
                          'rounded p-1'
                        ].join(' ')
                      }
                    />
                    <span className="font-medium text-gray-900 text-xs">{model.name}</span>
                  </div>
                  
                  {status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {isRunning && isSelected && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                
                {run && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
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

        {selectedModels.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select at least one model to run</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiModelRunner;