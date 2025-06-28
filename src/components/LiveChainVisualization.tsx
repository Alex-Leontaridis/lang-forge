import React from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface LiveChainVisualizationProps {
  nodes: any[];
  edges: any[];
  executionHistory: any[];
  isRunning: boolean;
}

const LiveChainVisualization: React.FC<LiveChainVisualizationProps> = ({
  nodes,
  edges,
  executionHistory,
  isRunning
}) => {
  const getNodeStatus = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return 'idle';
    
    if (node.data.isRunning) return 'running';
    if (node.data.error) return 'error';
    if (node.data.output) return 'completed';
    return 'idle';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const totalTokens = executionHistory.reduce((sum, item) => sum + (item.tokenUsage?.total || 0), 0);
  const totalTime = executionHistory.reduce((sum, item) => sum + (item.executionTime || 0), 0);
  const avgScore = executionHistory.length > 0 
    ? executionHistory.reduce((sum, item) => sum + (item.score || 0), 0) / executionHistory.length 
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Live Chain Visualization</h2>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Total Time</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {(totalTime / 1000).toFixed(1)}s
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Total Tokens</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {totalTokens.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <Award className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Avg Score</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {avgScore.toFixed(1)}/10
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Nodes</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {nodes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Chain Flow */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Chain Flow</h3>
        
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No nodes in chain</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nodes.map((node, index) => {
              const status = getNodeStatus(node.id);
              const execution = executionHistory.find(h => h.nodeId === node.id);
              
              return (
                <div key={node.id}>
                  <div className={`p-3 rounded-lg border-2 transition-all ${getStatusColor(status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium text-gray-900">
                          {node.data.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {node.data.model.toUpperCase()}
                      </span>
                    </div>

                    {/* Node Details */}
                    <div className="text-xs text-gray-600 mb-2">
                      {node.data.prompt.substring(0, 60)}
                      {node.data.prompt.length > 60 ? '...' : ''}
                    </div>

                    {/* Temperature and Condition */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Temp: {node.data.temperature || 0.7}</span>
                      {node.data.condition && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          Conditional
                        </span>
                      )}
                    </div>

                    {/* Execution Metrics */}
                    {execution && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-gray-500">Time</div>
                          <div className="font-medium">
                            {(execution.executionTime / 1000).toFixed(1)}s
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Tokens</div>
                          <div className="font-medium">
                            {execution.tokenUsage?.total || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Score</div>
                          <div className="font-medium">
                            {execution.score?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {node.data.error && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                        {node.data.error}
                      </div>
                    )}
                  </div>

                  {/* Connection Arrow */}
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-px h-4 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Executions</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {executionHistory.slice(-5).reverse().map((execution, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{execution.title}</span>
                <div className="flex items-center space-x-2 text-gray-500">
                  <span>{(execution.executionTime / 1000).toFixed(1)}s</span>
                  <span>{execution.tokenUsage?.total || 0} tokens</span>
                  <span className="font-medium">{execution.score?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Running Indicator */}
      {isRunning && (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <div className="flex items-center space-x-2 text-blue-700">
            <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Chain Executing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChainVisualization;