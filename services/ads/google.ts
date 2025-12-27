/**
 * Google Ads API Service
 * 
 * Google Ads API v17 integration
 * Docs: https://developers.google.com/google-ads/api/docs/start
 * 
 * Required Setup:
 * 1. Create Google Cloud project
 * 2. Enable Google Ads API
 * 3. Create OAuth 2.0 credentials
 * 4. Apply for Google Ads API Developer Token (takes time for approval)
 * 5. Link to Google Ads Manager account
 * 
 * Environment variables:
 * - GOOGLE_ADS_CLIENT_ID
 * - GOOGLE_ADS_CLIENT_SECRET
 * - GOOGLE_ADS_DEVELOPER_TOKEN
 * - GOOGLE_ADS_REFRESH_TOKEN
 * - GOOGLE_ADS_LOGIN_CUSTOMER_ID (manager account ID)
 */

import type {
    AdApiResponse,
    UnifiedCampaign,
    CampaignMetrics,
    GoogleAdGroup,
    GoogleKeyword,
    GoogleResponsiveSearchAd,
    GoogleCampaignType,
    GoogleBiddingStrategy,
    CampaignObjective,
    AudienceTargeting,
    PaginatedResponse,
} from './types';

const API_BASE = '/api/ads/google';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

const objectiveToGoogleType: Record<CampaignObjective, GoogleCampaignType> = {
    awareness: 'DISPLAY',
    traffic: 'SEARCH',
    engagement: 'DISPLAY',
    leads: 'SEARCH',
    conversions: 'PERFORMANCE_MAX',
    app_installs: 'SMART',
    video_views: 'VIDEO',
    catalog_sales: 'SHOPPING',
};

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

/**
 * List accessible Google Ads customer accounts
 */
export async function getCustomers(): Promise<AdApiResponse<{
    id: string;
    descriptiveName: string;
    currencyCode: string;
    manager: boolean;
}[]>> {
    const response = await fetch(`${API_BASE}/customers`);
    return response.json();
}

/**
 * Get customer account details
 */
export async function getCustomerDetails(
    customerId: string
): Promise<AdApiResponse<{
    id: string;
    descriptiveName: string;
    currencyCode: string;
    timeZone: string;
    trackingUrlTemplate?: string;
    conversionTrackingEnabled: boolean;
}>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}`);
    return response.json();
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * List campaigns for a customer
 */
export async function listCampaigns(
    customerId: string,
    options?: {
        status?: 'ENABLED' | 'PAUSED' | 'REMOVED';
        type?: GoogleCampaignType;
        pageToken?: string;
        pageSize?: number;
    }
): Promise<AdApiResponse<PaginatedResponse<UnifiedCampaign>>> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.type) params.set('type', options.type);
    if (options?.pageToken) params.set('pageToken', options.pageToken);
    if (options?.pageSize) params.set('pageSize', options.pageSize.toString());

    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns?${params}`);
    return response.json();
}

/**
 * Create a new campaign
 */
export async function createCampaign(
    customerId: string,
    campaign: {
        name: string;
        type: GoogleCampaignType;
        budget: { amount: number; type: 'daily' | 'shared' };
        biddingStrategy: GoogleBiddingStrategy;
        targetCpa?: number;
        targetRoas?: number;
        networkSettings?: {
            targetGoogleSearch?: boolean;
            targetSearchNetwork?: boolean;
            targetContentNetwork?: boolean;
            targetPartnerSearchNetwork?: boolean;
        };
        startDate?: string;  // YYYY-MM-DD
        endDate?: string;
    }
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
    });
    return response.json();
}

/**
 * Update campaign
 */
export async function updateCampaign(
    customerId: string,
    campaignId: string,
    updates: Partial<{
        name: string;
        status: 'ENABLED' | 'PAUSED' | 'REMOVED';
        budgetAmountMicros: number;
        targetCpaMicros: number;
        startDate: string;
        endDate: string;
    }>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
}

// ============================================================================
// AD GROUP MANAGEMENT
// ============================================================================

/**
 * Create an ad group
 */
export async function createAdGroup(
    customerId: string,
    adGroup: {
        campaignId: string;
        name: string;
        cpcBidMicros?: number;
        status?: 'ENABLED' | 'PAUSED';
    }
): Promise<AdApiResponse<GoogleAdGroup>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/adgroups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adGroup),
    });
    return response.json();
}

/**
 * List ad groups for a campaign
 */
export async function listAdGroups(
    customerId: string,
    campaignId?: string
): Promise<AdApiResponse<GoogleAdGroup[]>> {
    const params = campaignId ? `?campaign_id=${campaignId}` : '';
    const response = await fetch(`${API_BASE}/customers/${customerId}/adgroups${params}`);
    return response.json();
}

// ============================================================================
// KEYWORD MANAGEMENT (Search Campaigns)
// ============================================================================

/**
 * Add keywords to an ad group
 */
export async function addKeywords(
    customerId: string,
    adGroupId: string,
    keywords: Array<{
        text: string;
        matchType: 'EXACT' | 'PHRASE' | 'BROAD';
        cpcBidMicros?: number;
    }>
): Promise<AdApiResponse<GoogleKeyword[]>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/adgroups/${adGroupId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
    });
    return response.json();
}

/**
 * Get keyword suggestions
 */
export async function getKeywordIdeas(
    customerId: string,
    config: {
        seedKeywords?: string[];
        seedUrl?: string;
        language: string;  // e.g., 'en'
        locations: string[];  // Location criterion IDs
    }
): Promise<AdApiResponse<{
    keyword: string;
    avgMonthlySearches: number;
    competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    lowTopOfPageBidMicros: number;
    highTopOfPageBidMicros: number;
}[]>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/keyword-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    return response.json();
}

// ============================================================================
// AD CREATION
// ============================================================================

/**
 * Create a Responsive Search Ad
 */
export async function createResponsiveSearchAd(
    customerId: string,
    adGroupId: string,
    ad: {
        headlines: Array<{ text: string; pinnedPosition?: 1 | 2 | 3 }>;
        descriptions: Array<{ text: string; pinnedPosition?: 1 | 2 }>;
        finalUrls: string[];
        path1?: string;
        path2?: string;
    }
): Promise<AdApiResponse<{ resourceName: string }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/adgroups/${adGroupId}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'RESPONSIVE_SEARCH_AD',
            ...ad,
        }),
    });
    return response.json();
}

/**
 * Create a Responsive Display Ad
 */
export async function createResponsiveDisplayAd(
    customerId: string,
    adGroupId: string,
    ad: {
        headlines: Array<{ text: string }>;
        longHeadline: string;
        descriptions: Array<{ text: string }>;
        businessName: string;
        marketingImages: string[];  // Asset resource names
        squareMarketingImages: string[];
        logoImages?: string[];
        squareLogoImages?: string[];
        finalUrls: string[];
        callToAction?: string;
    }
): Promise<AdApiResponse<{ resourceName: string }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/adgroups/${adGroupId}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'RESPONSIVE_DISPLAY_AD',
            ...ad,
        }),
    });
    return response.json();
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

/**
 * Upload an image asset
 */
export async function uploadImageAsset(
    customerId: string,
    file: File,
    name: string
): Promise<AdApiResponse<{ resourceName: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await fetch(`${API_BASE}/customers/${customerId}/assets/image`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

/**
 * Upload a YouTube video asset (by video ID)
 */
export async function createYouTubeVideoAsset(
    customerId: string,
    youtubeVideoId: string,
    name: string
): Promise<AdApiResponse<{ resourceName: string }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/assets/youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeVideoId, name }),
    });
    return response.json();
}

// ============================================================================
// AUDIENCE & TARGETING
// ============================================================================

/**
 * Create a customer match audience (from customer list)
 */
export async function createCustomerMatchAudience(
    customerId: string,
    audience: {
        name: string;
        description?: string;
        membershipLifeSpan: number;  // Days, max 540
    }
): Promise<AdApiResponse<{ resourceName: string }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/user-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'CRM_BASED',
            ...audience,
        }),
    });
    return response.json();
}

/**
 * Get geo target suggestions
 */
export async function searchGeoTargets(
    query: string,
    options?: {
        countryCode?: string;
        targetTypes?: ('Country' | 'State' | 'City' | 'PostalCode')[];
    }
): Promise<AdApiResponse<{
    resourceName: string;
    id: number;
    name: string;
    canonicalName: string;
    targetType: string;
    countryCode: string;
}[]>> {
    const params = new URLSearchParams({ q: query });
    if (options?.countryCode) params.set('country', options.countryCode);
    if (options?.targetTypes) params.set('types', options.targetTypes.join(','));

    const response = await fetch(`${API_BASE}/geo-targets?${params}`);
    return response.json();
}

/**
 * Add location targeting to a campaign
 */
export async function addLocationTargeting(
    customerId: string,
    campaignId: string,
    locations: Array<{
        geoTargetConstant: string;  // e.g., "geoTargetConstants/2840" (USA)
        negative?: boolean;
    }>
): Promise<AdApiResponse<{ success: boolean }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns/${campaignId}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
    });
    return response.json();
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get campaign performance metrics
 */
export async function getCampaignMetrics(
    customerId: string,
    options: {
        campaignIds?: string[];
        dateRange: {
            startDate: string;  // YYYY-MM-DD
            endDate: string;
        };
        metrics?: string[];
        segments?: ('date' | 'device' | 'network')[];
    }
): Promise<AdApiResponse<CampaignMetrics[]>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/reports/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...options,
            metrics: options.metrics || [
                'metrics.impressions',
                'metrics.clicks',
                'metrics.cost_micros',
                'metrics.conversions',
                'metrics.conversions_value',
                'metrics.ctr',
                'metrics.average_cpc',
                'metrics.average_cpm',
                'metrics.video_views',
            ],
        }),
    });
    return response.json();
}

/**
 * Get keyword performance
 */
export async function getKeywordMetrics(
    customerId: string,
    options: {
        adGroupId?: string;
        dateRange: { startDate: string; endDate: string };
    }
): Promise<AdApiResponse<{
    keyword: string;
    matchType: string;
    impressions: number;
    clicks: number;
    costMicros: number;
    conversions: number;
    qualityScore?: number;
}[]>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/reports/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
    });
    return response.json();
}

/**
 * Get search terms report (what users actually searched)
 */
export async function getSearchTermsReport(
    customerId: string,
    options: {
        campaignId?: string;
        adGroupId?: string;
        dateRange: { startDate: string; endDate: string };
    }
): Promise<AdApiResponse<{
    searchTerm: string;
    impressions: number;
    clicks: number;
    costMicros: number;
    conversions: number;
}[]>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/reports/search-terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
    });
    return response.json();
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Get Google Ads recommendations for optimization
 */
export async function getRecommendations(
    customerId: string,
    types?: ('KEYWORD' | 'TEXT_AD' | 'TARGET_CPA_OPT_IN' | 'MAXIMIZE_CONVERSIONS_OPT_IN' | 'CALLOUT_EXTENSION' | 'SITELINK_EXTENSION')[]
): Promise<AdApiResponse<{
    resourceName: string;
    type: string;
    impact: { baseMetrics: Record<string, number>; potentialMetrics: Record<string, number> };
    recommendation: Record<string, unknown>;
}[]>> {
    const params = types ? `?types=${types.join(',')}` : '';
    const response = await fetch(`${API_BASE}/customers/${customerId}/recommendations${params}`);
    return response.json();
}

/**
 * Apply a recommendation
 */
export async function applyRecommendation(
    customerId: string,
    recommendationResourceName: string
): Promise<AdApiResponse<{ success: boolean }>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/recommendations/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceName: recommendationResourceName }),
    });
    return response.json();
}

// ============================================================================
// FULL CAMPAIGN CREATION HELPER
// ============================================================================

/**
 * Create a complete Search campaign with ad group, keywords, and ads
 */
export async function createFullSearchCampaign(
    customerId: string,
    config: {
        name: string;
        budget: { amount: number; type: 'daily' };
        biddingStrategy: GoogleBiddingStrategy;
        targetCpa?: number;
        locations: string[];  // Geo target IDs
        keywords: Array<{ text: string; matchType: 'EXACT' | 'PHRASE' | 'BROAD' }>;
        ad: {
            headlines: string[];  // 3-15 headlines
            descriptions: string[];  // 2-4 descriptions
            finalUrls: string[];
            path1?: string;
            path2?: string;
        };
        startDate?: string;
        endDate?: string;
    }
): Promise<AdApiResponse<{
    campaign: UnifiedCampaign;
    adGroup: GoogleAdGroup;
    keywords: GoogleKeyword[];
    adResourceName: string;
}>> {
    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns/full-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    return response.json();
}

/**
 * Create a Performance Max campaign
 */
export async function createPerformanceMaxCampaign(
    customerId: string,
    config: {
        name: string;
        budget: { amount: number; type: 'daily' };
        targetCpa?: number;
        targetRoas?: number;
        finalUrls: string[];
        headlines: string[];
        longHeadlines: string[];
        descriptions: string[];
        businessName: string;
        images: File[];  // Marketing images
        logos: File[];
        youtubeVideoIds?: string[];
        callToAction?: string;
    }
): Promise<AdApiResponse<{ campaign: UnifiedCampaign }>> {
    const formData = new FormData();
    formData.append('config', JSON.stringify({
        name: config.name,
        budget: config.budget,
        targetCpa: config.targetCpa,
        targetRoas: config.targetRoas,
        finalUrls: config.finalUrls,
        headlines: config.headlines,
        longHeadlines: config.longHeadlines,
        descriptions: config.descriptions,
        businessName: config.businessName,
        youtubeVideoIds: config.youtubeVideoIds,
        callToAction: config.callToAction,
    }));

    config.images.forEach((file, i) => formData.append(`image_${i}`, file));
    config.logos.forEach((file, i) => formData.append(`logo_${i}`, file));

    const response = await fetch(`${API_BASE}/customers/${customerId}/campaigns/performance-max`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}