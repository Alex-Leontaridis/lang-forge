import React from 'react';
import { FileText, Zap } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isRunning: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, setPrompt, isRunning }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">Prompt Editor</h2>
          <p className="text-gray-600">Write your AI prompt with variable support</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={handleInputChange}
          placeholder="Write your AI prompt here... Use {{variables}} for dynamic content like {{name}}, {{topic}}, or {{context}}."
          className={`w-full h-64 p-6 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 text-black placeholder-gray-500 ${
            isRunning ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isRunning}
        />
        
        {/* Variable Highlight Overlay */}
        {prompt && (
          <div className="absolute top-6 left-6 pointer-events-none text-transparent whitespace-pre-wrap break-words font-mono">
            {prompt.split(/(\{\{[^}]*\}\})/).map((part, index) => 
              part.startsWith('{{') && part.endsWith('}}') ? (
                <span key={index} className="bg-gray-200 text-gray-700 px-1 rounded">
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Zap className="w-4 h-4" />
          <span>Use {"{{variable}}"} syntax for dynamic placeholders</span>
        </div>
        <div className="text-sm text-gray-500">
          {prompt.length} characters
        </div>
      </div>

      {/* Variable Examples */}
      {!prompt && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
  );
};

export default PromptEditor;