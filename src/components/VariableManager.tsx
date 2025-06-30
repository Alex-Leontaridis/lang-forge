import React, { useState, useEffect } from 'react';
import { Variable as Variable2, Plus, X, Search, AlertTriangle, CheckCircle, Settings, Type, Hash } from 'lucide-react';
import { Variable, InputVariable } from '../types';

interface VariableManagerProps {
  variables: Variable[];
  inputVariables: InputVariable[];
  prompt: string;
  onVariableChange: (name: string, value: string) => void;
  onAddVariable: (name: string) => void;
  onRemoveVariable: (name: string) => void;
  onInputVariableChange: (inputVariables: InputVariable[]) => void;
  showInputDeclaration?: boolean;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  inputVariables,
  prompt,
  onVariableChange,
  onAddVariable,
  onRemoveVariable,
  onInputVariableChange,
  showInputDeclaration = true
}) => {
  const [newVariableName, setNewVariableName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddVariable = () => {
    if (newVariableName.trim() && !variables.find(v => v.name === newVariableName.trim())) {
      onAddVariable(newVariableName.trim());
      setNewVariableName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariable();
    }
  };

  const validateVariableValue = (variable: InputVariable, value: string): boolean => {
    if (variable.required && !value) return false;
    
    if (variable.validation) {
      const { validation } = variable;
      
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return false;
      }
      
      if (validation.enum && !validation.enum.includes(value)) {
        return false;
      }
      
      if (variable.type === 'int' || variable.type === 'float') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        if (validation.min !== undefined && numValue < validation.min) return false;
        if (validation.max !== undefined && numValue > validation.max) return false;
      }
    }
    
    return true;
  };

  const getVariableTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return <span className="text-blue-600">"</span>;
      case 'int': return <Hash className="w-3 h-3 text-green-600" />;
      case 'float': return <span className="text-green-600">#</span>;
      case 'boolean': return <span className="text-purple-600">✓</span>;
      case 'array': return <span className="text-orange-600">[]</span>;
      case 'object': return <span className="text-red-600">{}</span>;
      default: return <Type className="w-3 h-3 text-gray-600" />;
    }
  };

  const filteredVariables = variables.filter(variable =>
    searchTerm === '' || 
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Variable2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Variables</span>
            <span className="text-xs sm:text-sm text-gray-500">({variables.length})</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {variables.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Variable2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No variables detected</p>
            <p className="text-xs">Use {"{{variable}}"} syntax in your prompt</p>
          </div>
        ) : (
          <>
            {/* Search */}
            {variables.length > 3 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredVariables.map((variable) => {
                const inputVar = inputVariables.find(iv => iv.name === variable.name);
                const isValid = inputVar ? validateVariableValue(inputVar, variable.value) : true;
                
                return (
                  <div key={variable.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {`{{${variable.name}}}`}
                        </code>
                        {inputVar && (
                          <div className="flex items-center space-x-1">
                            {getVariableTypeIcon(inputVar.type)}
                            {inputVar.required && (
                              <span className="text-xs text-red-500">*</span>
                            )}
                          </div>
                        )}
                        {!isValid && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveVariable(variable.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={variable.value}
                      onChange={(e) => onVariableChange(variable.name, e.target.value)}
                      placeholder={`Value for ${variable.name}${inputVar?.defaultValue ? ` (default: ${inputVar.defaultValue})` : ''}`}
                      className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black ${
                        !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {inputVar?.description && (
                      <p className="text-xs text-gray-500">{inputVar.description}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredVariables.length === 0 && searchTerm && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No variables found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newVariableName}
              onChange={(e) => setNewVariableName(e.target.value)}
              placeholder="Add new variable"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleAddVariable}
              disabled={!newVariableName.trim() || !!variables.find(v => v.name === newVariableName.trim())}
              className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span className="ml-1 sm:hidden">Add</span>
            </button>
          </div>
          {newVariableName.trim() && variables.find(v => v.name === newVariableName.trim()) && (
            <p className="text-xs text-red-500 mt-1">Variable already exists</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariableManager; 