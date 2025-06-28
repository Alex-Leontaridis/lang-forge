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