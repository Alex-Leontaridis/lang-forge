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
      return projectPrompts.map((p: any) => ({
        ...p
      }));
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
      description
    };
    setPrompts(prev => [...prev, newPrompt]);
    setCurrentPromptId(newPrompt.id);
    return newPrompt;
  }, [projectId]);

  const getCurrentPrompt = useCallback(() => {
    if (prompts.length === 0) {
      return null;
    }
    return prompts.find(p => p.id === currentPromptId) || prompts[0];
  }, [prompts, currentPromptId]);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates }
        : p
    ));
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
  }, [prompts, currentPromptId]);

  const duplicatePrompt = useCallback((id: string) => {
    const promptToDuplicate = prompts.find(p => p.id === id);
    if (!promptToDuplicate) return;
    const newPrompt: Prompt = {
      ...promptToDuplicate,
      id: `p${Date.now()}`,
      title: `${promptToDuplicate.title} (Copy)`
    };
    setPrompts(prev => [...prev, newPrompt]);
    setCurrentPromptId(newPrompt.id);
    return newPrompt;
  }, [prompts]);

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