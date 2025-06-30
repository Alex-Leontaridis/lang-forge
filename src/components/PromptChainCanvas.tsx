import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Settings as SettingsIcon
} from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import LiveChainVisualization from './LiveChainVisualization';
import ConditionEditor from './ConditionEditor';
import { PromptNode as PromptNodeType, PromptScore, ConnectionCondition, ConditionalEdge } from '../types';
import apiService from '../services/apiService';

const nodeTypes = {
  promptNode: PromptNodeComponent,
};

const PromptChainCanvasInner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [chainName, setChainName] = useState('Untitled Chain');
  const [showVisualization, setShowVisualization] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<ConditionalEdge | null>(null);
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [showSystemMessage, setShowSystemMessage] = useState(false);

  const reactFlowInstance = useReactFlow();

  // Check for updated data from editor
  React.useEffect(() => {
    const editorData = localStorage.getItem('editorToCanvasData');
    if (editorData) {
      try {
        const data = JSON.parse(editorData);
        if (data.updated && data.nodeId) {
          // Update the corresponding node
          setNodes((nds) =>
            nds.map((node) =>
              node.id === data.nodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      prompt: data.prompt,
                      variables: data.variables,
                      model: data.model,
                      temperature: data.temperature,
                      title: data.title
                    }
                  }
                : node
            )
          );
          
          // Clear the localStorage data
          localStorage.removeItem('editorToCanvasData');
        }
      } catch (error) {
        console.error('Error loading editor data:', error);
        localStorage.removeItem('editorToCanvasData');
      }
    }
  }, [setNodes]);

  // Initialize default condition
  const getDefaultCondition = (): ConnectionCondition => ({
    enabled: false,
    type: 'output_contains',
    operator: 'contains',
    value: '',
    variable: '',
    field: 'overall'
  });

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      const newEdge: ConditionalEdge = {
          ...params,
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        condition: getDefaultCondition(),
        label: '',
        style: { stroke: '#6b7280', strokeWidth: 2 },
        labelStyle: { fontSize: 12, fontWeight: 600, fill: '#6b7280' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
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

  const addPromptNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'promptNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        title: `Node ${Date.now()}`,
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
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

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

  const extractVariables = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const exportToLangChainPython = () => {
    if (nodes.length === 0) {
      alert('No nodes to export');
      return;
    }

    let pythonCode = `from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.schema import BaseOutputParser
from typing import Dict, Any, List
import json

# Chain: ${chainName}
`;

    // Add prompt templates
    nodes.forEach((node, index) => {
      const variables = extractVariables(node.data.prompt);
      const varList = variables.length > 0 ? `[${variables.map(v => `"${v}"`).join(', ')}]` : '[]';
      
      pythonCode += `
# Node ${index + 1}: ${node.data.prompt.substring(0, 50)}...
prompt_template_${index + 1} = PromptTemplate(
    input_variables=${varList},
    template="""${node.data.prompt.replace(/"/g, '\\"')}"""
)

llm_${index + 1} = ChatOpenAI(
    model_name="${node.data.model}",
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

  const exportToLangChainJS = () => {
    if (nodes.length === 0) {
      alert('No nodes to export');
      return;
    }

    let jsCode = `import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";

// Chain: ${chainName}
`;

    // Add prompt templates
    nodes.forEach((node, index) => {
      const variables = extractVariables(node.data.prompt);
      const varList = variables.length > 0 ? `[${variables.map(v => `"${v}"`).join(', ')}]` : '[]';
      
      jsCode += `
// Node ${index + 1}: ${node.data.prompt.substring(0, 50)}...
const promptTemplate${index + 1} = PromptTemplate.fromTemplate(\`${node.data.prompt.replace(/`/g, '\\`')}\`);

const llm${index + 1} = new ChatOpenAI({
  modelName: "${node.data.model}",
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
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

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                    <Code className="w-4 h-4 text-blue-600" />
                    <span>Export to LangChain Python</span>
                    </button>
                  <button
                    onClick={() => {
                      exportToLangChainJS();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors"
                  >
                    <Code className="w-4 h-4 text-yellow-600" />
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
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onEdgeUpdate={onEdgeUpdate}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            proOptions={proOptions}
            className="bg-gray-50"
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
              <Panel position="top-center" style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                position: 'absolute'
              }}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
                  <div className="text-4xl mb-4">🦜</div>
                  <h2 className="text-2xl font-bold text-black mb-2">Welcome to LangForge Canvas</h2>
                  <p className="text-gray-600 mb-6">
                    Create visual LangChain workflows with conditional logic. Build complex multi-step reasoning chains with branching paths.
                  </p>
                  <button
                    onClick={addPromptNode}
                    className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Node</span>
                  </button>
                </div>
              </Panel>
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

const PromptChainCanvas = () => (
  <ReactFlowProvider>
    <PromptChainCanvasInner />
  </ReactFlowProvider>
);

export default PromptChainCanvas;