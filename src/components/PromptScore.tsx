import React from 'react';
import { Award, Target, Eye, Sparkles } from 'lucide-react';

interface PromptScoreProps {
  score: {
    relevance: number;
    clarity: number;
    creativity: number;
    critique: string;
  };
}

const PromptScore: React.FC<PromptScoreProps> = ({ score }) => {
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

  const averageScore = Math.round((score.relevance + score.clarity + score.creativity) / 3 * 10) / 10;

  const CircularProgress = ({ value, size = 40, strokeWidth = 3 }: { value: number; size?: number; strokeWidth?: number }) => {
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
        <span className={`absolute text-base font-bold ${getScoreTextColor(value)}`}>
          {value}
        </span>
      </div>
    );
  };

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
      </div>
      <div className="mt-2 text-xs text-gray-600 italic">{score.critique}</div>
    </>
  );
};

export default PromptScore;