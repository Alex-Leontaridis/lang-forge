import React, { useState } from 'react';
import { Award, Target, Eye, Sparkles, X } from 'lucide-react';

interface PromptScoreProps {
  score: {
    relevance: number;
    clarity: number;
    creativity: number;
    overall?: number;
    critique: string;
  };
  compact?: boolean;
}

const PromptScore: React.FC<PromptScoreProps> = ({ score, compact = false }) => {
  const [showFullReport, setShowFullReport] = useState(false);

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'bg-green-500';
    if (value >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (value: number) => {
    if (value >= 8) return 'text-green-700';
    if (value >= 6) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getScoreStroke = (value: number) => {
    if (value >= 8) return '#10b981';
    if (value >= 6) return '#d97706';
    return '#dc2626';
  };

  const scoreItems = [
    { 
      name: 'Relevance', 
      value: score.relevance, 
      icon: Target,
      description: 'How well the response matches the prompt'
    },
    { 
      name: 'Clarity', 
      value: score.clarity, 
      icon: Eye,
      description: 'How clear and understandable the prompt is'
    },
    { 
      name: 'Creativity', 
      value: score.creativity, 
      icon: Sparkles,
      description: 'How creative and engaging the prompt is'
    }
  ];

  const averageScore = score.overall || Math.round((score.relevance + score.clarity + score.creativity) / 3 * 10) / 10;

  const CircularProgress = ({ value, size = 48, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) => {
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
            className="transition-all duration-500"
          />
        </svg>
        <span className={`absolute text-sm font-bold ${getScoreTextColor(value)}`}>
          {value}
        </span>
      </div>
    );
  };

  if (compact) {
    return (
      <>
        <div className="flex items-center space-x-3">
          <CircularProgress value={averageScore} size={40} strokeWidth={3} />
          <div className="flex items-center space-x-2">
            {scoreItems.map((item) => (
              <div key={item.name} className="text-center">
                <CircularProgress value={item.value} size={24} strokeWidth={2} />
                <div className="text-xs text-gray-500 mt-1">{item.name.charAt(0)}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowFullReport(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            Full Report
          </button>
        </div>

        {/* Full Report Modal */}
        {showFullReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">PromptScore Report</h2>
                    <p className="text-gray-600">Detailed AI evaluation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Overall Score */}
              <div className="text-center mb-8">
                <CircularProgress value={averageScore} size={80} strokeWidth={6} />
                <p className="text-lg font-semibold text-gray-800 mt-3">Overall Score</p>
                <p className="text-sm text-gray-600">Out of 10</p>
              </div>

              {/* Individual Scores */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {scoreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className={`text-xl font-bold mb-1 ${getScoreTextColor(item.value)}`}>
                        {item.value}
                      </div>
                      <div className="text-sm font-medium text-gray-800 mb-1">{item.name}</div>
                      <div className="text-xs text-gray-500 leading-tight">{item.description}</div>
                    </div>
                  );
                })}
              </div>

              {/* Critique */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-black mb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>AI Critique</span>
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">{score.critique}</p>
              </div>

              {/* Scoring Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Scores generated by GPT-4 evaluation system
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Original full-size layout
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">PromptScore</h2>
          <p className="text-gray-600">AI-powered evaluation</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${getScoreColor(averageScore)} text-white text-3xl font-bold mb-3 shadow-sm`}>
          {averageScore}
        </div>
        <p className="text-lg font-semibold text-gray-800">Overall Score</p>
        <p className="text-sm text-gray-600">Out of 10</p>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {scoreItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getScoreTextColor(item.value)}`}>
                {item.value}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">{item.name}</div>
              <div className="text-xs text-gray-500 leading-tight">{item.description}</div>
            </div>
          );
        })}
      </div>

      {/* Critique */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-black mb-3 flex items-center space-x-2">
          <Award className="w-4 h-4" />
          <span>AI Critique</span>
        </h3>
        <p className="text-gray-700 leading-relaxed">{score.critique}</p>
      </div>

      {/* Scoring Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Scores are generated by GPT-4 evaluation system • Updated in real-time
        </p>
      </div>
    </div>
  );
};

export default PromptScore;