import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts';
import { TrendingUp, BarChart3, Clock, Zap, Target, AlertTriangle } from 'lucide-react';
import { ModelRun, PromptVersion } from '../types';

interface AnalyticsProps {
  versions: PromptVersion[];
  runs: ModelRun[];
}

const Analytics: React.FC<AnalyticsProps> = ({ versions, runs }) => {
  // Prepare data for charts
  const scoreOverTimeData = versions.map(version => {
    const versionRuns = runs.filter(run => run.versionId === version.id && run.score);
    const avgScores = versionRuns.length > 0 ? {
      relevance: versionRuns.reduce((sum, run) => sum + run.score!.relevance, 0) / versionRuns.length,
      clarity: versionRuns.reduce((sum, run) => sum + run.score!.clarity, 0) / versionRuns.length,
      creativity: versionRuns.reduce((sum, run) => sum + run.score!.creativity, 0) / versionRuns.length,
    } : { relevance: 0, clarity: 0, creativity: 0 };

    return {
      version: version.title,
      ...avgScores,
      overall: (avgScores.relevance + avgScores.clarity + avgScores.creativity) / 3
    };
  });

  const modelComparisonData = runs.reduce((acc, run) => {
    if (!run.score) return acc;
    
    const existing = acc.find(item => item.model === run.modelId);
    if (existing) {
      existing.relevance = (existing.relevance + run.score.relevance) / 2;
      existing.clarity = (existing.clarity + run.score.clarity) / 2;
      existing.creativity = (existing.creativity + run.score.creativity) / 2;
      existing.count++;
    } else {
      acc.push({
        model: run.modelId.toUpperCase(),
        relevance: run.score.relevance,
        clarity: run.score.clarity,
        creativity: run.score.creativity,
        count: 1
      });
    }
    return acc;
  }, [] as any[]);

  const executionTimeData = versions.map(version => {
    const versionRuns = runs.filter(run => run.versionId === version.id);
    const avgTime = versionRuns.length > 0 
      ? versionRuns.reduce((sum, run) => sum + run.executionTime, 0) / versionRuns.length / 1000
      : 0;
    
    return {
      version: version.title,
      time: avgTime,
      runs: versionRuns.length
    };
  });

  const tokenUsageData = versions.map(version => {
    const versionRuns = runs.filter(run => run.versionId === version.id);
    const totalTokens = versionRuns.reduce((sum, run) => ({
      input: sum.input + run.tokenUsage.input,
      output: sum.output + run.tokenUsage.output
    }), { input: 0, output: 0 });

    return {
      version: version.title,
      input: totalTokens.input,
      output: totalTokens.output,
      total: totalTokens.input + totalTokens.output
    };
  });

  const failureRateData = versions.map(version => {
    const versionRuns = runs.filter(run => run.versionId === version.id && run.score);
    const failedRuns = versionRuns.filter(run => run.score!.overall < 6);
    const failureRate = versionRuns.length > 0 ? (failedRuns.length / versionRuns.length) * 100 : 0;

    return {
      version: version.title,
      failureRate,
      totalRuns: versionRuns.length
    };
  });

  const COLORS = ['#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Versions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{versions.length}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Runs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{runs.length}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {runs.length > 0 ? `${(runs.reduce((sum, run) => sum + run.executionTime, 0) / runs.length / 1000).toFixed(1)}s` : '0s'}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {runs.reduce((sum, run) => sum + run.tokenUsage.total, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PromptScore Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PromptScore Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="relevance" stroke="#000000" strokeWidth={2} name="Relevance" />
              <Line type="monotone" dataKey="clarity" stroke="#374151" strokeWidth={2} name="Clarity" />
              <Line type="monotone" dataKey="creativity" stroke="#6B7280" strokeWidth={2} name="Creativity" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance Comparison */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="relevance" fill="#000000" name="Relevance" />
              <Bar dataKey="clarity" fill="#374151" name="Clarity" />
              <Bar dataKey="creativity" fill="#6B7280" name="Creativity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Execution Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Execution Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}s`, 'Execution Time']} />
              <Bar dataKey="time" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tokenUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="input" stackId="1" stroke="#000000" fill="#000000" name="Input Tokens" />
              <Area type="monotone" dataKey="output" stackId="1" stroke="#374151" fill="#374151" name="Output Tokens" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Failure Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Failure Rate (Score &lt; 6)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={failureRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Failure Rate']} />
              <Line type="monotone" dataKey="failureRate" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Version Comparison Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Score Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="overall" fill="#000000" name="Overall Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;