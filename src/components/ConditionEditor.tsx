import React, { useState } from 'react';
import { X, Check, Settings, AlertTriangle } from 'lucide-react';
import { ConnectionCondition } from '../types';

interface ConditionEditorProps {
  condition: ConnectionCondition;
  onSave: (condition: ConnectionCondition) => void;
  onCancel: () => void;
  variables: Record<string, string>;
}

const ConditionEditor: React.FC<ConditionEditorProps> = ({
  condition,
  onSave,
  onCancel,
  variables
}) => {
  const [localCondition, setLocalCondition] = useState<ConnectionCondition>(condition);

  const conditionTypes = [
    { value: 'output_contains', label: 'Output contains', description: 'Check if output contains text' },
    { value: 'variable_equals', label: 'Variable equals', description: 'Check if variable equals value' },
    { value: 'token_count', label: 'Token count', description: 'Check token count' },
    { value: 'score_threshold', label: 'Score threshold', description: 'Check score values' },
    { value: 'custom', label: 'Custom condition', description: 'Write custom condition' }
  ];

  const operators = [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_equal', label: '>=' },
    { value: 'less_equal', label: '<=' },
    { value: 'not_equals', label: '!=' }
  ];

  const scoreFields = [
    { value: 'overall', label: 'Overall Score' },
    { value: 'relevance', label: 'Relevance' },
    { value: 'clarity', label: 'Clarity' },
    { value: 'creativity', label: 'Creativity' }
  ];

  const handleSave = () => {
    onSave(localCondition);
  };

  const renderConditionInputs = () => {
    switch (localCondition.type) {
      case 'output_contains':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Output</span>
              <select
                value={localCondition.operator}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {operators.filter(op => ['contains', 'equals', 'not_equals'].includes(op.value)).map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={localCondition.value}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter text to check"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        );

      case 'variable_equals':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Variable</span>
              <select
                value={localCondition.variable || ''}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, variable: e.target.value }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Select variable</option>
                {Object.keys(variables).map(varName => (
                  <option key={varName} value={varName}>{varName}</option>
                ))}
              </select>
              <select
                value={localCondition.operator}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {operators.filter(op => ['equals', 'not_equals', 'greater_than', 'less_than'].includes(op.value)).map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={localCondition.value}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter value"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        );

      case 'token_count':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Token count</span>
              <select
                value={localCondition.operator}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {operators.filter(op => ['greater_than', 'less_than', 'greater_equal', 'less_equal', 'equals'].includes(op.value)).map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={localCondition.value}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter token count"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        );

      case 'score_threshold':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Score</span>
              <select
                value={localCondition.field || 'overall'}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, field: e.target.value }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {scoreFields.map(field => (
                  <option key={field.value} value={field.value}>{field.label}</option>
                ))}
              </select>
              <select
                value={localCondition.operator}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {operators.filter(op => ['greater_than', 'less_than', 'greater_equal', 'less_equal', 'equals'].includes(op.value)).map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={localCondition.value}
                onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter score (0-10)"
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-2">
            <textarea
              value={localCondition.value}
              onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Enter custom condition (e.g., output.length > 100 && score.overall > 7)"
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 h-20 resize-none"
            />
            <div className="text-xs text-gray-500">
              Available variables: output, score, tokenUsage, variables
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Condition Editor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localCondition.enabled}
            onChange={(e) => setLocalCondition(prev => ({ ...prev, enabled: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Enable condition</span>
        </div>

        {localCondition.enabled && (
          <>
            {/* Condition Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Condition Type</label>
              <select
                value={localCondition.type}
                onChange={(e) => setLocalCondition(prev => ({ 
                  ...prev, 
                  type: e.target.value as any,
                  value: '',
                  variable: '',
                  field: ''
                }))}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                {conditionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                {conditionTypes.find(t => t.value === localCondition.type)?.description}
              </p>
            </div>

            {/* Condition Inputs */}
            {renderConditionInputs()}

            {/* Preview */}
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">Preview:</div>
              <div className="text-xs font-mono text-gray-800">
                {localCondition.type === 'output_contains' && `output ${localCondition.operator} "${localCondition.value}"`}
                {localCondition.type === 'variable_equals' && `${localCondition.variable} ${localCondition.operator} "${localCondition.value}"`}
                {localCondition.type === 'token_count' && `tokenCount ${localCondition.operator} ${localCondition.value}`}
                {localCondition.type === 'score_threshold' && `score.${localCondition.field} ${localCondition.operator} ${localCondition.value}`}
                {localCondition.type === 'custom' && localCondition.value}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConditionEditor; 