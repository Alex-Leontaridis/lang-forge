import React, { useEffect } from 'react';
import { FileText, Zap } from 'lucide-react';
import { Variable } from '../types';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isRunning: boolean;
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ 
  prompt, 
  setPrompt, 
  isRunning, 
  variables,
  onVariablesChange 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  // Extract variables from prompt
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    const foundVariables = matches.map(match => match[1].trim());
    const uniqueVariables = [...new Set(foundVariables)];

    // Update variables list
    const newVariables: Variable[] = uniqueVariables.map(name => {
      const existing = variables.find(v => v.name === name);
      return existing || { name, value: '' };
    });

    // Always update if variables changed (either added or removed)
    const currentNames = variables.map(v => v.name).sort();
    const newNames = newVariables.map(v => v.name).sort();
    
    if (JSON.stringify(currentNames) !== JSON.stringify(newNames)) {
      onVariablesChange(newVariables);
    }
  }, [prompt, onVariablesChange]);

  // Replace variables in prompt for preview
  const getPreviewPrompt = () => {
    let preview = prompt;
    variables.forEach(variable => {
      if (variable.value) {
        preview = preview.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'),
          variable.value
        );
      }
    });
    return preview;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">Prompt Editor</span>
        </div>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={handleInputChange}
            placeholder="Write your AI prompt here... Use {{variables}} for dynamic content like {{name}}, {{topic}}, or {{context}}."
            className={`w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black placeholder-gray-500 ${
              isRunning ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isRunning}
          />
        </div>

        {/* Preview with variables replaced */}
        {variables.some(v => v.value) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview with variables:</h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {getPreviewPrompt()}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Use {"{{variable}}"} syntax for dynamic placeholders</span>
          </div>
          <div>
            {prompt.length} characters
          </div>
        </div>

        {/* Variable Examples */}
        {!prompt && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-black mb-2">Example Variables:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{name}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{topic}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{context}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{style}}"}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptEditor;