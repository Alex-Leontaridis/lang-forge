import { Edge } from 'reactflow';

export interface PromptVersion {
  id: string;
  projectId: string;
  promptId: string; // Reference to the parent prompt
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
  logo?: string;
}

export interface Variable {
  name: string;
  value: string;
  description?: string;
  type?: 'string' | 'int' | 'float' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
}

// Enhanced types for Variable Management
export interface InputVariable {
  name: string;
  type: 'string' | 'int' | 'float' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  required: boolean;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
}

export interface OutputVariable {
  name: string;
  type: 'string' | 'int' | 'float' | 'boolean' | 'array' | 'object';
  description?: string;
  source: string; // Which node/operation produces this output
}

export interface VariableFlow {
  fromNode: string;
  toNode: string;
  fromVariable: string;
  toVariable: string;
  type: 'direct' | 'transformed' | 'conditional';
}

export interface ChainHealthIssue {
  type: 'undeclared_variable' | 'unused_input' | 'dangling_output' | 'disconnected_node' | 'unsupported_config';
  severity: 'warning' | 'error';
  message: string;
  nodeId?: string;
  variableName?: string;
  details?: any;
}

// Enhanced types for Prompt Chaining Canvas
export interface PromptNode {
  id: string;
  title: string;
  prompt: string;
  model: string;
  temperature?: number;
  output: string;
  isRunning: boolean;
  score?: PromptScore;
  position: { x: number; y: number };
  variables: Record<string, string>;
  inputVariables: InputVariable[]; // Explicit input variable declarations
  outputVariables: OutputVariable[]; // Expected output variables
  condition?: string; // For conditional logic
  error?: string;
  executionTime?: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  healthIssues?: ChainHealthIssue[]; // Health validation issues for this node
  autoTestResult?: AutoTestResult; // Auto-test results for this node
}

export interface ChainEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  style?: any;
  labelStyle?: any;
  condition?: ConnectionCondition;
}

export interface ConnectionCondition {
  enabled: boolean;
  type: 'output_contains' | 'variable_equals' | 'token_count' | 'score_threshold' | 'custom';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'not_equals';
  value: string;
  variable?: string; // For variable-based conditions
  field?: string; // For score-based conditions (e.g., 'overall', 'relevance')
}

// Custom edge type that extends ReactFlow Edge
export type ConditionalEdge = Edge & {
  condition?: ConnectionCondition;
};

export interface PromptChain {
  id: string;
  name: string;
  nodes: PromptNode[];
  edges: ChainEdge[];
  createdAt: Date;
  updatedAt: Date;
  variableFlows: VariableFlow[]; // Track variable flow between nodes
  healthIssues: ChainHealthIssue[]; // Chain-level health issues
}

// Auto-Test related types
export interface TestCase {
  id: string;
  input: Record<string, string>;
  expectedOutput: string;
  description: string;
}

export interface TestResult {
  testCase: TestCase;
  actualOutput: string;
  modelId: string;
  modelName: string;
  passed: boolean;
  evaluation: {
    followsInstructions: boolean;
    toneStyleAligned: boolean;
    constraintsRespected: boolean;
    overallPassed: boolean;
    critique: string;
  };
  executionTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

export interface AutoTestResult {
  prompt: string;
  testCases: TestCase[];
  results: TestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallPassed: boolean;
    averageScore: number;
    modelResults: Record<string, { passed: number; failed: number; total: number }>;
  };
}

// New interface for managing prompts within a project
export interface Prompt {
  id: string;
  projectId: string;
  title: string;
  description?: string;
}