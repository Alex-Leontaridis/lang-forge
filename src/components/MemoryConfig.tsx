import React, { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Hash, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Database,
  Network,
  FileText,
  Zap,
  Clock,
  Users,
  Search,
  Layers
} from 'lucide-react';
import { MemoryConfig } from '../types';

interface MemoryConfigProps {
  memory: MemoryConfig;
  onMemoryChange: (memory: MemoryConfig) => void;
}

const MemoryConfigComponent: React.FC<MemoryConfigProps> = ({ memory, onMemoryChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const memoryTypes = [
    {
      id: 'conversation_buffer',
      name: 'Conversation Buffer',
      description: 'Simple memory that keeps a list of chat messages',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      id: 'conversation_summary',
      name: 'Conversation Summary',
      description: 'Maintains a running summary of the conversation',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'conversation_token_window',
      name: 'Token Window',
      description: 'Keeps messages within a token limit',
      icon: Hash,
      color: 'text-purple-600'
    },
    {
      id: 'entity_memory',
      name: 'Entity Memory',
      description: 'Remembers information about specific entities',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      id: 'knowledge_graph',
      name: 'Knowledge Graph',
      description: 'Builds a knowledge graph from conversations',
      icon: Network,
      color: 'text-red-600'
    },
    {
      id: 'vector_store',
      name: 'Vector Store',
      description: 'Stores conversation embeddings for semantic search',
      icon: Search,
      color: 'text-indigo-600'
    }
  ];

  const handleToggleMemory = () => {
    onMemoryChange({
      ...memory,
      enabled: !memory.enabled
    });
  };

  const handleTypeChange = (type: MemoryConfig['type']) => {
    onMemoryChange({
      ...memory,
      type,
      // Reset specific settings when changing type
      maxTokens: type === 'conversation_token_window' ? 2000 : undefined,
      maxMessages: type === 'conversation_buffer' ? 10 : undefined,
      k: type === 'vector_store' ? 4 : undefined
    });
  };

  const handleSettingChange = (key: keyof MemoryConfig, value: any) => {
    onMemoryChange({
      ...memory,
      [key]: value
    });
  };

  const selectedMemoryType = memoryTypes.find(t => t.id === memory.type);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-gray-700" />
            <div>
              <h3 className="font-semibold text-gray-900">Memory Configuration</h3>
              <p className="text-sm text-gray-600">Configure LangChain memory for conversation context</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={memory.enabled}
                onChange={handleToggleMemory}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && memory.enabled && (
        <div className="p-4 space-y-4">
          {/* Memory Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memoryTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeChange(type.id as MemoryConfig['type'])}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      memory.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`w-4 h-4 ${type.color}`} />
                      <span className="font-medium text-gray-900">{type.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Basic Settings</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memory.type === 'conversation_token_window' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={memory.maxTokens || 2000}
                    onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="100"
                    max="10000"
                  />
                </div>
              )}

              {memory.type === 'conversation_buffer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Messages
                  </label>
                  <input
                    type="number"
                    value={memory.maxMessages || 10}
                    onChange={(e) => handleSettingChange('maxMessages', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              {memory.type === 'vector_store' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top K Results
                  </label>
                  <input
                    type="number"
                    value={memory.k || 4}
                    onChange={(e) => handleSettingChange('k', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input Key
                    </label>
                    <input
                      type="text"
                      value={memory.inputKey || ''}
                      onChange={(e) => handleSettingChange('inputKey', e.target.value)}
                      placeholder="input"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Output Key
                    </label>
                    <input
                      type="text"
                      value={memory.outputKey || ''}
                      onChange={(e) => handleSettingChange('outputKey', e.target.value)}
                      placeholder="output"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memory Key
                    </label>
                    <input
                      type="text"
                      value={memory.memoryKey || ''}
                      onChange={(e) => handleSettingChange('memoryKey', e.target.value)}
                      placeholder="history"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Human Prefix
                    </label>
                    <input
                      type="text"
                      value={memory.humanPrefix || ''}
                      onChange={(e) => handleSettingChange('humanPrefix', e.target.value)}
                      placeholder="Human"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Prefix
                    </label>
                    <input
                      type="text"
                      value={memory.aiPrefix || ''}
                      onChange={(e) => handleSettingChange('aiPrefix', e.target.value)}
                      placeholder="Assistant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {memory.type === 'vector_store' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Type
                      </label>
                      <select
                        value={memory.searchType || 'similarity'}
                        onChange={(e) => handleSettingChange('searchType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="similarity">Similarity</option>
                        <option value="mmr">MMR (Maximal Marginal Relevance)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Memory Prompt
                  </label>
                  <textarea
                    value={memory.customMemoryPrompt || ''}
                    onChange={(e) => handleSettingChange('customMemoryPrompt', e.target.value)}
                    placeholder="Custom prompt for memory retrieval..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Memory Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Memory Configuration</span>
            </div>
            <div className="text-xs text-blue-800 space-y-1">
              <div><strong>Type:</strong> {selectedMemoryType?.name}</div>
              {memory.maxTokens && <div><strong>Max Tokens:</strong> {memory.maxTokens}</div>}
              {memory.maxMessages && <div><strong>Max Messages:</strong> {memory.maxMessages}</div>}
              {memory.k && <div><strong>Top K:</strong> {memory.k}</div>}
              {memory.inputKey && <div><strong>Input Key:</strong> {memory.inputKey}</div>}
              {memory.outputKey && <div><strong>Output Key:</strong> {memory.outputKey}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryConfigComponent;
