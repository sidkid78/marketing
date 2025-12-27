/**
 * Twitter/X Ads API Service
 * 
 * Twitter Ads API v12 integration
 * Docs: https://developer.x.com/en/docs/twitter-ads-api
 * 
 * Note: All API calls should go through the Next.js API routes
 * to keep credentials server-side.
 */

import type {
    AdApiResponse,
    UnifiedCampaign,
    CampaignMetrics,
    TwitterLineItem,
    TwitterPromotedTweet,
    TwitterFundingInstrument,
    TwitterObjective,
    TwitterTargetingCriteria,
    CampaignObjective,
    AudienceTargeting,
    PaginatedResponse,
} from './types';

const API_BASE = '/api/ads/twitter';

// ============================================================================
// OBJECTIVE MAPPING
// ============================================================================

const objectiveToTwitter: Record<CampaignObjective, TwitterObjective> = {
    awareness: 'AWARENESS',
    traffic: 'WEBSITE_CLICKS',
    engagement: 'TWEET_ENGAGEMENTS',
    leads: 'WEBSITE_CONVERSIONS',
    conversions: 'WEBSITE_CONVERSIONS',
    app_installs: 'APP_INSTALLS',
    video_views: 'VIDEO_VIEWS',
    catalog_sales: 'WEBSITE_CONVERSIONS',
};

const twitterToObjective: Record<TwitterObjective, CampaignObjective> = {
    AWARENESS: 'awareness',
    TWEET_ENGAGEMENTS: 'engagement',
    VIDEO_VIEWS: 'video_views',
    PREROLL_VIEWS: 'video_views',
    WEBSITE_CLICKS: 'traffic',
    WEBSITE_CONVERSIONS: 'conversions',
    APP_INSTALLS: 'app_installs',
    APP_ENGAGEMENTS: 'app_installs',
    FOLLOWERS: 'awareness',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert micro-currency to standard currency
 * Twitter uses 1/1,000,000 of the currency unit
 */
function fromMicro(micro: number): number {
    return micro / 1_000_000;
}

/**
 * Convert standard currency to micro-currency
 */
function toMicro(amount: number): number {
    return Math.round(amount * 1_000_000);
}

/**
 * Convert unified targeting to Twitter targeting criteria
 */
function toTwitterTargeting(targeting: AudienceTargeting): TwitterTargetingCriteria {
    const twitterTargeting: TwitterTargetingCriteria = {};

    // Age
    if (targeting.ageMin || targeting.ageMax) {
        twitterTargeting.age = {
            min: targeting.ageMin || 13,
            max: targeting.ageMax,
        };
    }

    // Gender
    if (targeting.genders?.length === 1) {
        twitterTargeting.gender = targeting.genders[0] === 'male' ? 'MALE' :
            targeting.genders[0] === 'female' ? 'FEMALE' : 'ANY';
    }

    // Languages
    if (targeting.languages?.length) {
        twitterTargeting.languages = targeting.languages;
    }

    // Keywords (Twitter-specific)
    if (targeting.keywords?.length) {
        twitterTargeting.keywords = targeting.keywords;
    }

    // Follower lookalikes (Twitter-specific)
    if (targeting.followerLookalikes?.length) {
        twitterTargeting.followerLookalikes = targeting.followerLookalikes;
    }

    // Devices
    if (targeting.devices?.length) {
        const platformMap: Record<string, 'DESKTOP' | 'IOS' | 'ANDROID'> = {
            desktop: 'DESKTOP',
            mobile: 'IOS', // Default mobile to iOS, would need separate handling
            tablet: 'IOS',
        };
        twitterTargeting.platforms = targeting.devices
            .map(d => platformMap[d])
            .filter(Boolean);
    }

    // Interests
    if (targeting.interests?.length) {
        twitterTargeting.interests = targeting.interests;
    }

    return twitterTargeting;
}

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Get all ad accounts the authenticated user has access to
 */
export async function getAdAccounts(): Promise<AdApiResponse<{ id: string; name: string; currency: string }[]>> {
    const response = await fetch(`${API_BASE}/accounts`);
    return response.json();
}

/**
 * Get funding instruments (payment methods) for an ad account
 */
export async function getFundingInstruments(
    accountId: string
): Promise<AdApiResponse<TwitterFundingInstrument[]>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/funding-instruments`);
    return response.json();
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * List all campaigns for an ad account
 */
export async function listCampaigns(
    accountId: string,
    options?: {
        status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
        cursor?: string;
        count?: number;
    }
): Promise<AdApiResponse<PaginatedResponse<UnifiedCampaign>>> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.count) params.set('count', options.count.toString());

    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns?${params}`);
    return response.json();
}

/**
 * Get a single campaign by ID
 */
export async function getCampaign(
    accountId: string,
    campaignId: string
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}`);
    return response.json();
}

/**
 * Create a new campaign
 */
export async function createCampaign(
    accountId: string,
    campaign: Omit<UnifiedCampaign, 'id' | 'externalId' | 'platform' | 'createdAt' | 'updatedAt'>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: campaign.name,
            funding_instrument_id: (campaign.platformData as any)?.fundingInstrumentId,
            daily_budget_amount_local_micro: campaign.budget.type === 'daily'
                ? toMicro(campaign.budget.amount)
                : undefined,
            total_budget_amount_local_micro: campaign.budget.type === 'lifetime'
                ? toMicro(campaign.budget.amount)
                : undefined,
            start_time: campaign.schedule.start,
            end_time: campaign.schedule.end,
            entity_status: campaign.status === 'active' ? 'ACTIVE' :
                campaign.status === 'paused' ? 'PAUSED' : 'DRAFT',
        }),
    });
    return response.json();
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
    accountId: string,
    campaignId: string,
    updates: Partial<UnifiedCampaign>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
}

/**
 * Delete (archive) a campaign
 */
export async function deleteCampaign(
    accountId: string,
    campaignId: string
): Promise<AdApiResponse<{ deleted: boolean }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}`, {
        method: 'DELETE',
    });
    return response.json();
}

// ============================================================================
// LINE ITEMS (Ad Groups)
// ============================================================================

/**
 * Create a line item (ad group) for a campaign
 */
export async function createLineItem(
    accountId: string,
    lineItem: Omit<TwitterLineItem, 'id'>
): Promise<AdApiResponse<TwitterLineItem>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/line-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            campaign_id: lineItem.campaignId,
            name: lineItem.name,
            objective: lineItem.objective,
            placements: lineItem.placements,
            bid_amount_local_micro: lineItem.bidAmountLocalMicro,
            total_budget_amount_local_micro: lineItem.budgetLocalMicro,
            start_time: lineItem.startTime,
            end_time: lineItem.endTime,
            entity_status: lineItem.status,
        }),
    });
    return response.json();
}

/**
 * Update line item targeting
 */
export async function updateLineItemTargeting(
    accountId: string,
    lineItemId: string,
    targeting: TwitterTargetingCriteria
): Promise<AdApiResponse<TwitterLineItem>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/line-items/${lineItemId}/targeting`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targeting),
    });
    return response.json();
}

// ============================================================================
// PROMOTED TWEETS (Ads)
// ============================================================================

/**
 * Promote an existing tweet
 */
export async function promoteTweet(
    accountId: string,
    lineItemId: string,
    tweetId: string
): Promise<AdApiResponse<TwitterPromotedTweet>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/promoted-tweets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            line_item_id: lineItemId,
            tweet_ids: [tweetId],
        }),
    });
    return response.json();
}

/**
 * Create a new tweet and promote it (Tweets API + Ads API)
 */
export async function createAndPromoteTweet(
    accountId: string,
    lineItemId: string,
    tweetContent: {
        text: string;
        mediaIds?: string[];
        cardUri?: string;  // For website cards
    }
): Promise<AdApiResponse<TwitterPromotedTweet>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/promoted-tweets/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            line_item_id: lineItemId,
            ...tweetContent,
        }),
    });
    return response.json();
}

/**
 * List promoted tweets for a line item
 */
export async function listPromotedTweets(
    accountId: string,
    lineItemId: string
): Promise<AdApiResponse<TwitterPromotedTweet[]>> {
    const response = await fetch(
        `${API_BASE}/accounts/${accountId}/promoted-tweets?line_item_id=${lineItemId}`
    );
    return response.json();
}

// ============================================================================
// CARDS (Rich Media)
// ============================================================================

/**
 * Create a website card for link previews
 */
export async function createWebsiteCard(
    accountId: string,
    card: {
        name: string;
        websiteTitle: string;
        websiteUrl: string;
        imageMediaKey?: string;
    }
): Promise<AdApiResponse<{ cardUri: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/cards/website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    });
    return response.json();
}

// ============================================================================
// MEDIA UPLOAD
// ============================================================================

/**
 * Upload media for use in ads
 */
export async function uploadMedia(
    accountId: string,
    file: File,
    mediaType: 'image' | 'video' | 'gif'
): Promise<AdApiResponse<{ mediaKey: string; mediaId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', mediaType);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/media`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get campaign metrics/analytics
 */
export async function getCampaignMetrics(
    accountId: string,
    campaignIds: string[],
    options: {
        startDate: string;
        endDate: string;
        granularity?: 'DAY' | 'HOUR' | 'TOTAL';
        metrics?: string[];
    }
): Promise<AdApiResponse<CampaignMetrics[]>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            campaign_ids: campaignIds,
            start_time: options.startDate,
            end_time: options.endDate,
            granularity: options.granularity || 'TOTAL',
            metric_groups: options.metrics || [
                'ENGAGEMENT',
                'BILLING',
                'VIDEO',
                'MEDIA',
                'WEB_CONVERSION',
                'MOBILE_CONVERSION',
            ],
        }),
    });
    return response.json();
}

/**
 * Get real-time campaign stats (active spend, impressions today)
 */
export async function getRealtimeStats(
    accountId: string,
    campaignId: string
): Promise<AdApiResponse<{
    spend: number;
    impressions: number;
    clicks: number;
    engagements: number;
}>> {
    const response = await fetch(
        `${API_BASE}/accounts/${accountId}/campaigns/${campaignId}/stats/realtime`
    );
    return response.json();
}

// ============================================================================
// TARGETING RESEARCH
// ============================================================================

/**
 * Search for targetable interests
 */
export async function searchInterests(
    query: string
): Promise<AdApiResponse<{ id: string; name: string; audienceSize?: number }[]>> {
    const response = await fetch(`${API_BASE}/targeting/interests?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Search for targetable locations
 */
export async function searchLocations(
    query: string
): Promise<AdApiResponse<{ id: string; name: string; type: string; country?: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/locations?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Get audience size estimate for targeting criteria
 */
export async function getAudienceEstimate(
    accountId: string,
    targeting: TwitterTargetingCriteria
): Promise<AdApiResponse<{ audienceSize: { min: number; max: number } }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/audience-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targeting),
    });
    return response.json();
}

// ============================================================================
// UNIFIED CAMPAIGN HELPERS
// ============================================================================

/**
 * Create a complete campaign with line item and promoted tweet
 * This is the main function you'll use from the UI
 */
export async function createFullCampaign(
    accountId: string,
    fundingInstrumentId: string,
    config: {
        name: string;
        objective: CampaignObjective;
        budget: { amount: number; type: 'daily' | 'lifetime' };
        schedule: { start: string; end?: string };
        targeting: AudienceTargeting;
        creative: {
            tweetText: string;
            websiteUrl?: string;
            imageFile?: File;
        };
    }
): Promise<AdApiResponse<{
    campaign: UnifiedCampaign;
    lineItem: TwitterLineItem;
    promotedTweet: TwitterPromotedTweet;
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            funding_instrument_id: fundingInstrumentId,
            name: config.name,
            objective: objectiveToTwitter[config.objective],
            budget: config.budget,
            schedule: config.schedule,
            targeting: toTwitterTargeting(config.targeting),
            creative: config.creative,
        }),
    });
    return response.json();
}