/**
 * Meta (Facebook/Instagram) Marketing API Service
 * 
 * Meta Marketing API integration for Facebook and Instagram ads
 * Docs: https://developers.facebook.com/docs/marketing-apis
 * 
 * Required Setup:
 * 1. Create Meta Business account
 * 2. Create App in Meta for Developers
 * 3. Request Marketing API access (requires app review for production)
 * 4. Get System User access token with ads_management permission
 * 
 * Environment variables:
 * - META_ACCESS_TOKEN
 * - META_APP_ID
 * - META_APP_SECRET
 * - META_AD_ACCOUNT_ID (format: act_123456789)
 */

import type {
    AdApiResponse,
    UnifiedCampaign,
    CampaignMetrics,
    MetaAdSet,
    MetaTargeting,
    CampaignObjective,
    AudienceTargeting,
    AdCreative,
    PaginatedResponse,
} from './types';

const API_BASE = '/api/ads/meta';

// ============================================================================
// OBJECTIVE MAPPING
// ============================================================================

const objectiveToMeta: Record<CampaignObjective, string> = {
    awareness: 'OUTCOME_AWARENESS',
    traffic: 'OUTCOME_TRAFFIC',
    engagement: 'OUTCOME_ENGAGEMENT',
    leads: 'OUTCOME_LEADS',
    conversions: 'OUTCOME_SALES',
    app_installs: 'OUTCOME_APP_PROMOTION',
    video_views: 'OUTCOME_ENGAGEMENT',
    catalog_sales: 'OUTCOME_SALES',
};

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Get all ad accounts the user has access to
 */
export async function getAdAccounts(): Promise<AdApiResponse<{ id: string; name: string; currency: string; status: string }[]>> {
    const response = await fetch(`${API_BASE}/accounts`);
    return response.json();
}

/**
 * Get ad account details including spend limits
 */
export async function getAccountDetails(
    accountId: string
): Promise<AdApiResponse<{
    id: string;
    name: string;
    currency: string;
    spendCap: number;
    amountSpent: number;
    balance: number;
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}`);
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
        status?: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
        after?: string;
        limit?: number;
    }
): Promise<AdApiResponse<PaginatedResponse<UnifiedCampaign>>> {
    const params = new URLSearchParams();
    if (options?.status) params.set('effective_status', JSON.stringify([options.status]));
    if (options?.after) params.set('after', options.after);
    if (options?.limit) params.set('limit', options.limit.toString());

    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns?${params}`);
    return response.json();
}

/**
 * Create a new campaign
 */
export async function createCampaign(
    accountId: string,
    campaign: {
        name: string;
        objective: CampaignObjective;
        status?: 'ACTIVE' | 'PAUSED';
        specialAdCategories?: string[];  // HOUSING, CREDIT, EMPLOYMENT, etc.
        budget?: { amount: number; type: 'daily' | 'lifetime' };
    }
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: campaign.name,
            objective: objectiveToMeta[campaign.objective],
            status: campaign.status || 'PAUSED',
            special_ad_categories: campaign.specialAdCategories || [],
            daily_budget: campaign.budget?.type === 'daily' ? campaign.budget.amount * 100 : undefined,
            lifetime_budget: campaign.budget?.type === 'lifetime' ? campaign.budget.amount * 100 : undefined,
        }),
    });
    return response.json();
}

/**
 * Update campaign
 */
export async function updateCampaign(
    accountId: string,
    campaignId: string,
    updates: Partial<{
        name: string;
        status: 'ACTIVE' | 'PAUSED' | 'DELETED';
        dailyBudget: number;
        lifetimeBudget: number;
    }>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
}

// ============================================================================
// AD SET MANAGEMENT
// ============================================================================

/**
 * Create an ad set (targeting group)
 */
export async function createAdSet(
    accountId: string,
    adSet: {
        campaignId: string;
        name: string;
        targeting: AudienceTargeting;
        budget: { amount: number; type: 'daily' | 'lifetime' };
        schedule: { start: string; end?: string };
        optimizationGoal: string;
        billingEvent: 'IMPRESSIONS' | 'CLICKS';
        placements?: string[];
    }
): Promise<AdApiResponse<MetaAdSet>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/adsets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adSet),
    });
    return response.json();
}

/**
 * List ad sets for a campaign
 */
export async function listAdSets(
    accountId: string,
    campaignId?: string
): Promise<AdApiResponse<MetaAdSet[]>> {
    const params = campaignId ? `?campaign_id=${campaignId}` : '';
    const response = await fetch(`${API_BASE}/accounts/${accountId}/adsets${params}`);
    return response.json();
}

// ============================================================================
// AD CREATIVE MANAGEMENT
// ============================================================================

/**
 * Create an ad creative
 */
export async function createCreative(
    accountId: string,
    creative: {
        name: string;
        objectStorySpec?: {
            pageId: string;
            linkData?: {
                link: string;
                message: string;
                name?: string;
                description?: string;
                callToAction?: { type: string; value?: { link: string } };
                imageHash?: string;
            };
            videoData?: {
                videoId: string;
                title?: string;
                message?: string;
                callToAction?: { type: string; value?: { link: string } };
            };
        };
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/adcreatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creative),
    });
    return response.json();
}

/**
 * Create an ad (links creative to ad set)
 */
export async function createAd(
    accountId: string,
    ad: {
        name: string;
        adsetId: string;
        creativeId: string;
        status?: 'ACTIVE' | 'PAUSED';
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ad),
    });
    return response.json();
}

// ============================================================================
// MEDIA UPLOAD
// ============================================================================

/**
 * Upload image for use in ads
 */
export async function uploadImage(
    accountId: string,
    file: File
): Promise<AdApiResponse<{ hash: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/adimages`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

/**
 * Upload video for use in ads
 */
export async function uploadVideo(
    accountId: string,
    file: File,
    options?: { title?: string; description?: string }
): Promise<AdApiResponse<{ id: string; status: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.title) formData.append('title', options.title);
    if (options?.description) formData.append('description', options.description);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/advideos`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get campaign insights/metrics
 */
export async function getCampaignInsights(
    accountId: string,
    campaignIds: string[],
    options: {
        datePreset?: 'today' | 'yesterday' | 'this_week' | 'last_7d' | 'last_30d' | 'this_month';
        timeRange?: { since: string; until: string };
        breakdown?: 'age' | 'gender' | 'country' | 'placement' | 'device_platform';
    }
): Promise<AdApiResponse<CampaignMetrics[]>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            campaign_ids: campaignIds,
            ...options,
            fields: [
                'impressions',
                'reach',
                'frequency',
                'clicks',
                'ctr',
                'cpc',
                'cpm',
                'spend',
                'actions',
                'cost_per_action_type',
                'video_p25_watched_actions',
                'video_p50_watched_actions',
                'video_p75_watched_actions',
                'video_p100_watched_actions',
            ],
        }),
    });
    return response.json();
}

// ============================================================================
// AUDIENCE TARGETING RESEARCH
// ============================================================================

/**
 * Search for targetable interests
 */
export async function searchInterests(
    query: string
): Promise<AdApiResponse<{ id: string; name: string; audienceSize: number; path: string[] }[]>> {
    const response = await fetch(`${API_BASE}/targeting/interests?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Search for targetable behaviors
 */
export async function searchBehaviors(
    query: string
): Promise<AdApiResponse<{ id: string; name: string; audienceSize: number; description: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/behaviors?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Get audience size estimate
 */
export async function getReachEstimate(
    accountId: string,
    targeting: AudienceTargeting
): Promise<AdApiResponse<{
    usersLowerBound: number;
    usersUpperBound: number;
    estimateDau: number;
    estimateMau: number;
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/reachestimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targeting_spec: toMetaTargeting(targeting) }),
    });
    return response.json();
}

// ============================================================================
// CUSTOM AUDIENCES
// ============================================================================

/**
 * Create a custom audience from customer list
 */
export async function createCustomAudience(
    accountId: string,
    audience: {
        name: string;
        description?: string;
        subtype: 'CUSTOM' | 'WEBSITE' | 'APP' | 'OFFLINE_CONVERSION' | 'LOOKALIKE';
        customerFileSource?: 'USER_PROVIDED_ONLY' | 'PARTNER_PROVIDED_ONLY' | 'BOTH';
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/customaudiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audience),
    });
    return response.json();
}

/**
 * Create a lookalike audience
 */
export async function createLookalikeAudience(
    accountId: string,
    config: {
        name: string;
        sourceAudienceId: string;
        targetCountry: string;
        ratio: number;  // 0.01 to 0.20 (1% to 20%)
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/customaudiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: config.name,
            subtype: 'LOOKALIKE',
            origin_audience_id: config.sourceAudienceId,
            lookalike_spec: {
                country: config.targetCountry,
                ratio: config.ratio,
                type: 'similarity',
            },
        }),
    });
    return response.json();
}

// ============================================================================
// FULL CAMPAIGN CREATION HELPER
// ============================================================================

/**
 * Create a complete campaign with ad set and ad
 */
export async function createFullCampaign(
    accountId: string,
    config: {
        name: string;
        objective: CampaignObjective;
        budget: { amount: number; type: 'daily' | 'lifetime' };
        schedule: { start: string; end?: string };
        targeting: AudienceTargeting;
        creative: AdCreative;
        pageId: string;  // Facebook page ID
        placements?: ('facebook_feed' | 'instagram_feed' | 'facebook_stories' | 'instagram_stories')[];
    }
): Promise<AdApiResponse<{
    campaign: UnifiedCampaign;
    adSet: MetaAdSet;
    adId: string;
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    return response.json();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toMetaTargeting(targeting: AudienceTargeting): MetaTargeting {
    const metaTargeting: MetaTargeting = {};

    // Age
    if (targeting.ageMin) metaTargeting.age_min = targeting.ageMin;
    if (targeting.ageMax) metaTargeting.age_max = targeting.ageMax;

    // Gender (Meta uses 1=male, 2=female)
    if (targeting.genders?.length) {
        metaTargeting.genders = targeting.genders
            .filter(g => g !== 'all')
            .map(g => g === 'male' ? 1 : 2);
    }

    // Locations
    if (targeting.locations?.length) {
        metaTargeting.geo_locations = {
            countries: targeting.locations
                .filter(l => l.type === 'country')
                .map(l => l.value),
            cities: targeting.locations
                .filter(l => l.type === 'city')
                .map(l => ({ key: l.value, radius: l.radius?.distance })),
        };
    }

    // Interests
    if (targeting.interests?.length) {
        metaTargeting.interests = targeting.interests.map(id => ({ id, name: '' }));
    }

    // Behaviors
    if (targeting.behaviors?.length) {
        metaTargeting.behaviors = targeting.behaviors.map(id => ({ id, name: '' }));
    }

    // Custom Audiences
    if (targeting.customAudiences?.length) {
        metaTargeting.custom_audiences = targeting.customAudiences.map(id => ({ id }));
    }

    // Excluded Audiences
    if (targeting.excludeAudiences?.length) {
        metaTargeting.excluded_custom_audiences = targeting.excludeAudiences.map(id => ({ id }));
    }

    return metaTargeting;
}