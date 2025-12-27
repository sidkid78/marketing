/**
 * TikTok Marketing API Service
 * 
 * TikTok Marketing API integration
 * Docs: https://business-api.tiktok.com/portal/docs
 * 
 * Required Setup:
 * 1. Create TikTok for Business account
 * 2. Create app in TikTok Marketing API portal
 * 3. Get your app approved (review process)
 * 4. Authenticate with OAuth and get access token
 * 
 * Environment variables:
 * - TIKTOK_APP_ID
 * - TIKTOK_APP_SECRET
 * - TIKTOK_ACCESS_TOKEN
 * - TIKTOK_ADVERTISER_ID
 */

import type {
    AdApiResponse,
    UnifiedCampaign,
    CampaignMetrics,
    TikTokObjective,
    TikTokTargeting,
    CampaignObjective,
    AudienceTargeting,
    AdCreative,
    PaginatedResponse,
} from './types';

const API_BASE = '/api/ads/tiktok';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

const objectiveToTikTok: Record<CampaignObjective, TikTokObjective> = {
    awareness: 'REACH',
    traffic: 'TRAFFIC',
    engagement: 'COMMUNITY_INTERACTION',
    leads: 'LEAD_GENERATION',
    conversions: 'CONVERSIONS',
    app_installs: 'APP_PROMOTION',
    video_views: 'VIDEO_VIEWS',
    catalog_sales: 'CATALOG_SALES',
};

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Get advertiser accounts
 */
export async function getAdvertiserAccounts(): Promise<AdApiResponse<{
    advertiserId: string;
    name: string;
    currency: string;
    timezone: string;
    status: string;
}[]>> {
    const response = await fetch(`${API_BASE}/advertisers`);
    return response.json();
}

/**
 * Get advertiser info with available balance
 */
export async function getAdvertiserInfo(
    advertiserId: string
): Promise<AdApiResponse<{
    advertiserId: string;
    name: string;
    currency: string;
    balance: number;
    status: string;
    timezone: string;
}>> {
    const response = await fetch(`${API_BASE}/advertisers/${advertiserId}`);
    return response.json();
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * List campaigns
 */
export async function listCampaigns(
    advertiserId: string,
    options?: {
        status?: 'ENABLE' | 'DISABLE' | 'DELETE';
        objectiveType?: TikTokObjective;
        page?: number;
        pageSize?: number;
    }
): Promise<AdApiResponse<PaginatedResponse<UnifiedCampaign>>> {
    const params = new URLSearchParams();
    params.set('advertiser_id', advertiserId);
    if (options?.status) params.set('primary_status', options.status);
    if (options?.objectiveType) params.set('objective_type', options.objectiveType);
    if (options?.page) params.set('page', options.page.toString());
    if (options?.pageSize) params.set('page_size', options.pageSize.toString());

    const response = await fetch(`${API_BASE}/campaigns?${params}`);
    return response.json();
}

/**
 * Create a campaign
 */
export async function createCampaign(
    advertiserId: string,
    campaign: {
        name: string;
        objective: TikTokObjective;
        budget: number;
        budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
        status?: 'ENABLE' | 'DISABLE';
    }
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_name: campaign.name,
            objective_type: campaign.objective,
            budget: campaign.budget,
            budget_mode: campaign.budgetMode,
            operation_status: campaign.status || 'DISABLE',  // Start paused
        }),
    });
    return response.json();
}

/**
 * Update a campaign
 */
export async function updateCampaign(
    advertiserId: string,
    campaignId: string,
    updates: Partial<{
        name: string;
        budget: number;
        status: 'ENABLE' | 'DISABLE' | 'DELETE';
    }>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            ...updates,
        }),
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
    advertiserId: string,
    adGroup: {
        campaignId: string;
        name: string;
        placement: 'PLACEMENT_TYPE_AUTOMATIC' | 'PLACEMENT_TYPE_TIKTOK' | 'PLACEMENT_TYPE_PANGLE';
        budget: number;
        budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
        schedule: {
            scheduleType: 'SCHEDULE_START_END' | 'SCHEDULE_FROM_NOW';
            startTime?: string;
            endTime?: string;
        };
        optimizationGoal: 'CLICK' | 'CONVERT' | 'SHOW' | 'REACH' | 'ENGAGED_VIEW' | 'FOCUSED_VIEW';
        bidType: 'BID_TYPE_NO_BID' | 'BID_TYPE_CUSTOM';
        bid?: number;
        billing: 'CPC' | 'CPM' | 'CPV' | 'OCPM';
        targeting: TikTokTargeting;
        videoDownload?: 'ALLOW_DOWNLOAD' | 'PREVENT_DOWNLOAD';
    }
): Promise<AdApiResponse<{ adgroupId: string }>> {
    const response = await fetch(`${API_BASE}/adgroups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_id: adGroup.campaignId,
            adgroup_name: adGroup.name,
            placement_type: adGroup.placement,
            budget: adGroup.budget,
            budget_mode: adGroup.budgetMode,
            schedule_type: adGroup.schedule.scheduleType,
            schedule_start_time: adGroup.schedule.startTime,
            schedule_end_time: adGroup.schedule.endTime,
            optimization_goal: adGroup.optimizationGoal,
            bid_type: adGroup.bidType,
            bid: adGroup.bid,
            billing_event: adGroup.billing,
            location_ids: adGroup.targeting.locations,
            languages: adGroup.targeting.languages,
            gender: adGroup.targeting.gender,
            age_groups: adGroup.targeting.ageGroups,
            interest_category_ids: adGroup.targeting.interests,
            video_download: adGroup.videoDownload,
        }),
    });
    return response.json();
}

/**
 * List ad groups for a campaign
 */
export async function listAdGroups(
    advertiserId: string,
    campaignId?: string
): Promise<AdApiResponse<{
    adgroupId: string;
    name: string;
    campaignId: string;
    status: string;
    budget: number;
}[]>> {
    const params = new URLSearchParams({ advertiser_id: advertiserId });
    if (campaignId) params.set('campaign_ids', JSON.stringify([campaignId]));

    const response = await fetch(`${API_BASE}/adgroups?${params}`);
    return response.json();
}

// ============================================================================
// AD CREATION
// ============================================================================

/**
 * Create an ad
 */
export async function createAd(
    advertiserId: string,
    ad: {
        adgroupId: string;
        name: string;
        creatives: Array<{
            videoId?: string;
            imageIds?: string[];
            adText: string;
            callToAction?: string;
            landingPageUrl?: string;
            displayName?: string;
            profileImage?: string;
        }>;
        status?: 'ENABLE' | 'DISABLE';
    }
): Promise<AdApiResponse<{ adId: string }>> {
    const response = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            adgroup_id: ad.adgroupId,
            ad_name: ad.name,
            creatives: ad.creatives,
            operation_status: ad.status || 'DISABLE',
        }),
    });
    return response.json();
}

// ============================================================================
// MEDIA UPLOAD
// ============================================================================

/**
 * Upload a video for ads
 */
export async function uploadVideo(
    advertiserId: string,
    file: File,
    options?: {
        filename?: string;
        autoFixEnabled?: boolean;
        autoBindEnabled?: boolean;
    }
): Promise<AdApiResponse<{
    videoId: string;
    previewUrl: string;
    duration: number;
    width: number;
    height: number;
}>> {
    const formData = new FormData();
    formData.append('advertiser_id', advertiserId);
    formData.append('video_file', file);
    if (options?.filename) formData.append('file_name', options.filename);
    if (options?.autoFixEnabled !== undefined) {
        formData.append('auto_fix_enabled', options.autoFixEnabled.toString());
    }
    if (options?.autoBindEnabled !== undefined) {
        formData.append('auto_bind_enabled', options.autoBindEnabled.toString());
    }

    const response = await fetch(`${API_BASE}/files/video/upload`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

/**
 * Upload an image for ads
 */
export async function uploadImage(
    advertiserId: string,
    file: File,
    filename?: string
): Promise<AdApiResponse<{
    imageId: string;
    url: string;
    width: number;
    height: number;
}>> {
    const formData = new FormData();
    formData.append('advertiser_id', advertiserId);
    formData.append('image_file', file);
    if (filename) formData.append('file_name', filename);

    const response = await fetch(`${API_BASE}/files/image/upload`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

/**
 * Get video info
 */
export async function getVideoInfo(
    advertiserId: string,
    videoIds: string[]
): Promise<AdApiResponse<{
    videoId: string;
    previewUrl: string;
    duration: number;
    width: number;
    height: number;
    status: 'PROCESSING' | 'READY' | 'FAILED';
}[]>> {
    const response = await fetch(
        `${API_BASE}/files/video/info?advertiser_id=${advertiserId}&video_ids=${JSON.stringify(videoIds)}`
    );
    return response.json();
}

// ============================================================================
// TARGETING RESEARCH
// ============================================================================

/**
 * Get available locations
 */
export async function getLocations(
    options?: {
        locationTypes?: ('COUNTRY' | 'PROVINCE' | 'CITY' | 'DISTRICT')[];
        parentId?: string;
    }
): Promise<AdApiResponse<{
    locationId: string;
    name: string;
    type: string;
    parentId?: string;
}[]>> {
    const params = new URLSearchParams();
    if (options?.locationTypes) params.set('location_types', JSON.stringify(options.locationTypes));
    if (options?.parentId) params.set('parent_id', options.parentId);

    const response = await fetch(`${API_BASE}/targeting/locations?${params}`);
    return response.json();
}

/**
 * Get available interest categories
 */
export async function getInterestCategories(
    advertiserId: string,
    options?: { language?: string }
): Promise<AdApiResponse<{
    id: string;
    name: string;
    parentId?: string;
    level: number;
}[]>> {
    const params = new URLSearchParams({ advertiser_id: advertiserId });
    if (options?.language) params.set('language', options.language);

    const response = await fetch(`${API_BASE}/targeting/interests?${params}`);
    return response.json();
}

/**
 * Get audience estimate
 */
export async function getAudienceEstimate(
    advertiserId: string,
    targeting: TikTokTargeting
): Promise<AdApiResponse<{
    audienceSize: number;
    coverage: 'LOW' | 'MEDIUM' | 'HIGH';
}>> {
    const response = await fetch(`${API_BASE}/audience/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            targeting,
        }),
    });
    return response.json();
}

// ============================================================================
// CUSTOM AUDIENCES
// ============================================================================

/**
 * Create a custom audience from customer file
 */
export async function createCustomAudience(
    advertiserId: string,
    audience: {
        name: string;
        type: 'CUSTOMER_FILE' | 'ENGAGEMENT' | 'LOOKALIKE' | 'WEBSITE_TRAFFIC' | 'APP_ACTIVITY';
        fileId?: string;  // For CUSTOMER_FILE type
    }
): Promise<AdApiResponse<{ audienceId: string }>> {
    const response = await fetch(`${API_BASE}/audiences/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            custom_audience_name: audience.name,
            audience_type: audience.type,
            file_id: audience.fileId,
        }),
    });
    return response.json();
}

/**
 * Create a lookalike audience
 */
export async function createLookalikeAudience(
    advertiserId: string,
    config: {
        name: string;
        sourceAudienceId: string;
        locations: string[];  // Location IDs
        lookalikeType: 'BALANCE' | 'REACH' | 'NARROW';
    }
): Promise<AdApiResponse<{ audienceId: string }>> {
    const response = await fetch(`${API_BASE}/audiences/lookalike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            custom_audience_name: config.name,
            source_audience_id: config.sourceAudienceId,
            location_ids: config.locations,
            lookalike_type: config.lookalikeType,
        }),
    });
    return response.json();
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get campaign metrics
 */
export async function getCampaignMetrics(
    advertiserId: string,
    options: {
        campaignIds?: string[];
        dateRange: { startDate: string; endDate: string };  // YYYY-MM-DD
        timeGranularity?: 'STAT_TIME_GRANULARITY_DAILY' | 'STAT_TIME_GRANULARITY_HOURLY' | 'STAT_TIME_GRANULARITY_LIFETIME';
    }
): Promise<AdApiResponse<CampaignMetrics[]>> {
    const response = await fetch(`${API_BASE}/reports/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_ids: options.campaignIds,
            start_date: options.dateRange.startDate,
            end_date: options.dateRange.endDate,
            time_granularity: options.timeGranularity || 'STAT_TIME_GRANULARITY_LIFETIME',
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: ['campaign_id', 'stat_time_day'],
            metrics: [
                'spend',
                'impressions',
                'reach',
                'frequency',
                'clicks',
                'ctr',
                'cpc',
                'cpm',
                'video_views_p25',
                'video_views_p50',
                'video_views_p75',
                'video_views_p100',
                'total_complete_payment_rate',
                'complete_payment',
                'conversion',
                'cost_per_conversion',
            ],
        }),
    });
    return response.json();
}

/**
 * Get real-time campaign stats
 */
export async function getRealtimeStats(
    advertiserId: string,
    campaignIds: string[]
): Promise<AdApiResponse<{
    campaignId: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}[]>> {
    const response = await fetch(`${API_BASE}/reports/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            campaign_ids: campaignIds,
        }),
    });
    return response.json();
}

// ============================================================================
// SPARK ADS (Organic Post Promotion)
// ============================================================================

/**
 * Get authorized TikTok posts for Spark Ads
 */
export async function getAuthorizedPosts(
    advertiserId: string
): Promise<AdApiResponse<{
    itemId: string;
    previewUrl: string;
    authorName: string;
    duration: number;
}[]>> {
    const response = await fetch(`${API_BASE}/spark-ads/posts?advertiser_id=${advertiserId}`);
    return response.json();
}

/**
 * Create a Spark Ad from an organic post
 */
export async function createSparkAd(
    advertiserId: string,
    ad: {
        adgroupId: string;
        name: string;
        itemId: string;  // TikTok post ID
        callToAction?: string;
        landingPageUrl?: string;
    }
): Promise<AdApiResponse<{ adId: string }>> {
    const response = await fetch(`${API_BASE}/spark-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            advertiser_id: advertiserId,
            adgroup_id: ad.adgroupId,
            ad_name: ad.name,
            tiktok_item_id: ad.itemId,
            call_to_action: ad.callToAction,
            landing_page_url: ad.landingPageUrl,
        }),
    });
    return response.json();
}

// ============================================================================
// FULL CAMPAIGN CREATION HELPER
// ============================================================================

/**
 * Create a complete TikTok campaign with ad group and ad
 */
export async function createFullCampaign(
    advertiserId: string,
    config: {
        name: string;
        objective: CampaignObjective;
        budget: { amount: number; type: 'daily' | 'lifetime' };
        schedule: { start: string; end?: string };
        targeting: AudienceTargeting;
        creative: {
            videoFile: File;
            adText: string;
            callToAction?: string;
            landingPageUrl: string;
            displayName: string;
        };
    }
): Promise<AdApiResponse<{
    campaign: UnifiedCampaign;
    adgroup: { id: string };
    ad: { id: string };
}>> {
    const formData = new FormData();
    formData.append('video', config.creative.videoFile);
    formData.append('config', JSON.stringify({
        name: config.name,
        objective: objectiveToTikTok[config.objective],
        budget: config.budget,
        schedule: config.schedule,
        targeting: toTikTokTargeting(config.targeting),
        adText: config.creative.adText,
        callToAction: config.creative.callToAction,
        landingPageUrl: config.creative.landingPageUrl,
        displayName: config.creative.displayName,
    }));

    const response = await fetch(`${API_BASE}/campaigns/full`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toTikTokTargeting(targeting: AudienceTargeting): TikTokTargeting {
    const tikTokTargeting: TikTokTargeting = {};

    // Locations
    if (targeting.locations?.length) {
        tikTokTargeting.locations = targeting.locations.map(loc => loc.value);
    }

    // Languages
    if (targeting.languages?.length) {
        tikTokTargeting.languages = targeting.languages;
    }

    // Gender
    if (targeting.genders?.length === 1) {
        tikTokTargeting.gender = targeting.genders[0] === 'male' ? 'GENDER_MALE' :
            targeting.genders[0] === 'female' ? 'GENDER_FEMALE' :
                'GENDER_UNLIMITED';
    }

    // Age groups - TikTok uses specific age group strings
    if (targeting.ageMin || targeting.ageMax) {
        const ageGroups: string[] = [];
        const ranges = [
            { min: 13, max: 17, label: 'AGE_13_17' },
            { min: 18, max: 24, label: 'AGE_18_24' },
            { min: 25, max: 34, label: 'AGE_25_34' },
            { min: 35, max: 44, label: 'AGE_35_44' },
            { min: 45, max: 54, label: 'AGE_45_54' },
            { min: 55, max: 100, label: 'AGE_55_100' },
        ];

        const targetMin = targeting.ageMin || 13;
        const targetMax = targeting.ageMax || 100;

        for (const range of ranges) {
            if (range.min <= targetMax && range.max >= targetMin) {
                ageGroups.push(range.label);
            }
        }

        tikTokTargeting.ageGroups = ageGroups;
    }

    // Interests
    if (targeting.interests?.length) {
        tikTokTargeting.interests = targeting.interests;
    }

    // Behaviors
    if (targeting.behaviors?.length) {
        tikTokTargeting.behaviors = targeting.behaviors;
    }

    // Devices
    if (targeting.devices?.length) {
        tikTokTargeting.operatingSystems = targeting.devices.includes('mobile')
            ? ['IOS', 'ANDROID']
            : undefined;
    }

    return tikTokTargeting;
}