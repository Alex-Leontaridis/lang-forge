import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Play, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Bot, 
  Award,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PromptNode, PromptScore } from '../types';

interface PromptNodeData extends PromptNode {
  onUpdate: (id: string, updates: Partial<PromptNode>) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

const PromptNodeComponent: React.FC<NodeProps<PromptNodeData>> = ({ id, data }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(data.title);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);

  const models = [
    { id: 'gpt-4', name: 'GPT-4', color: 'bg-purple-500' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5', color: 'bg-green-500' },
    { id: 'claude-3', name: 'Claude 3', color: 'bg-orange-500' },
    { id: 'gemini-pro', name: 'Gemini Pro', color: 'bg-blue-500' },
    { id: 'llama-2', name: 'Llama 2', color: 'bg-red-500' }
  ];

  const selectedModel = models.find(m => m.id === data.model) || models[0];

  const handleTitleSave = () => {
    data.onUpdate(id, { title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(data.title);
    setIsEditingTitle(false);
  };

  const handlePromptChange = (prompt: string) => {
    data.onUpdate(id, { prompt });
  };

  const handleModelChange = (model: string) => {
    data.onUpdate(id, { model });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const extractVariables = (prompt: string) => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const variables = extractVariables(data.prompt);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-w-[320px] max-w-[400px] overflow-hidden">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />

      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="flex-1 px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                autoFocus
              />
              <button onClick={handleTitleSave} className="text-green-600 hover:text-green-700">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleTitleCancel} className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{data.title}</h3>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => data.onDelete(id)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${selectedModel.color}`}></div>
          <select
            value={data.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="text-xs bg-transparent border-none outline-none text-gray-600 font-medium"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Prompt Input */}
          <div className="p-4">
            <textarea
              value={data.prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Enter your prompt here... Use {{variables}} for dynamic content."
              className="w-full h-24 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />

            {/* Variables */}
            {variables.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-600 mb-2">Variables:</div>
                <div className="flex flex-wrap gap-1">
                  {variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={() => data.onRun(id)}
              disabled={data.isRunning || !data.prompt.trim()}
              className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className={`w-4 h-4 ${data.isRunning ? 'animate-pulse' : ''}`} />
              <span>{data.isRunning ? 'Running...' : 'Run'}</span>
            </button>
          </div>

          {/* Output Section */}
          {(data.output || data.isRunning) && (
            <div className="border-t border-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Output</span>
                    {data.score && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(data.score.overall)}`}>
                        {data.score.overall}/10
                      </div>
                    )}
                  </div>
                  {data.output && (
                    <button
                      onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isOutputExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {data.isRunning ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : data.output ? (
                  <div className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${isOutputExpanded ? '' : 'max-h-20 overflow-hidden'}`}>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {data.output}
                    </pre>
                  </div>
                ) : null}

                {/* Score Details */}
                {data.score && isOutputExpanded && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Relevance</div>
                        <div className="font-semibold text-sm">{data.score.relevance}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Clarity</div>
                        <div className="font-semibold text-sm">{data.score.clarity}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600">Creativity</div>
                        <div className="font-semibold text-sm">{data.score.creativity}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 italic">
                      {data.score.critique}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {data.output && (
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>~2.1s</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{Math.floor(data.output.length / 4)} tokens</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(PromptNodeComponent);