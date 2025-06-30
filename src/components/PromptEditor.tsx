import React, { useEffect } from 'react';
import { FileText, Zap, Eye, EyeOff, Sparkles, FileCode, ChevronDown, Code } from 'lucide-react';
import { Variable, Model } from '../types';
import apiService from '../services/apiService';
import PromptAutoTest, { AutoTestResult } from './PromptAutoTest';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isRunning: boolean;
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
  selectedModel?: string;
  temperature?: number;
  models?: Model[];
  selectedModels?: string[];
  onAutoTestComplete?: (result: AutoTestResult) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ 
  prompt, 
  setPrompt, 
  isRunning, 
  variables,
  onVariablesChange,
  selectedModel = 'gpt-4',
  temperature = 0.3,
  models = [],
  selectedModels = ['gpt-4'],
  onAutoTestComplete
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [showAutoTest, setShowAutoTest] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  // Handle clicking outside export menu to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const optimizePrompt = async () => {
    if (!prompt.trim() || isOptimizing) return;
    
    setIsOptimizing(true);
    try {
      const systemMessage = `You are an expert prompt engineer specializing in optimizing AI prompts for maximum effectiveness, clarity, and performance. Your goal is to enhance prompts while preserving their core intent and variables.

OPTIMIZATION PRINCIPLES:
1. CLARITY: Make instructions explicit and unambiguous
2. STRUCTURE: Organize prompts logically with clear sections
3. CONTEXT: Provide sufficient context for better understanding
4. CONSTRAINTS: Add helpful constraints to guide the AI
5. EXAMPLES: Include relevant examples when beneficial
6. VARIABLES: Preserve all {{variable}} placeholders exactly as they appear
7. LENGTH: Optimize for effectiveness, not necessarily brevity

OPTIMIZATION PROCESS:
- Analyze the original prompt's intent and purpose
- Identify areas for improvement in clarity, structure, and effectiveness
- Enhance the prompt while maintaining all variables
- Ensure the optimized version is more likely to produce high-quality outputs
- Provide a brief explanation of the improvements made

Respond with the optimized prompt only, maintaining all {{variable}} placeholders exactly as they appear.`;

      const optimizationPrompt = `Please optimize this prompt for better AI performance while preserving all variables:

ORIGINAL PROMPT:
${prompt}

OPTIMIZED PROMPT:`;

      const result = await apiService.generateCompletion(
        'gpt-4',
        optimizationPrompt,
        systemMessage,
        0.3,
        1000
      );

      setPrompt(result.content.trim());
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      // You could add a toast notification here
    } finally {
      setIsOptimizing(false);
    }
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
  }, [prompt, onVariablesChange, variables]);

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

  const hasVariablesWithValues = variables.some(v => v.value);

  // Extract variables from prompt text
  const extractVariables = (prompt: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...prompt.matchAll(variableRegex)];
    return [...new Set(matches.map(match => match[1].trim()))];
  };

  const exportToLangChainPython = () => {
    if (!prompt.trim()) {
      alert('No prompt to export');
      return;
    }

    const variables = extractVariables(prompt);
    const varList = variables.length > 0 ? `[${variables.map(v => `"${v}"`).join(', ')}]` : '[]';
    
    const pythonCode = `from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain

# Prompt Template
prompt_template = PromptTemplate(
    input_variables=${varList},
    template="""${prompt.replace(/"/g, '\\"')}"""
)

# Initialize the language model
llm = ChatOpenAI(
    model_name="${selectedModel}",
    temperature=${temperature}
)

# Create the chain
chain = LLMChain(
    llm=llm,
    prompt=prompt_template
)

# Example usage:
# inputs = {${variables.map(v => `"${v}": "value"`).join(', ')}}
# result = chain.run(inputs)
# print(result)

def run_prompt(inputs):
    """
    Run the prompt with given inputs
    """
    return chain.run(inputs)
`;

    const blob = new Blob([pythonCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_langchain.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToLangChainJS = () => {
    if (!prompt.trim()) {
      alert('No prompt to export');
      return;
    }

    const variables = extractVariables(prompt);
    
    const jsCode = `import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";

// Prompt Template
const promptTemplate = PromptTemplate.fromTemplate(\`${prompt.replace(/`/g, '\\`')}\`);

// Initialize the language model
const llm = new ChatOpenAI({
  modelName: "${selectedModel}",
  temperature: ${temperature}
});

// Create the chain
const chain = new LLMChain({
  llm: llm,
  prompt: promptTemplate
});

// Example usage:
// const inputs = {${variables.map(v => `${v}: "value"`).join(', ')}};
// const result = await chain.call(inputs);
// console.log(result.text);

async function runPrompt(inputs) {
  /**
   * Run the prompt with given inputs
   */
  const result = await chain.call(inputs);
  return result.text;
}

export { runPrompt };
`;

    const blob = new Blob([jsCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_langchain.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Prompt Editor</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasVariablesWithValues && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
            )}
            
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  showExportMenu 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <div className="p-2">
                    <button
                      onClick={exportToLangChainPython}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors"
                    >
                      <Code className="w-4 h-4 text-blue-600" />
                      <span>Export to LangChain Python</span>
                    </button>
                    <button
                      onClick={exportToLangChainJS}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors"
                    >
                      <Code className="w-4 h-4 text-yellow-600" />
                      <span>Export to LangChain JS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowAutoTest(!showAutoTest)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Test</span>
            </button>
            
            <button
              onClick={optimizePrompt}
              disabled={!prompt.trim() || isOptimizing || isRunning}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={handleInputChange}
            placeholder="Write your AI prompt here... Use {{variables}} for dynamic content like {{name}}, {{topic}}, or {{context}}."
            className={`w-full h-48 sm:h-64 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black placeholder-gray-500 text-sm sm:text-base ${
              isRunning ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isRunning}
          />
        </div>

        {/* Preview with variables replaced */}
        {showPreview && hasVariablesWithValues && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview with variables:</h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {getPreviewPrompt()}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Use {"{{variable}}"} syntax for dynamic placeholders</span>
          </div>
          <div>
            {prompt.length} characters
          </div>
        </div>

        {/* Variable Examples */}
        {!prompt && (
          <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-black mb-2 text-sm sm:text-base">Example Variables:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{name}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{topic}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{context}}"}</code>
              <code className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">{"{{style}}"}</code>
            </div>
          </div>
        )}

        {/* Auto-Test Component */}
        {showAutoTest && prompt.trim() && (
          <div className="mt-4">
            <PromptAutoTest
              prompt={prompt}
              variables={variables}
              models={models}
              selectedModels={selectedModels}
              temperature={temperature}
              onTestComplete={(result) => {
                onAutoTestComplete?.(result);
              }}
              isRunning={isRunning}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptEditor;