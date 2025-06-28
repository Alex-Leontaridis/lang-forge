import React, { useState, useCallback, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Plus, Play, Save, Zap, Download, Upload } from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import { PromptNode as PromptNodeType, PromptScore } from '../types';

const nodeTypes = {
  promptNode: PromptNodeComponent,
};

const PromptChainCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [chainName, setChainName] = useState('Untitled Chain');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
        output: '',
        isRunning: false,
        variables: {},
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

  const generateMockResponse = (prompt: string, model: string): string => {
    const responses = {
      'gpt-4': `**GPT-4 Analysis:**\n\n${prompt.substring(0, 50)}...\n\nThis is a comprehensive response that demonstrates advanced reasoning. The analysis includes detailed insights, creative perspectives, and maintains excellent coherence throughout.\n\n• Thorough contextual understanding\n• Creative and original insights\n• Well-structured communication\n• Actionable recommendations`,
      
      'gpt-3.5-turbo': `**GPT-3.5 Response:**\n\n${prompt.substring(0, 40)}...\n\nHere's a clear and efficient response that addresses your request directly. This provides practical, well-structured information with good balance of detail and brevity.\n\n- Direct answers to key points\n- Practical suggestions\n- Clear communication`,
      
      'claude-3': `**Claude 3 Analysis:**\n\n${prompt.substring(0, 45)}...\n\nI'll provide a thoughtful response with careful consideration of nuance and context. My analysis focuses on:\n\n→ Balanced perspectives\n→ Detailed reasoning\n→ Ethical considerations\n→ Solution-oriented approach`,
      
      'gemini-pro': `**Gemini Pro Response:**\n\n${prompt.substring(0, 42)}...\n\nLeveraging advanced AI capabilities for comprehensive understanding:\n\n🔍 Deep contextual analysis\n🧠 Advanced reasoning patterns\n🌐 Broad knowledge integration\n⚡ Efficient processing`,
      
      'llama-2': `**Llama 2 Response:**\n\n${prompt.substring(0, 38)}...\n\nAs an open-source model, providing transparent and accessible AI capabilities:\n\n• Open reasoning process\n• Community-driven benefits\n• Balanced perspective\n• Practical applications`
    };

    return responses[model as keyof typeof responses] || `Response from ${model.toUpperCase()}: This is a simulated response to your prompt.`;
  };

  const generateMockScore = (): PromptScore => {
    const relevance = Math.floor(Math.random() * 3) + 8;
    const clarity = Math.floor(Math.random() * 3) + 7;
    const creativity = Math.floor(Math.random() * 4) + 6;
    
    const critiques = [
      "Excellent prompt structure with clear intent. Consider adding more specific context.",
      "Well-crafted prompt that effectively guides the AI. The use of variables makes it highly reusable.",
      "Strong prompt with good clarity. Adding examples could further improve response quality.",
      "Thoughtful prompt design that balances specificity with flexibility.",
      "Clear and purposeful prompt. Consider refining the tone instructions for consistency."
    ];

    return {
      relevance,
      clarity,
      creativity,
      overall: Math.round(((relevance + clarity + creativity) / 3) * 10) / 10,
      critique: critiques[Math.floor(Math.random() * critiques.length)]
    };
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
        processedPrompt = processedPrompt.replace(regex, value);
      });
    }

    return processedPrompt;
  };

  const runSingleNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.data.prompt.trim()) return;

    // Set node as running
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isRunning: true, output: '' } }
          : n
      )
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const processedPrompt = replaceVariables(node.data.prompt, nodeId);
    const output = generateMockResponse(processedPrompt, node.data.model);
    const score = generateMockScore();

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
                score 
              } 
            }
          : n
      )
    );
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

  const runFullChain = async () => {
    if (nodes.length === 0) return;

    setIsRunningChain(true);
    const executionOrder = getTopologicalOrder();

    if (executionOrder.length === 0) {
      alert('Cannot execute chain: Cycle detected in the flow');
      setIsRunningChain(false);
      return;
    }

    // Clear all outputs first
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, output: '', score: undefined } }))
    );

    // Execute nodes in topological order
    for (const nodeId of executionOrder) {
      await runSingleNode(nodeId);
      // Small delay between nodes for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
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
      <div className="flex-1">
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
                  Create visual prompt workflows by connecting AI nodes. Build complex multi-step reasoning chains.
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
    </div>
  );
};

export default PromptChainCanvas;