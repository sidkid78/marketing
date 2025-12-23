
export enum PromptLevel {
  SIMPLE = 'SIMPLE',
  WORKFLOW = 'WORKFLOW',
  CONTROL_FLOW = 'CONTROL_FLOW',
  DELEGATION = 'DELEGATION',
  MULTI_AGENT = 'MULTI_AGENT',
  AUTONOMOUS = 'AUTONOMOUS',
}

export interface PromptVariable {
  name: string;
  variable_type: string;
  description: string;
  required: boolean;
}

export interface WorkflowStep {
  step_number: number;
  title: string;
  description: string;
}

export interface PromptMetadata {
  recommended_model: string;
  temperature: number;
  thinking_budget?: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PromptAnalysis {
  task_summary: string;
  identified_requirements: string[];
  recommended_level: PromptLevel;
  recommended_target_model: string;
  suggested_tools?: string[];
  complexity_factors: string[];
  potential_challenges: string[];
  grounding_sources?: GroundingSource[];
}

export interface GeneratedPrompt {
  title: string;
  level: PromptLevel;
  purpose: string;
  variables: PromptVariable[];
  workflow: WorkflowStep[];
  design_rationale: string;
  rendered_prompt: string;
  metadata: PromptMetadata;
}

export interface AgentResponse {
  agent_role: string;
  content: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  metadata?: any;
}

export interface WorkflowState {
  analysis?: PromptAnalysis;
  generation?: GeneratedPrompt;
  review?: string;
  isProcessing: boolean;
  currentStep: number;
  error?: string;
}
