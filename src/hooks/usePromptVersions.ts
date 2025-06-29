import { useState, useCallback } from 'react';
import { PromptVersion, ModelRun } from '../types';

export const usePromptVersions = () => {
  const [versions, setVersions] = useState<PromptVersion[]>([
    {
      id: 'v1',
      title: 'Initial Version',
      content: 'Write a {{style}} email to {{recipient}} about {{topic}}.',
      variables: { style: 'professional', recipient: 'team', topic: 'project update' },
      createdAt: new Date(Date.now() - 86400000),
      message: 'Initial prompt creation'
    }
  ]);
  
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('v1');

  const createVersion = useCallback((content: string, variables: Record<string, string>, title?: string, message?: string) => {
    const newVersion: PromptVersion = {
      id: `v${Date.now()}`,
      title: title || `Version ${versions.length + 1}`,
      content,
      variables,
      createdAt: new Date(),
      parentId: currentVersionId,
      message: message || 'New version created'
    };
    
    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionId(newVersion.id);
    return newVersion;
  }, [versions.length, currentVersionId]);

  const getCurrentVersion = useCallback(() => {
    return versions.find(v => v.id === currentVersionId) || versions[0];
  }, [versions, currentVersionId]);

  const addRun = useCallback((run: Omit<ModelRun, 'id' | 'createdAt'>) => {
    const newRun: ModelRun = {
      ...run,
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setRuns(prev => [...prev, newRun]);
    return newRun;
  }, []);

  const getRunsForVersion = useCallback((versionId: string) => {
    return runs.filter(run => run.versionId === versionId);
  }, [runs]);

  const updateVersion = useCallback((id: string, updates: Partial<PromptVersion>) => {
    setVersions(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  return {
    versions,
    runs,
    currentVersionId,
    setCurrentVersionId,
    createVersion,
    getCurrentVersion,
    addRun,
    getRunsForVersion,
    updateVersion
  };
};