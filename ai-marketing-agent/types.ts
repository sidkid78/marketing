
export type MarketingGoal = 'lead_generation' | 'brand_awareness' | 'website_traffic' | 'engagement' | 'sales_conversions';

export type Platform = 'facebook' | 'instagram' | 'linkedin' | 'twitter_x' | 'google_ads' | 'tiktok';

export interface UserInput {
  goals: MarketingGoal[];
  platforms: Platform[];
  demographics: {
    age_range: string;
    gender: string;
    location: string;
  };
  brand_offer_details: string;
  audience_interests?: string;
  campaign_budget?: number;
  timeline?: {
    start_date?: string;
    end_date?: string;
  };
  kpis?: string[];
}

export interface BudgetAllocation {
  category: string;
  percentage: number;
  rationale: string;
}

export interface Strategy {
  goal: MarketingGoal;
  platform: Platform;
  strategy_title: string;
  summary: string;
  recommendations: string[];
  targeting_suggestions: string[];
  creative_asset_ideas: string[];
  budget_allocation: BudgetAllocation[];
  rationale: string;
  kpis: string[];
}

export interface ContentIdeaItem {
  headline: string;
  visual_direction: string;
  caption: string;
  cta: string;
  hashtag_suggestions: string[];
}

export interface ContentIdea {
  platform: Platform;
  goal: MarketingGoal;
  ideas: ContentIdeaItem[];
}

export interface PerformanceData {
  metrics: Record<string, number>;
  past_metrics?: Record<string, number>;
}

export interface MetricAnalysisItem {
  metric: string;
  label: string;
  value: number;
  status: 'Excellent' | 'On Target' | 'Needs Attention';
  flag: 'good' | 'on_target' | 'warning';
  message: string;
}

export interface PerformanceAnalysis {
  goal: MarketingGoal;
  platform: Platform;
  summary: string;
  analysis: MetricAnalysisItem[];
  adjustment_recommendations: string[];
}
