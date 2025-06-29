import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  MiniMap,
  NodeProps,
  Handle,
  Position,
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
  Activity
} from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import LiveChainVisualization from './LiveChainVisualization';
import { PromptNode as PromptNodeType, PromptScore } from '../types';
import apiService from '../services/apiService';

const nodeTypes = {
  promptNode: PromptNodeComponent,
};

const PromptChainCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [chainName, setChainName] = useState('Untitled Chain');
  const [showVisualization, setShowVisualization] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Handle conditional connections
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode?.data.condition && params.sourceHandle) {
        const edge = {
          ...params,
          label: params.sourceHandle === 'true' ? 'True' : params.sourceHandle === 'false' ? 'False' : '',
          style: { 
            stroke: params.sourceHandle === 'true' ? '#10b981' : params.sourceHandle === 'false' ? '#ef4444' : '#6b7280',
            strokeWidth: 2
          },
          labelStyle: { 
            fontSize: 12, 
            fontWeight: 600,
            fill: params.sourceHandle === 'true' ? '#10b981' : params.sourceHandle === 'false' ? '#ef4444' : '#6b7280'
          }
        };
        setEdges((eds) => addEdge(edge, eds));
      } else {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, nodes]
  );

  const addPromptNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'promptNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        title: `Prompt ${nodes.length + 1}`,
        prompt: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        output: '',
        isRunning: false,
        variables: {},
        condition: '',
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
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const evaluateCondition = (condition: string, nodeData: any): boolean => {
    if (!condition) return true;
    
    try {
      // Simple condition evaluation
      // In a real app, you'd want a more robust expression parser
      const score = nodeData.score?.overall || 0;
      const sentiment = 'positive'; // Mock sentiment
      
      // Replace variables in condition
      let evaluatedCondition = condition
        .replace(/\{\{score\}\}/g, score.toString())
        .replace(/\{\{sentiment\}\}/g, `"${sentiment}"`);
      
      // Simple evaluation for common patterns
      if (evaluatedCondition.includes('>')) {
        const [left, right] = evaluatedCondition.split('>').map(s => s.trim());
        return parseFloat(left) > parseFloat(right);
      }
      if (evaluatedCondition.includes('<')) {
        const [left, right] = evaluatedCondition.split('<').map(s => s.trim());
        return parseFloat(left) < parseFloat(right);
      }
      if (evaluatedCondition.includes('==')) {
        const [left, right] = evaluatedCondition.split('==').map(s => s.trim().replace(/"/g, ''));
        return left === right;
      }
      if (evaluatedCondition.includes('!=')) {
        const [left, right] = evaluatedCondition.split('!=').map(s => s.trim().replace(/"/g, ''));
        return left !== right;
      }
      
      return true;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return true;
    }
  };

  const replaceVariables = (prompt: string, nodeId: string): string => {
    let processedPrompt = prompt;
    
    // Replace node output variables like {{nodeA.output}}
    const nodeOutputRegex = /\{\{(\w+)\.output\}\}/g;
    const nodeOutputMatches = [...prompt.matchAll(nodeOutputRegex)];
    
    nodeOutputMatches.forEach(match => {
      const referencedNodeId = match[1];
      const referencedNode = nodes.find(n => n.id === referencedNodeId || n.data.title.toLowerCase().replace(/\s+/g, '') === referencedNodeId.toLowerCase());
      
      if (referencedNode && referencedNode.data.output) {
        processedPrompt = processedPrompt.replace(match[0], referencedNode.data.output);
      }
    });

    // Replace regular variables
    const currentNode = nodes.find(n => n.id === nodeId);
    if (currentNode?.data.variables) {
      Object.entries(currentNode.data.variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedPrompt = processedPrompt.replace(regex, String(value));
      });
    }

    return processedPrompt;
  };

  const runSingleNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data.prompt.trim()) return;

    const startTime = Date.now();

    // Set node as running
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isRunning: true, output: '', error: undefined } }
          : n
      )
    );

    try {
      const processedPrompt = replaceVariables(node.data.prompt, nodeId);
      let output: string;
      let tokenUsage = { input: 0, output: 0, total: 0 };

      // Use real API call for all models
      const result = await apiService.generateCompletion(
        node.data.model,
        processedPrompt,
        undefined, // system message
        node.data.temperature || 0.7
      );
      
      output = result.content;
      if (result.usage) {
        tokenUsage = {
          input: result.usage.prompt_tokens,
          output: result.usage.completion_tokens,
          total: result.usage.total_tokens
        };
      }

      // Use GPT-4 to evaluate the response
      const score = await apiService.evaluatePromptResponse(
        processedPrompt,
        output,
        0.3 // Low temperature for consistent evaluation
      );

      const executionTime = Date.now() - startTime;

      // Update node with results
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  isRunning: false, 
                  output,
                  score,
                  executionTime,
                  tokenUsage
                } 
              }
            : n
        )
      );

      // Add to execution history
      setExecutionHistory(prev => [...prev, {
        nodeId,
        title: node.data.title,
        executionTime,
        tokenUsage,
        score: score.overall,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error(`Error running node ${nodeId}:`, error);
      
      // Update node with error
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  isRunning: false, 
                  error: error instanceof Error ? error.message : 'Failed to execute prompt. Please try again.'
                } 
              }
            : n
        )
      );
    }
  };

  const getTopologicalOrder = (): string[] => {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string): boolean => {
      if (visiting.has(nodeId)) return false; // Cycle detected
      if (visited.has(nodeId)) return true;

      visiting.add(nodeId);
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visit(edge.target)) return false;
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      result.unshift(nodeId);
      return true;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (!visit(node.id)) {
          console.error('Cycle detected in the flow');
          return [];
        }
      }
    }

    return result;
  };

  const getNextNodes = (nodeId: string, conditionResult?: boolean): string[] => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return [];

    if (node.data.condition && conditionResult !== undefined) {
      // Find edges based on condition result
      return edges
        .filter(edge => 
          edge.source === nodeId && 
          edge.sourceHandle === (conditionResult ? 'true' : 'false')
        )
        .map(edge => edge.target);
    } else {
      // Find all outgoing edges
      return edges
        .filter(edge => edge.source === nodeId && (!edge.sourceHandle || edge.sourceHandle === 'default'))
        .map(edge => edge.target);
    }
  };

  const runFullChain = async () => {
    if (nodes.length === 0) return;

    setIsRunningChain(true);
    setExecutionHistory([]);
    
    // Clear all outputs first
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, output: '', score: undefined, error: undefined } }))
    );

    // Find starting nodes (nodes with no incoming edges)
    const startingNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );

    if (startingNodes.length === 0) {
      alert('No starting nodes found. Please ensure you have nodes without incoming connections.');
      setIsRunningChain(false);
      return;
    }

    // Execute chain with conditional logic
    const executedNodes = new Set<string>();
    const queue = [...startingNodes.map(n => n.id)];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (executedNodes.has(nodeId)) continue;

      await runSingleNode(nodeId);
      executedNodes.add(nodeId);

      // Small delay between nodes for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determine next nodes based on conditions
      const node = nodes.find(n => n.id === nodeId);
      if (node?.data.condition && node.data.score) {
        const conditionResult = evaluateCondition(node.data.condition, node.data);
        const nextNodes = getNextNodes(nodeId, conditionResult);
        queue.push(...nextNodes);
      } else {
        const nextNodes = getNextNodes(nodeId);
        queue.push(...nextNodes);
      }
    }

    setIsRunningChain(false);
  };

  const saveChain = () => {
    const chainData = {
      name: chainName,
      nodes: nodes.map(n => ({
        id: n.id,
        position: n.position,
        data: n.data
      })),
      edges: edges,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chainData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chainName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadChain = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chainData = JSON.parse(e.target?.result as string);
        setChainName(chainData.name || 'Loaded Chain');
        
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

  // Export functions
  const exportToLangChainPython = () => {
    const code = generateLangChainPythonCode();
    downloadFile(`${chainName.replace(/\s+/g, '_')}_langchain.py`, code);
  };

  const exportToLangChainJS = () => {
    const code = generateLangChainJSCode();
    downloadFile(`${chainName.replace(/\s+/g, '_')}_langchain.js`, code);
  };

  const exportToOpenAISDK = () => {
    const code = generateOpenAISDKCode();
    downloadFile(`${chainName.replace(/\s+/g, '_')}_openai.py`, code);
  };

  const exportToLangGraph = () => {
    // Implementation for exporting to LangGraph
    console.log('Export to LangGraph');
  };

  const exportToJSON = () => {
    const config = generateJSONConfig();
    downloadFile(`${chainName.replace(/\s+/g, '_')}_config.json`, JSON.stringify(config, null, 2));
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateLangChainPythonCode = () => {
    const sortedNodes = getTopologicalOrder().map(id => nodes.find(n => n.id === id)).filter(Boolean);
    
    return `"""
${chainName} - Generated LangChain Python Code
Auto-generated from PromptForge Canvas
"""

from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain
from langchain.schema import BaseOutputParser
import os

# Initialize models
${sortedNodes.map(node => {
  const modelMap = {
    'gpt-4': 'ChatOpenAI(model_name="gpt-4", temperature=',
    'gpt-3.5-turbo': 'ChatOpenAI(model_name="gpt-3.5-turbo", temperature=',
    'claude-3': 'ChatOpenAI(model_name="claude-3", temperature=',
    'gemini-pro': 'ChatOpenAI(model_name="gemini-pro", temperature=',
    'llama-2': 'ChatOpenAI(model_name="llama-2", temperature='
  };
  return `${node.id}_llm = ${modelMap[node.data.model] || 'ChatOpenAI(temperature='}${node.data.temperature || 0.7})`;
}).join('\n')}

# Define prompt templates
${sortedNodes.map(node => `${node.id}_prompt = PromptTemplate(
    input_variables=[${extractVariables(node.data.prompt).map(v => `"${v}"`).join(', ')}],
    template="${node.data.prompt.replace(/"/g, '\\"')}"
)`).join('\n\n')}

# Create chains
${sortedNodes.map(node => `${node.id}_chain = LLMChain(
    llm=${node.id}_llm,
    prompt=${node.id}_prompt,
    output_key="${node.id}_output"
)`).join('\n\n')}

# Execute chain
def run_chain(**kwargs):
    """Execute the complete prompt chain"""
    results = {}
    
${sortedNodes.map(node => `    # Execute ${node.data.title}
    ${node.id}_result = ${node.id}_chain.run(**kwargs, **results)
    results["${node.id}_output"] = ${node.id}_result
    print(f"${node.data.title}: {${node.id}_result}")
`).join('\n')}
    
    return results

# Example usage
if __name__ == "__main__":
    # Set your OpenAI API key
    os.environ["OPENAI_API_KEY"] = "your-api-key-here"
    
    # Run the chain with initial inputs
    results = run_chain(
        # Add your input variables here
        # example_var="example_value"
    )
    
    print("\\nFinal Results:", results)
`;
  };

  const generateLangChainJSCode = () => {
    const sortedNodes = getTopologicalOrder().map(id => nodes.find(n => n.id === id)).filter(Boolean);
    
    return `/**
 * ${chainName} - Generated LangChain JavaScript Code
 * Auto-generated from PromptForge Canvas
 */

import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, SequentialChain } from "langchain/chains";

// Initialize models
${sortedNodes.map(node => {
  const modelMap = {
    'gpt-4': 'new ChatOpenAI({ modelName: "gpt-4", temperature: ',
    'gpt-3.5-turbo': 'new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: ',
    'claude-3': 'new ChatOpenAI({ modelName: "claude-3", temperature: ',
    'gemini-pro': 'new ChatOpenAI({ modelName: "gemini-pro", temperature: ',
    'llama-2': 'new ChatOpenAI({ modelName: "llama-2", temperature: '
  };
  return `const ${node.id}Llm = ${modelMap[node.data.model] || 'new ChatOpenAI({ temperature: '}${node.data.temperature || 0.7} });`;
}).join('\n')}

// Define prompt templates
${sortedNodes.map(node => `const ${node.id}Prompt = new PromptTemplate({
  inputVariables: [${extractVariables(node.data.prompt).map(v => `"${v}"`).join(', ')}],
  template: \`${node.data.prompt}\`
});`).join('\n\n')}

// Create chains
${sortedNodes.map(node => `const ${node.id}Chain = new LLMChain({
  llm: ${node.id}Llm,
  prompt: ${node.id}Prompt,
  outputKey: "${node.id}Output"
});`).join('\n\n')}

// Execute chain
export async function runChain(inputs = {}) {
  const results = { ...inputs };
  
${sortedNodes.map(node => `  // Execute ${node.data.title}
  const ${node.id}Result = await ${node.id}Chain.call(results);
  results["${node.id}Output"] = ${node.id}Result.text;
  console.log("${node.data.title}:", ${node.id}Result.text);
`).join('\n')}
  
  return results;
}

// Example usage
async function main() {
  // Set your OpenAI API key in environment variables
  // process.env.OPENAI_API_KEY = "your-api-key-here";
  
  const results = await runChain({
    // Add your input variables here
    // exampleVar: "example value"
  });
  
  console.log("Final Results:", results);
}

// Uncomment to run
// main().catch(console.error);
`;
  };

  const generateOpenAISDKCode = () => {
    const sortedNodes = getTopologicalOrder().map(id => nodes.find(n => n.id === id)).filter(Boolean);
    
    return `"""
${chainName} - Generated OpenAI SDK Python Code
Auto-generated from PromptForge Canvas
"""

import openai
import os
from typing import Dict, Any

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class PromptChain:
    def __init__(self):
        self.results = {}
    
    def format_prompt(self, template: str, variables: Dict[str, Any]) -> str:
        """Format prompt template with variables"""
        formatted = template
        for key, value in variables.items():
            formatted = formatted.replace(f"{{{{{key}}}}}", str(value))
        return formatted
    
${sortedNodes.map(node => `    def ${node.id}_step(self, **kwargs) -> str:
        """${node.data.title}"""
        prompt = "${node.data.prompt.replace(/"/g, '\\"')}"
        formatted_prompt = self.format_prompt(prompt, {**kwargs, **self.results})
        
        response = openai.ChatCompletion.create(
            model="${node.data.model}",
            messages=[
                {"role": "user", "content": formatted_prompt}
            ],
            temperature=${node.data.temperature || 0.7}
        )
        
        result = response.choices[0].message.content
        self.results["${node.id}_output"] = result
        print(f"${node.data.title}: {result}")
        return result
`).join('\n')}
    
    def run_chain(self, **initial_inputs) -> Dict[str, Any]:
        """Execute the complete prompt chain"""
        self.results = {**initial_inputs}
        
${sortedNodes.map(node => `        # Execute ${node.data.title}
        self.${node.id}_step(**self.results)`).join('\n')}
        
        return self.results

# Example usage
if __name__ == "__main__":
    # Initialize the chain
    chain = PromptChain()
    
    # Run the chain with initial inputs
    results = chain.run_chain(
        # Add your input variables here
        # example_var="example_value"
    )
    
    print("\\nFinal Results:", results)
`;
  };

  const generateJSONConfig = () => {
    const sortedNodes = getTopologicalOrder().map(id => nodes.find(n => n.id === id)).filter(Boolean);
    
    return {
      name: chainName,
      description: `Prompt chain configuration for ${chainName}`,
      version: "1.0.0",
      nodes: sortedNodes.map(node => ({
        id: node.id,
        title: node.data.title,
        type: "prompt",
        config: {
          prompt: node.data.prompt,
          model: node.data.model,
          temperature: node.data.temperature || 0.7,
          variables: extractVariables(node.data.prompt),
          condition: node.data.condition || null
        },
        position: node.position
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || "default",
        targetHandle: edge.targetHandle || "default",
        label: edge.label || null
      })),
      metadata: {
        createdAt: new Date().toISOString(),
        totalNodes: nodes.length,
        totalEdges: edges.length,
        exportedFrom: "PromptForge Canvas"
      }
    };
  };

  const extractVariables = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const exportOptions = [
    {
      id: 'langchain-python',
      name: 'LangChain Python',
      description: 'Export as LangChain Python code',
      color: 'bg-green-600',
      icon: <span className="flex items-center"><img src="/src/components/logos/langgraph.png" alt="LangGraph" className="h-5 w-auto mr-1 object-contain" />🐍</span>,
      action: exportToLangChainPython
    },
    {
      id: 'langchain-js',
      name: 'LangChain JS',
      description: 'Export as LangChain JavaScript code',
      color: 'bg-yellow-600',
      icon: <span className="flex items-center"><img src="/src/components/logos/langgraph.png" alt="LangGraph" className="h-5 w-auto mr-1 object-contain" />🟨</span>,
      action: exportToLangChainJS
    },
    {
      id: 'openai-sdk',
      name: 'OpenAI SDK',
      description: 'Export as OpenAI Python SDK code',
      color: 'bg-black',
      icon: <img src="/src/components/logos/openai.png" alt="OpenAI" className="h-7 w-auto object-contain" />,
      action: exportToOpenAISDK
    },
    {
      id: 'json-config',
      name: 'JSON Config',
      description: 'Export as JSON configuration',
      color: 'bg-blue-600',
      icon: '📄',
      action: exportToJSON
    }
  ];

  const proOptions = { hideAttribution: true };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/app" 
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Editor</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
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

          {/* Export Dropdown */}
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide">
                    Export Formats
                  </div>
                  {exportOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        option.action();
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className={`w-8 h-8 ${option.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.name}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </button>
                  ))}
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
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              nodeColor="#000000"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            
            {/* Welcome Panel */}
            {nodes.length === 0 && (
              <Panel position="center">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-2">Welcome to Prompt Chaining</h2>
                  <p className="text-gray-600 mb-6">
                    Create visual prompt workflows with conditional logic. Build complex multi-step reasoning chains with branching paths.
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

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default PromptChainCanvas;