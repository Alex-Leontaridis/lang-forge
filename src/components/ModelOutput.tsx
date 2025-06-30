import React from 'react';
import { Bot, Copy, Check, Clock, Eye } from 'lucide-react';

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
  timestamp?: Date;
  executionTime?: number;
}

const ModelOutput: React.FC<ModelOutputProps> = ({ 
  output, 
  isRunning, 
  selectedModel, 
  score,
  compact = false,
  onShowFullReport,
  modelLogo,
  modelName,
  timestamp,
  executionTime
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showFullOutput, setShowFullOutput] = React.useState(false);

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStroke = (value: number) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#d97706';
    return '#dc2626';
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatExecutionTime = (time: number) => {
    return `${(time / 1000).toFixed(1)}s`;
  };

  const CircularProgress = ({ value, size = 40, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

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
        <span className={`absolute text-[10px] font-bold ${getScoreColor(value)}`}>{value}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <>
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
                {timestamp && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{formatTimestamp(timestamp)}</span>
                  </div>
                )}
                {score && (
                  <div className="flex items-center space-x-2 mt-1">
                    <CircularProgress value={score.overall} size={40} strokeWidth={4} />
                    <div className="flex items-center space-x-1">
                      <CircularProgress value={score.relevance} size={28} strokeWidth={3} />
                      <CircularProgress value={score.clarity} size={28} strokeWidth={3} />
                      <CircularProgress value={score.creativity} size={28} strokeWidth={3} />
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
            <div className="flex items-center space-x-1">
              {output && (
                <>
                  <button
                    onClick={() => setShowFullOutput(true)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs transition-colors border border-blue-200"
                  >
                    <Eye className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600">Full Output</span>
                  </button>
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
                </>
              )}
            </div>
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
              <span>{executionTime ? formatExecutionTime(executionTime) : '~2.3s'}</span>
              <span>{output.length} chars</span>
            </div>
          )}
        </div>

        {/* Full Output Modal */}
        {showFullOutput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {modelLogo ? (
                      <img src={modelLogo} alt="model logo" className="w-8 h-8 rounded-md object-contain bg-white border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Full Output</h3>
                      <p className="text-sm text-gray-600">{modelName || selectedModel.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <button
                      onClick={() => setShowFullOutput(false)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="prose prose-gray max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                      {output}
                    </pre>
                  </div>
                </div>
                {executionTime && (
                  <div className="mt-4 text-sm text-gray-500">
                    Generated in {formatExecutionTime(executionTime)} • {output.length} characters
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
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
            {timestamp && (
              <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                <Clock className="w-4 h-4" />
                <span>{formatTimestamp(timestamp)}</span>
              </p>
            )}
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
          <span>Response generated in {executionTime ? formatExecutionTime(executionTime) : '~2.3s'}</span>
          <span>{output.length} characters</span>
        </div>
      )}
    </div>
  );
};

export default ModelOutput;