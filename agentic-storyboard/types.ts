export enum WorkflowStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface StoryScene {
  id: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  isAnimating?: boolean;
  isNarrating?: boolean;
}

export interface WorkflowState {
  status: WorkflowStatus;
  originalStory: string;
  scenes: StoryScene[];
  error?: string;
}