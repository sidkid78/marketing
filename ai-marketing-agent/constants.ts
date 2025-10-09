
import type { MarketingGoal, Platform } from './types';

export const MARKETING_GOALS: { id: MarketingGoal; label: string; description: string }[] = [
  { id: 'lead_generation', label: 'Lead Generation', description: 'Attract and capture potential customers interested in your products or services.' },
  { id: 'brand_awareness', label: 'Brand Awareness', description: 'Increase recognition and recall of your brand among your target audience.' },
  { id: 'website_traffic', label: 'Website Traffic', description: 'Drive users to visit your website or landing page.' },
  { id: 'engagement', label: 'Engagement', description: 'Encourage interactions (likes, shares, comments) with your content.' },
  { id: 'sales_conversions', label: 'Sales/Conversions', description: 'Generate actual sales or completed actions (purchases, signups, downloads).' },
];

export const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter_x', label: 'Twitter/X' },
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'tiktok', label: 'TikTok' },
];

export const PERFORMANCE_METRICS: Record<MarketingGoal, { id: string; label: string; description: string }[]> = {
  lead_generation: [
    { id: 'leads', label: 'Leads', description: 'Total number of new contacts captured.' },
    { id: 'cvr', label: 'Conversion Rate (%)', description: '% of visitors who became a lead.' },
    { id: 'cpl', label: 'Cost Per Lead ($)', description: 'Average cost to acquire a new lead.' },
  ],
  brand_awareness: [
    { id: 'impressions', label: 'Impressions', description: 'Total times your content was displayed.' },
    { id: 'reach', label: 'Reach', description: 'Unique users who saw your content.' },
    { id: 'cpm', label: 'CPM ($)', description: 'Cost per 1,000 impressions.' },
  ],
  website_traffic: [
    { id: 'sessions', label: 'Sessions', description: 'Total number of visits to your website.' },
    { id: 'ctr', label: 'Click-Through Rate (%)', description: '% of impressions that resulted in a click.' },
    { id: 'bounce_rate', label: 'Bounce Rate (%)', description: '% of single-page visits.' },
  ],
  engagement: [
    { id: 'engagement_rate', label: 'Engagement Rate (%)', description: 'Likes, comments, shares / impressions.' },
    { id: 'likes', label: 'Likes', description: 'Total number of likes.' },
    { id: 'shares', label: 'Shares', description: 'Total number of shares.' },
    { id: 'comments', label: 'Comments', description: 'Total number of comments.' },
  ],
  sales_conversions: [
    { id: 'sales_conversions', label: 'Sales/Conversions', description: 'Total number of purchases or goal actions.' },
    { id: 'cpa', label: 'Cost Per Acquisition ($)', description: 'Cost to acquire one customer.' },
    { id: 'roas', label: 'Return On Ad Spend (x)', description: 'Revenue generated per dollar spent.' },
    { id: 'aov', label: 'Average Order Value ($)', description: 'Average value of each purchase.' },
  ],
};
