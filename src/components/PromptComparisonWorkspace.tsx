import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Eye, 
  Sparkles, 
  Clock, 
  Hash,
  ChevronLeft,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';

interface PromptData {
  id: string;
  title: string;
  prompt: string;
  output: string;
  score: {
    relevance: number;
    clarity: number;
    creativity: number;
    overall: number;
  };
  stats: {
    tokens: number;
    latency: number;
  };
}

interface PromptComparisonWorkspaceProps {
  prompts: PromptData[];
  onAddPrompt: () => void;
  onRemovePrompt: (id: string) => void;
}

const PromptComparisonWorkspace: React.FC<PromptComparisonWorkspaceProps> = ({
  prompts,
  onAddPrompt,
  onRemovePrompt
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');

  // Mock data if no prompts provided
  const mockPrompts: PromptData[] = [
    {
      id: '1',
      title: 'Marketing Copy v1',
      prompt: 'Write compelling marketing copy for a new AI productivity tool that helps teams collaborate better.',
      output: 'Transform your team\'s productivity with our revolutionary AI-powered collaboration platform. Streamline workflows, enhance communication, and achieve 40% faster project completion rates.',
      score: { relevance: 9, clarity: 8, creativity: 7, overall: 8.0 },
      stats: { tokens: 156, latency: 1.2 }
    },
    {
      id: '2',
      title: 'Marketing Copy v2',
      prompt: 'Create engaging marketing content for an AI collaboration tool. Focus on benefits and include emotional appeal.',
      output: 'Unlock your team\'s true potential! Our AI collaboration tool doesn\'t just organize work—it transforms how your team thinks, creates, and succeeds together. Join 10,000+ teams already experiencing the future of work.',
      score: { relevance: 8, clarity: 9, creativity: 9, overall: 8.7 },
      stats: { tokens: 142, latency: 1.8 }
    },
    {
      id: '3',
      title: 'Marketing Copy v3',
      prompt: 'Write professional marketing copy for B2B AI productivity software. Include specific metrics and ROI focus.',
      output: 'Increase team productivity by 40% with our enterprise AI collaboration platform. Reduce project timelines, eliminate communication bottlenecks, and deliver measurable ROI within 90 days. Trusted by Fortune 500 companies.',
      score: { relevance: 9, clarity: 9, creativity: 6, overall: 8.0 },
      stats: { tokens: 134, latency: 1.5 }
    }
  ];

  const displayPrompts = prompts.length > 0 ? prompts : mockPrompts;
  const bestPrompt = displayPrompts.reduce((best, current) => 
    current.score.overall > best.score.overall ? current : best
  );

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-400 to-green-600';
    if (score >= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return 'text-green-700';
    if (score >= 6) return 'text-yellow-700';
    return 'text-red-700';
  };

  const PromptCard = ({ prompt, isWinner }: { prompt: PromptData; isWinner: boolean }) => (
    <div className={`relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      isWinner 
        ? 'border-yellow-300 shadow-yellow-200/50 shadow-2xl' 
        : 'border-gray-200 shadow-xl hover:border-gray-300'
    }`}>
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg z-10">
          <Trophy className="w-6 h-6 text-white" />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">{prompt.title}</h3>
          <button
            onClick={() => onRemovePrompt(prompt.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Prompt</h4>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{prompt.prompt}</p>
          </div>
        </div>

        {/* Output */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Output</h4>
          <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed">{prompt.output}</p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-600">PromptScore</h4>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreTextColor(prompt.score.overall)} bg-gradient-to-r ${getScoreColor(prompt.score.overall)} bg-opacity-20`}>
              {prompt.score.overall}/10
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{prompt.score.relevance}</div>
              <div className="text-xs text-gray-500">Relevance</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{prompt.score.clarity}</div>
              <div className="text-xs text-gray-500">Clarity</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{prompt.score.creativity}</div>
              <div className="text-xs text-gray-500">Creativity</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Hash className="w-4 h-4" />
            <span>{prompt.stats.tokens} tokens</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{prompt.stats.latency}s</span>
          </div>
        </div>
      </div>

      {/* Glow Effect for Winner */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-3xl pointer-events-none"></div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prompt Comparison</h2>
              <p className="text-gray-600">Compare and optimize your prompts</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === 'carousel'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Carousel
              </button>
            </div>

            <button
              onClick={onAddPrompt}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Prompt</span>
            </button>
          </div>
        </div>

        {/* Winner Announcement */}
        {displayPrompts.length > 1 && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-800">Current Winner</h3>
                <p className="text-yellow-700">
                  <span className="font-semibold">{bestPrompt.title}</span> with a score of {bestPrompt.score.overall}/10
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayPrompts.map((prompt) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                isWinner={prompt.id === bestPrompt.id && displayPrompts.length > 1}
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>

              <div className="w-full max-w-md">
                <PromptCard 
                  prompt={displayPrompts[currentIndex]} 
                  isWinner={displayPrompts[currentIndex].id === bestPrompt.id && displayPrompts.length > 1}
                />
              </div>

              <button
                onClick={() => setCurrentIndex(Math.min(displayPrompts.length - 1, currentIndex + 1))}
                disabled={currentIndex === displayPrompts.length - 1}
                className="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {displayPrompts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptComparisonWorkspace;