import React, { useState } from 'react';
import { ArrowRight, GitBranch, Eye, EyeOff, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { VariableFlow, PromptNode, ChainHealthIssue } from '../types';

interface VariableFlowVisualizationProps {
  nodes: PromptNode[];
  variableFlows: VariableFlow[];
  healthIssues: ChainHealthIssue[];
  onFlowClick?: (flow: VariableFlow) => void;
  onNodeClick?: (nodeId: string) => void;
}

const VariableFlowVisualization: React.FC<VariableFlowVisualizationProps> = ({
  nodes,
  variableFlows,
  healthIssues,
  onFlowClick,
  onNodeClick
}) => {
  const [showUnusedInputs, setShowUnusedInputs] = useState(true);
  const [showDanglingOutputs, setShowDanglingOutputs] = useState(true);
  const [hoveredFlow, setHoveredFlow] = useState<VariableFlow | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Analyze variable usage
  const getNodeVariableUsage = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { inputs: [], outputs: [], unused: [], dangling: [] };

    const usedInputs = node.inputVariables.filter(iv => 
      node.prompt.includes(`{{${iv.name}}}`)
    );
    const unusedInputs = node.inputVariables.filter(iv => 
      !node.prompt.includes(`{{${iv.name}}}`)
    );
    const danglingOutputs = node.outputVariables.filter(ov => 
      !variableFlows.some(flow => flow.fromVariable === ov.name)
    );

    return {
      inputs: usedInputs,
      outputs: node.outputVariables,
      unused: unusedInputs,
      dangling: danglingOutputs
    };
  };

  const getFlowTypeIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <ArrowRight className="w-3 h-3 text-green-600" />;
      case 'transformed':
        return <Zap className="w-3 h-3 text-blue-600" />;
      case 'conditional':
        return <GitBranch className="w-3 h-3 text-purple-600" />;
      default:
        return <ArrowRight className="w-3 h-3 text-gray-600" />;
    }
  };

  const getFlowTypeColor = (type: string) => {
    switch (type) {
      case 'direct':
        return 'border-green-200 bg-green-50';
      case 'transformed':
        return 'border-blue-200 bg-blue-50';
      case 'conditional':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getNodeHealthStatus = (nodeId: string) => {
    const nodeIssues = healthIssues.filter(issue => issue.nodeId === nodeId);
    const errors = nodeIssues.filter(issue => issue.severity === 'error');
    const warnings = nodeIssues.filter(issue => issue.severity === 'warning');
    
    if (errors.length > 0) return { status: 'error', count: errors.length };
    if (warnings.length > 0) return { status: 'warning', count: warnings.length };
    return { status: 'healthy', count: 0 };
  };

  const getNodeHealthIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'healthy':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const filteredFlows = variableFlows.filter(flow => {
    if (!showUnusedInputs) {
      const fromNodeUsage = getNodeVariableUsage(flow.fromNode);
      if (fromNodeUsage.unused.some(u => u.name === flow.fromVariable)) {
        return false;
      }
    }
    if (!showDanglingOutputs) {
      const toNodeUsage = getNodeVariableUsage(flow.toNode);
      if (toNodeUsage.dangling.some(d => d.name === flow.toVariable)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Variable Flow</span>
            <span className="text-xs sm:text-sm text-gray-500">({variableFlows.length} flows)</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 text-xs">
              <input
                type="checkbox"
                checked={showUnusedInputs}
                onChange={(e) => setShowUnusedInputs(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Unused</span>
            </label>
            <label className="flex items-center space-x-1 text-xs">
              <input
                type="checkbox"
                checked={showDanglingOutputs}
                onChange={(e) => setShowDanglingOutputs(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Dangling</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {variableFlows.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No variable flows detected</p>
            <p className="text-xs">Variables will flow automatically between connected nodes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Flow Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                <div className="text-xs text-green-600">Direct</div>
                <div className="text-lg font-bold text-green-700">
                  {variableFlows.filter(f => f.type === 'direct').length}
                </div>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                <div className="text-xs text-blue-600">Transformed</div>
                <div className="text-lg font-bold text-blue-700">
                  {variableFlows.filter(f => f.type === 'transformed').length}
                </div>
              </div>
              <div className="p-2 bg-purple-50 border border-purple-200 rounded text-center">
                <div className="text-xs text-purple-600">Conditional</div>
                <div className="text-lg font-bold text-purple-700">
                  {variableFlows.filter(f => f.type === 'conditional').length}
                </div>
              </div>
            </div>

            {/* Variable Flows */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFlows.map((flow, index) => {
                const fromNode = nodes.find(n => n.id === flow.fromNode);
                const toNode = nodes.find(n => n.id === flow.toNode);
                const fromNodeHealth = getNodeHealthStatus(flow.fromNode);
                const toNodeHealth = getNodeHealthStatus(flow.toNode);

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredFlow(flow)}
                    onMouseLeave={() => setHoveredFlow(null)}
                    onClick={() => onFlowClick?.(flow)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      getFlowTypeColor(flow.type)
                    } ${onFlowClick ? 'hover:shadow-md' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* From Node */}
                        <div 
                          className="flex items-center space-x-2 min-w-0"
                          onMouseEnter={() => setHoveredNode(flow.fromNode)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <div className="flex items-center space-x-1">
                            {getNodeHealthIcon(fromNodeHealth.status)}
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {fromNode?.title || flow.fromNode}
                            </span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {flow.fromVariable}
                          </span>
                        </div>

                        {/* Flow Arrow */}
                        <div className="flex items-center space-x-1">
                          {getFlowTypeIcon(flow.type)}
                          <span className="text-xs text-gray-500">
                            {flow.type}
                          </span>
                        </div>

                        {/* To Node */}
                        <div 
                          className="flex items-center space-x-2 min-w-0"
                          onMouseEnter={() => setHoveredNode(flow.toNode)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {flow.toVariable}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {toNode?.title || flow.toNode}
                            </span>
                            {getNodeHealthIcon(toNodeHealth.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Details */}
                    {hoveredFlow === flow && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>From: {fromNode?.title || flow.fromNode} → {flow.fromVariable}</div>
                          <div>To: {toNode?.title || flow.toNode} → {flow.toVariable}</div>
                          <div>Type: {flow.type}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Node Variable Usage Summary */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Node Variable Usage</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {nodes.map(node => {
                  const usage = getNodeVariableUsage(node.id);
                  const health = getNodeHealthStatus(node.id);
                  
                  return (
                    <div
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => onNodeClick?.(node.id)}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        hoveredNode === node.id ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getNodeHealthIcon(health.status)}
                          <span className="text-sm font-medium text-gray-700">{node.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{usage.inputs.length} inputs</span>
                          <span>{usage.outputs.length} outputs</span>
                          {usage.unused.length > 0 && (
                            <span className="text-yellow-600">{usage.unused.length} unused</span>
                          )}
                          {usage.dangling.length > 0 && (
                            <span className="text-blue-600">{usage.dangling.length} dangling</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariableFlowVisualization; 