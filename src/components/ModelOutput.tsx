import React from 'react';
import { Bot, Copy, Check } from 'lucide-react';

interface ModelOutputProps {
  output: string;
  isRunning: boolean;
  selectedModel: string;
  score?: {
    relevance: number;
    clarity: number;
    creativity: number;
    overall: number;
    critique: string;
  };
  compact?: boolean;
  onShowFullReport?: () => void;
  modelLogo?: string;
  modelName?: string;
}

const ModelOutput: React.FC<ModelOutputProps> = ({ 
  output, 
  isRunning, 
  selectedModel, 
  score,
  compact = false,
  onShowFullReport,
  modelLogo,
  modelName
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStroke = (value: number) => {
    if (value >= 8) return '#10b981';
    if (value >= 6) return '#d97706';
    return '#dc2626';
  };

  const CircularProgress = ({ value, size = 32, strokeWidth = 3 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 10) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreStroke(value)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className={`absolute text-base font-bold ${getScoreColor(value)}`}>{value}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {modelLogo ? (
              <img src={modelLogo} alt="model logo" className="w-7 h-7 rounded-md object-contain bg-white border border-gray-200" />
            ) : (
              <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-black">{modelName || selectedModel.toUpperCase()}</h3>
              {score && (
                <div className="flex items-center space-x-2 mt-1">
                  <CircularProgress value={score.overall} size={32} strokeWidth={3} />
                  <div className="flex items-center space-x-1">
                    <CircularProgress value={score.relevance} size={22} strokeWidth={2} />
                    <CircularProgress value={score.clarity} size={22} strokeWidth={2} />
                    <CircularProgress value={score.creativity} size={22} strokeWidth={2} />
                  </div>
                  {onShowFullReport && (
                    <button
                      onClick={onShowFullReport}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Full Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-600">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        {/* Content */}
        <div className="relative">
          {isRunning ? (
            <div className="h-24 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full mb-2 border border-gray-200">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-xs text-gray-600 font-medium">Generating...</p>
              </div>
            </div>
          ) : output ? (
            <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed line-clamp-4">
                  {output}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Bot className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Awaiting response</p>
              </div>
            </div>
          )}
        </div>
        {output && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>~2.3s</span>
            <span>{output.length} chars</span>
          </div>
        )}
      </div>
    );
  }

  // Original full-size layout for backwards compatibility
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">AI Response</h2>
            <p className="text-gray-600">Generated by {modelName || selectedModel.toUpperCase()}</p>
          </div>
        </div>
        {output && (
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Copy</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="relative">
        {isRunning ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full mb-4 border border-gray-200">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-gray-600 font-medium">AI is thinking...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        ) : output ? (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="prose prose-gray max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {output}
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>AI response will appear here</p>
            </div>
          </div>
        )}
      </div>
      {output && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Response generated in ~2.3s</span>
          <span>{output.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default ModelOutput;