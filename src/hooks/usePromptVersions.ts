import { useState, useCallback, useEffect } from 'react';
import { PromptVersion, ModelRun } from '../types';

export const usePromptVersions = (projectId?: string) => {
  const [versions, setVersions] = useState<PromptVersion[]>(() => {
    const saved = localStorage.getItem('promptVersions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const projectVersions = projectId 
        ? parsed.filter((v: any) => v.projectId === projectId)
        : parsed;
      return projectVersions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
    }
    return [];
  });
  
  const [runs, setRuns] = useState<ModelRun[]>(() => {
    const saved = localStorage.getItem('modelRuns');
    if (saved) {
      const parsed = JSON.parse(saved);
      const projectRuns = projectId 
        ? parsed.filter((r: any) => {
            const version = versions.find(v => v.id === r.versionId);
            return version && version.projectId === projectId;
          })
        : parsed;
      return projectRuns.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }
    return [];
  });
  
  const [currentVersionId, setCurrentVersionId] = useState<string>(() => {
    const saved = localStorage.getItem(`currentVersionId_${projectId || 'global'}`);
    if (saved) {
      return saved;
    }
    // If no saved version ID and no versions exist, return empty string
    const savedVersions = localStorage.getItem('promptVersions');
    if (!savedVersions) {
      return '';
    }
    // If there are saved versions for this project, use the first one
    const parsed = JSON.parse(savedVersions);
    const projectVersions = projectId 
      ? parsed.filter((v: any) => v.projectId === projectId)
      : parsed;
    return projectVersions.length > 0 ? projectVersions[0].id : '';
  });

  // Persist versions to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('promptVersions');
    const allVersions = saved ? JSON.parse(saved) : [];
    
    // Update versions for this project
    const otherVersions = allVersions.filter((v: any) => v.projectId !== projectId);
    const updatedVersions = [...otherVersions, ...versions];
    
    localStorage.setItem('promptVersions', JSON.stringify(updatedVersions));
  }, [versions, projectId]);

  // Persist runs to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('modelRuns');
    const allRuns = saved ? JSON.parse(saved) : [];
    
    // Update runs for this project's versions
    const otherRuns = allRuns.filter((r: any) => {
      const version = versions.find(v => v.id === r.versionId);
      return !version || version.projectId !== projectId;
    });
    const updatedRuns = [...otherRuns, ...runs];
    
    localStorage.setItem('modelRuns', JSON.stringify(updatedRuns));
  }, [runs, versions, projectId]);

  // Persist current version ID to localStorage
  useEffect(() => {
    localStorage.setItem(`currentVersionId_${projectId || 'global'}`, currentVersionId);
  }, [currentVersionId, projectId]);

  const createVersion = useCallback((content: string, variables: Record<string, string>, title?: string, message?: string) => {
    if (!projectId) {
      console.warn('Cannot create version without projectId');
      return null;
    }
    
    const newVersion: PromptVersion = {
      id: `v${Date.now()}`,
      projectId,
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
  }, [versions.length, currentVersionId, projectId]);

  const getCurrentVersion = useCallback(() => {
    if (versions.length === 0) {
      return null;
    }
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