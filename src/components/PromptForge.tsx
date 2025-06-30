import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Save, 
  Settings, 
  BarChart3, 
  Clock, 
  Zap, 
  Target,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Check,
  Edit3,
  Trash2,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Thermometer,
  FileText,
  Code,
  Database,
  GitBranch,
  Workflow,
  FileCode,
  Activity,
  Settings as SettingsIcon,
  Copy,
  Menu,
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PromptEditor from './PromptEditor';
import ModelOutput from './ModelOutput';
import PromptScore from './PromptScore';
import VariableManager from './VariableManager';
import PromptManager from './PromptManager';
import MultiModelRunner from './MultiModelRunner';
import VersionComparison from './VersionComparison';
import VersionControl from './VersionControl';
import Analytics from './Analytics';
import PromptChainCanvas from './PromptChainCanvas';
import PromptAutoTest from './PromptAutoTest';
import { usePromptVersions } from '../hooks/usePromptVersions';
import { usePrompts } from '../hooks/usePrompts';
import { Model, Variable, InputVariable, OutputVariable, AutoTestResult } from '../types';
import apiService from '../services/apiService';

// Custom debounce function
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PromptForge = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const projectId = location.state?.projectId;
  
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'compare' | 'canvas'>('editor');
  const [variables, setVariables] = useState<Variable[]>(() => {
    const saved = localStorage.getItem(`promptForgeVariables_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputVariables, setInputVariables] = useState<InputVariable[]>(() => {
    const saved = localStorage.getItem(`promptForgeInputVariables_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersionsForComparison, setSelectedVersionsForComparison] = useState<string[]>(() => {
    const saved = localStorage.getItem(`promptForgeSelectedVersionsForComparison_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>(() => {
    const saved = localStorage.getItem(`promptForgeCurrentModel_${projectId || 'global'}`);
    return saved || 'gpt-3.5-turbo';
  });
  const [systemMessage, setSystemMessage] = useState<string>(() => {
    const saved = localStorage.getItem(`promptForgeSystemMessage_${projectId || 'global'}`);
    return saved || '';
  });
  const [showFullScoreReport, setShowFullScoreReport] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapseVariables, setCollapseVariables] = useState(() => {
    const saved = localStorage.getItem(`promptForgeCollapseVariables_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [collapsePrompts, setCollapsePrompts] = useState(() => {
    const saved = localStorage.getItem(`promptForgeCollapsePrompts_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [showVariableManagement, setShowVariableManagement] = useState(true);
  const [selectedModelsForAutoTest, setSelectedModelsForAutoTest] = useState<string[]>(() => {
    const saved = localStorage.getItem(`promptForgeSelectedModelsForAutoTest_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : ['gpt-4'];
  });
  const [autoTestResults, setAutoTestResults] = useState<AutoTestResult[]>(() => {
    const saved = localStorage.getItem(`promptForgeAutoTestResults_${projectId || 'global'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [fromCanvas, setFromCanvas] = useState(false);
  const [canvasNodeId, setCanvasNodeId] = useState<string | null>(null);

  // Initialize prompt management
  const {
    prompts,
    currentPromptId,
    setCurrentPromptId,
    createPrompt,
    getCurrentPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    selectPrompt
  } = usePrompts(projectId);

  const currentPrompt = getCurrentPrompt();

  // Initialize version management with current prompt
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
  } = usePromptVersions(projectId, currentPromptId);

  const currentVersion = getCurrentVersion();
  const currentRuns = getRunsForVersion(currentVersionId);

  // Check for data from canvas on component mount
  useEffect(() => {
    const canvasData = localStorage.getItem('canvasToEditorData');
    if (canvasData) {
      try {
        const data = JSON.parse(canvasData);
        
        if (data.action === 'createPromptFromCanvas' && data.updated) {
          // Create a new prompt from canvas node
          const newPrompt = createPrompt(
            data.data.title,
            'Created from canvas node'
          );
          if (newPrompt) {
            setCurrentPromptId(newPrompt.id);
            
            // Create a new version with the canvas data
            const newVersion = createVersion(
              data.data.prompt,
              data.data.variables,
              data.data.title,
              'Created from canvas node'
            );
            if (newVersion) {
              setCurrentVersionId(newVersion.id);
            }
            
            // Set the model
            setCurrentModel(data.data.model);
            
            // Convert variables to the expected format
            const canvasVariables = Object.entries(data.data.variables).map(([name, value]) => ({
              name,
              value: value as string
            }));
            setVariables(canvasVariables);
            
            // Store the mapping between the new prompt ID and the temporary prompt ID from canvas
            localStorage.setItem(`promptToNode_${newPrompt.id}`, data.data.nodeId);
            localStorage.setItem(`tempPromptToRealPrompt_${data.data.promptId}`, newPrompt.id);
          }
          
          // Clear the localStorage data
          localStorage.removeItem('canvasToEditorData');
        } else if (data.action === 'updateFromCanvas' && data.updated) {
          // Update prompt and version from canvas
          if (data.promptId && data.data) {
            // Update prompt title if it changed
            if (data.data.title && currentPrompt && currentPrompt.title !== data.data.title) {
              updatePrompt(data.promptId, { title: data.data.title });
            }
            
            // Update version content if it changed
            if (data.data.prompt && currentVersion && currentVersion.content !== data.data.prompt) {
              updateVersion(currentVersionId, { content: data.data.prompt });
            }
            
            // Update variables if they changed
            if (data.data.variables) {
              const newVariables = Object.entries(data.data.variables).map(([name, value]) => ({
                name,
                value: value as string
              }));
              setVariables(newVariables);
            }
            
            // Update model if it changed
            if (data.data.model && currentModel !== data.data.model) {
              setCurrentModel(data.data.model);
            }
          }
          
          // Clear the localStorage data
          localStorage.removeItem('canvasToEditorData');
        } else if (data.action === 'deletePromptFromCanvas' && data.updated) {
          // Delete the corresponding prompt from editor
          if (data.data.promptId) {
            deletePrompt(data.data.promptId);
            // Remove the mapping
            localStorage.removeItem(`promptToNode_${data.data.promptId}`);
          }
          
          // Clear the localStorage data
          localStorage.removeItem('canvasToEditorData');
        } else if (data.fromCanvas) {
          setFromCanvas(true);
          setCanvasNodeId(data.nodeId);
          setCurrentModel(data.model);
          
          // Create a new prompt if none exists
          if (!currentPrompt) {
            const newPrompt = createPrompt(
              `Canvas Node: ${data.title}`,
              'Imported from canvas'
            );
            if (newPrompt) {
              setCurrentPromptId(newPrompt.id);
            }
          }
          
          // Create a new version with the canvas data
          const newVersion = createVersion(
            data.prompt,
            data.variables,
            `Canvas Node: ${data.title}`,
            'Imported from canvas'
          );
          if (newVersion) {
            setCurrentVersionId(newVersion.id);
          }
          
          // Convert variables to the expected format
          const canvasVariables = Object.entries(data.variables).map(([name, value]) => ({
            name,
            value: value as string
          }));
          setVariables(canvasVariables);
          
          // Clear the localStorage data
          localStorage.removeItem('canvasToEditorData');
        }
      } catch (error) {
        console.error('Error loading canvas data:', error);
        localStorage.removeItem('canvasToEditorData');
      }
    }
  }, [createVersion, setCurrentVersionId, createPrompt, setCurrentPromptId, currentPrompt, currentVersion, currentVersionId, updatePrompt, updateVersion, currentModel, deletePrompt]);

  // Persist state to localStorage with project-specific keys
  useEffect(() => {
    localStorage.setItem(`promptForgeVariables_${projectId || 'global'}`, JSON.stringify(variables));
  }, [variables, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeInputVariables_${projectId || 'global'}`, JSON.stringify(inputVariables));
  }, [inputVariables, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeSelectedVersionsForComparison_${projectId || 'global'}`, JSON.stringify(selectedVersionsForComparison));
  }, [selectedVersionsForComparison, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeCurrentModel_${projectId || 'global'}`, currentModel);
  }, [currentModel, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeSystemMessage_${projectId || 'global'}`, systemMessage);
  }, [systemMessage, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeCollapseVariables_${projectId || 'global'}`, JSON.stringify(collapseVariables));
  }, [collapseVariables, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeCollapsePrompts_${projectId || 'global'}`, JSON.stringify(collapsePrompts));
  }, [collapsePrompts, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeSelectedModelsForAutoTest_${projectId || 'global'}`, JSON.stringify(selectedModelsForAutoTest));
  }, [selectedModelsForAutoTest, projectId]);

  useEffect(() => {
    localStorage.setItem(`promptForgeAutoTestResults_${projectId || 'global'}`, JSON.stringify(autoTestResults));
  }, [autoTestResults, projectId]);

  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', provider: 'OpenAI', logo: '/src/logo/openai.png', enabled: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', provider: 'OpenAI', logo: '/src/logo/openai.png', enabled: true },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', description: 'Google Gemma 2 9B IT (Groq)', provider: 'Google', logo: '/src/logo/google.png', enabled: true },
    { id: 'google/gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp', description: 'Google Gemini 2.5 Pro Exp (OpenRouter)', provider: 'Google', logo: '/src/logo/google.png', enabled: true },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp', description: 'Google Gemini 2.0 Flash Exp (OpenRouter)', provider: 'Google', logo: '/src/logo/google.png', enabled: true },
    { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B IT', description: 'Google Gemma 3 12B IT (OpenRouter)', provider: 'Google', logo: '/src/logo/google.png', enabled: true },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Meta Llama 3.1 8B Instant (Groq)', provider: 'Meta', logo: '/src/logo/meta.png', enabled: true },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Meta Llama 3.3 70B Versatile (Groq)', provider: 'Meta', logo: '/src/logo/meta.png', enabled: true },
    { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B', description: 'Meta Llama Guard 4 12B (Groq)', provider: 'Meta', logo: '/src/logo/meta.png', enabled: true },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', description: 'DeepSeek R1 Distill Llama 70B (OpenRouter)', provider: 'DeepSeek', logo: '/src/logo/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', description: 'DeepSeek R1 0528 (OpenRouter)', provider: 'DeepSeek', logo: '/src/logo/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-r1-0528-qwen3-8b:free', name: 'DeepSeek R1 0528 Qwen3 8B', description: 'DeepSeek R1 0528 Qwen3 8B (OpenRouter)', provider: 'DeepSeek', logo: '/src/logo/deepseek.png', enabled: true },
    { id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base', description: 'DeepSeek V3 Base (OpenRouter)', provider: 'DeepSeek', logo: '/src/logo/deepseek.png', enabled: true },
    { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B', description: 'Alibaba Qwen QWQ 32B (OpenRouter)', provider: 'Alibaba Cloud', logo: '/src/logo/google.png', enabled: true },
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', description: 'Alibaba Qwen 3 32B (Groq)', provider: 'Alibaba Cloud', logo: '/src/logo/google.png', enabled: true },
    { id: 'distil-whisper-large-v3-en', name: 'Distil Whisper Large v3 EN', description: 'Hugging Face Distil Whisper Large v3 EN (Groq)', provider: 'Hugging Face', logo: '/src/logo/google.png', enabled: true },
    { id: 'whisper-large-v3', name: 'Whisper Large v3', description: 'OpenAI Whisper Large v3 (Groq)', provider: 'OpenAI', logo: '/src/logo/openai.png', enabled: true },
    { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo', description: 'OpenAI Whisper Large v3 Turbo (Groq)', provider: 'OpenAI', logo: '/src/logo/openai.png', enabled: true },
    { id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Llama 3.3 Nemotron Super 49B', description: 'Nvidia Llama 3.3 Nemotron Super 49B (OpenRouter)', provider: 'Nvidia', logo: '/src/logo/google.png', enabled: true },
    { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2 24B Instruct', description: 'Mistral Small 3.2 24B Instruct (OpenRouter)', provider: 'Mistral', logo: '/src/logo/google.png', enabled: true },
    { id: 'minimax/minimax-m1', name: 'MiniMax M1', description: 'MiniMax M1 (OpenRouter)', provider: 'MiniMax', logo: '/src/logo/minimax.png', enabled: true },
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

  const handleInputVariableChange = (newInputVariables: InputVariable[]) => {
    setInputVariables(newInputVariables);
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
    if (!currentVersion?.content.trim()) return;
    setIsRunning(true);
    setSelectedModelsForAutoTest(selectedModels);
    const processedPrompt = replaceVariables(currentVersion?.content || '');
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

  const handleRunPrompt = async () => {
    if (!currentVersion?.content.trim()) return;

    setIsRunning(true);
    try {
      const processedPrompt = replaceVariables(currentVersion?.content || '');
      const result = await apiService.generateCompletion(
        currentModel,
        processedPrompt,
        systemMessage,
        0.7,
        1000
      );

      setCurrentOutput(result.content);
      
      // Add run to version history
      addRun({
        versionId: currentVersionId,
        modelId: currentModel,
        output: result.content,
        executionTime: 0, // Will be calculated by the hook
        tokenUsage: result.usage ? {
          input: result.usage.prompt_tokens,
          output: result.usage.completion_tokens,
          total: result.usage.total_tokens
        } : { input: 0, output: 0, total: 0 }
      });

    } catch (error) {
      console.error('Error running prompt:', error);
      setCurrentOutput('Error: Failed to generate response');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateVersion = (title: string, message: string) => {
    createVersion(currentVersion?.content || '', Object.fromEntries(variables.map(v => [v.name, v.value])), title, message);
  };

  const handleVersionSelect = (versionId: string) => {
    setCurrentVersionId(versionId);
    const version = versions.find((v: any) => v.id === versionId);
    if (version) {
      const versionVariables = Object.entries(version.variables || {}).map(([name, value]) => ({ name, value: value as string }));
      setVariables(versionVariables);
    }
  };

  const handleVersionSelectForComparison = (versionId: string) => {
    setSelectedVersionsForComparison(prev => 
      prev.includes(versionId) 
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleDeleteVersion = (versionId: string) => {
    deleteVersion(versionId);
    // Remove from comparison if it was selected
    setSelectedVersionsForComparison(prev => prev.filter(id => id !== versionId));
  };

  const handleDuplicateVersion = (versionId: string) => {
    duplicateVersion(versionId);
  };

  const handleUpdateVersion = (versionId: string, updates: any) => {
    updateVersion(versionId, updates);
  };

  const handleAutoTestComplete = (result: AutoTestResult) => {
    setAutoTestResults(prev => [...prev, result]);
  };

  // Prompt management handlers
  const handleCreatePrompt = (title: string, description?: string) => {
    const newPrompt = createPrompt(title, description);
    
    // Automatically create a canvas node for the new prompt
    if (newPrompt) {
      const canvasNodeData = {
        promptId: newPrompt.id,
        title: newPrompt.title,
        prompt: '',
        model: currentModel,
        temperature: 0.7,
        maxTokens: 1000,
        variables: {},
        inputVariables: [],
        outputVariables: [],
        output: '',
        isRunning: false,
        score: null,
        tokenUsage: null,
        error: undefined,
        healthIssues: [],
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
        createdAt: new Date().toISOString()
      };
      
      // Store the node data for canvas to pick up
      const existingCanvasData = localStorage.getItem(`canvasNodes_${projectId || 'default'}`);
      const canvasNodes = existingCanvasData ? JSON.parse(existingCanvasData) : [];
      canvasNodes.push(canvasNodeData);
      localStorage.setItem(`canvasNodes_${projectId || 'default'}`, JSON.stringify(canvasNodes));
      
      // Notify canvas that a new node should be created
      localStorage.setItem('editorToCanvasData', JSON.stringify({
        action: 'createNode',
        data: canvasNodeData,
        updated: true
      }));
    }
  };

  // Function to sync prompt changes with canvas nodes
  const syncPromptToCanvas = useCallback((promptId: string, updates: any) => {
    // Get the corresponding node ID for this prompt
    const nodeId = localStorage.getItem(`promptToNode_${promptId}`);
    
    const canvasNodeData = {
      promptId,
      nodeId,
      title: updates.title || currentPrompt?.title,
      prompt: updates.content || currentVersion?.content || '',
      variables: Object.fromEntries(variables.map(v => [v.name, v.value])),
      model: currentModel,
      temperature: 0.7,
      maxTokens: 1000,
      updated: true
    };
    
    localStorage.setItem('editorToCanvasData', JSON.stringify({
      action: 'updateNode',
      data: canvasNodeData,
      updated: true
    }));
  }, [currentPrompt?.title, currentVersion?.content, variables, currentModel]);

  // Debounced sync function to prevent too frequent updates
  const debouncedSync = useCallback(
    debounce((promptId: string, updates: any) => {
      syncPromptToCanvas(promptId, updates);
    }, 300),
    [syncPromptToCanvas]
  );

  // Sync prompt changes to canvas - only when content actually changes
  useEffect(() => {
    if (currentPrompt && currentVersion) {
      const syncData = {
        title: currentPrompt.title,
        content: currentVersion.content
      };
      debouncedSync(currentPrompt.id, syncData);
    }
  }, [currentPrompt?.title, currentVersion?.content, currentPrompt?.id, debouncedSync]);

  // Sync variable changes to canvas - only when variables actually change
  useEffect(() => {
    if (currentPrompt) {
      const variablesData = Object.fromEntries(variables.map(v => [v.name, v.value]));
      debouncedSync(currentPrompt.id, { variables: variablesData });
    }
  }, [variables, currentPrompt?.id, debouncedSync]);

  // Sync model changes to canvas - only when model actually changes
  useEffect(() => {
    if (currentPrompt) {
      debouncedSync(currentPrompt.id, { model: currentModel });
    }
  }, [currentModel, currentPrompt?.id, debouncedSync]);

  const handlePromptSelect = (promptId: string) => {
    selectPrompt(promptId);
  };

  const handleDeletePrompt = (promptId: string) => {
    deletePrompt(promptId);
  };

  const handleDuplicatePrompt = (promptId: string) => {
    duplicatePrompt(promptId);
  };

  const handleUpdatePrompt = (promptId: string, updates: any) => {
    updatePrompt(promptId, updates);
  };

  const tabs = [
    { id: 'editor' as const, name: 'Editor', icon: Zap },
    { id: 'canvas' as const, name: 'Canvas', icon: Workflow },
    { id: 'analytics' as const, name: 'Analytics', icon: BarChart3 },
    { id: 'compare' as const, name: 'Compare', icon: GitBranch }
  ];

  const filteredRuns = currentRuns.filter((run: any) => 
    run.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
    run.modelId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-semibold text-black">🦜 LangForge</span>
                {currentPrompt && (
                  <span className="text-sm text-gray-500">• {currentPrompt.title}</span>
                )}
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
                    data-walkthrough={tab.id === 'analytics' ? 'analytics-tab' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
              
              {fromCanvas && (
                <button
                  onClick={() => {
                    // Save the current prompt data back to canvas
                    const updatedData = {
                      prompt: currentVersion?.content || '',
                      variables: Object.fromEntries(variables.map(v => [v.name, v.value])),
                      model: currentModel,
                      temperature: 0.7,
                      title: currentVersion?.title || 'Updated Node',
                      fromCanvas: true,
                      nodeId: canvasNodeId,
                      updated: true
                    };
                    localStorage.setItem('editorToCanvasData', JSON.stringify(updatedData));
                    window.close();
                  }}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Workflow className="w-4 h-4" />
                  <span className="hidden sm:inline">Save to Canvas</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
                  data-walkthrough={tab.id === 'analytics' ? 'analytics-tab' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
            
            {fromCanvas && (
              <button
                onClick={() => {
                  // Save the current prompt data back to canvas
                  const updatedData = {
                    prompt: currentVersion?.content || '',
                    variables: Object.fromEntries(variables.map(v => [v.name, v.value])),
                    model: currentModel,
                    temperature: 0.7,
                    title: currentVersion?.title || 'Updated Node',
                    fromCanvas: true,
                    nodeId: canvasNodeId,
                    updated: true
                  };
                  localStorage.setItem('editorToCanvasData', JSON.stringify(updatedData));
                  window.close();
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <Workflow className="w-4 h-4" />
                <span className="text-sm">Save to Canvas</span>
              </button>
            )}
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
      <div className={activeTab === 'canvas' ? '' : 'px-4 sm:px-6 py-4 sm:py-8'} data-walkthrough="editor-main">
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

                {/* Prompts Collapsible */}
                <div>
                  <button onClick={() => setCollapsePrompts((v: boolean) => !v)} className="flex items-center w-full mb-2 text-left space-x-2">
                    {collapsePrompts ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-semibold">Prompts</span>
                  </button>
                  {!collapsePrompts && (
                    <div data-walkthrough="prompt-list">
                      <PromptManager
                        projectId={projectId}
                        prompts={prompts}
                        currentPromptId={currentPromptId}
                        onPromptSelect={handlePromptSelect}
                        onCreatePrompt={handleCreatePrompt}
                        onDeletePrompt={handleDeletePrompt}
                        onDuplicatePrompt={handleDuplicatePrompt}
                        onUpdatePrompt={handleUpdatePrompt}
                        collapsible={false}
                      />
                    </div>
                  )}
                </div>

                {/* Variables Collapsible */}
                <div>
                  <button onClick={() => setCollapseVariables((v: boolean) => !v)} className="flex items-center w-full mb-2 text-left space-x-2">
                    {collapseVariables ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-semibold">Variables</span>
                  </button>
                  {!collapseVariables && (
                    <div data-walkthrough="variables-panel">
                      <VariableManager
                        variables={variables}
                        inputVariables={inputVariables}
                        prompt={currentVersion?.content || ''}
                        onVariableChange={handleVariableChange}
                        onAddVariable={handleAddVariable}
                        onRemoveVariable={handleRemoveVariable}
                        onInputVariableChange={handleInputVariableChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Left Sidebar */}
            <div className="hidden xl:block space-y-6">
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

              {/* Prompts Collapsible */}
              <div>
                <button onClick={() => setCollapsePrompts((v: boolean) => !v)} className="flex items-center w-full mb-2 text-left space-x-2">
                  {collapsePrompts ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="font-semibold">Prompts</span>
                </button>
                {!collapsePrompts && (
                  <div data-walkthrough="prompt-list">
                    <PromptManager
                      projectId={projectId}
                      prompts={prompts}
                      currentPromptId={currentPromptId}
                      onPromptSelect={handlePromptSelect}
                      onCreatePrompt={handleCreatePrompt}
                      onDeletePrompt={handleDeletePrompt}
                      onDuplicatePrompt={handleDuplicatePrompt}
                      onUpdatePrompt={handleUpdatePrompt}
                      collapsible={false}
                    />
                  </div>
                )}
              </div>

              {/* Variables Collapsible */}
              <div>
                <button onClick={() => setCollapseVariables((v: boolean) => !v)} className="flex items-center w-full mb-2 text-left space-x-2">
                  {collapseVariables ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="font-semibold">Variables</span>
                </button>
                {!collapseVariables && (
                  <div data-walkthrough="variables-panel">
                    <VariableManager
                      variables={variables}
                      inputVariables={inputVariables}
                      prompt={currentVersion?.content || ''}
                      onVariableChange={handleVariableChange}
                      onAddVariable={handleAddVariable}
                      onRemoveVariable={handleRemoveVariable}
                      onInputVariableChange={handleInputVariableChange}
                    />
                  </div>
                )}
              </div>

              {/* Version Control */}
              <div data-walkthrough="version-control">
                <VersionControl
                  versions={versions}
                  currentVersionId={currentVersionId}
                  onVersionSelect={handleVersionSelect}
                  onCreateVersion={handleCreateVersion}
                  onDeleteVersion={handleDeleteVersion}
                  onDuplicateVersion={handleDuplicateVersion}
                  onUpdateVersion={handleUpdateVersion}
                />
              </div>

              {/* Prompt Actions */}
              <div data-walkthrough="prompt-actions">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Actions</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <button
                      onClick={() => handleDuplicatePrompt(currentPromptId)}
                      className="w-full flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Duplicate Prompt</span>
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(currentPromptId)}
                      className="w-full flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Prompt</span>
                    </button>
                  </div>
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

              <div data-walkthrough="prompt-input">
                <PromptEditor 
                  prompt={currentVersion?.content || ''} 
                  setPrompt={handlePromptChange}
                  isRunning={isRunning}
                  variables={variables}
                  onVariablesChange={handleVariablesChange}
                  selectedModel={currentModel}
                  temperature={0.7}
                  models={models}
                  selectedModels={selectedModelsForAutoTest}
                  onAutoTestComplete={handleAutoTestComplete}
                />
              </div>

              <div data-walkthrough="run-button">
                <MultiModelRunner
                  models={models}
                  onRunModels={handleRunModels}
                  isRunning={isRunning}
                  runs={currentRuns}
                />
              </div>

              {/* Search and Filter for Recent Runs */}
              {currentRuns.length > 0 && (
                <div className="space-y-4" data-walkthrough="output-panel">
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
                    {filteredRuns.slice(-6).map((run: any) => {
                      const model = models.find((m: any) => m.id === run.modelId);
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
                  modelLogo={models.find(m => m.id === currentModel)?.logo}
                  modelName={models.find(m => m.id === currentModel)?.name || currentModel}
                />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block space-y-6">
              {/* Version History */}
              <VersionControl
                versions={versions}
                currentVersionId={currentVersionId}
                onVersionSelect={handleVersionSelect}
                onCreateVersion={handleCreateVersion}
                onDeleteVersion={handleDeleteVersion}
                onDuplicateVersion={handleDuplicateVersion}
                onUpdateVersion={handleUpdateVersion}
                selectedVersionsForComparison={selectedVersionsForComparison}
                onVersionSelectForComparison={handleVersionSelectForComparison}
              />
              
              <VersionComparison
                versions={versions}
                runs={runs}
                selectedVersions={selectedVersionsForComparison}
                onVersionSelect={handleVersionSelectForComparison}
                onDeleteVersion={handleDeleteVersion}
                onDuplicateVersion={handleDuplicateVersion}
                onUpdateVersion={handleUpdateVersion}
                collapsible={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="h-[calc(100vh-140px)] overflow-hidden">
            <PromptChainCanvas projectId={projectId} projectName={location.state?.projectName || 'Untitled Project'} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto">
            <Analytics versions={versions} runs={runs} autoTestResults={autoTestResults} />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="max-w-4xl mx-auto">
            <VersionComparison
              versions={versions}
              runs={runs}
              selectedVersions={selectedVersionsForComparison}
              onVersionSelect={handleVersionSelectForComparison}
              onDeleteVersion={handleDeleteVersion}
              onDuplicateVersion={handleDuplicateVersion}
              onUpdateVersion={handleUpdateVersion}
              collapsible={true}
            />
          </div>
        )}
      </div>

      {/* Full Score Report Modal */}
      {showFullScoreReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const run = currentRuns.find((r: any) => r.id === showFullScoreReport);
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