
export interface StrategistInput {
  userContext: string;
  targetAudience: string;
  outputStyle: string;
}

export interface StrategistOutput {
  thinkingProcess: string;
  painAnalysis: {
    frustration: string;
    storyAdvantage: string;
  };
  professionAnalysis: {
    provenEconomy: string;
    fractionalizationStrategy: string;
  };
  passionAnalysis: {
    obsessiveEdge: string;
    selfCorrection: string;
  };
  synthesis: {
    concept: string;
    markdown: string;
  };
  unfairAdvantage: string;
  imageUrl?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
