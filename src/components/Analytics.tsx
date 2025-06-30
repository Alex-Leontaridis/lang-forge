import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, Clock, Zap, Target, AlertTriangle, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { ModelRun, PromptVersion, AutoTestResult } from '../types';

interface AnalyticsProps {
  versions: PromptVersion[];
  runs: ModelRun[];
  autoTestResults?: AutoTestResult[];
}

const Analytics: React.FC<AnalyticsProps> = ({ versions, runs, autoTestResults = [] }) => {
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

  // Auto-test analytics data
  const autoTestSummary = {
    totalTests: autoTestResults.reduce((sum, result) => sum + result.summary.totalTests, 0),
    passedTests: autoTestResults.reduce((sum, result) => sum + result.summary.passedTests, 0),
    failedTests: autoTestResults.reduce((sum, result) => sum + result.summary.failedTests, 0),
    overallPassRate: autoTestResults.length > 0 
      ? (autoTestResults.reduce((sum, result) => sum + result.summary.passedTests, 0) / 
         autoTestResults.reduce((sum, result) => sum + result.summary.totalTests, 0)) * 100
      : 0
  };

  const autoTestModelPerformance = Object.entries(
    autoTestResults.reduce((acc, result) => {
      Object.entries(result.summary.modelResults).forEach(([modelId, stats]) => {
        if (!acc[modelId]) {
          acc[modelId] = { passed: 0, failed: 0, total: 0 };
        }
        acc[modelId].passed += stats.passed;
        acc[modelId].failed += stats.failed;
        acc[modelId].total += stats.total;
      });
      return acc;
    }, {} as Record<string, { passed: number; failed: number; total: number }>)
  ).map(([modelId, stats]) => ({
    model: modelId,
    passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
    totalTests: stats.total,
    passedTests: stats.passed,
    failedTests: stats.failed
  }));

  const autoTestPassFailData = [
    { name: 'Passed', value: autoTestSummary.passedTests, color: '#10b981' },
    { name: 'Failed', value: autoTestSummary.failedTests, color: '#ef4444' }
  ];

  const autoTestOverTimeData = versions.map(version => {
    const versionAutoTests = autoTestResults.filter(result => 
      result.prompt === version.content
    );
    const avgPassRate = versionAutoTests.length > 0 
      ? versionAutoTests.reduce((sum, result) => sum + (result.summary.passedTests / result.summary.totalTests * 100), 0) / versionAutoTests.length
      : 0;
    
    return {
      version: version.title,
      passRate: avgPassRate,
      totalTests: versionAutoTests.reduce((sum, result) => sum + result.summary.totalTests, 0)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Total Versions</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{versions.length}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Total Runs</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{runs.length}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Avg Response Time</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {runs.length > 0 ? `${(runs.reduce((sum, run) => sum + run.executionTime, 0) / runs.length / 1000).toFixed(1)}s` : '0s'}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Total Tokens</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {runs.reduce((sum, run) => sum + run.tokenUsage.total, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Auto-Test Summary Cards */}
      {autoTestResults.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Auto-Tests</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{autoTestSummary.totalTests}</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Passed Tests</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{autoTestSummary.passedTests}</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Failed Tests</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{autoTestSummary.failedTests}</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">Pass Rate</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {autoTestSummary.overallPassRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* PromptScore Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">PromptScore Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Model Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Prompt Execution Time</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Token Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Failure Rate (Score &lt; 6)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={failureRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Failure Rate']} />
              <Bar dataKey="failureRate" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Auto-Test Pass/Fail Distribution */}
        {autoTestResults.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Auto-Test Results Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={autoTestPassFailData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {autoTestPassFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Auto-Test Model Performance */}
        {autoTestResults.length > 0 && autoTestModelPerformance.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Auto-Test Model Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={autoTestModelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                <Bar dataKey="passRate" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Auto-Test Pass Rate Over Time */}
        {autoTestResults.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Auto-Test Pass Rate Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={autoTestOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="version" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                <Line type="monotone" dataKey="passRate" stroke="#8b5cf6" strokeWidth={2} name="Pass Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;