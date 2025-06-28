import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, BarChart3, GitBranch, Settings, AlertCircle } from 'lucide-react';
import PromptEditor from './PromptEditor';
import ModelOutput from './ModelOutput';
import PromptScore from './PromptScore';
import VersionControl from './VersionControl';
import VariableManager from './VariableManager';
import MultiModelRunner from './MultiModelRunner';
import VersionComparison from './VersionComparison';
import Analytics from './Analytics';
import ApiKeySetup from './ApiKeySetup';
import { usePromptVersions } from '../hooks/usePromptVersions';
import { Model, Variable, PromptScore as PromptScoreType } from '../types';
import { OpenAIService } from '../services/openai';

const PromptForge = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'compare'>('editor');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [systemMessage, setSystemMessage] = useState<string>('');

  const {
    versions,
    runs,
    currentVersionId,
    setCurrentVersionId,
    createVersion,
    getCurrentVersion,
    addRun,
    getRunsForVersion
  } = usePromptVersions();

  const currentVersion = getCurrentVersion();
  const currentRuns = getRunsForVersion(currentVersionId);

  // Check if API key is configured on mount
  useEffect(() => {
    const checkApiKey = () => {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        (window as any).__OPENAI_API_KEY__ = storedKey;
        OpenAIService.initialize(storedKey);
        setApiKeyConfigured(true);
      } else {
        setApiKeyConfigured(OpenAIService.isConfigured());
      }
    };

    checkApiKey();
  }, []);

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', provider: 'OpenAI', enabled: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', provider: 'OpenAI', enabled: true },
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', description: 'Latest GPT-4 with improved performance', provider: 'OpenAI', enabled: true },
  ];

  const handlePromptChange = (newPrompt: string) => {
    // Update current version content
    const updatedVersions = versions.map(v => 
      v.id === currentVersionId ? { ...v, content: newPrompt } : v
    );
    // In a real app, this would update the version in the store
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
    setVariables(newVariables);
  }, []);

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
    
    try {
      const processedPrompt = replaceVariables(currentVersion.content);
      
      // Run models using OpenAI API
      const responses = await OpenAIService.runMultipleModels(
        processedPrompt, 
        selectedModels,
        systemMessage || undefined
      );
      
      // Process each response
      for (const [modelId, response] of Object.entries(responses)) {
        try {
          // Get AI evaluation of the prompt
          const evaluation = await OpenAIService.evaluatePrompt(
            processedPrompt,
            response.content
          );

          const score: PromptScoreType = {
            relevance: evaluation.relevance,
            clarity: evaluation.clarity,
            creativity: evaluation.creativity,
            overall: Math.round(((evaluation.relevance + evaluation.clarity + evaluation.creativity) / 3) * 10) / 10,
            critique: evaluation.critique
          };

          addRun({
            versionId: currentVersionId,
            modelId,
            output: response.content,
            score,
            executionTime: response.executionTime,
            tokenUsage: {
              input: response.usage.prompt_tokens,
              output: response.usage.completion_tokens,
              total: response.usage.total_tokens
            }
          });

          // Update current output for the first model
          if (selectedModels[0] === modelId) {
            setCurrentOutput(response.content);
            setCurrentModel(modelId);
          }
        } catch (error) {
          console.error(`Error processing response for ${modelId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error running models:', error);
      // Show error to user
    } finally {
      setIsRunning(false);
    }
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

  const handleApiKeySet = () => {
    setApiKeyConfigured(true);
  };

  // Show API key setup if not configured
  if (!apiKeyConfigured) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  const tabs = [
    { id: 'editor' as const, name: 'Editor', icon: Zap },
    { id: 'analytics' as const, name: 'Analytics', icon: BarChart3 },
    { id: 'compare' as const, name: 'Compare', icon: GitBranch }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-black">PromptForge</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              <VersionControl
                versions={versions}
                currentVersionId={currentVersionId}
                onVersionSelect={handleVersionSelect}
                onCreateVersion={handleCreateVersion}
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
            <div className="lg:col-span-2 space-y-6">
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

              {/* Current Output */}
              {(currentOutput || isRunning) && (
                <ModelOutput 
                  output={currentOutput} 
                  isRunning={isRunning}
                  selectedModel={currentModel}
                />
              )}

              {/* Recent Runs */}
              {currentRuns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Runs</h3>
                  {currentRuns.slice(-3).map((run) => (
                    <div key={run.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ModelOutput 
                        output={run.output} 
                        isRunning={false}
                        selectedModel={run.modelId}
                      />
                      {run.score && (
                        <PromptScore score={run.score} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
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
              />

              {/* API Status */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">OpenAI API Connected</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Real AI responses enabled
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Analytics versions={versions} runs={runs} />
        )}

        {activeTab === 'compare' && (
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
          />
        )}
      </div>
    </div>
  );
};

export default PromptForge;