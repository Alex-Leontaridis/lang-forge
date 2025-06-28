import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Zap, ChevronDown, Sparkles } from 'lucide-react';
import PromptEditor from './PromptEditor';
import ModelOutput from './ModelOutput';
import PromptScore from './PromptScore';

const PromptForge = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [promptScore, setPromptScore] = useState(null);

  const models = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' }
  ];

  const handleRunPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsRunning(true);
    setOutput('');
    setPromptScore(null);
    
    // Simulate AI processing
    setTimeout(() => {
      const simulatedOutput = `This is a simulated response from ${selectedModel} based on your prompt: "${prompt.substring(0, 50)}..."\n\nIn a real implementation, this would be the actual AI response from the selected model. The response would be contextually relevant and follow the instructions provided in your prompt.`;
      setOutput(simulatedOutput);
      setIsRunning(false);
      
      // Simulate PromptScore evaluation
      setTimeout(() => {
        const score = {
          relevance: Math.floor(Math.random() * 3) + 8, // 8-10
          clarity: Math.floor(Math.random() * 3) + 7,   // 7-9
          creativity: Math.floor(Math.random() * 4) + 6, // 6-9
          critique: `This prompt demonstrates good structure and clear intent. The ${selectedModel} response shows strong alignment with the request. Consider adding more specific context or examples to further improve clarity and effectiveness.`
        };
        setPromptScore(score);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-black">PromptForge</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-black">
                    {models.find(m => m.id === selectedModel)?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedModel === model.id ? 'bg-gray-50 border-l-2 border-black' : ''
                        }`}
                      >
                        <div className="font-medium text-black">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunPrompt}
                disabled={!prompt.trim() || isRunning}
                className="flex items-center space-x-2 bg-black text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200"
              >
                <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
                <span>{isRunning ? 'Running...' : 'Run Prompt'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Prompt Editor */}
          <PromptEditor 
            prompt={prompt} 
            setPrompt={setPrompt}
            isRunning={isRunning}
          />

          {/* Output and Score */}
          {(output || isRunning) && (
            <div className="grid lg:grid-cols-2 gap-8">
              <ModelOutput 
                output={output} 
                isRunning={isRunning}
                selectedModel={selectedModel}
              />
              
              {promptScore && (
                <PromptScore score={promptScore} />
              )}
            </div>
          )}

          {/* Welcome Message */}
          {!output && !isRunning && (
            <div className="text-center py-20">
              <div className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium">Ready to forge amazing prompts?</span>
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">
                Start building your perfect AI prompt
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Write your prompt above, select your preferred AI model, and hit "Run Prompt" to see the magic happen. 
                You'll get instant feedback with our PromptScore evaluation system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptForge;