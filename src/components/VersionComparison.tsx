import React from 'react';
import { GitCompare, ArrowRight } from 'lucide-react';
import { PromptVersion, ModelRun } from '../types';

interface VersionComparisonProps {
  versions: PromptVersion[];
  runs: ModelRun[];
  selectedVersions: string[];
  onVersionSelect: (versionId: string) => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  versions,
  runs,
  selectedVersions,
  onVersionSelect
}) => {
  const getVersionRuns = (versionId: string) => {
    return runs.filter(run => run.versionId === versionId);
  };

  const getAverageScore = (versionId: string) => {
    const versionRuns = getVersionRuns(versionId);
    const scoresWithData = versionRuns.filter(run => run.score);
    
    if (scoresWithData.length === 0) return null;
    
    const avgScore = scoresWithData.reduce((sum, run) => sum + run.score!.overall, 0) / scoresWithData.length;
    return Math.round(avgScore * 10) / 10;
  };

  const compareVersions = versions.filter(v => selectedVersions.includes(v.id));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">Version Comparison</span>
          <span className="text-sm text-gray-500">({selectedVersions.length} selected)</span>
        </div>
      </div>

      <div className="p-4">
        {selectedVersions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GitCompare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select versions to compare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {compareVersions.map((version, index) => {
              const avgScore = getAverageScore(version.id);
              const versionRuns = getVersionRuns(version.id);
              
              return (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{version.title}</h3>
                      <p className="text-sm text-gray-500">
                        {version.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {avgScore && (
                        <div className="text-lg font-bold text-gray-900">
                          {avgScore}/10
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {versionRuns.length} runs
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 font-mono">
                      {version.content}
                    </p>
                  </div>
                  
                  {version.variables && Object.keys(version.variables).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(version.variables).map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded"
                        >
                          <code className="text-gray-600">{key}:</code>
                          <span className="ml-1 text-gray-800">{value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {index < compareVersions.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionComparison;