export interface Metric {
  name: string;
  value: number | string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface TweetDraft {
  content: string;
  hashtags: string[];
  type: 'statistic' | 'infographic_caption' | 'reply' | 'thread';
}

export interface VisualConcept {
  description: string;
  imageBase64?: string;
}

export interface Account {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'active' | 'connected';
}

export interface ScheduledTweet {
  id: string;
  content: string;
  handle: string;
  avatar: string;
  scheduledAt: string;
  status: 'pending' | 'posted';
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  CONTENT_GENERATOR = 'CONTENT_GENERATOR',
  VISUALS = 'VISUALS',
  ENGAGEMENT = 'ENGAGEMENT',
  ACCOUNTS = 'ACCOUNTS',
  SCHEDULE = 'SCHEDULE'
}
