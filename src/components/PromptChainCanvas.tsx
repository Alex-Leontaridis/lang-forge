import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom styles to ensure edges are visible
const customStyles = `
  .react-flow__edge {
    z-index: 10 !important;
    pointer-events: all !important;
  }
  .react-flow__edge-path {
    stroke-width: 2px !important;
    stroke: #6b7280 !important;
  }
  .react-flow__edge.conditional {
    stroke: #3b82f6 !important;
    stroke-width: 3px !important;
    stroke-dasharray: 5,5 !important;
  }
`;
import langchainLogo from '../logo/langchain.png';
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  BarChart3, 
  Clock, 
  Zap, 
  Target,
  ChevronDown,
  ChevronUp,
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
  Sparkles,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import LiveChainVisualization from './LiveChainVisualization';
import ConditionEditor from './ConditionEditor';
import { PromptNode as PromptNodeType, PromptScore, ConnectionCondition, ConditionalEdge } from '../types';
import apiService from '../services/apiService';

// LangChain Template Interface
interface LangChainTemplate {
  id: string;
  name: string;
  description: string;
  category: 'prompt' | 'chain' | 'agent' | 'memory' | 'retrieval';
  template: string;
  variables: string[];
  example: string;
  tags: string[];
}

// Predefined LangChain Templates
const predefinedTemplates: LangChainTemplate[] = [
  {
    id: 'translation',
    name: 'Translation Assistant',
    description: 'Translate text between languages with context preservation',
    category: 'prompt',
    template: `You are a professional translator with expertise in {source_language} and {target_language}.

Context: {context}

Please translate the following text from {source_language} to {target_language}:

Text to translate: {text}

Requirements:
- Maintain the original tone and style
- Preserve cultural nuances where possible
- Ensure accuracy and fluency

Translation:`,
    variables: ['source_language', 'target_language', 'context', 'text'],
    example: 'Translate "Hello, how are you?" from English to Spanish',
    tags: ['translation', 'multilingual', 'language']
  },
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    description: 'Comprehensive code review with security and best practices analysis',
    category: 'prompt',
    template: `You are an expert software engineer conducting a code review. Please analyze the following code:

Programming Language: {language}
Code to Review:
\`\`\`{language}
{code}
\`\`\`

Review Criteria:
1. **Code Quality**: Check for readability, maintainability, and best practices
2. **Security**: Identify potential security vulnerabilities
3. **Performance**: Suggest optimizations if applicable
4. **Documentation**: Assess code documentation and comments

Please provide a detailed review with:
- Overall assessment (Pass/Fail with reasoning)
- Specific issues found with line numbers
- Suggestions for improvement
- Security concerns (if any)

Code Review:`,
    variables: ['language', 'code'],
    example: 'Review a JavaScript function for security and best practices',
    tags: ['code-review', 'security', 'best-practices', 'programming']
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Create concise and accurate summaries of long-form content',
    category: 'prompt',
    template: `You are a skilled content summarizer. Please create a comprehensive summary of the following content:

Content Type: {content_type}
Target Length: {target_length} words
Key Focus Areas: {focus_areas}

Content to Summarize:
{content}

Summary Requirements:
- Maintain the main ideas and key points
- Use clear, concise language
- Include important statistics or data if present
- Preserve the original tone and perspective

Please provide:
1. A concise summary within the target word count
2. Key takeaways or main points
3. Important statistics or data (if applicable)

Summary:`,
    variables: ['content_type', 'target_length', 'focus_areas', 'content'],
    example: 'Summarize a 2000-word article about AI trends in 200 words',
    tags: ['summarization', 'content', 'analysis', 'clarity']
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing Assistant',
    description: 'Generate creative content with specific style and genre requirements',
    category: 'prompt',
    template: `You are a creative writing assistant. Please help create content based on the following specifications:

Genre: {genre}
Style: {style}
Tone: {tone}
Target Audience: {audience}
Word Count: {word_count} words

Story Elements:
- Setting: {setting}
- Characters: {characters}
- Plot Elements: {plot_elements}
- Theme: {theme}

Please create a {genre} piece that:
- Matches the specified style and tone
- Appeals to the target audience
- Incorporates the provided story elements
- Meets the word count requirement
- Demonstrates creativity and originality

Creative Content:`,
    variables: ['genre', 'style', 'tone', 'audience', 'word_count', 'setting', 'characters', 'plot_elements', 'theme'],
    example: 'Create a 500-word sci-fi story with descriptive style and serious tone',
    tags: ['creative-writing', 'fiction', 'storytelling', 'imagination']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Assistant',
    description: 'Analyze and interpret data with statistical insights and recommendations',
    category: 'prompt',
    template: `You are a data analyst. Please analyze the following dataset and provide insights:

Dataset Description: {dataset_description}
Analysis Type: {analysis_type}
Key Questions: {key_questions}

Data:
{data}

Analysis Requirements:
1. **Descriptive Statistics**: Provide summary statistics and key metrics
2. **Pattern Recognition**: Identify trends, patterns, or anomalies
3. **Correlation Analysis**: Find relationships between variables (if applicable)
4. **Insights**: Extract meaningful insights from the data
5. **Recommendations**: Provide actionable recommendations based on findings

Please provide:
- Executive summary of findings
- Detailed analysis with supporting evidence
- Key insights and their implications
- Actionable recommendations
- Limitations of the analysis

Data Analysis Report:`,
    variables: ['dataset_description', 'analysis_type', 'key_questions', 'data'],
    example: 'Analyze quarterly sales data to identify trends and provide recommendations',
    tags: ['data-analysis', 'statistics', 'insights', 'business-intelligence']
  }
];

interface PromptChainCanvasProps {
  projectId?: string;
  projectName?: string;
}

const nodeTypes = {
  promptNode: PromptNodeComponent,
};

// Edge types are handled by ReactFlow's default edge renderer

const PromptChainCanvasInner = ({ projectId, projectName }: PromptChainCanvasProps) => {
  const location = useLocation();
  const canvasProjectId = projectId || location.state?.projectId;
  const canvasProjectName = projectName || location.state?.projectName || 'Untitled Project';
  
  console.log('Canvas initialized with:', { projectId, canvasProjectId, canvasProjectName });
  
  // Get localStorage key for this project
  const getStorageKey = (key: string) => {
    const storageKey = `canvas_${canvasProjectId || 'default'}_${key}`;
    return storageKey;
  };
  
  // Initialize state from localStorage (without function references initially)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Debug logging for edges
  useEffect(() => {
    console.log('Edges state changed:', edges);
  }, [edges]);
  
  const [chainName, setChainName] = useState(() => {
    const savedChainName = localStorage.getItem(getStorageKey('chainName'));
    return savedChainName || 'Untitled Chain';
  });
  
  const [systemMessage, setSystemMessage] = useState(() => {
    const savedSystemMessage = localStorage.getItem(getStorageKey('systemMessage'));
    return savedSystemMessage || '';
  });
  
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<ConditionalEdge | null>(null);
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [showSystemMessage, setShowSystemMessage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const edgesRef = useRef<Edge[]>([]);

  const reactFlowInstance = useReactFlow();

  // Handle clicking outside export menu to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Extract variables from prompt text
  const extractVariables = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  // Define helper functions first (before loading from localStorage)
  const replaceVariables = (prompt: string, nodeId: string): string => {
    let result = prompt;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return result;
    
    const variables = node.data.variables || {};
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
      }
    });
    return result;
  };

  const runSingleNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`Node ${nodeId} not found`);
      return;
    }

    console.log(`Starting execution of node ${nodeId}:`, node.data.title);

    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isRunning: true, error: undefined } }
          : n
      )
    );

    try {
      const processedPrompt = replaceVariables(node.data.prompt, nodeId);
      console.log(`Processed prompt for node ${nodeId}:`, processedPrompt);

      const result = await apiService.generateCompletion(
        node.data.model,
        processedPrompt,
        systemMessage || undefined,
        node.data.temperature || 0.7,
        node.data.maxTokens || 1000
      );

      console.log(`API response for node ${nodeId}:`, result);

      let score;
      try {
        score = await apiService.evaluatePromptResponse(
        processedPrompt,
          result.content,
          node.data.temperature || 0.3
        );
        console.log(`Evaluation score for node ${nodeId}:`, score);
      } catch (evalError) {
        console.warn(`Failed to evaluate node ${nodeId}:`, evalError);
        score = {
          relevance: 50,
          clarity: 50,
          creativity: 50,
          overall: 50,
          critique: 'Evaluation failed. Using default scores.'
        };
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  output: result.content,
                  score,
                  tokenUsage: result.usage ? {
                    input: result.usage.prompt_tokens,
                    output: result.usage.completion_tokens,
                    total: result.usage.total_tokens
                  } : undefined,
                  isRunning: false,
                  error: undefined
                } 
              }
            : n
        )
      );

      console.log(`Node ${nodeId} completed successfully`);
    } catch (error) {
      console.error(`Error running node ${nodeId}:`, error);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  output: '',
                  error: error instanceof Error ? error.message : 'Failed to generate response',
                  isRunning: false
                } 
              }
            : n
        )
      );
    }
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find(node => node.id === nodeId);
      
      // If this node has a promptId, notify the editor to delete the corresponding prompt
      if (nodeToDelete?.data.promptId) {
        const editorData = {
          action: 'deletePromptFromCanvas',
          data: {
            promptId: nodeToDelete.data.promptId,
            nodeId
          },
          updated: true
        };
        localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
      }
      
      // Also remove from project-specific storage
      const projectKey = `canvasNodes_${canvasProjectId || 'default'}`;
      const canvasNodesData = localStorage.getItem(projectKey);
      if (canvasNodesData) {
        try {
          const canvasNodes = JSON.parse(canvasNodesData);
          const updatedCanvasNodes = canvasNodes.filter((node: any) => node.id !== nodeId);
          localStorage.setItem(projectKey, JSON.stringify(updatedCanvasNodes));
        } catch (error) {
          console.error('Error updating canvas nodes storage:', error);
        }
      }
      
      return nds.filter((node) => node.id !== nodeId);
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges, canvasProjectId]);

  // Function to update project-specific storage
  const updateCanvasNodesStorage = useCallback((updatedNodes: Node[]) => {
    const projectKey = `canvasNodes_${canvasProjectId || 'default'}`;
    const nodesData = updatedNodes.map(node => ({
      id: node.id,
      promptId: node.data.promptId,
      title: node.data.title,
      prompt: node.data.prompt,
      model: node.data.model,
      temperature: node.data.temperature,
      maxTokens: node.data.maxTokens,
      variables: node.data.variables,
      inputVariables: node.data.inputVariables,
      outputVariables: node.data.outputVariables,
      output: node.data.output,
      score: node.data.score,
      tokenUsage: node.data.tokenUsage,
      error: node.data.error,
      healthIssues: node.data.healthIssues,
      position: node.position
    }));
    localStorage.setItem(projectKey, JSON.stringify(nodesData));
  }, [canvasProjectId]);

  // Load nodes and edges from localStorage on mount
  React.useEffect(() => {
    const savedNodes = localStorage.getItem(getStorageKey('nodes'));
    if (savedNodes) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        // Add function references directly when loading
        const nodesWithFunctions = parsedNodes.map((node: any) => ({
          ...node,
          data: {
            ...node.data,
            onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, data: { ...n.data, ...updates } }
                    : n
                )
              );
            },
            onRun: (id: string) => runSingleNode(id),
            onDelete: (id: string) => deleteNode(id),
          }
        }));
        setNodes(nodesWithFunctions);
      } catch (error) {
        console.error('Error loading nodes from localStorage:', error);
      }
    }

    const savedEdges = localStorage.getItem(getStorageKey('edges'));
    if (savedEdges) {
      try {
        const parsedEdges = JSON.parse(savedEdges);
        console.log('Loading edges from localStorage:', parsedEdges);
        
        // Use ReactFlow's addEdge function to properly initialize edges
        let currentEdges: Edge[] = [];
        parsedEdges.forEach((edgeData: any) => {
          const conditionalEdge = edgeData as ConditionalEdge;
          
          // Create a proper edge object with ReactFlow structure
          const edge: ConditionalEdge = {
            id: conditionalEdge.id,
            source: conditionalEdge.source,
            target: conditionalEdge.target,
            sourceHandle: conditionalEdge.sourceHandle,
            targetHandle: conditionalEdge.targetHandle,
            condition: conditionalEdge.condition,
            type: conditionalEdge.type || 'default',
            data: conditionalEdge.data || {}
          };
          
                      // Apply styling based on condition
            if (conditionalEdge.condition && conditionalEdge.condition.enabled) {
              edge.label = `${conditionalEdge.condition.type.replace('_', ' ')} ${conditionalEdge.condition.operator} ${conditionalEdge.condition.value}`;
              edge.style = { 
                stroke: '#3b82f6', 
                strokeWidth: 3,
                strokeDasharray: '5,5'
              };
              edge.labelStyle = { 
                fontSize: 10, 
                fontWeight: 600,
                fill: '#3b82f6',
                backgroundColor: 'white',
                padding: '2px 4px',
                borderRadius: '4px'
              };
              edge.className = 'conditional';
            } else {
              edge.label = conditionalEdge.label || '';
              edge.style = conditionalEdge.style || { stroke: '#6b7280', strokeWidth: 2 };
              edge.labelStyle = conditionalEdge.labelStyle || { fontSize: 12, fontWeight: 600, fill: '#6b7280' };
            }
          
          // Use addEdge to properly add the edge
          currentEdges = addEdge(edge, currentEdges);
          
          // Ensure the edge is properly initialized
          console.log('Added edge to currentEdges:', edge);
        });
        
        console.log('Setting edges with addEdge:', currentEdges);
        setEdges(currentEdges);
      } catch (error) {
        console.error('Error loading edges from localStorage:', error);
      }
    }
    
    // Mark as loaded after initial data is processed
    setIsLoaded(true);
    
    // Force a fresh render by incrementing canvas key
    setCanvasKey(prev => prev + 1);
    
    // Force a complete re-render after a short delay
    setTimeout(() => {
      setForceRender(prev => prev + 1);
    }, 100);
  }, [canvasProjectId]); // Only run when projectId changes

  // Save nodes to localStorage whenever they change
  React.useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(getStorageKey('nodes'), JSON.stringify(nodes));
      // Also update project-specific storage
      updateCanvasNodesStorage(nodes);
    }
  }, [nodes, canvasProjectId, updateCanvasNodesStorage]);

  // Save edges to localStorage whenever they change
  React.useEffect(() => {
    console.log('Saving edges to localStorage:', edges);
    localStorage.setItem(getStorageKey('edges'), JSON.stringify(edges));
    edgesRef.current = edges;
  }, [edges, canvasProjectId]);

  // Ensure edges are properly styled after loading
  React.useEffect(() => {
    if (edges.length > 0) {
      const updatedEdges = edges.map((edge) => {
        const conditionalEdge = edge as ConditionalEdge;
        if (conditionalEdge.condition && conditionalEdge.condition.enabled) {
          // Ensure conditional styling is applied
          return {
            ...conditionalEdge,
            label: `${conditionalEdge.condition.type.replace('_', ' ')} ${conditionalEdge.condition.operator} ${conditionalEdge.condition.value}`,
            style: { 
              stroke: '#3b82f6', 
              strokeWidth: 3,
              strokeDasharray: '5,5'
            },
            labelStyle: { 
              fontSize: 10, 
              fontWeight: 600,
              fill: '#3b82f6',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '4px'
            }
          };
        } else {
          // Ensure default styling is applied
          return {
            ...conditionalEdge,
            label: conditionalEdge.label || '',
            style: conditionalEdge.style || { stroke: '#6b7280', strokeWidth: 2 },
            labelStyle: conditionalEdge.labelStyle || { fontSize: 12, fontWeight: 600, fill: '#6b7280' }
          };
        }
      });
      
      // Only update if there are actual changes to avoid infinite loops
      const hasChanges = updatedEdges.some((updatedEdge, index) => {
        const originalEdge = edges[index];
        return JSON.stringify(updatedEdge) !== JSON.stringify(originalEdge);
      });
      
      if (hasChanges) {
        setEdges(updatedEdges);
      }
    }
  }, [edges.length]); // Only run when edges array length changes (after initial load)

  // Save chain name to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem(getStorageKey('chainName'), chainName);
  }, [chainName, canvasProjectId]);

  // Save system message to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem(getStorageKey('systemMessage'), systemMessage);
    // Sync with editor system message
    localStorage.setItem(`promptForgeSystemMessage_${canvasProjectId || 'global'}`, systemMessage);
  }, [systemMessage, canvasProjectId]);

  // Poll for system message changes from editor
  React.useEffect(() => {
    const interval = setInterval(() => {
      const editorSystemMessage = localStorage.getItem(`promptForgeSystemMessage_${canvasProjectId || 'global'}`);
      if (editorSystemMessage !== null && editorSystemMessage !== systemMessage) {
        setSystemMessage(editorSystemMessage);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [systemMessage, canvasProjectId]);

  // Poll for updated data from editor (editor → canvas sync)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const editorData = localStorage.getItem('editorToCanvasData');
      if (editorData) {
        try {
          const data = JSON.parse(editorData);
          if ((data.action === 'createNode' || data.action === 'updateNode') && data.updated) {
            setNodes((nds) => {
              // Try to find node by promptId
              const nodeIdx = nds.findIndex(node => node.data.promptId === data.data.promptId);
              if (nodeIdx !== -1) {
                // Update existing node
                return nds.map((node, idx) =>
                  idx === nodeIdx
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          promptId: data.data.promptId,
                          title: data.data.title || node.data.title,
                          prompt: data.data.prompt || node.data.prompt,
                          variables: data.data.variables || node.data.variables,
                          model: data.data.model || node.data.model,
                          temperature: data.data.temperature || node.data.temperature
                        }
                      }
                    : node
                );
              } else {
                // Create new node
                const newNode: Node = {
                  id: `node_${Date.now()}`,
                  type: 'promptNode',
                  position: data.data.position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
                  data: {
                    promptId: data.data.promptId,
                    title: data.data.title,
                    prompt: data.data.prompt || '',
                    model: data.data.model || 'gpt-4',
                    temperature: data.data.temperature || 0.7,
                    maxTokens: data.data.maxTokens || 1000,
                    variables: data.data.variables || {},
                    inputVariables: data.data.inputVariables || [],
                    outputVariables: data.data.outputVariables || [],
                    output: '',
                    isRunning: false,
                    score: null,
                    tokenUsage: null,
                    error: undefined,
                    healthIssues: [],
                    onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
                      setNodes((nds2) =>
                        nds2.map((n) =>
                          n.id === id
                            ? { ...n, data: { ...n.data, ...updates } }
                            : n
                        )
                      );
                    },
                    onRun: (id: string) => runSingleNode(id),
                    onDelete: (id: string) => deleteNode(id),
                  }
                };
                return [...nds, newNode];
              }
            });
            // Remove the sync message after processing
            localStorage.removeItem('editorToCanvasData');
          }
        } catch (error) {
          console.error('Error loading editor data:', error);
          localStorage.removeItem('editorToCanvasData');
        }
      }
      
      // Check for promptId updates (when temp promptId is replaced with real one)
      setNodes((nds) => {
        let updated = false;
        const updatedNodes = nds.map((node) => {
          if (node.data.promptId && node.data.promptId.startsWith('temp_prompt_')) {
            const realPromptId = localStorage.getItem(`tempPromptToRealPrompt_${node.data.promptId}`);
            if (realPromptId) {
              updated = true;
              // Clean up the mapping
              localStorage.removeItem(`tempPromptToRealPrompt_${node.data.promptId}`);
              console.log(`Updated node ${node.id} with real prompt ID: ${realPromptId}`);
              return { ...node, data: { ...node.data, promptId: realPromptId } };
            }
          }
          return node;
        });
        return updated ? updatedNodes : nds;
      });
      
      // Also check for any nodes that might have been created while editor was closed
      setNodes((currentNodes) => {
        const projectKey = `canvasNodes_${canvasProjectId || 'default'}`;
        const canvasNodesData = localStorage.getItem(projectKey);
        if (canvasNodesData) {
          try {
            const canvasNodes = JSON.parse(canvasNodesData);
            const currentNodeIds = currentNodes.map(node => node.id);
            
            // Find nodes that exist in storage but not in current state
            const orphanedNodes: Node[] = [];
            canvasNodes.forEach((storedNode: any) => {
              if (!currentNodeIds.includes(storedNode.id)) {
                console.log('Found orphaned canvas node, recreating:', storedNode.id);
                
                // Recreate the node
                const newNode: Node = {
                  id: storedNode.id,
                  type: 'promptNode',
                  position: storedNode.position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
                  data: {
                    promptId: storedNode.promptId,
                    title: storedNode.title,
                    prompt: storedNode.prompt || '',
                    model: storedNode.model || 'gpt-4',
                    temperature: storedNode.temperature || 0.7,
                    maxTokens: storedNode.maxTokens || 1000,
                    variables: storedNode.variables || {},
                    inputVariables: storedNode.inputVariables || [],
                    outputVariables: storedNode.outputVariables || [],
                    output: storedNode.output || '',
                    isRunning: false,
                    score: storedNode.score || null,
                    tokenUsage: storedNode.tokenUsage || null,
                    error: storedNode.error || undefined,
                    healthIssues: storedNode.healthIssues || [],
                    onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
                      setNodes((nds2) =>
                        nds2.map((n) =>
                          n.id === id
                            ? { ...n, data: { ...n.data, ...updates } }
                            : n
                        )
                      );
                    },
                    onRun: (id: string) => runSingleNode(id),
                    onDelete: (id: string) => deleteNode(id),
                  }
                };
                
                orphanedNodes.push(newNode);
              }
            });
            
            return orphanedNodes.length > 0 ? [...currentNodes, ...orphanedNodes] : currentNodes;
          } catch (error) {
            console.error('Error checking for orphaned nodes:', error);
            return currentNodes;
          }
        }
        return currentNodes;
      });
    }, 300); // Poll every 300ms
    return () => clearInterval(interval);
  }, [setNodes, runSingleNode, deleteNode, reactFlowInstance, canvasProjectId]);

  // Initialize default condition
  const getDefaultCondition = (): ConnectionCondition => ({
    enabled: false,
    type: 'output_contains',
    operator: 'contains',
    value: '',
    variable: '',
    field: 'overall'
  });

  // LangChain Template Functions
  const handleTemplateSelect = (template: LangChainTemplate) => {
    const nodeId = `node_${Date.now()}`;
    const tempPromptId = `template_${template.id}_${Date.now()}`;
    
    const newNode: Node = {
      id: nodeId,
      type: 'promptNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        promptId: tempPromptId,
        title: template.name,
        prompt: template.template,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        variables: template.variables.reduce((acc, variable) => {
          acc[variable] = '';
          return acc;
        }, {} as Record<string, string>),
        inputVariables: template.variables.map(variable => ({
          name: variable,
          type: 'string' as const,
          required: true,
          description: `Input for ${variable}`
        })),
        outputVariables: [],
        output: '',
        isRunning: false,
        score: null,
        tokenUsage: null,
        error: undefined,
        healthIssues: [],
        onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id
                ? { ...n, data: { ...n.data, ...updates } }
                : n
            )
          );
        },
        onRun: (id: string) => runSingleNode(id),
        onDelete: (id: string) => deleteNode(id),
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Automatically create a prompt in the editor for this template node
    const editorData = {
      action: 'createPromptFromCanvas',
      data: {
        nodeId,
        promptId: tempPromptId,
        title: template.name,
        prompt: template.template,
        model: 'gpt-4',
        temperature: 0.7,
        variables: template.variables.reduce((acc, variable) => {
          acc[variable] = '';
          return acc;
        }, {} as Record<string, string>),
        position: newNode.position
      },
      updated: true
    };
    localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
    
    // Also store the node data in project-specific storage
    const projectKey = `canvasNodes_${canvasProjectId || 'default'}`;
    const existingNodes = localStorage.getItem(projectKey);
    const canvasNodes = existingNodes ? JSON.parse(existingNodes) : [];
    canvasNodes.push({
      ...newNode.data,
      id: nodeId,
      position: newNode.position
    });
    localStorage.setItem(projectKey, JSON.stringify(canvasNodes));
    
    // Set up a retry mechanism to ensure the prompt gets created
    let retryCount = 0;
    const maxRetries = 5;
    const checkPromptCreated = () => {
      const realPromptId = localStorage.getItem(`tempPromptToRealPrompt_${tempPromptId}`);
      if (realPromptId) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, promptId: realPromptId } }
              : node
          )
        );
        localStorage.removeItem(`tempPromptToRealPrompt_${tempPromptId}`);
        console.log(`Template node ${nodeId} successfully linked to prompt ${realPromptId}`);
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying prompt creation for template node ${nodeId}, attempt ${retryCount}`);
        localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
        setTimeout(checkPromptCreated, 1000);
      } else {
        console.warn(`Failed to create prompt for template node ${nodeId} after ${maxRetries} attempts`);
        const fallbackPromptId = `fallback_prompt_${Date.now()}`;
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, promptId: fallbackPromptId } }
              : node
          )
        );
      }
    };
    
    setTimeout(checkPromptCreated, 500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prompt': return <MessageSquare className="w-4 h-4" />;
      case 'chain': return <Workflow className="w-4 h-4" />;
      case 'agent': return <Bot className="w-4 h-4" />;
      case 'memory': return <Database className="w-4 h-4" />;
      case 'retrieval': return <BookOpen className="w-4 h-4" />;
      default: return <FileCode className="w-4 h-4" />;
    }
  };

  const exportTemplate = (template: LangChainTemplate, type: 'python' | 'javascript') => {
    const code = type === 'python' 
      ? `from langchain.prompts import PromptTemplate

prompt = PromptTemplate.from_template("""${template.template.replace(/"/g, '\\"')}""")

variables = {
${template.variables.map(v => `    "${v}": "value"`).join(',\n')}
}

formatted_prompt = prompt.format(**variables)
print(formatted_prompt)`
      : `const template = \`${template.template.replace(/`/g, '\\`')}\`;

const variables = {
${template.variables.map(v => `  ${v}: "value"`).join(',\n')}
};

function formatTemplate(template, variables) {
  return template.replace(/\\{([^}]+)\\}/g, (match, key) => {
    return variables[key] || match;
  });
}

const formattedPrompt = formatTemplate(template, variables);
console.log(formattedPrompt);`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      console.log('Creating new connection:', params);
      
      const newEdge: ConditionalEdge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        condition: getDefaultCondition(),
        label: '',
        style: { stroke: '#6b7280', strokeWidth: 2 },
        labelStyle: { fontSize: 12, fontWeight: 600, fill: '#6b7280' },
        type: 'default',
        data: {}
      };
      
      console.log('New edge created:', newEdge);
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        console.log('Updated edges after adding new edge:', updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge as ConditionalEdge);
    setShowConditionEditor(true);
  }, []);

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    if (!newConnection.source || !newConnection.target) return;
    
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === oldEdge.id
          ? { ...edge, ...newConnection, source: newConnection.source!, target: newConnection.target! }
          : edge
      )
    );
  }, [setEdges]);

  const updateEdgeCondition = useCallback((edgeId: string, condition: ConnectionCondition) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          const updatedEdge = { ...edge, condition } as ConditionalEdge;
          
          // Update edge styling based on condition
          if (condition.enabled) {
            updatedEdge.label = `${condition.type.replace('_', ' ')} ${condition.operator} ${condition.value}`;
            updatedEdge.style = { 
              stroke: '#3b82f6', 
              strokeWidth: 3,
              strokeDasharray: '5,5'
            };
            updatedEdge.labelStyle = { 
              fontSize: 10, 
            fontWeight: 600,
              fill: '#3b82f6',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '4px'
            };
      } else {
            updatedEdge.label = '';
            updatedEdge.style = { stroke: '#6b7280', strokeWidth: 2 };
            updatedEdge.labelStyle = { fontSize: 12, fontWeight: 600, fill: '#6b7280' };
          }
          
          return updatedEdge;
        }
        return edge;
      })
    );
    setShowConditionEditor(false);
    setSelectedEdge(null);
  }, [setEdges]);

  const evaluateEdgeCondition = useCallback((condition: ConnectionCondition, nodeData: any): boolean => {
    if (!condition.enabled) return true;
    
    try {
      const { output, score, tokenUsage, variables } = nodeData;
      
      switch (condition.type) {
        case 'output_contains':
          if (condition.operator === 'contains') {
            return output.toLowerCase().includes(condition.value.toLowerCase());
          } else if (condition.operator === 'equals') {
            return output.toLowerCase() === condition.value.toLowerCase();
          } else if (condition.operator === 'not_equals') {
            return output.toLowerCase() !== condition.value.toLowerCase();
          }
          break;
          
        case 'variable_equals':
          const varValue = variables[condition.variable || ''];
          if (condition.operator === 'equals') {
            return varValue === condition.value;
          } else if (condition.operator === 'not_equals') {
            return varValue !== condition.value;
          } else if (condition.operator === 'greater_than') {
            return parseFloat(varValue) > parseFloat(condition.value);
          } else if (condition.operator === 'less_than') {
            return parseFloat(varValue) < parseFloat(condition.value);
          }
          break;
          
        case 'token_count':
          const tokenCount = tokenUsage?.total || 0;
          if (condition.operator === 'greater_than') {
            return tokenCount > parseInt(condition.value);
          } else if (condition.operator === 'less_than') {
            return tokenCount < parseInt(condition.value);
          } else if (condition.operator === 'greater_equal') {
            return tokenCount >= parseInt(condition.value);
          } else if (condition.operator === 'less_equal') {
            return tokenCount <= parseInt(condition.value);
          } else if (condition.operator === 'equals') {
            return tokenCount === parseInt(condition.value);
          }
          break;
          
        case 'score_threshold':
          const scoreValue = score?.[condition.field || 'overall'] || 0;
          if (condition.operator === 'greater_than') {
            return scoreValue > parseFloat(condition.value);
          } else if (condition.operator === 'less_than') {
            return scoreValue < parseFloat(condition.value);
          } else if (condition.operator === 'greater_equal') {
            return scoreValue >= parseFloat(condition.value);
          } else if (condition.operator === 'less_equal') {
            return scoreValue <= parseFloat(condition.value);
          } else if (condition.operator === 'equals') {
            return scoreValue === parseFloat(condition.value);
          }
          break;
      }
    } catch (error) {
      console.error('Error evaluating condition:', error);
    }
    
    return false;
  }, []);

  // Center and fit view on nodes when nodes are loaded (on mount)
  React.useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        try {
          reactFlowInstance.fitView();
        } catch {}
      }, 0);
    }
  }, [canvasProjectId]);

  // Ensure edges are properly rendered after ReactFlow is initialized
  React.useEffect(() => {
    if (isLoaded && edges.length > 0) {
      console.log('Ensuring edges are properly rendered, count:', edges.length);
      
      // Force a complete re-render of edges
      const timer = setTimeout(() => {
        setEdges(currentEdges => {
          console.log('Current edges before re-render:', currentEdges);
          
          // Create fresh edge objects to ensure proper rendering
          const freshEdges = currentEdges.map(edge => {
            const conditionalEdge = edge as ConditionalEdge;
            const freshEdge: ConditionalEdge = {
              id: conditionalEdge.id,
              source: conditionalEdge.source,
              target: conditionalEdge.target,
              sourceHandle: conditionalEdge.sourceHandle,
              targetHandle: conditionalEdge.targetHandle,
              condition: conditionalEdge.condition,
              type: conditionalEdge.type || 'default',
              data: conditionalEdge.data || {}
            };
            
            // Apply styling
            if (conditionalEdge.condition && conditionalEdge.condition.enabled) {
              freshEdge.label = `${conditionalEdge.condition.type.replace('_', ' ')} ${conditionalEdge.condition.operator} ${conditionalEdge.condition.value}`;
              freshEdge.style = { 
                stroke: '#3b82f6', 
                strokeWidth: 3,
                strokeDasharray: '5,5'
              };
              freshEdge.labelStyle = { 
                fontSize: 10, 
                fontWeight: 600,
                fill: '#3b82f6',
                backgroundColor: 'white',
                padding: '2px 4px',
                borderRadius: '4px'
              };
              // Add CSS class for conditional styling
              freshEdge.className = 'conditional';
            } else {
              freshEdge.label = conditionalEdge.label || '';
              freshEdge.style = conditionalEdge.style || { stroke: '#6b7280', strokeWidth: 2 };
              freshEdge.labelStyle = conditionalEdge.labelStyle || { fontSize: 12, fontWeight: 600, fill: '#6b7280' };
            }
            
            return freshEdge;
          });
          
          console.log('Fresh edges after re-render:', freshEdges);
          return freshEdges;
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, edges.length]);

  const addPromptNode = useCallback(() => {
    const nodeId = `node_${Date.now()}`;
    
    // Use "Main Prompt" as the default title
    const nodeTitle = `Main Prompt`;
    const tempPromptId = `temp_prompt_${Date.now()}`;
    
    const newNode: Node = {
      id: nodeId,
      type: 'promptNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        promptId: tempPromptId, // Temporary ID that will be updated when prompt is created
        title: nodeTitle,
        prompt: '',
        model: 'gpt-4',
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
        onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, ...updates } }
                : node
            )
          );
        },
        onRun: (id: string) => runSingleNode(id),
        onDelete: (id: string) => deleteNode(id),
      }
    };
    
    setNodes((nds) => {
      const updated = [...nds, newNode];
      // Center and fit after node is added
      setTimeout(() => {
        try {
          reactFlowInstance.fitView();
        } catch {}
      }, 0);
      return updated;
    });
    
    // Automatically create a prompt in the editor for this node
    const editorData = {
      action: 'createPromptFromCanvas',
      data: {
        nodeId,
        promptId: tempPromptId,
        title: nodeTitle,
        prompt: '',
        model: 'gpt-4',
        temperature: 0.7,
        variables: {},
        position: newNode.position
      },
      updated: true
    };
    localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
    
    // Also store the node data in a project-specific storage for better persistence
    const projectKey = `canvasNodes_${canvasProjectId || 'default'}`;
    const existingNodes = localStorage.getItem(projectKey);
    const canvasNodes = existingNodes ? JSON.parse(existingNodes) : [];
    canvasNodes.push({
      ...newNode.data,
      id: nodeId,
      position: newNode.position
    });
    localStorage.setItem(projectKey, JSON.stringify(canvasNodes));
    
    // Set up a retry mechanism to ensure the prompt gets created
    let retryCount = 0;
    const maxRetries = 5;
    const checkPromptCreated = () => {
      // Check if the prompt was created by looking for the real prompt ID
      const realPromptId = localStorage.getItem(`tempPromptToRealPrompt_${tempPromptId}`);
      if (realPromptId) {
        // Update the node with the real prompt ID
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, promptId: realPromptId } }
              : node
          )
        );
        // Clean up the temporary mapping
        localStorage.removeItem(`tempPromptToRealPrompt_${tempPromptId}`);
        console.log(`Node ${nodeId} successfully linked to prompt ${realPromptId}`);
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying prompt creation for node ${nodeId}, attempt ${retryCount}`);
        // Re-send the creation request
        localStorage.setItem('canvasToEditorData', JSON.stringify(editorData));
        setTimeout(checkPromptCreated, 1000);
      } else {
        console.warn(`Failed to create prompt for node ${nodeId} after ${maxRetries} attempts`);
        // Create a fallback prompt ID to prevent issues
        const fallbackPromptId = `fallback_prompt_${Date.now()}`;
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, promptId: fallbackPromptId } }
              : node
          )
        );
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkPromptCreated, 500);
  }, [setNodes, runSingleNode, deleteNode, reactFlowInstance, canvasProjectId]);

  const getNextNodes = (nodeId: string): string[] => {
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    const nextNodes: string[] = [];
    
    outgoingEdges.forEach(edge => {
      const conditionalEdge = edge as ConditionalEdge;
      const sourceNode = nodes.find(n => n.id === nodeId);
      
      // If no condition or condition is disabled, always follow the edge
      if (!conditionalEdge.condition || !conditionalEdge.condition.enabled) {
        nextNodes.push(edge.target);
        return;
      }
      
      // Evaluate condition if enabled
      if (sourceNode && evaluateEdgeCondition(conditionalEdge.condition, sourceNode.data)) {
        nextNodes.push(edge.target);
      }
    });
    
    return nextNodes;
  };

  const runFullChain = async () => {
    if (nodes.length === 0) {
      alert('No nodes to run. Add some prompt nodes first.');
      return;
    }

    console.log('Starting full chain execution');
    setIsRunningChain(true);
    setExecutionHistory([]);
    
    const startNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (startNodes.length === 0) {
      alert('No start nodes found. Add a node with no incoming connections.');
      setIsRunningChain(false);
      return;
    }

    console.log(`Found ${startNodes.length} start nodes:`, startNodes.map(n => n.data.title));

    const visited = new Set<string>();
    const queue = [...startNodes.map(n => n.id)];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);
      
      console.log(`Executing node: ${currentNodeId}`);
      
      // Run the current node
      await runSingleNode(currentNodeId);
      
      // Wait a bit between nodes to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add execution to history
      const node = nodes.find(n => n.id === currentNodeId);
      if (node) {
        setExecutionHistory(prev => [...prev, {
          nodeId: currentNodeId,
          nodeName: node.data.title || node.data.prompt.substring(0, 50) + '...',
          output: node.data.output || '',
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Get next nodes based on conditions
      const nextNodes = getNextNodes(currentNodeId);
      console.log(`Next nodes for ${currentNodeId}:`, nextNodes);
      
      // Add unvisited next nodes to queue
      nextNodes.forEach(nextNodeId => {
        if (!visited.has(nextNodeId)) {
          queue.push(nextNodeId);
        }
      });
    }

    console.log('Chain execution completed');
    setIsRunningChain(false);
  };

  const saveChain = () => {
    const chainData = {
      name: chainName,
      systemMessage,
      nodes: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: {
          prompt: node.data.prompt,
          model: node.data.model,
          temperature: node.data.temperature,
          maxTokens: node.data.maxTokens,
          variables: node.data.variables
        }
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        condition: (edge as ConditionalEdge).condition
      }))
    };
    
    const blob = new Blob([JSON.stringify(chainData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chainName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadChain = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chainData = JSON.parse(e.target?.result as string);
        setChainName(chainData.name || 'Untitled Chain');
        setSystemMessage(chainData.systemMessage || '');
        
        const loadedNodes = chainData.nodes.map((nodeData: any) => ({
          id: nodeData.id,
          type: 'promptNode',
          position: nodeData.position,
          data: {
            ...nodeData.data,
            onUpdate: (id: string, updates: Partial<PromptNodeType>) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === id
                    ? { ...node, data: { ...node.data, ...updates } }
                    : node
                )
              );
            },
            onRun: (id: string) => runSingleNode(id),
            onDelete: (id: string) => deleteNode(id),
          }
        }));
        
        setNodes(loadedNodes);
        setEdges(chainData.edges || []);
      } catch (error) {
        alert('Error loading chain file');
      }
    };
    reader.readAsText(file);
  };

  // Helper function to get the appropriate LangChain chat model class
  const getLangChainChatModel = (modelName: string): { import: string; class: string; config: string } => {
    // OpenAI models (gpt-*) - now routed through OpenRouter
    if (modelName.startsWith('gpt-')) {
      return {
        import: 'from langchain_openrouter import ChatOpenRouter',
        class: 'ChatOpenRouter',
        config: `model="openai/${modelName}"`
      };
    }
    
    // Groq models
    if (['gemma2-9b-it', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 
         'llama-4-maverick-17b-128e-instruct', 'llama-4-scout-17b-16e-instruct', 'mistral-saba-24b', 
         'qwen-qwq-32b', 'qwen3-32b'].includes(modelName)) {
      return {
        import: 'from langchain_groq import ChatGroq',
        class: 'ChatGroq',
        config: `model_name="${modelName}"`
      };
    }
    
    // OpenRouter models (models with / in the name)
    if (modelName.includes('/')) {
      return {
        import: 'from langchain_openrouter import ChatOpenRouter',
        class: 'ChatOpenRouter',
        config: `model="${modelName}"`
      };
    }
    
    // Default to OpenRouter for unknown models
    return {
      import: 'from langchain_openrouter import ChatOpenRouter',
      class: 'ChatOpenRouter',
      config: `model="openai/gpt-4o"`
    };
  };

  const exportToLangChainPython = () => {
    if (nodes.length === 0) {
      alert('No nodes to export');
      return;
    }

    // Collect unique imports
    const imports = new Set<string>();
    imports.add('from langchain.prompts import PromptTemplate');
    imports.add('from langchain.chains import LLMChain');
    imports.add('from langchain.schema import BaseOutputParser');
    imports.add('from typing import Dict, Any, List');
    imports.add('import json');

    // Add imports for each node's chat model
    nodes.forEach((node) => {
      const chatModel = getLangChainChatModel(node.data.model);
      imports.add(chatModel.import);
    });

    let pythonCode = `${Array.from(imports).join('\n')}

# Chain: ${chainName}
`;

    // Add prompt templates
    nodes.forEach((node, index) => {
      const variables = extractVariables(node.data.prompt);
      const varList = variables.length > 0 ? `[${variables.map(v => `"${v}"`).join(', ')}]` : '[]';
      const chatModel = getLangChainChatModel(node.data.model);
      
      pythonCode += `
# Node ${index + 1}: ${node.data.prompt.substring(0, 50)}...
prompt_template_${index + 1} = PromptTemplate(
    input_variables=${varList},
    template="""${node.data.prompt.replace(/"/g, '\\"')}"""
)

llm_${index + 1} = ${chatModel.class}(
    ${chatModel.config},
    temperature=${node.data.temperature},
    max_tokens=${node.data.maxTokens}
)

chain_${index + 1} = LLMChain(
    llm=llm_${index + 1},
    prompt=prompt_template_${index + 1}
)
`;
    });

    // Add chain execution logic
    pythonCode += `
def run_chain(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the prompt chain with given inputs
    """
    results = {}
    
    # Execute nodes in order (simplified - no conditional logic)
    ${nodes.map((node, index) => `
    # Execute node ${index + 1}
    result_${index + 1} = chain_${index + 1}.run(inputs)
    results["node_${index + 1}"] = result_${index + 1}
    inputs["output_${index + 1}"] = result_${index + 1}`).join('')}
    
    return results

# Example usage:
# inputs = {"variable1": "value1", "variable2": "value2"}
# results = run_chain(inputs)
# print(results)
`;

    const blob = new Blob([pythonCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chainName.replace(/\s+/g, '_')}_langchain.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to get the appropriate LangChain chat model class for JavaScript
  const getLangChainChatModelJS = (modelName: string): { import: string; class: string; config: string } => {
    // OpenAI models (gpt-*) - now routed through OpenRouter
    if (modelName.startsWith('gpt-')) {
      return {
        import: 'import { ChatOpenRouter } from "@langchain/openrouter"',
        class: 'ChatOpenRouter',
        config: `model: "openai/${modelName}"`
      };
    }
    
    // Groq models
    if (['gemma2-9b-it', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 
         'llama-4-maverick-17b-128e-instruct', 'llama-4-scout-17b-16e-instruct', 'mistral-saba-24b', 
         'qwen-qwq-32b', 'qwen3-32b'].includes(modelName)) {
      return {
        import: 'import { ChatGroq } from "@langchain/groq"',
        class: 'ChatGroq',
        config: `modelName: "${modelName}"`
      };
    }
    
    // OpenRouter models (models with / in the name)
    if (modelName.includes('/')) {
      return {
        import: 'import { ChatOpenRouter } from "@langchain/openrouter"',
        class: 'ChatOpenRouter',
        config: `model: "${modelName}"`
      };
    }
    
    // Default to OpenRouter for unknown models
    return {
      import: 'import { ChatOpenRouter } from "@langchain/openrouter"',
      class: 'ChatOpenRouter',
      config: `model: "openai/gpt-4o"`
    };
  };

  const exportToLangChainJS = () => {
    if (nodes.length === 0) {
      alert('No nodes to export');
      return;
    }

    // Collect unique imports
    const imports = new Set<string>();
    imports.add('import { PromptTemplate } from "langchain/prompts"');
    imports.add('import { LLMChain } from "langchain/chains"');

    // Add imports for each node's chat model
    nodes.forEach((node) => {
      const chatModel = getLangChainChatModelJS(node.data.model);
      imports.add(chatModel.import);
    });

    let jsCode = `${Array.from(imports).join('\n')}

// Chain: ${chainName}
`;

    // Add prompt templates
    nodes.forEach((node, index) => {
      const variables = extractVariables(node.data.prompt);
      const varList = variables.length > 0 ? `[${variables.map(v => `"${v}"`).join(', ')}]` : '[]';
      const chatModel = getLangChainChatModelJS(node.data.model);
      
      jsCode += `
// Node ${index + 1}: ${node.data.prompt.substring(0, 50)}...
const promptTemplate${index + 1} = PromptTemplate.fromTemplate(\`${node.data.prompt.replace(/`/g, '\\`')}\`);

const llm${index + 1} = new ${chatModel.class}({
  ${chatModel.config},
  temperature: ${node.data.temperature},
  maxTokens: ${node.data.maxTokens}
});

const chain${index + 1} = new LLMChain({
  llm: llm${index + 1},
  prompt: promptTemplate${index + 1}
});
`;
    });

    // Add chain execution logic
    jsCode += `
async function runChain(inputs) {
  /**
   * Run the prompt chain with given inputs
   */
  const results = {};
  
  // Execute nodes in order (simplified - no conditional logic)
  ${nodes.map((node, index) => `
  // Execute node ${index + 1}
  const result${index + 1} = await chain${index + 1}.call(inputs);
  results["node_${index + 1}"] = result${index + 1}.text;
  inputs["output_${index + 1}"] = result${index + 1}.text;`).join('')}
  
  return results;
}

// Example usage:
// const inputs = { variable1: "value1", variable2: "value2" };
// const results = await runChain(inputs);
// console.log(results);

export { runChain };
`;

    const blob = new Blob([jsCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chainName.replace(/\s+/g, '_')}_langchain.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const proOptions = { hideAttribution: true };

  console.log('RENDER: nodes passed to ReactFlow:', nodes);

  // Map nodes to PromptNode[]
  const promptNodes = nodes.map(n => ({ ...n.data, id: n.id, position: n.position }));

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-black">🦜 LangForge</span>
            <input
              type="text"
              value={chainName}
              onChange={(e) => setChainName(e.target.value)}
              className="text-lg font-semibold text-black bg-transparent border-none outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSystemMessage(!showSystemMessage)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showSystemMessage 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>System</span>
          </button>

          <button
            onClick={() => setShowVisualization(!showVisualization)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showVisualization 
                ? 'bg-black text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Viz</span>
          </button>

          {/* Export Menu Container */}
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showExportMenu 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                <div className="p-2">
                  <button
                    onClick={() => {
                      exportToLangChainPython();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors"
                  >
                    <img
                      src={langchainLogo}
                      alt="LangChain Logo"
                      style={{ height: '18px', width: 'auto' }}
                    />
                    <span>Export to LangChain Python</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToLangChainJS();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors"
                  >
                    <img
                      src={langchainLogo}
                      alt="LangChain Logo"
                      style={{ height: '18px', width: 'auto' }}
                    />
                    <span>Export to LangChain JS</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept=".json"
            onChange={loadChain}
            className="hidden"
            id="load-chain"
          />
          <label
            htmlFor="load-chain"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Load</span>
          </label>
          
          <button
            onClick={saveChain}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          <button
            onClick={addPromptNode}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Node</span>
          </button>

          <button
            onClick={runFullChain}
            disabled={isRunningChain || nodes.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className={`w-4 h-4 ${isRunningChain ? 'animate-pulse' : ''}`} />
            <span>{isRunningChain ? 'Running...' : 'Run Chain'}</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex">
        <div className={`transition-all duration-300 ${showVisualization ? 'w-2/3' : 'w-full'}`}>
          <ReactFlow
            key={`canvas-${canvasProjectId}-${edges.length}-${isLoaded}-${canvasKey}-${forceRender}`}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onEdgeUpdate={onEdgeUpdate}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            proOptions={proOptions}
            className="bg-gray-50"
            fitView
            fitViewOptions={{ padding: 0.1 }}
            style={{ zIndex: 1 }}
            defaultEdgeOptions={{
              style: { stroke: '#6b7280', strokeWidth: 2 },
              labelStyle: { fontSize: 12, fontWeight: 600, fill: '#6b7280' }
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="#e5e7eb"
            />
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
            
            {/* Welcome Panel - Centered */}
            {nodes.length === 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  pointerEvents: 'auto'
                }}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
                  <div className="text-4xl mb-4">🦜</div>
                  <h2 className="text-2xl font-bold text-black mb-2">Welcome to 🦜 LangForge Canvas</h2>
                  <p className="text-gray-600 mb-6">
                    Create visual LangChain workflows with conditional logic. Build complex multi-step reasoning chains with branching paths.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={addPromptNode}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Your First Node</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Condition Editor Panel */}
            {showConditionEditor && selectedEdge && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <ConditionEditor
                  condition={selectedEdge.condition || getDefaultCondition()}
                  onSave={(condition) => updateEdgeCondition(selectedEdge.id, condition)}
                  onCancel={() => {
                    setShowConditionEditor(false);
                    setSelectedEdge(null);
                  }}
                  variables={(() => {
                    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
                    return sourceNode?.data.variables || {};
                  })()}
                />
              </Panel>
            )}

            {/* System Message Panel */}
            {showSystemMessage && (
              <Panel position="top-left" className="ml-4 mt-4 z-50">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">System Message</h3>
                    <button
                      onClick={() => setShowSystemMessage(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    placeholder="Enter a system message that will be applied to all nodes in this chain..."
                    className="w-full h-32 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    This system message will be applied to all prompt nodes in the chain.
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Live Visualization Panel */}
        {showVisualization && (
          <div className="w-1/3 border-l border-gray-200 bg-white">
            <LiveChainVisualization 
              nodes={nodes}
              edges={edges}
              executionHistory={executionHistory}
              isRunning={isRunningChain}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PromptChainCanvas = ({ projectId, projectName }: PromptChainCanvasProps) => (
  <>
    <style>{customStyles}</style>
    <ReactFlowProvider>
      <PromptChainCanvasInner projectId={projectId} projectName={projectName} />
    </ReactFlowProvider>
  </>
);

export default PromptChainCanvas;