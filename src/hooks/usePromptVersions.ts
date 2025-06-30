import { useState, useCallback, useEffect, useMemo } from 'react';
import { PromptVersion, ModelRun } from '../types';

export const usePromptVersions = (projectId?: string, promptId?: string) => {
  // State to force re-renders when versions are updated
  const [versionUpdateTrigger, setVersionUpdateTrigger] = useState(0);
  
  // Use useMemo to recalculate versions when promptId changes
  const versions = useMemo(() => {
    const saved = localStorage.getItem('promptVersions');
    if (saved) {
      const parsed = JSON.parse(saved);
      let filteredVersions = parsed;
      
      // Filter by project
      if (projectId) {
        filteredVersions = parsed.filter((v: any) => v.projectId === projectId);
      }
      
      // Filter by prompt if specified
      if (promptId) {
        filteredVersions = filteredVersions.filter((v: any) => v.promptId === promptId);
      }
      
      return filteredVersions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
    }
    return [];
  }, [projectId, promptId, versionUpdateTrigger]);

  // Use useMemo to recalculate runs when versions change
  const runs = useMemo(() => {
    const saved = localStorage.getItem('modelRuns');
    if (saved) {
      const parsed = JSON.parse(saved);
      const projectRuns = parsed.filter((r: any) => {
        const version = versions.find((v: PromptVersion) => v.id === r.versionId);
        return version && version.projectId === projectId && version.promptId === promptId;
      });
      return projectRuns.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }));
    }
    return [];
  }, [versions, projectId, promptId]);

  // State for current version ID
  const [currentVersionId, setCurrentVersionId] = useState<string>('');

  // Effect to set current version ID when promptId changes
  useEffect(() => {
    if (promptId) {
      const savedCurrentVersionId = localStorage.getItem(`currentVersionId_${projectId || 'global'}_${promptId}`);
      if (savedCurrentVersionId && versions.some((v: PromptVersion) => v.id === savedCurrentVersionId)) {
        setCurrentVersionId(savedCurrentVersionId);
      } else if (versions.length > 0) {
        setCurrentVersionId(versions[0].id);
      } else {
        setCurrentVersionId('');
      }
    } else {
      setCurrentVersionId('');
    }
  }, [promptId, projectId, versions]);

  // Persist current version ID to localStorage
  useEffect(() => {
    if (currentVersionId && promptId) {
      localStorage.setItem(`currentVersionId_${projectId || 'global'}_${promptId}`, currentVersionId);
    }
  }, [currentVersionId, projectId, promptId]);

  const createVersion = useCallback((content: string, variables: Record<string, string>, title?: string, message?: string) => {
    if (!projectId || !promptId) {
      console.warn('Cannot create version without projectId and promptId');
      return null;
    }
    
    const newVersion: PromptVersion = {
      id: `v${Date.now()}`,
      projectId,
      promptId,
      title: title || `Version ${versions.length + 1}`,
      content,
      variables,
      createdAt: new Date(),
      parentId: currentVersionId,
      message: message || 'New version created'
    };
    
    // Save to localStorage
    const saved = localStorage.getItem('promptVersions');
    const allVersions = saved ? JSON.parse(saved) : [];
    allVersions.push(newVersion);
    localStorage.setItem('promptVersions', JSON.stringify(allVersions));
    
    // Update current version ID
    setCurrentVersionId(newVersion.id);
    
    // Force a re-render
    setVersionUpdateTrigger(prev => prev + 1);
    
    return newVersion;
  }, [versions.length, currentVersionId, projectId, promptId]);

  const getCurrentVersion = useCallback(() => {
    if (versions.length === 0) {
      return null;
    }
    return versions.find((v: PromptVersion) => v.id === currentVersionId) || versions[0];
  }, [versions, currentVersionId]);

  const addRun = useCallback((run: Omit<ModelRun, 'id' | 'createdAt'>) => {
    const newRun: ModelRun = {
      ...run,
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    // Save to localStorage
    const saved = localStorage.getItem('modelRuns');
    const allRuns = saved ? JSON.parse(saved) : [];
    allRuns.push(newRun);
    localStorage.setItem('modelRuns', JSON.stringify(allRuns));
    
    return newRun;
  }, []);

  const getRunsForVersion = useCallback((versionId: string) => {
    return runs.filter((run: ModelRun) => run.versionId === versionId);
  }, [runs]);

  const updateVersion = useCallback((id: string, updates: Partial<PromptVersion>) => {
    // Update in localStorage
    const saved = localStorage.getItem('promptVersions');
    if (saved) {
      const allVersions = JSON.parse(saved);
      const updatedVersions = allVersions.map((v: any) => 
        v.id === id ? { ...v, ...updates } : v
      );
      localStorage.setItem('promptVersions', JSON.stringify(updatedVersions));
      
      // Force a re-render by incrementing the trigger
      setVersionUpdateTrigger(prev => prev + 1);
    }
  }, []);

  const deleteVersion = useCallback((id: string) => {
    if (versions.length <= 1) return; // Don't delete the last version
    
    // Remove from localStorage
    const saved = localStorage.getItem('promptVersions');
    if (saved) {
      const allVersions = JSON.parse(saved);
      const remainingVersions = allVersions.filter((v: any) => v.id !== id);
      localStorage.setItem('promptVersions', JSON.stringify(remainingVersions));
    }
    
    // Remove runs for this version
    const savedRuns = localStorage.getItem('modelRuns');
    if (savedRuns) {
      const allRuns = JSON.parse(savedRuns);
      const remainingRuns = allRuns.filter((r: any) => r.versionId !== id);
      localStorage.setItem('modelRuns', JSON.stringify(remainingRuns));
    }
    
    // If we're deleting the current version, switch to the first available version
    if (currentVersionId === id) {
      const remainingVersions = versions.filter((v: PromptVersion) => v.id !== id);
      if (remainingVersions.length > 0) {
        setCurrentVersionId(remainingVersions[0].id);
      }
    }
    
    // Force a re-render
    setVersionUpdateTrigger(prev => prev + 1);
  }, [versions, currentVersionId]);

  const duplicateVersion = useCallback((id: string) => {
    const versionToDuplicate = versions.find((v: PromptVersion) => v.id === id);
    if (!versionToDuplicate) return;

    const newVersion: PromptVersion = {
      ...versionToDuplicate,
      id: `v${Date.now()}`,
      title: `${versionToDuplicate.title} (Copy)`,
      createdAt: new Date(),
      parentId: id,
      message: 'Version duplicated'
    };

    // Save to localStorage
    const saved = localStorage.getItem('promptVersions');
    const allVersions = saved ? JSON.parse(saved) : [];
    allVersions.push(newVersion);
    localStorage.setItem('promptVersions', JSON.stringify(allVersions));
    
    // Force a re-render
    setVersionUpdateTrigger(prev => prev + 1);
    
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