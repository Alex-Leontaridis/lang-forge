import React, { useState, useEffect, useRef } from 'react';
import { GitCompare, ArrowRight, CheckCircle, Circle, Trash2, Copy, MoreVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { PromptVersion, ModelRun } from '../types';

interface VersionComparisonProps {
  versions: PromptVersion[];
  runs: ModelRun[];
  selectedVersions: string[];
  onVersionSelect: (versionId: string) => void;
  onDeleteVersion?: (versionId: string) => void;
  onDuplicateVersion?: (versionId: string) => void;
  collapsible?: boolean;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  versions,
  runs,
  selectedVersions,
  onVersionSelect,
  onDeleteVersion,
  onDuplicateVersion,
  collapsible = false
}) => {
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const getScoreBreakdown = (versionId: string) => {
    const versionRuns = getVersionRuns(versionId);
    const scoresWithData = versionRuns.filter(run => run.score);
    
    if (scoresWithData.length === 0) return null;
    
    return {
      relevance: scoresWithData.reduce((sum, run) => sum + run.score!.relevance, 0) / scoresWithData.length,
      clarity: scoresWithData.reduce((sum, run) => sum + run.score!.clarity, 0) / scoresWithData.length,
      creativity: scoresWithData.reduce((sum, run) => sum + run.score!.creativity, 0) / scoresWithData.length,
    };
  };

  const compareVersions = versions.filter(v => selectedVersions.includes(v.id));

  const handleVersionToggle = (versionId: string) => {
    onVersionSelect(versionId);
  };

  const handleDeleteVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteVersion && versions.length > 1) {
      onDeleteVersion(versionId);
    }
    setShowMenuFor(null);
  };

  const handleDuplicateVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateVersion) {
      onDuplicateVersion(versionId);
    }
    setShowMenuFor(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between cursor-pointer" onClick={() => collapsible && setCollapsed(v => !v)}>
        <div className="flex items-center space-x-2">
          {collapsible && (collapsed ? <ChevronRight className="w-5 h-5 text-gray-700" /> : <ChevronDown className="w-5 h-5 text-gray-700" />)}
          <GitCompare className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">Version Comparison</span>
          <span className="text-sm text-gray-500">({selectedVersions.length} selected)</span>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4">
          {selectedVersions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <GitCompare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select versions to compare</p>
              <p className="text-xs text-gray-400 mt-1">Click on version checkboxes to add them to comparison</p>
            </div>
          ) : (
            <div className="space-y-4">
              {compareVersions.map((version, index) => {
                const avgScore = getAverageScore(version.id);
                const scoreBreakdown = getScoreBreakdown(version.id);
                const versionRuns = getVersionRuns(version.id);
                return (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleVersionToggle(version.id)}
                          className="flex items-center space-x-2"
                        >
                          {selectedVersions.includes(version.id) ? (
                            <CheckCircle className="w-4 h-4 text-black" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">{version.title}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
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
                        {/* Version Actions Menu */}
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenuFor(showMenuFor === version.id ? null : version.id);
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {showMenuFor === version.id && (
                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              {onDuplicateVersion && (
                                <button
                                  onClick={(e) => handleDuplicateVersion(version.id, e)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Duplicate</span>
                                </button>
                              )}
                              {onDeleteVersion && versions.length > 1 && (
                                <button
                                  onClick={(e) => handleDeleteVersion(version.id, e)}
                                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 font-mono">
                        {version.content}
                      </p>
                    </div>
                    {scoreBreakdown && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">Relevance</div>
                          <div className="font-semibold">{scoreBreakdown.relevance.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">Clarity</div>
                          <div className="font-semibold">{scoreBreakdown.clarity.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="text-xs text-gray-500">Creativity</div>
                          <div className="font-semibold">{scoreBreakdown.creativity.toFixed(1)}</div>
                        </div>
                      </div>
                    )}
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
      )}
    </div>
  );
};

export default VersionComparison;