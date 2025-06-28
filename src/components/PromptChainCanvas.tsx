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
import { ArrowLeft, Plus, Play, Save, Zap, Download, Upload, BarChart3, Activity, FileCode, ChevronDown, Target, Sparkles } from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import ConditionalBranchNode from './ConditionalBranchNode';
import LiveChainVisualization from './LiveChainVisualization';
import RealTimeTestingPanel from './RealTimeTestingPanel';
import LogicFlowCanvas from './LogicFlowCanvas';
import { PromptNode as PromptNodeType, PromptScore } from '../types';

const nodeTypes = {
  promptNode: PromptNodeComponent,
  conditionalBranch: ConditionalBranchNode,
};

const PromptChainCanvas = () => {
  const [useNewCanvas, setUseNewCanvas] = useState(false);

  // If using new canvas, render the modern Framer-style version
  if (useNewCanvas) {
    return <LogicFlowCanvas />;
  }

  // Original canvas implementation (keeping for backwards compatibility)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [chainName, setChainName] = useState('Untitled Chain');
  const [showVisualization, setShowVisualization] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTestingPanel, setShowTestingPanel] = useState(false);

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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowTestingPanel(true);
  }, []);

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

  const addConditionalNode = useCallback(() => {
    const newNode: Node = {
      id: `conditional_${Date.now()}`,
      type: 'conditionalBranch',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        title: `Condition ${nodes.filter(n => n.type === 'conditionalBranch').length + 1}`,
        condition: 'contains',
        value: '',
        onUpdate: (id: string, updates: any) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, ...updates } }
                : node
            )
          );
        },
        onDelete: (id: string) => deleteNode(id),
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const generateMockResponse = (prompt: string, model: string, temperature: number): string => {
    const tempVariation = temperature > 1.5 ? 'highly creative' : temperature > 1.0 ? 'creative' : temperature > 0.5 ? 'balanced' : 'focused';
    
    const responses = {
      'gpt-4': `**GPT-4 Response (${tempVariation}):**\n\n${prompt.substring(0, 50)}...\n\nThis is a comprehensive response that demonstrates advanced reasoning. The analysis includes detailed insights, creative perspectives, and maintains excellent coherence throughout.\n\n• Thorough contextual understanding\n• Creative and original insights\n• Well-structured communication\n• Actionable recommendations`,
      
      'gpt-3.5-turbo': `**GPT-3.5 Response (${tempVariation}):**\n\n${prompt.substring(0, 40)}...\n\nHere's a clear and efficient response that addresses your request directly. This provides practical, well-structured information with good balance of detail and brevity.\n\n- Direct answers to key points\n- Practical suggestions\n- Clear communication`,
      
      'claude-3': `**Claude 3 Analysis (${tempVariation}):**\n\n${prompt.substring(0, 45)}...\n\nI'll provide a thoughtful response with careful consideration of nuance and context. My analysis focuses on:\n\n→ Balanced perspectives\n→ Detailed reasoning\n→ Ethical considerations\n→ Solution-oriented approach`,
      
      'gemini-pro': `**Gemini Pro Response (${tempVariation}):**\n\n${prompt.substring(0, 42)}...\n\nLeveraging advanced AI capabilities for comprehensive understanding:\n\n🔍 Deep contextual analysis\n🧠 Advanced reasoning patterns\n🌐 Broad knowledge integration\n⚡ Efficient processing`,
      
      'llama-2': `**Llama 2 Response (${tempVariation}):**\n\n${prompt.substring(0, 38)}...\n\nAs an open-source model, providing transparent and accessible AI capabilities:\n\n• Open reasoning process\n• Community-driven benefits\n• Balanced perspective\n• Practical applications`
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
      // Simulate API delay based on model and temperature
      const baseDelay = {
        'gpt-4': 2000,
        'gpt-3.5-turbo': 800,
        'claude-3': 1500,
        'gemini-pro': 1200,
        'llama-2': 1000
      }[node.data.model] || 1000;
      
      const temperatureDelay = (node.data.temperature || 0.7) * 500;
      const totalDelay = baseDelay + temperatureDelay + Math.random() * 1000;
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));

      const output = generateMockResponse(node.data.prompt, node.data.model, node.data.temperature || 0.7);
      const score = generateMockScore();
      const executionTime = Date.now() - startTime;

      // Simulate realistic token usage
      const inputTokens = Math.floor(node.data.prompt.length / 4) + Math.floor(Math.random() * 50);
      const outputTokens = Math.floor(output.length / 4) + Math.floor(Math.random() * 100);

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
                  tokenUsage: {
                    input: inputTokens,
                    output: outputTokens,
                    total: inputTokens + outputTokens
                  }
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
        tokenUsage: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        score: score.overall,
        timestamp: new Date()
      }]);

    } catch (error) {
      // Update node with error
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  isRunning: false, 
                  error: 'Failed to execute prompt. Please try again.'
                } 
              }
            : n
        )
      );
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

    // Execute chain sequentially
    for (const node of startingNodes) {
      await runSingleNode(node.id);
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
          {/* Canvas Mode Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUseNewCanvas(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !useNewCanvas
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setUseNewCanvas(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                useNewCanvas
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Modern
            </button>
          </div>

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
        <div className={`transition-all duration-300 ${showVisualization ? 'w-2/3' : 'w-full'} ${showTestingPanel ? 'mr-96' : ''}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
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
                  <div className="space-y-3">
                    <button
                      onClick={addPromptNode}
                      className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Prompt Node</span>
                    </button>
                    <button
                      onClick={addConditionalNode}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                    >
                      <Target className="w-5 h-5" />
                      <span>Add Conditional Node</span>
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 Try the new <button onClick={() => setUseNewCanvas(true)} className="font-semibold underline">Modern Canvas</button> for an enhanced Framer-style experience!
                    </p>
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

        {/* Testing Panel */}
        {showTestingPanel && (
          <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] z-40">
            <RealTimeTestingPanel
              selectedNode={selectedNode}
              onRunNode={runSingleNode}
              onRunChain={runFullChain}
              isRunning={isRunningChain}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptChainCanvas;