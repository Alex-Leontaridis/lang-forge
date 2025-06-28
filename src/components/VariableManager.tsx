import React from 'react';
import { Variable as Variable2, Plus, X } from 'lucide-react';
import { Variable } from '../types';

interface VariableManagerProps {
  variables: Variable[];
  onVariableChange: (name: string, value: string) => void;
  onAddVariable: (name: string) => void;
  onRemoveVariable: (name: string) => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  onVariableChange,
  onAddVariable,
  onRemoveVariable
}) => {
  const [newVariableName, setNewVariableName] = React.useState('');

  const handleAddVariable = () => {
    if (newVariableName.trim() && !variables.find(v => v.name === newVariableName.trim())) {
      onAddVariable(newVariableName.trim());
      setNewVariableName('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Variable2 className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">Variables</span>
          <span className="text-sm text-gray-500">({variables.length})</span>
        </div>
      </div>

      <div className="p-4">
        {variables.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Variable2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No variables detected</p>
            <p className="text-xs">Use {"{{variable}}"} syntax in your prompt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {variables.map((variable) => (
              <div key={variable.name} className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {`{{${variable.name}}}`}
                    </code>
                    <button
                      onClick={() => onRemoveVariable(variable.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) => onVariableChange(variable.name, e.target.value)}
                    placeholder={`Value for ${variable.name}`}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.target.value)}
              placeholder="Add new variable"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              onKeyPress={(e) => e.key === 'Enter' && handleAddVariable()}
            />
            <button
              onClick={handleAddVariable}
              className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableManager;