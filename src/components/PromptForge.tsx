import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, BarChart3, GitBranch, Settings, Workflow, Menu, X, Search, Filter } from 'lucide-react';
import PromptEditor from './PromptEditor';
import ModelOutput from './ModelOutput';
import PromptScore from './PromptScore';
import VersionControl from './VersionControl';
import VariableManager from './VariableManager';
import MultiModelRunner from './MultiModelRunner';
import VersionComparison from './VersionComparison';
import Analytics from './Analytics';
import PromptChainCanvas from './PromptChainCanvas';
import { usePromptVersions } from '../hooks/usePromptVersions';
import { Model, Variable, PromptScore as PromptScoreType } from '../types';
import apiService from '../services/apiService';

const PromptForge = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'compare' | 'canvas'>('editor');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>([]);
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [showFullScoreReport, setShowFullScoreReport] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    versions,
    runs,
    currentVersionId,
    setCurrentVersionId,
    createVersion,
    getCurrentVersion,
    addRun,
    getRunsForVersion,
    updateVersion,
    deleteVersion,
    duplicateVersion
  } = usePromptVersions();

  const currentVersion = getCurrentVersion();
  const currentRuns = getRunsForVersion(currentVersionId);

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', provider: 'OpenAI', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', provider: 'OpenAI', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', description: 'Google Gemma 2 9B IT (Groq)', provider: 'Groq', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp', description: 'Google Gemini 2.5 Pro Exp (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp', description: 'Google Gemini 2.0 Flash Exp (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B IT', description: 'Google Gemma 3 12B IT (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Meta Llama 3.1 8B Instant (Groq)', provider: 'Groq', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Meta Llama 3.3 70B Versatile (Groq)', provider: 'Groq', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B', description: 'Meta Llama Guard 4 12B (Groq)', provider: 'Groq', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', description: 'DeepSeek R1 Distill Llama 70B (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', description: 'DeepSeek R1 0528 (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528-qwen3-8b:free', name: 'DeepSeek R1 0528 Qwen3 8B', description: 'DeepSeek R1 0528 Qwen3 8B (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base', description: 'DeepSeek V3 Base (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B', description: 'Alibaba Qwen QWQ 32B (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/alibaba.png', enabled: true },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', description: 'Alibaba Qwen 3 32B (Groq)', provider: 'Groq', logo: '/src/components/logos/alibaba.png', enabled: true },
    { id: 'distil-whisper-large-v3-en', name: 'Distil Whisper Large v3 EN', description: 'Hugging Face Distil Whisper Large v3 EN (Groq)', provider: 'Groq', logo: '/src/components/logos/huggingface.png', enabled: true },
    { id: 'whisper-large-v3', name: 'Whisper Large v3', description: 'OpenAI Whisper Large v3 (Groq)', provider: 'Groq', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo', description: 'OpenAI Whisper Large v3 Turbo (Groq)', provider: 'Groq', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Llama 3.3 Nemotron Super 49B', description: 'Nvidia Llama 3.3 Nemotron Super 49B (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/nvidia.png', enabled: true },
    { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2 24B Instruct', description: 'Mistral Small 3.2 24B Instruct (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/mistral.png', enabled: true },
    { id: 'minimax/minimax-m1', name: 'MiniMax M1', description: 'MiniMax M1 (OpenRouter)', provider: 'OpenRouter', logo: '/src/components/logos/minimax.png', enabled: true },
  ];

  const handlePromptChange = (newPrompt: string) => {
    updateVersion(currentVersionId, { content: newPrompt });
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => prev.map(v => v.name === name ? { ...v, value } : v));
  };

  const handleAddVariable = (name: string) => {
    setVariables(prev => [...prev, { name, value: '' }]);
  };

  const handleRemoveVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name));
  };

  const handleVariablesChange = useCallback((newVariables: Variable[]) => {
    const currentVariableNames = variables.map(v => v.name).sort();
    const newVariableNames = newVariables.map(v => v.name).sort();
    
    if (JSON.stringify(currentVariableNames) !== JSON.stringify(newVariableNames)) {
      setVariables(newVariables);
    }
  }, [variables]);

  const replaceVariables = (prompt: string) => {
    let result = prompt;
    variables.forEach(variable => {
      if (variable.value) {
        result = result.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
          variable.value
        );
      }
    });
    return result;
  };

  const handleRunModels = async (selectedModels: string[]) => {
    if (!currentVersion.content.trim()) return;
    setIsRunning(true);
    const processedPrompt = replaceVariables(currentVersion.content);
    const TIMEOUT_MS = 20000;
    const withTimeout = (promise: Promise<any>, ms: number) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
      ]);
    };
    await Promise.allSettled(selectedModels.map(async (modelId) => {
      const startTime = Date.now();
      try {
        const result = await withTimeout(
          apiService.generateCompletion(
            modelId,
            processedPrompt,
            systemMessage || undefined,
            0.7
          ),
          TIMEOUT_MS
        );
        const output = result.content;
        const tokenUsage = result.usage ? {
          input: result.usage.prompt_tokens,
          output: result.usage.completion_tokens,
          total: result.usage.total_tokens
        } : { input: 0, output: 0, total: 0 };
        const executionTime = Date.now() - startTime;
        const score = await withTimeout(
          apiService.evaluatePromptResponse(
            processedPrompt,
            output,
            0.3
          ),
          TIMEOUT_MS
        );
        addRun({
          versionId: currentVersionId,
          modelId,
          output,
          score,
          executionTime,
          tokenUsage
        });
        if (selectedModels[0] === modelId) {
          setCurrentOutput(output);
          setCurrentModel(modelId);
        }
      } catch (error) {
        console.error(`Error running model ${modelId}:`, error);
        addRun({
          versionId: currentVersionId,
          modelId,
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          executionTime: Date.now() - startTime,
          tokenUsage: { input: 0, output: 0, total: 0 }
        });
      }
    }));
    setIsRunning(false);
  };

  const handleCreateVersion = (title: string, message: string) => {
    createVersion(currentVersion.content, Object.fromEntries(variables.map(v => [v.name, v.value])), title, message);
  };

  const handleVersionSelect = (versionId: string) => {
    setCurrentVersionId(versionId);
    const version = versions.find(v => v.id === versionId);
    if (version) {
      const versionVariables = Object.entries(version.variables || {}).map(([name, value]) => ({ name, value }));
      setVariables(versionVariables);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    deleteVersion(versionId);
    // Remove from comparison if it was selected
    setSelectedVersionsForComparison(prev => prev.filter(id => id !== versionId));
  };

  const handleDuplicateVersion = (versionId: string) => {
    const duplicatedVersion = duplicateVersion(versionId);
    if (duplicatedVersion) {
      // Switch to the duplicated version
      setCurrentVersionId(duplicatedVersion.id);
      const versionVariables = Object.entries(duplicatedVersion.variables || {}).map(([name, value]) => ({ name, value }));
      setVariables(versionVariables);
    }
  };

  const tabs = [
    { id: 'editor' as const, name: 'Editor', icon: Zap },
    { id: 'canvas' as const, name: 'Canvas', icon: Workflow },
    { id: 'analytics' as const, name: 'Analytics', icon: BarChart3 },
    { id: 'compare' as const, name: 'Compare', icon: GitBranch }
  ];

  const filteredRuns = currentRuns.filter(run => {
    if (!searchTerm) return true;
    return run.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           run.output.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium hidden sm:inline">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-black">PromptForge</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Tab Navigation */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mt-3 flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={activeTab === 'canvas' ? '' : 'px-4 sm:px-6 py-4 sm:py-8'}>
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Mobile/Tablet Sidebar */}
            <div className={`xl:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="h-full overflow-y-auto p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Controls</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <VersionControl
                  versions={versions}
                  currentVersionId={currentVersionId}
                  onVersionSelect={handleVersionSelect}
                  onCreateVersion={handleCreateVersion}
                  onDeleteVersion={handleDeleteVersion}
                  onDuplicateVersion={handleDuplicateVersion}
                />
                
                <VariableManager
                  variables={variables}
                  onVariableChange={handleVariableChange}
                  onAddVariable={handleAddVariable}
                  onRemoveVariable={handleRemoveVariable}
                />

                {/* System Message */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-gray-700" />
                      <span className="font-semibold text-gray-900">System Message</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      placeholder="Optional system message to set context for the AI..."
                      className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Left Sidebar */}
            <div className="hidden xl:block space-y-6">
              <VersionControl
                versions={versions}
                currentVersionId={currentVersionId}
                onVersionSelect={handleVersionSelect}
                onCreateVersion={handleCreateVersion}
                onDeleteVersion={handleDeleteVersion}
                onDuplicateVersion={handleDuplicateVersion}
              />
              
              <VariableManager
                variables={variables}
                onVariableChange={handleVariableChange}
                onAddVariable={handleAddVariable}
                onRemoveVariable={handleRemoveVariable}
              />

              {/* System Message */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-700" />
                    <span className="font-semibold text-gray-900">System Message</span>
                  </div>
                </div>
                <div className="p-4">
                  <textarea
                    value={systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    placeholder="Optional system message to set context for the AI..."
                    className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Mobile Controls Button */}
              <div className="xl:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Controls</span>
                </button>
              </div>

              <PromptEditor 
                prompt={currentVersion.content} 
                setPrompt={handlePromptChange}
                isRunning={isRunning}
                variables={variables}
                onVariablesChange={handleVariablesChange}
              />

              <MultiModelRunner
                models={models}
                onRunModels={handleRunModels}
                isRunning={isRunning}
                runs={currentRuns}
              />

              {/* Search and Filter for Recent Runs */}
              {currentRuns.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Runs</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search runs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredRuns.slice(-6).map((run) => {
                      const model = models.find(m => m.id === run.modelId);
                      return (
                        <ModelOutput 
                          key={run.id}
                          output={run.output} 
                          isRunning={false}
                          selectedModel={run.modelId}
                          score={run.score}
                          compact={true}
                          modelLogo={model?.logo}
                          modelName={model?.name || run.modelId}
                          onShowFullReport={() => setShowFullScoreReport(run.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Current Output */}
              {(currentOutput || isRunning) && (
                <ModelOutput 
                  output={currentOutput} 
                  isRunning={isRunning}
                  selectedModel={currentModel}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block space-y-6">
              <VersionComparison
                versions={versions}
                runs={runs}
                selectedVersions={selectedVersionsForComparison}
                onVersionSelect={(versionId) => {
                  setSelectedVersionsForComparison(prev => 
                    prev.includes(versionId) 
                      ? prev.filter(id => id !== versionId)
                      : [...prev, versionId].slice(0, 3)
                  );
                }}
                onDeleteVersion={handleDeleteVersion}
                onDuplicateVersion={handleDuplicateVersion}
              />
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <PromptChainCanvas />
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto">
            <Analytics versions={versions} runs={runs} />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="max-w-4xl mx-auto">
            <VersionComparison
              versions={versions}
              runs={runs}
              selectedVersions={selectedVersionsForComparison}
              onVersionSelect={(versionId) => {
                setSelectedVersionsForComparison(prev => 
                  prev.includes(versionId) 
                    ? prev.filter(id => id !== versionId)
                    : [...prev, versionId]
                );
              }}
              onDeleteVersion={handleDeleteVersion}
              onDuplicateVersion={handleDuplicateVersion}
            />
          </div>
        )}
      </div>

      {/* Full Score Report Modal */}
      {showFullScoreReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const run = currentRuns.find(r => r.id === showFullScoreReport);
              return run?.score ? (
                <div className="p-6">
                  <PromptScore score={run.score} />
                </div>
              ) : null;
            })()}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowFullScoreReport(null)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptForge;