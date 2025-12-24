export interface ArtResult {
  rationale: string;
  html: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  result: ArtResult;
  timestamp: number;
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
