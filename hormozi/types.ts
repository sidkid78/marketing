
export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  FEAR_NEUTRALIZER = 'FEAR_NEUTRALIZER',
  LIFE_CYCLE = 'LIFE_CYCLE',
  BUSINESS_VALIDATOR = 'BUSINESS_VALIDATOR',
  BRAND_MOSAIC = 'BRAND_MOSAIC',
  CULTURE_COACH = 'CULTURE_COACH',
  MENTOR = 'MENTOR'
}

export interface FearScenario {
  id: string;
  step: string;
  impact: string;
  mitigation: string;
}

export interface BusinessIdea {
  name: string;
  category: 'Pain' | 'Profession' | 'Passion';
  description: string;
  score: number;
  isMissionary?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
