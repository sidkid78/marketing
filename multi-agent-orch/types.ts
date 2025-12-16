export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  name: string;
  prompt: string;
  dependencies: string[];
  priority: TaskPriority;
  model: string;
  tools: string[];
  estimatedTokens: number;
}

export interface TaskPlan {
  goal: string;
  strategy: string;
  tasks: SubTask[];
  parallelGroups: string[][];
  successCriteria: string;
}

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  output: string;
  artifacts?: string[];
  tokenUsage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  durationMs: number;
  error?: string;
}

export interface OrchestratorResult {
  success: boolean;
  summary: string;
  taskResults: TaskResult[];
  totalTokens: number;
  totalDurationMs: number;
  artifacts?: string[];
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}