import { useState, useCallback, useEffect } from 'react';
import { Prompt } from '../types';

export const usePrompts = (projectId?: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('prompts');
    if (saved) {
      const parsed = JSON.parse(saved);
      const projectPrompts = projectId 
        ? parsed.filter((p: any) => p.projectId === projectId)
        : parsed;
      return projectPrompts;
    }
    return [];
  });
  
  const [currentPromptId, setCurrentPromptId] = useState<string>(() => {
    const saved = localStorage.getItem(`currentPromptId_${projectId || 'global'}`);
    if (saved) {
      return saved;
    }
    const savedPrompts = localStorage.getItem('prompts');
    if (!savedPrompts) {
      return '';
    }
    const parsed = JSON.parse(savedPrompts);
    const projectPrompts = projectId 
      ? parsed.filter((p: any) => p.projectId === projectId)
      : parsed;
    return projectPrompts.length > 0 ? projectPrompts[0].id : '';
  });

  useEffect(() => {
    const saved = localStorage.getItem('prompts');
    const allPrompts = saved ? JSON.parse(saved) : [];
    const otherPrompts = allPrompts.filter((p: any) => p.projectId !== projectId);
    const updatedPrompts = [...otherPrompts, ...prompts];
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
  }, [prompts, projectId]);

  useEffect(() => {
    localStorage.setItem(`currentPromptId_${projectId || 'global'}`, currentPromptId);
  }, [currentPromptId, projectId]);

  const createPrompt = useCallback((title: string, description?: string) => {
    if (!projectId) {
      console.warn('Cannot create prompt without projectId');
      return null;
    }
    const newPrompt: Prompt = {
      id: `p${Date.now()}`,
      projectId,
      title,
      description: description || '',
      createdAt: new Date()
    };
    setPrompts(prev => [...prev, newPrompt]);
    setCurrentPromptId(newPrompt.id);
    
    const initialVersion = {
      id: `v${Date.now()}`,
      projectId,
      promptId: newPrompt.id,
      title: 'Initial Version',
      content: '',
      variables: {},
      createdAt: new Date(),
      parentId: '',
      message: 'Initial version created'
    };
    
    const savedVersions = localStorage.getItem('promptVersions');
    const allVersions = savedVersions ? JSON.parse(savedVersions) : [];
    allVersions.push(initialVersion);
    localStorage.setItem('promptVersions', JSON.stringify(allVersions));
    
    localStorage.setItem(`currentVersionId_${projectId}_${newPrompt.id}`, initialVersion.id);
    
    return newPrompt;
  }, [projectId]);

  const getCurrentPrompt = useCallback(() => {
    if (prompts.length === 0) {
      return null;
    }
    return prompts.find(p => p.id === currentPromptId) || prompts[0];
  }, [prompts, currentPromptId]);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePrompt = useCallback((id: string) => {
    if (prompts.length <= 1) return;
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (currentPromptId === id) {
      const remainingPrompts = prompts.filter(p => p.id !== id);
      if (remainingPrompts.length > 0) {
        setCurrentPromptId(remainingPrompts[0].id);
      }
    }
    
    const savedVersions = localStorage.getItem('promptVersions');
    if (savedVersions) {
      const allVersions = JSON.parse(savedVersions);
      const remainingVersions = allVersions.filter((v: any) => v.promptId !== id);
      localStorage.setItem('promptVersions', JSON.stringify(remainingVersions));
    }
    
    const savedRuns = localStorage.getItem('modelRuns');
    if (savedRuns) {
      const allRuns = JSON.parse(savedRuns);
      const promptVersions = allVersions?.filter((v: any) => v.promptId === id) || [];
      const promptVersionIds = promptVersions.map((v: any) => v.id);
      const remainingRuns = allRuns.filter((r: any) => !promptVersionIds.includes(r.versionId));
      localStorage.setItem('modelRuns', JSON.stringify(remainingRuns));
    }
  }, [prompts, currentPromptId]);

  const duplicatePrompt = useCallback((id: string) => {
    const promptToDuplicate = prompts.find(p => p.id === id);
    if (!promptToDuplicate) return;
    const newPrompt: Prompt = {
      ...promptToDuplicate,
      id: `p${Date.now()}`,
      title: `${promptToDuplicate.title} (Copy)`,
      createdAt: new Date()
    };
    setPrompts(prev => [...prev, newPrompt]);
    setCurrentPromptId(newPrompt.id);
    
    const savedVersions = localStorage.getItem('promptVersions');
    if (savedVersions) {
      const allVersions = JSON.parse(savedVersions);
      const originalVersions = allVersions.filter((v: any) => v.promptId === id);
      const currentOriginalVersion = originalVersions.find((v: any) => 
        v.id === localStorage.getItem(`currentVersionId_${projectId}_${id}`)
      ) || originalVersions[0];
      
      if (currentOriginalVersion) {
        const duplicatedVersion = {
          ...currentOriginalVersion,
          id: `v${Date.now()}`,
          promptId: newPrompt.id,
          title: `${currentOriginalVersion.title} (Copy)`,
          createdAt: new Date(),
          parentId: '',
          message: 'Version duplicated from original prompt'
        };
        
        allVersions.push(duplicatedVersion);
        localStorage.setItem('promptVersions', JSON.stringify(allVersions));
        localStorage.setItem(`currentVersionId_${projectId}_${newPrompt.id}`, duplicatedVersion.id);
      }
    }
    
    return newPrompt;
  }, [prompts, projectId]);

  const selectPrompt = useCallback((promptId: string) => {
    setCurrentPromptId(promptId);
  }, []);

  return {
    prompts,
    currentPromptId,
    setCurrentPromptId,
    createPrompt,
    getCurrentPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    selectPrompt
  };
}; 