/**
 * Unified Ad Platform Types
 * Normalized interfaces for cross-platform ad management
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type AdPlatform = 'meta' | 'google' | 'linkedin' | 'twitter' | 'tiktok';

export type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';

export type CampaignObjective =
    | 'awareness'        // Brand awareness, reach
    | 'traffic'          // Website clicks
    | 'engagement'       // Likes, comments, shares
    | 'leads'            // Lead generation forms
    | 'conversions'      // Website conversions
    | 'app_installs'     // Mobile app installs
    | 'video_views'      // Video view campaigns
    | 'catalog_sales';   // E-commerce product sales

export type BidStrategy =
    | 'lowest_cost'      // Automatic lowest cost
    | 'cost_cap'         // Maximum cost per result
    | 'bid_cap'          // Maximum bid amount
    | 'target_cost'      // Target cost per result
    | 'manual';          // Manual bidding

export interface DateRange {
    start: string;  // ISO date
    end?: string;   // ISO date, optional for ongoing
}

export interface Budget {
    amount: number;
    currency: string;
    type: 'daily' | 'lifetime';
}

export interface GeoTarget {
    type: 'country' | 'region' | 'city' | 'zip' | 'radius';
    value: string;
    radius?: {
        distance: number;
        unit: 'miles' | 'kilometers';
    };
}

// ============================================================================
// AUDIENCE TARGETING
// ============================================================================

export interface AudienceTargeting {
    // Demographics
    ageMin?: number;
    ageMax?: number;
    genders?: ('male' | 'female' | 'all')[];

    // Location
    locations?: GeoTarget[];
    excludeLocations?: GeoTarget[];

    // Interests & Behaviors (platform-specific IDs)
    interests?: string[];
    behaviors?: string[];

    // Custom Audiences
    customAudiences?: string[];      // Uploaded lists, website visitors
    lookalikeAudiences?: string[];   // Lookalike/similar audiences
    excludeAudiences?: string[];

    // Platform-specific
    languages?: string[];
    devices?: ('mobile' | 'desktop' | 'tablet')[];
    placements?: string[];           // Feed, stories, right column, etc.

    // Twitter-specific
    keywords?: string[];
    followerLookalikes?: string[];   // @handles to target similar followers
    tweetEngagers?: string[];        // People who engaged with specific tweets

    // LinkedIn-specific
    companies?: string[];
    jobTitles?: string[];
    industries?: string[];
    skills?: string[];
    seniorities?: string[];
    companySize?: string[];
}

// ============================================================================
// CREATIVE / AD CONTENT
// ============================================================================

export type AdFormat =
    | 'single_image'
    | 'carousel'
    | 'video'
    | 'collection'
    | 'stories'
    | 'text_only'
    | 'promoted_tweet'
    | 'lead_gen_form';

export interface AdCreative {
    id?: string;
    name: string;
    format: AdFormat;

    // Primary content
    headline?: string;
    primaryText?: string;        // Main body copy
    description?: string;        // Secondary text

    // Media
    imageUrl?: string;
    imageUrls?: string[];        // For carousels
    videoUrl?: string;
    thumbnailUrl?: string;

    // Call to action
    ctaType?: string;            // LEARN_MORE, SHOP_NOW, SIGN_UP, etc.
    ctaLink?: string;
    displayUrl?: string;         // Shortened display URL

    // Tracking
    trackingPixels?: string[];
    utmParams?: Record<string, string>;
}

// ============================================================================
// CAMPAIGN STRUCTURE
// ============================================================================

export interface UnifiedCampaign {
    // Identifiers
    id?: string;
    externalId?: string;         // Platform's campaign ID
    platform: AdPlatform;

    // Basic Info
    name: string;
    status: CampaignStatus;
    objective: CampaignObjective;

    // Schedule & Budget
    schedule: DateRange;
    budget: Budget;
    bidStrategy: BidStrategy;
    bidAmount?: number;

    // Targeting
    targeting: AudienceTargeting;

    // Creatives
    creatives: AdCreative[];

    // Metadata
    createdAt?: string;
    updatedAt?: string;

    // Platform-specific raw data
    platformData?: Record<string, unknown>;
}

// ============================================================================
// CAMPAIGN METRICS / REPORTING
// ============================================================================

export interface CampaignMetrics {
    campaignId: string;
    platform: AdPlatform;
    dateRange: DateRange;

    // Spend
    spend: number;
    currency: string;

    // Reach & Impressions
    impressions: number;
    reach?: number;
    frequency?: number;

    // Engagement
    clicks: number;
    ctr: number;                 // Click-through rate
    engagements?: number;        // Likes, comments, shares combined
    videoViews?: number;
    videoCompletions?: number;

    // Conversions
    conversions?: number;
    conversionRate?: number;
    costPerConversion?: number;

    // Leads
    leads?: number;
    costPerLead?: number;

    // Cost Metrics
    cpc: number;                 // Cost per click
    cpm: number;                 // Cost per 1000 impressions

    // Platform-specific
    platformMetrics?: Record<string, number>;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface AdApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    rateLimit?: {
        remaining: number;
        resetAt: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    nextCursor?: string;
    totalCount?: number;
}

// ============================================================================
// PLATFORM CREDENTIALS (stored server-side only)
// ============================================================================

export interface PlatformCredentials {
    platform: AdPlatform;

    // OAuth tokens
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;

    // Platform-specific IDs
    accountId?: string;          // Ad account ID
    businessId?: string;         // Business manager ID

    // API keys (for platforms that use them)
    apiKey?: string;
    apiSecret?: string;

    // Developer tokens
    developerToken?: string;     // Google Ads
}

// ============================================================================
// TWITTER/X SPECIFIC TYPES
// ============================================================================

export type TwitterObjective =
    | 'AWARENESS'
    | 'TWEET_ENGAGEMENTS'
    | 'VIDEO_VIEWS'
    | 'PREROLL_VIEWS'
    | 'WEBSITE_CLICKS'
    | 'WEBSITE_CONVERSIONS'
    | 'APP_INSTALLS'
    | 'APP_ENGAGEMENTS'
    | 'FOLLOWERS';

export type TwitterPlacement =
    | 'ALL_ON_TWITTER'
    | 'TWITTER_TIMELINE'
    | 'TWITTER_PROFILE'
    | 'TWITTER_SEARCH'
    | 'PUBLISHER_NETWORK';

export interface TwitterFundingInstrument {
    id: string;
    type: 'CREDIT_CARD' | 'INSERTION_ORDER' | 'CREDIT_LINE';
    currency: string;
    creditRemaining?: number;
}

export interface TwitterLineItem {
    id?: string;
    campaignId: string;
    name: string;
    objective: TwitterObjective;
    placements: TwitterPlacement[];
    bidAmountLocalMicro: number;  // Twitter uses micro-currency (1/1,000,000)
    budgetLocalMicro?: number;
    startTime: string;
    endTime?: string;
    status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
    targeting: TwitterTargetingCriteria;
}

export interface TwitterTargetingCriteria {
    locations?: { id: string; type: string }[];
    age?: { min: number; max?: number };
    gender?: 'MALE' | 'FEMALE' | 'ANY';
    languages?: string[];
    interests?: string[];
    keywords?: string[];
    followerLookalikes?: string[];  // User IDs
    platforms?: ('DESKTOP' | 'IOS' | 'ANDROID')[];
    events?: string[];
    tvShows?: string[];
    conversations?: string[];
}

export interface TwitterPromotedTweet {
    id?: string;
    lineItemId: string;
    tweetId: string;
}

// ============================================================================
// META (FACEBOOK/INSTAGRAM) SPECIFIC TYPES
// ============================================================================

export type MetaObjective =
    | 'OUTCOME_AWARENESS'
    | 'OUTCOME_ENGAGEMENT'
    | 'OUTCOME_LEADS'
    | 'OUTCOME_SALES'
    | 'OUTCOME_TRAFFIC'
    | 'OUTCOME_APP_PROMOTION';

export type MetaPlacement =
    | 'facebook_feed'
    | 'facebook_stories'
    | 'facebook_reels'
    | 'facebook_right_column'
    | 'instagram_feed'
    | 'instagram_stories'
    | 'instagram_reels'
    | 'instagram_explore'
    | 'audience_network'
    | 'messenger';

export interface MetaAdSet {
    id?: string;
    campaignId: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'DELETED';
    dailyBudget?: number;
    lifetimeBudget?: number;
    startTime: string;
    endTime?: string;
    targeting: MetaTargeting;
    optimization_goal: string;
    billing_event: 'IMPRESSIONS' | 'CLICKS' | 'ACTIONS';
}

export interface MetaTargeting {
    geo_locations?: {
        countries?: string[];
        regions?: { key: string }[];
        cities?: { key: string; radius?: number }[];
        zips?: { key: string }[];
    };
    age_min?: number;
    age_max?: number;
    genders?: number[];  // 1 = male, 2 = female
    interests?: { id: string; name: string }[];
    behaviors?: { id: string; name: string }[];
    custom_audiences?: { id: string }[];
    excluded_custom_audiences?: { id: string }[];
    publisher_platforms?: string[];
    facebook_positions?: string[];
    instagram_positions?: string[];
}

// ============================================================================
// GOOGLE ADS SPECIFIC TYPES
// ============================================================================

export type GoogleCampaignType =
    | 'SEARCH'
    | 'DISPLAY'
    | 'SHOPPING'
    | 'VIDEO'
    | 'PERFORMANCE_MAX'
    | 'LOCAL'
    | 'SMART';

export type GoogleBiddingStrategy =
    | 'MAXIMIZE_CLICKS'
    | 'MAXIMIZE_CONVERSIONS'
    | 'TARGET_CPA'
    | 'TARGET_ROAS'
    | 'MANUAL_CPC'
    | 'MANUAL_CPM';

export interface GoogleAdGroup {
    id?: string;
    campaignId: string;
    name: string;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED';
    cpcBidMicros?: number;
    keywords?: GoogleKeyword[];
}

export interface GoogleKeyword {
    text: string;
    matchType: 'EXACT' | 'PHRASE' | 'BROAD';
    cpcBidMicros?: number;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

export interface GoogleResponsiveSearchAd {
    headlines: { text: string; pinnedField?: number }[];
    descriptions: { text: string; pinnedField?: number }[];
    finalUrls: string[];
    path1?: string;
    path2?: string;
}

// ============================================================================
// LINKEDIN SPECIFIC TYPES
// ============================================================================

export type LinkedInObjective =
    | 'BRAND_AWARENESS'
    | 'WEBSITE_VISITS'
    | 'ENGAGEMENT'
    | 'VIDEO_VIEWS'
    | 'LEAD_GENERATION'
    | 'WEBSITE_CONVERSIONS'
    | 'JOB_APPLICANTS';

export interface LinkedInTargeting {
    locations?: { urn: string }[];
    industries?: { urn: string }[];
    companyNames?: { urn: string }[];
    companySizes?: string[];
    jobTitles?: { urn: string }[];
    jobFunctions?: { urn: string }[];
    seniorities?: string[];
    skills?: { urn: string }[];
    degrees?: string[];
    fieldsOfStudy?: { urn: string }[];
    memberGroups?: { urn: string }[];
    ageRanges?: string[];
    genders?: string[];
}

// ============================================================================
// TIKTOK SPECIFIC TYPES
// ============================================================================

export type TikTokObjective =
    | 'REACH'
    | 'TRAFFIC'
    | 'VIDEO_VIEWS'
    | 'LEAD_GENERATION'
    | 'COMMUNITY_INTERACTION'
    | 'APP_PROMOTION'
    | 'CONVERSIONS'
    | 'CATALOG_SALES';

export interface TikTokTargeting {
    locations?: string[];           // Location IDs
    languages?: string[];
    gender?: 'GENDER_MALE' | 'GENDER_FEMALE' | 'GENDER_UNLIMITED';
    ageGroups?: string[];           // AGE_13_17, AGE_18_24, etc.
    interests?: string[];
    behaviors?: string[];
    deviceModels?: string[];
    operatingSystems?: string[];
    connectionTypes?: string[];
    carriers?: string[];
}