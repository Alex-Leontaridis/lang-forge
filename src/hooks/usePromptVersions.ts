import { useState, useCallback, useEffect } from 'react';
import { PromptVersion, ModelRun } from '../types';

export const usePromptVersions = () => {
  const [versions, setVersions] = useState<PromptVersion[]>(() => {
    const saved = localStorage.getItem('promptVersions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
    }
    return [{
      id: 'v1',
      title: 'Initial Version',
      content: 'Write a {{style}} email to {{recipient}} about {{topic}}.',
      variables: { style: 'professional', recipient: 'team', topic: 'project update' },
      createdAt: new Date(Date.now() - 86400000),
      message: 'Initial prompt creation'
    }];
  });
  
  const [runs, setRuns] = useState<ModelRun[]>(() => {
    const saved = localStorage.getItem('modelRuns');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }
    return [];
  });
  
  const [currentVersionId, setCurrentVersionId] = useState<string>(() => {
    const saved = localStorage.getItem('currentVersionId');
    return saved || 'v1';
  });

  // Persist versions to localStorage
  useEffect(() => {
    localStorage.setItem('promptVersions', JSON.stringify(versions));
  }, [versions]);

  // Persist runs to localStorage
  useEffect(() => {
    localStorage.setItem('modelRuns', JSON.stringify(runs));
  }, [runs]);

  // Persist current version ID to localStorage
  useEffect(() => {
    localStorage.setItem('currentVersionId', currentVersionId);
  }, [currentVersionId]);

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

  const deleteVersion = useCallback((id: string) => {
    if (versions.length <= 1) return; // Don't delete the last version
    
    setVersions(prev => prev.filter(v => v.id !== id));
    setRuns(prev => prev.filter(r => r.versionId !== id));
    
    // If we're deleting the current version, switch to the first available version
    if (currentVersionId === id) {
      const remainingVersions = versions.filter(v => v.id !== id);
      if (remainingVersions.length > 0) {
        setCurrentVersionId(remainingVersions[0].id);
      }
    }
  }, [versions, currentVersionId]);

  const duplicateVersion = useCallback((id: string) => {
    const versionToDuplicate = versions.find(v => v.id === id);
    if (!versionToDuplicate) return;

    const newVersion: PromptVersion = {
      ...versionToDuplicate,
      id: `v${Date.now()}`,
      title: `${versionToDuplicate.title} (Copy)`,
      createdAt: new Date(),
      parentId: id,
      message: 'Version duplicated'
    };

    setVersions(prev => [...prev, newVersion]);
    return newVersion;
  }, [versions]);

  return {
    versions,
    runs,
    currentVersionId,
    setCurrentVersionId,
    createVersion,
    getCurrentVersion,
    addRun,
    getRunsForVersion,
    updateVersion,
    deleteVersion,
    duplicateVersion
  };
};