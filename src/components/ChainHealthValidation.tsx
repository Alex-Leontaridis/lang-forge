import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, GitBranch, Zap } from 'lucide-react';
import { ChainHealthIssue, PromptNode, VariableFlow } from '../types';

interface ChainHealthValidationProps {
  nodes: PromptNode[];
  variableFlows: VariableFlow[];
  healthIssues: ChainHealthIssue[];
  onIssueClick?: (issue: ChainHealthIssue) => void;
}

const ChainHealthValidation: React.FC<ChainHealthValidationProps> = ({
  nodes,
  variableFlows,
  healthIssues,
  onIssueClick
}) => {
  const getIssueIcon = (severity: 'warning' | 'error') => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getIssueTypeLabel = (type: string) => {
    switch (type) {
      case 'undeclared_variable':
        return 'Undeclared Variable';
      case 'unused_input':
        return 'Unused Input';
      case 'dangling_output':
        return 'Dangling Output';
      case 'disconnected_node':
        return 'Disconnected Node';
      case 'unsupported_config':
        return 'Unsupported Config';
      default:
        return type;
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'undeclared_variable':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'unused_input':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'dangling_output':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'disconnected_node':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'unsupported_config':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityColor = (severity: 'warning' | 'error') => {
    return severity === 'error' ? 'text-red-600' : 'text-yellow-600';
  };

  const issueCounts = healthIssues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalIssues = healthIssues.length;
  const errorCount = healthIssues.filter(i => i.severity === 'error').length;
  const warningCount = healthIssues.filter(i => i.severity === 'warning').length;

  const handleAutoFixVariables = () => {
    // Auto-fix undeclared variables
    const undeclaredIssues = healthIssues.filter(i => i.type === 'undeclared_variable');
    console.log('Auto-fixing undeclared variables:', undeclaredIssues);
    
    // In a real implementation, this would:
    // 1. Create missing variables
    // 2. Add them to the variable manager
    // 3. Update the prompt if needed
    
    // For now, just log the action
    undeclaredIssues.forEach(issue => {
      console.log(`Would create variable: ${issue.variableName}`);
    });
  };

  const handleViewDetails = () => {
    // Show detailed analysis
    console.log('Detailed chain analysis:', { nodes, variableFlows, healthIssues });
    
    // In a real implementation, this would:
    // 1. Open a detailed modal
    // 2. Show variable usage patterns
    // 3. Show dependency graphs
    // 4. Show optimization suggestions
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Chain Health</span>
            {totalIssues > 0 ? (
              <div className="flex items-center space-x-2">
                {errorCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {errorCount} errors
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    {warningCount} warnings
                  </span>
                )}
              </div>
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {nodes.length} nodes, {variableFlows.length} flows
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {totalIssues === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium text-green-700">Chain is healthy!</p>
            <p className="text-xs">No issues detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Issue Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(issueCounts).map(([type, count]) => (
                <div
                  key={type}
                  className={`p-2 rounded-lg border text-center ${getIssueTypeColor(type)}`}
                >
                  <div className="text-xs font-medium">{getIssueTypeLabel(type)}</div>
                  <div className="text-lg font-bold">{count}</div>
                </div>
              ))}
            </div>

            {/* Issues List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {healthIssues.map((issue, index) => (
                <div
                  key={index}
                  onClick={() => onIssueClick?.(issue)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    onIssueClick ? 'hover:border-gray-300' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getIssueIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getIssueTypeColor(issue.type)}`}>
                          {getIssueTypeLabel(issue.type)}
                        </span>
                        <span className={`text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{issue.message}</p>
                      {issue.nodeId && (
                        <p className="text-xs text-gray-500">
                          Node: <span className="font-medium">{issue.nodeId}</span>
                        </p>
                      )}
                      {issue.variableName && (
                        <p className="text-xs text-gray-500">
                          Variable: <span className="font-medium">{issue.variableName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAutoFixVariables}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Auto-fix Variables
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainHealthValidation; 