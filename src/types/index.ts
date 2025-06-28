export interface PromptVersion {
  id: string;
  title: string;
  content: string;
  variables: Record<string, string>;
  createdAt: Date;
  parentId?: string;
  message?: string;
}

export interface ModelRun {
  id: string;
  versionId: string;
  modelId: string;
  output: string;
  score?: PromptScore;
  executionTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  createdAt: Date;
}

export interface PromptScore {
  relevance: number;
  clarity: number;
  creativity: number;
  overall: number;
  critique: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  enabled: boolean;
}

export interface Variable {
  name: string;
  value: string;
  description?: string;
}

// New types for Prompt Chaining Canvas
export interface PromptNode {
  id: string;
  title: string;
  prompt: string;
  model: string;
  output: string;
  isRunning: boolean;
  score?: PromptScore;
  position: { x: number; y: number };
  variables: Record<string, string>;
}

export interface ChainEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PromptChain {
  id: string;
  name: string;
  nodes: PromptNode[];
  edges: ChainEdge[];
  createdAt: Date;
  updatedAt: Date;
}