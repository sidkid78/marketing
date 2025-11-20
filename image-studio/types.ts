export enum WorkflowStatus {
    IDLE = 'IDLE',
    OPTIMIZING = 'OPTIMIZING',
    GENERATING = 'GENERATING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
  }
  
  export interface GeneratedImage {
    id: string;
    url: string;
  }
  
  export interface WorkflowState {
    status: WorkflowStatus;
    originalPrompt: string;
    optimizedPrompt: string;
    images: GeneratedImage[];
    error?: string;
  }