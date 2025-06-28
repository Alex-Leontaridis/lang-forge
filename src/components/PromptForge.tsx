import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, BarChart3, GitBranch, Settings, Workflow } from 'lucide-react';
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

const PromptForge = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'compare' | 'canvas'>('editor');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>([]);
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [showFullScoreReport, setShowFullScoreReport] = useState<string | null>(null);

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
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', provider: 'OpenAI', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', provider: 'OpenAI', logo: '/src/components/logos/openai.png', enabled: true },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic model', provider: 'Anthropic', logo: '/src/components/logos/anthropic.png', enabled: true },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google advanced model', provider: 'Google', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', description: 'Google Gemma 2 9B IT', provider: 'Google', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp', description: 'Google Gemini 2.5 Pro Exp', provider: 'Google', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp', description: 'Google Gemini 2.0 Flash Exp', provider: 'Google', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B IT', description: 'Google Gemma 3 12B IT', provider: 'Google', logo: '/src/components/logos/google.png', enabled: true },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Meta Llama 3.1 8B Instant', provider: 'Meta', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Meta Llama 3.3 70B Versatile', provider: 'Meta', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B', description: 'Meta Llama Guard 4 12B', provider: 'Meta', logo: '/src/components/logos/meta.png', enabled: true },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', description: 'DeepSeek R1 Distill Llama 70B', provider: 'DeepSeek', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', description: 'DeepSeek R1 0528', provider: 'DeepSeek', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528-qwen3-8b:free', name: 'DeepSeek R1 0528 Qwen3 8B', description: 'DeepSeek R1 0528 Qwen3 8B', provider: 'DeepSeek', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base', description: 'DeepSeek V3 Base', provider: 'DeepSeek', logo: '/src/components/logos/deepseek.png', enabled: true },
    { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B', description: 'Alibaba Qwen QWQ 32B', provider: 'Alibaba', logo: '/src/components/logos/alibaba.png', enabled: true },
    { id: 'distil-whisper-large-v3-en', name: 'Distil Whisper Large v3 EN', description: 'Hugging Face Distil Whisper Large v3 EN', provider: 'HuggingFace', logo: '/src/components/logos/huggingface.png', enabled: true },
    { id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Llama 3.3 Nemotron Super 49B', description: 'Nvidia Llama 3.3 Nemotron Super 49B', provider: 'Nvidia', logo: '/src/components/logos/nvidia.png', enabled: true },
    { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2 24B Instruct', description: 'Mistral Small 3.2 24B Instruct', provider: 'Mistral', logo: '/src/components/logos/mistral.png', enabled: true },
    { id: 'minimax/minimax-m1', name: 'MiniMax M1', description: 'MiniMax M1', provider: 'MiniMax', logo: '/src/components/logos/minimax.png', enabled: true },
  ];

  const handlePromptChange = (newPrompt: string) => {
    // Update current version content
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

  const generateMockResponse = (modelId: string, prompt: string): string => {
    const responses = {
      'gpt-4': `**GPT-4 Response:**

Based on your prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"

This is a comprehensive and thoughtful response that demonstrates GPT-4's advanced reasoning capabilities. The model provides detailed analysis, creative insights, and maintains excellent coherence throughout the response.

Key points addressed:
• Thorough understanding of the prompt context
• Creative and original perspective
• Well-structured and clear communication
• Actionable insights and recommendations

This response showcases the model's ability to handle complex reasoning tasks while maintaining clarity and relevance to the original request.`,

      'gpt-3.5-turbo': `**GPT-3.5 Turbo Response:**

Thank you for your prompt: "${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}"

Here's a clear and efficient response that addresses your request directly. GPT-3.5 Turbo provides fast, reliable answers while maintaining good quality and relevance.

The response includes:
- Direct answers to your questions
- Practical suggestions
- Clear and concise communication
- Good balance of detail and brevity

This demonstrates the model's strength in providing quick, accurate responses for everyday tasks and queries.`,

      'claude-3': `**Claude 3 Response:**

I appreciate your thoughtful prompt: "${prompt.substring(0, 90)}${prompt.length > 90 ? '...' : ''}"

As Claude 3, I aim to provide helpful, harmless, and honest responses. Here's my analysis of your request with careful consideration of nuance and context.

My response focuses on:
→ Ethical considerations and balanced perspectives
→ Detailed reasoning and step-by-step thinking
→ Acknowledgment of limitations and uncertainties
→ Constructive and solution-oriented approach

I strive to be particularly thoughtful about potential implications and to provide responses that are both useful and responsible.`,

      'gemini-pro': `**Gemini Pro Response:**

Processing your prompt: "${prompt.substring(0, 85)}${prompt.length > 85 ? '...' : ''}"

Gemini Pro leverages Google's advanced AI capabilities to provide comprehensive, multimodal understanding. Here's my response with integrated knowledge and reasoning:

Analysis includes:
🔍 Deep contextual understanding
🧠 Advanced reasoning patterns
🌐 Broad knowledge integration
⚡ Efficient processing capabilities

The response demonstrates Gemini's strength in combining factual accuracy with creative problem-solving, drawing from extensive training data to provide relevant and insightful answers.`,

      'llama-2': `**Llama 2 Response:**

Your prompt: "${prompt.substring(0, 75)}${prompt.length > 75 ? '...' : ''}"

As an open-source model, Llama 2 provides transparent and accessible AI capabilities. Here's my response focusing on practical utility and clear communication:

Response characteristics:
• Open and transparent reasoning
• Community-driven development benefits
• Balanced and unbiased perspective
• Focus on practical applications

This response represents the collaborative nature of open-source AI development, providing reliable assistance while maintaining transparency in the reasoning process.`
    };

    return responses[modelId as keyof typeof responses] || `Response from ${modelId.toUpperCase()}: This is a simulated response to your prompt.`;
  };

  const generateMockScore = (): PromptScoreType => {
    const relevance = Math.floor(Math.random() * 3) + 8;
    const clarity = Math.floor(Math.random() * 3) + 7;
    const creativity = Math.floor(Math.random() * 4) + 6;
    
    const critiques = [
      "Excellent prompt structure with clear intent. Consider adding more specific context for even better results.",
      "Well-crafted prompt that effectively guides the AI. The use of variables makes it highly reusable.",
      "Strong prompt with good clarity. Adding examples could further improve response quality.",
      "Thoughtful prompt design that balances specificity with flexibility. Great use of structured variables.",
      "Clear and purposeful prompt. Consider refining the tone instructions for more consistent outputs."
    ];

    return {
      relevance,
      clarity,
      creativity,
      overall: Math.round(((relevance + clarity + creativity) / 3) * 10) / 10,
      critique: critiques[Math.floor(Math.random() * critiques.length)]
    };
  };

  const handleRunModels = async (selectedModels: string[]) => {
    if (!currentVersion.content.trim()) return;
    
    setIsRunning(true);
    
    const processedPrompt = replaceVariables(currentVersion.content);
    
    // Simulate running multiple models with realistic delays
    for (const modelId of selectedModels) {
      const startTime = Date.now();
      
      // Simulate API call delay (different for each model)
      const delays = {
        'gpt-4': 2000 + Math.random() * 1000,
        'gpt-3.5-turbo': 800 + Math.random() * 500,
        'claude-3': 1500 + Math.random() * 800,
        'gemini-pro': 1200 + Math.random() * 600,
        'llama-2': 1000 + Math.random() * 700
      };
      
      await new Promise(resolve => setTimeout(resolve, delays[modelId as keyof typeof delays] || 1000));
      
      const executionTime = Date.now() - startTime;
      const score = generateMockScore();
      const output = generateMockResponse(modelId, processedPrompt);
      
      // Simulate realistic token usage
      const inputTokens = Math.floor(processedPrompt.length / 4) + Math.floor(Math.random() * 50);
      const outputTokens = Math.floor(output.length / 4) + Math.floor(Math.random() * 100);
      
      addRun({
        versionId: currentVersionId,
        modelId,
        output,
        score,
        executionTime,
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        }
      });

      // Update current output for the first model
      if (selectedModels[0] === modelId) {
        setCurrentOutput(output);
        setCurrentModel(modelId);
      }
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
    { id: 'canvas' as const, name: 'Canvas', icon: Workflow },
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
      <div className={activeTab === 'canvas' ? '' : 'max-w-7xl mx-auto px-6 py-8'}>
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

              {/* Recent Runs Grid */}
              {currentRuns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Runs</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {currentRuns.slice(-6).map((run) => (
                      <ModelOutput 
                        key={run.id}
                        output={run.output} 
                        isRunning={false}
                        selectedModel={run.modelId}
                        score={run.score}
                        compact={true}
                        onShowFullReport={() => setShowFullScoreReport(run.id)}
                      />
                    ))}
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

              {/* Demo Status */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Demo Mode</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Using simulated AI responses for UI demonstration
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <PromptChainCanvas />
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

      {/* Full Score Report Modal */}
      {showFullScoreReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {(() => {
              const run = currentRuns.find(r => r.id === showFullScoreReport);
              return run?.score ? (
                <PromptScore 
                  score={run.score} 
                  compact={false}
                />
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