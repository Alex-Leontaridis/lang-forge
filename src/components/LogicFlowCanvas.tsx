import React, { useState, useCallback } from 'react';
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
import { 
  Plus, 
  GitBranch, 
  Zap, 
  Target,
  Sparkles,
  ChevronDown,
  Settings
} from 'lucide-react';
import PromptNodeComponent from './PromptNodeComponent';
import ConditionalBranchNode from './ConditionalBranchNode';
import RealTimeTestingPanel from './RealTimeTestingPanel';
import PromptComparisonWorkspace from './PromptComparisonWorkspace';

const nodeTypes = {
  promptNode: PromptNodeComponent,
  conditionalBranch: ConditionalBranchNode,
};

const LogicFlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTestingPanel, setShowTestingPanel] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Enhanced connection with condition logic
      const sourceNode = nodes.find(n => n.id === params.source);
      
      // Create edge with enhanced styling
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: params.sourceHandle === 'yes' ? '#10b981' : 
                  params.sourceHandle === 'no' ? '#ef4444' : '#6366f1',
          strokeWidth: 3,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        },
        labelStyle: { 
          fontSize: 12, 
          fontWeight: 600,
          fill: params.sourceHandle === 'yes' ? '#10b981' : 
                params.sourceHandle === 'no' ? '#ef4444' : '#6366f1',
          background: 'white',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        },
        label: params.sourceHandle === 'yes' ? '✓ YES' : 
               params.sourceHandle === 'no' ? '✗ NO' : ''
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowTestingPanel(true);
  }, []);

  const addPromptNode = useCallback(() => {
    const newNode: Node = {
      id: `prompt_${Date.now()}`,
      type: 'promptNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        title: `Prompt ${nodes.filter(n => n.type === 'promptNode').length + 1}`,
        prompt: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        output: '',
        isRunning: false,
        variables: {},
        onUpdate: (id: string, updates: any) => {
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
    setShowNodeMenu(false);
  }, [nodes, setNodes]);

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
    setShowNodeMenu(false);
  }, [nodes, setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const runSingleNode = async (nodeId: string) => {
    setIsRunning(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update node with mock output
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                output: 'This is a simulated AI response with detailed analysis and insights.',
                isRunning: false
              } 
            }
          : node
      )
    );
    
    setIsRunning(false);
  };

  const runFullChain = async () => {
    setIsRunning(true);
    // Simulate full chain execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRunning(false);
  };

  const nodeMenuItems = [
    {
      id: 'prompt',
      label: 'Prompt Node',
      icon: Zap,
      description: 'AI prompt execution node',
      color: 'from-blue-500 to-purple-600',
      action: addPromptNode
    },
    {
      id: 'conditional',
      label: 'Conditional Branch',
      icon: GitBranch,
      description: 'Logic branching node',
      color: 'from-purple-500 to-pink-600',
      action: addConditionalNode
    }
  ];

  const proOptions = { hideAttribution: true };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-white flex">
      {/* Main Canvas */}
      <div className={`flex-1 transition-all duration-300 ${showTestingPanel ? 'mr-96' : ''}`}>
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
          className="bg-gradient-to-br from-gray-50 to-white"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={2} 
            color="#e5e7eb"
            className="opacity-50"
          />
          
          <Controls 
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-xl"
            showInteractive={false}
          />
          
          <MiniMap 
            className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-xl"
            nodeColor="#6366f1"
            maskColor="rgba(99, 102, 241, 0.1)"
          />

          {/* Floating Add Button */}
          <Panel position="top-left">
            <div className="relative">
              <button
                onClick={() => setShowNodeMenu(!showNodeMenu)}
                className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Node</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showNodeMenu ? 'rotate-180' : ''}`} />
              </button>

              {showNodeMenu && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {nodeMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Panel>

          {/* Mode Toggle */}
          <Panel position="top-right">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  showComparison
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Compare</span>
              </button>
              
              <button
                onClick={() => setShowTestingPanel(!showTestingPanel)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  showTestingPanel
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Test</span>
              </button>
            </div>
          </Panel>

          {/* Welcome Panel */}
          {nodes.length === 0 && (
            <Panel position="center">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gray-200 p-12 max-w-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to PromptForge</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create sophisticated AI workflows with visual prompt chaining, conditional logic, and real-time testing.
                </p>
                <button
                  onClick={addPromptNode}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 mx-auto"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create Your First Node</span>
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Right Sidebar - Testing Panel */}
      {showTestingPanel && (
        <div className="fixed right-0 top-0 h-full z-40">
          <RealTimeTestingPanel
            selectedNode={selectedNode}
            onRunNode={runSingleNode}
            onRunChain={runFullChain}
            isRunning={isRunning}
          />
        </div>
      )}

      {/* Comparison Workspace Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <PromptComparisonWorkspace
              prompts={[]}
              onAddPrompt={() => console.log('Add prompt')}
              onRemovePrompt={(id) => console.log('Remove prompt', id)}
            />
            <button
              onClick={() => setShowComparison(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600 rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close node menu */}
      {showNodeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNodeMenu(false)}
        />
      )}
    </div>
  );
};

export default LogicFlowCanvas;