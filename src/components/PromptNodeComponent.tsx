import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
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
  ChevronUp,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Thermometer,
  Variable,
  Settings,
  Type,
  Hash,
  Plus,
  Search,
  Sparkles,
  FileText
} from 'lucide-react';
import { PromptNode, PromptScore, InputVariable, OutputVariable, ChainHealthIssue, Model, PromptVersion } from '../types';
import PromptAutoTest, { AutoTestResult } from './PromptAutoTest';

interface PromptNodeData extends PromptNode {
  onUpdate: (id: string, updates: Partial<PromptNode>) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  promptId?: string;
}

const PromptNodeComponent: React.FC<NodeProps<PromptNodeData>> = ({ id, data }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(data.title);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVariableValues, setShowVariableValues] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [showAutoTest, setShowAutoTest] = useState(false);
  const [autoTestResult, setAutoTestResult] = useState<AutoTestResult | null>(null);
  const [availableVersions, setAvailableVersions] = useState<PromptVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4', provider: 'OpenAI', enabled: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5', description: 'OpenAI GPT-3.5 Turbo', provider: 'OpenAI', enabled: true },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', description: 'Google Gemma 2 9B IT', provider: 'Google', enabled: true },
    { id: 'google/gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp', description: 'Google Gemini 2.5 Pro Experimental', provider: 'Google', enabled: true },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp', description: 'Google Gemini 2.0 Flash Experimental', provider: 'Google', enabled: true },
    { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B IT', description: 'Google Gemma 3 12B IT', provider: 'Google', enabled: true },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Meta Llama 3.1 8B Instant', provider: 'Meta', enabled: true },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Meta Llama 3.3 70B Versatile', provider: 'Meta', enabled: true },
    { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B', description: 'Meta Llama Guard 4 12B', provider: 'Meta', enabled: true },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', description: 'DeepSeek R1 Distill Llama 70B', provider: 'DeepSeek', enabled: true },
    { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', description: 'DeepSeek R1 0528', provider: 'DeepSeek', enabled: true },
    { id: 'deepseek/deepseek-r1-0528-qwen3-8b:free', name: 'DeepSeek R1 0528 Qwen3 8B', description: 'DeepSeek R1 0528 Qwen3 8B', provider: 'DeepSeek', enabled: true },
    { id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base', description: 'DeepSeek V3 Base', provider: 'DeepSeek', enabled: true },
    { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B', description: 'Qwen QWQ 32B', provider: 'Qwen', enabled: true },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', description: 'Qwen 3 32B', provider: 'Qwen', enabled: true },
    { id: 'distil-whisper-large-v3-en', name: 'Distil Whisper Large v3 EN', description: 'Distil Whisper Large v3 EN', provider: 'OpenAI', enabled: true },
    { id: 'whisper-large-v3', name: 'Whisper Large v3', description: 'OpenAI Whisper Large v3', provider: 'OpenAI', enabled: true },
    { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo', description: 'OpenAI Whisper Large v3 Turbo', provider: 'OpenAI', enabled: true },
    { id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Llama 3.3 Nemotron Super 49B', description: 'NVIDIA Llama 3.3 Nemotron Super 49B', provider: 'NVIDIA', enabled: true },
    { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2 24B Instruct', description: 'Mistral Small 3.2 24B Instruct', provider: 'Mistral', enabled: true },
    { id: 'minimax/minimax-m1', name: 'MiniMax M1', description: 'MiniMax M1', provider: 'MiniMax', enabled: true },
  ];

  // Get available versions for this prompt
  useEffect(() => {
    if (data.promptId) {
      const saved = localStorage.getItem('promptVersions');
      if (saved) {
        const allVersions = JSON.parse(saved);
        const promptVersions = allVersions.filter((v: any) => v.promptId === data.promptId);
        setAvailableVersions(promptVersions.map((v: any) => ({
          ...v,
          createdAt: new Date(v.createdAt)
        })));
        
        // Get current version ID
        const savedCurrentVersionId = localStorage.getItem(`currentVersionId_${data.promptId}`);
        if (savedCurrentVersionId && promptVersions.some((v: any) => v.id === savedCurrentVersionId)) {
          setCurrentVersionId(savedCurrentVersionId);
        } else if (promptVersions.length > 0) {
          setCurrentVersionId(promptVersions[0].id);
        }
      }
    }
  }, [data.promptId]);

  // Handle version selection
  const handleVersionSelect = (versionId: string) => {
    const selectedVersion = availableVersions.find(v => v.id === versionId);
    if (selectedVersion) {
      // Update the node with the selected version's content and variables
      data.onUpdate(id, {
        prompt: selectedVersion.content,
        variables: selectedVersion.variables,
        title: selectedVersion.title
      });
      
      // Update current version ID in localStorage
      localStorage.setItem(`currentVersionId_${data.promptId}`, versionId);
      setCurrentVersionId(versionId);
      
      // Sync to editor
      if (data.promptId) {
        syncToEditor();
      }
    }
  };

  const handleTitleSave = () => {
    data.onUpdate(id, { title: tempTitle });
    setIsEditingTitle(false);
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  const handleTitleCancel = () => {
    setTempTitle(data.title);
    setIsEditingTitle(false);
  };

  const handlePromptChange = (prompt: string) => {
    data.onUpdate(id, { prompt });
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  const handleModelChange = (model: string) => {
    data.onUpdate(id, { model });
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  const handleTemperatureChange = (temperature: number) => {
    data.onUpdate(id, { temperature });
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  const handleConditionChange = (condition: string) => {
    data.onUpdate(id, { condition });
  };

  const handleVariableChange = (name: string, value: string) => {
    const updatedVariables = { ...data.variables, [name]: value };
    data.onUpdate(id, { variables: updatedVariables });
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  const handleAddVariable = () => {
    if (newVariableName.trim() && !data.variables[newVariableName.trim()]) {
      const updatedVariables = { ...data.variables, [newVariableName.trim()]: '' };
      data.onUpdate(id, { variables: updatedVariables });
      setNewVariableName('');
      // Sync to editor if this node has a promptId
      if (data.promptId) {
        syncToEditor();
      }
    }
  };

  const handleRemoveVariable = (name: string) => {
    const updatedVariables = { ...data.variables };
    delete updatedVariables[name];
    data.onUpdate(id, { variables: updatedVariables });
    // Sync to editor if this node has a promptId
    if (data.promptId) {
      syncToEditor();
    }
  };

  // Function to sync canvas node changes back to editor
  const syncToEditor = () => {
    if (data.promptId) {
      const editorData = {
        action: 'updateFromCanvas',
        promptId: data.promptId,
        data: {
          title: data.title,
          prompt: data.prompt,
          variables: data.variables,
          model: data.model,
          temperature: data.temperature
        },
        updated: true
      };
      localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getExecutionStatusIcon = () => {
    if (data.isRunning) {
      return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
    }
    if (data.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (data.output) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-gray-400" />;
  };

  const extractVariables = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const getVariableTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return <span className="text-blue-600">"</span>;
      case 'int': return <Hash className="w-3 h-3 text-green-600" />;
      case 'float': return <span className="text-green-600">#</span>;
      case 'boolean': return <span className="text-purple-600">✓</span>;
      case 'array': return <span className="text-orange-600">[]</span>;
      case 'object': return <span className="text-red-600">{}</span>;
      default: return <Type className="w-3 h-3 text-gray-600" />;
    }
  };

  const getHealthStatus = () => {
    if (!data.healthIssues || data.healthIssues.length === 0) {
      return { status: 'healthy', count: 0 };
    }
    const errors = data.healthIssues.filter(issue => issue.severity === 'error');
    const warnings = data.healthIssues.filter(issue => issue.severity === 'warning');
    
    if (errors.length > 0) return { status: 'error', count: errors.length };
    if (warnings.length > 0) return { status: 'warning', count: warnings.length };
    return { status: 'healthy', count: 0 };
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'healthy':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const variables = extractVariables(data.prompt);
  const healthStatus = getHealthStatus();

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
          
          <div className="flex items-center space-x-2">
            {getExecutionStatusIcon()}
            
            {/* Auto-Test Badge */}
            {data.autoTestResult && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium">
                {data.autoTestResult.summary.overallPassed ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Test Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                    <XCircle className="w-3 h-3" />
                    <span>Test Failed</span>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => setShowAutoTest(!showAutoTest)}
              className="text-gray-400 hover:text-purple-500 transition-colors"
              title="Run Auto-Test"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                // Store the current prompt data in localStorage for the editor
                const editorData = {
                  prompt: data.prompt,
                  variables: data.variables,
                  model: data.model,
                  temperature: data.temperature,
                  title: data.title,
                  fromCanvas: true,
                  nodeId: id
                };
                localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
                window.open('/app?fromCanvas=true', '_blank');
              }}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit in Editor"
            >
              <FileText className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => data.onDelete(id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex items-center space-x-2">
          <select
            value={data.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          
          {/* Version Selector */}
          {data.promptId && availableVersions.length > 1 && (
            <select
              value={currentVersionId}
              onChange={(e) => handleVersionSelect(e.target.value)}
              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              title="Select Version"
            >
              {availableVersions.map((version, index) => (
                <option key={version.id} value={version.id}>
                  v{index + 1}: {version.title}
                </option>
              ))}
            </select>
          )}
          
          {healthStatus.count > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-gray-200">
              {getHealthIcon(healthStatus.status)}
              <span className="text-xs text-gray-600">{healthStatus.count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-600">Variables:</div>
                  <button
                    onClick={() => setShowVariableValues(!showVariableValues)}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Variable className="w-3 h-3" />
                    <span>Values</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                    >
                      <span>{variable}</span>
                      {data.variables[variable] && (
                        <span className="text-green-600">✓</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Variable Values */}
            {showVariableValues && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-700">Variable Values</h4>
                  <button
                    onClick={() => {
                      const newVariables = { ...data.variables };
                      variables.forEach(varName => {
                        if (!newVariables[varName]) {
                          newVariables[varName] = '';
                        }
                      });
                      data.onUpdate(id, { variables: newVariables });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Auto-add
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(data.variables).map(([name, value]) => (
                    <div key={name} className="flex items-center space-x-2 text-xs">
                      <code className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700">
                        {`{{${name}}}`}
                      </code>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(name, e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded"
                        placeholder={`Value for ${name}`}
                      />
                      <button
                        onClick={() => handleRemoveVariable(name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new variable */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newVariableName}
                      onChange={(e) => setNewVariableName(e.target.value)}
                      placeholder="Add new variable"
                      className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
                    />
                    <button
                      onClick={handleAddVariable}
                      disabled={!newVariableName.trim() || !!data.variables[newVariableName.trim()]}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="mt-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
              >
                <span>Advanced Settings</span>
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {showAdvanced && (
                <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Temperature */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Temperature: {data.temperature || 0.7}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={data.temperature || 0.7}
                      onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${((data.temperature || 0.7) / 2) * 100}%, #e5e7eb ${((data.temperature || 0.7) / 2) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Focused (0)</span>
                      <span>Balanced (1)</span>
                      <span>Creative (2)</span>
                    </div>
                  </div>

                  {/* Conditional Logic */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Condition (optional)
                    </label>
                    <input
                      type="text"
                      value={data.condition || ''}
                      onChange={(e) => handleConditionChange(e.target.value)}
                      placeholder="e.g., {{score}} &gt; 7"
                      className="w-full p-2 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Use conditions like: &#123;&#123;score&#125;&#125; &gt; 7, &#123;&#123;sentiment&#125;&#125; == "positive"
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auto-Test Component */}
            {showAutoTest && data.prompt.trim() && (
              <div className="mt-3">
                <PromptAutoTest
                  prompt={data.prompt}
                  variables={variables.map(name => ({ name, value: data.variables[name] || '' }))}
                  models={models}
                  selectedModels={[data.model]}
                  temperature={data.temperature || 0.7}
                  onTestComplete={(result) => {
                    setAutoTestResult(result);
                    data.onUpdate(id, { autoTestResult: result });
                  }}
                  className="text-xs"
                  isRunning={data.isRunning}
                />
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

          {/* Error Display */}
          {data.error && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Error</span>
                </div>
                <p className="text-xs text-red-600">{data.error}</p>
              </div>
            </div>
          )}

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
              </div>
            </div>
          )}
        </>
      )}

      {/* Conditional Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="default"
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ top: '50%' }}
      />
      
      {data.condition && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 bg-green-500 border-2 border-white"
            style={{ top: '35%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-3 h-3 bg-red-500 border-2 border-white"
            style={{ top: '65%' }}
          />
        </>
      )}
    </div>
  );
};

export default memo(PromptNodeComponent);