import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, BarChart3, GitBranch, Settings } from 'lucide-react';
import PromptEditor from './PromptEditor';
import ModelOutput from './ModelOutput';
import PromptScore from './PromptScore';
import VersionControl from './VersionControl';
import VariableManager from './VariableManager';
import MultiModelRunner from './MultiModelRunner';
import VersionComparison from './VersionComparison';
import Analytics from './Analytics';
import { usePromptVersions } from '../hooks/usePromptVersions';
import { Model, Variable, PromptScore as PromptScoreType } from '../types';

const PromptForge = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'compare'>('editor');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>([]);

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

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', provider: 'OpenAI', enabled: true },
    { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', provider: 'OpenAI', enabled: true },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic\'s latest', provider: 'Anthropic', enabled: true },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced model', provider: 'Google', enabled: true },
    { id: 'llama-2', name: 'Llama 2', description: 'Meta\'s open source model', provider: 'Meta', enabled: true }
  ];

  const handlePromptChange = (newPrompt: string) => {
    // Update current version
    const updatedVersion = { ...currentVersion, content: newPrompt };
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

  const generateMockScore = (): PromptScoreType => ({
    relevance: Math.floor(Math.random() * 3) + 8,
    clarity: Math.floor(Math.random() * 3) + 7,
    creativity: Math.floor(Math.random() * 4) + 6,
    overall: 0, // Will be calculated
    critique: `This prompt demonstrates good structure and clear intent. Consider adding more specific context or examples to further improve clarity and effectiveness.`
  });

  const handleRunModels = async (selectedModels: string[]) => {
    if (!currentVersion.content.trim()) return;
    
    setIsRunning(true);
    
    const processedPrompt = replaceVariables(currentVersion.content);
    
    // Simulate running multiple models
    for (const modelId of selectedModels) {
      const startTime = Date.now();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const executionTime = Date.now() - startTime;
      const score = generateMockScore();
      score.overall = Math.round(((score.relevance + score.clarity + score.creativity) / 3) * 10) / 10;
      
      const simulatedOutput = `Response from ${modelId.toUpperCase()}:\n\nThis is a simulated response based on your prompt: "${processedPrompt.substring(0, 100)}..."\n\nIn a real implementation, this would be the actual AI response from ${modelId}. The response would be contextually relevant and follow the instructions provided in your prompt.`;
      
      addRun({
        versionId: currentVersionId,
        modelId,
        output: simulatedOutput,
        score,
        executionTime,
        tokenUsage: {
          input: Math.floor(Math.random() * 200) + 50,
          output: Math.floor(Math.random() * 500) + 100,
          total: 0 // Will be calculated
        }
      });
    }
    
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

              {/* Model Outputs */}
              {currentRuns.length > 0 && (
                <div className="space-y-4">
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