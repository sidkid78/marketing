/**
 * LinkedIn Marketing API Service
 * 
 * LinkedIn Marketing Solutions API integration
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/
 * 
 * Required Setup:
 * 1. Create LinkedIn Marketing Solutions account
 * 2. Apply for Marketing Developer Platform access (strict review process)
 * 3. Create OAuth app with Marketing API product
 * 4. Authenticate with rw_ads, r_ads_reporting permissions
 * 
 * Environment variables:
 * - LINKEDIN_CLIENT_ID
 * - LINKEDIN_CLIENT_SECRET
 * - LINKEDIN_ACCESS_TOKEN
 * - LINKEDIN_AD_ACCOUNT_ID
 */

import type {
    AdApiResponse,
    UnifiedCampaign,
    CampaignMetrics,
    LinkedInObjective,
    LinkedInTargeting,
    CampaignObjective,
    AudienceTargeting,
    AdCreative,
    PaginatedResponse,
} from './types';

const API_BASE = '/api/ads/linkedin';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

const objectiveToLinkedIn: Record<CampaignObjective, LinkedInObjective> = {
    awareness: 'BRAND_AWARENESS',
    traffic: 'WEBSITE_VISITS',
    engagement: 'ENGAGEMENT',
    leads: 'LEAD_GENERATION',
    conversions: 'WEBSITE_CONVERSIONS',
    app_installs: 'WEBSITE_VISITS',  // LinkedIn doesn't have app install objective
    video_views: 'VIDEO_VIEWS',
    catalog_sales: 'WEBSITE_CONVERSIONS',
};

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Get ad accounts (sponsored accounts)
 */
export async function getAdAccounts(): Promise<AdApiResponse<{
    id: string;
    name: string;
    currency: string;
    status: string;
    type: string;
}[]>> {
    const response = await fetch(`${API_BASE}/accounts`);
    return response.json();
}

/**
 * Get account details including available budget
 */
export async function getAccountDetails(
    accountId: string
): Promise<AdApiResponse<{
    id: string;
    name: string;
    currency: string;
    status: string;
    totalBudget: number;
    totalSpend: number;
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}`);
    return response.json();
}

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * List campaigns (campaign groups in LinkedIn terminology)
 */
export async function listCampaigns(
    accountId: string,
    options?: {
        status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'CANCELED' | 'DRAFT';
        start?: number;
        count?: number;
    }
): Promise<AdApiResponse<PaginatedResponse<UnifiedCampaign>>> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.start) params.set('start', options.start.toString());
    if (options?.count) params.set('count', options.count.toString());

    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns?${params}`);
    return response.json();
}

/**
 * Create a campaign group
 */
export async function createCampaignGroup(
    accountId: string,
    campaignGroup: {
        name: string;
        status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
        budget?: { amount: number; type: 'daily' | 'lifetime' };
        schedule?: { start: string; end?: string };
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaign-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignGroup),
    });
    return response.json();
}

/**
 * Create a campaign (within a campaign group)
 */
export async function createCampaign(
    accountId: string,
    campaign: {
        campaignGroupId: string;
        name: string;
        objective: LinkedInObjective;
        type: 'TEXT_AD' | 'SPONSORED_UPDATES' | 'SPONSORED_INMAILS' | 'DYNAMIC';
        targeting: LinkedInTargeting;
        budget: { amount: number; type: 'daily' | 'total' };
        bidAmount?: number;
        bidType?: 'CPC' | 'CPM' | 'CPV';
        schedule?: { start: string; end?: string };
        creativeSelection?: 'OPTIMIZED' | 'ROUND_ROBIN';
    }
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
    });
    return response.json();
}

/**
 * Update a campaign
 */
export async function updateCampaign(
    accountId: string,
    campaignId: string,
    updates: Partial<{
        name: string;
        status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
        dailyBudget: number;
        totalBudget: number;
        bidAmount: number;
    }>
): Promise<AdApiResponse<UnifiedCampaign>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
}

// ============================================================================
// CREATIVE MANAGEMENT
// ============================================================================

/**
 * Create a creative (ad content)
 */
export async function createCreative(
    accountId: string,
    creative: {
        campaignId: string;
        type: 'SPONSORED_STATUS_UPDATE' | 'SPONSORED_VIDEO' | 'SPONSORED_INMAIL';
        status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
        // For sponsored updates
        share?: {
            commentary: string;
            shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE' | 'VIDEO';
            media?: {
                title?: string;
                description?: string;
                originalUrl?: string;  // For articles
                media?: string;  // Asset URN for images/videos
            };
        };
        // Call to action
        callToAction?: {
            labelType: 'APPLY' | 'DOWNLOAD' | 'GET_QUOTE' | 'LEARN_MORE' | 'REGISTER' | 'REQUEST_DEMO' | 'SIGN_UP' | 'SUBSCRIBE';
        };
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/creatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creative),
    });
    return response.json();
}

/**
 * List creatives for a campaign
 */
export async function listCreatives(
    accountId: string,
    campaignId: string
): Promise<AdApiResponse<{
    id: string;
    status: string;
    type: string;
    review?: { status: string; rejectionReasons?: string[] };
}[]>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/${campaignId}/creatives`);
    return response.json();
}

// ============================================================================
// MEDIA UPLOAD
// ============================================================================

/**
 * Upload an image for use in ads
 */
export async function uploadImage(
    accountId: string,
    file: File
): Promise<AdApiResponse<{ urn: string; downloadUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/images`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

/**
 * Upload a video for use in ads
 */
export async function uploadVideo(
    accountId: string,
    file: File,
    title?: string
): Promise<AdApiResponse<{ urn: string; status: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/videos`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

// ============================================================================
// TARGETING RESEARCH
// ============================================================================

/**
 * Search for companies to target
 */
export async function searchCompanies(
    query: string
): Promise<AdApiResponse<{
    urn: string;
    name: string;
    industry: string;
    employeeCount: string;
}[]>> {
    const response = await fetch(`${API_BASE}/targeting/companies?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Search for job titles to target
 */
export async function searchJobTitles(
    query: string
): Promise<AdApiResponse<{ urn: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/job-titles?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Search for skills to target
 */
export async function searchSkills(
    query: string
): Promise<AdApiResponse<{ urn: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/skills?q=${encodeURIComponent(query)}`);
    return response.json();
}

/**
 * Get available industries
 */
export async function getIndustries(): Promise<AdApiResponse<{ urn: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/industries`);
    return response.json();
}

/**
 * Get seniority levels
 */
export async function getSeniorities(): Promise<AdApiResponse<{ urn: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/seniorities`);
    return response.json();
}

/**
 * Get job functions
 */
export async function getJobFunctions(): Promise<AdApiResponse<{ urn: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/job-functions`);
    return response.json();
}

/**
 * Get company sizes
 */
export async function getCompanySizes(): Promise<AdApiResponse<{ id: string; name: string }[]>> {
    const response = await fetch(`${API_BASE}/targeting/company-sizes`);
    return response.json();
}

/**
 * Get audience count estimate
 */
export async function getAudienceCount(
    accountId: string,
    targeting: LinkedInTargeting
): Promise<AdApiResponse<{
    total: number;
    active: number;  // Members active in last 30 days
}>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/audience-counts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targeting }),
    });
    return response.json();
}

// ============================================================================
// MATCHED AUDIENCES (Custom Audiences)
// ============================================================================

/**
 * Create a matched audience from company list
 */
export async function createCompanyListAudience(
    accountId: string,
    audience: {
        name: string;
        companyUrns: string[];  // Company page URNs
    }
): Promise<AdApiResponse<{ urn: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/matched-audiences/company-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audience),
    });
    return response.json();
}

/**
 * Create a matched audience from contact list
 */
export async function createContactListAudience(
    accountId: string,
    audience: {
        name: string;
        emails: string[];  // Email addresses
    }
): Promise<AdApiResponse<{ urn: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/matched-audiences/contact-list`, {
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
        sourceAudienceUrn: string;
        countries: string[];  // Country codes
    }
): Promise<AdApiResponse<{ urn: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/matched-audiences/lookalike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    return response.json();
}

// ============================================================================
// LEAD GEN FORMS
// ============================================================================

/**
 * Create a lead gen form
 */
export async function createLeadGenForm(
    accountId: string,
    form: {
        name: string;
        headline: string;
        description?: string;
        privacyPolicyUrl: string;
        thankYouMessage: string;
        thankYouLandingPageUrl?: string;
        questions: Array<{
            questionType: 'FIRST_NAME' | 'LAST_NAME' | 'EMAIL' | 'PHONE' | 'COMPANY' | 'JOB_TITLE' | 'WORK_EMAIL' | 'WORK_PHONE' | 'CITY' | 'STATE' | 'COUNTRY' | 'ZIP' | 'CUSTOM';
            customQuestionText?: string;
            required?: boolean;
        }>;
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/lead-gen-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    });
    return response.json();
}

/**
 * Get leads from a form
 */
export async function getFormLeads(
    accountId: string,
    formId: string,
    options?: {
        startTime?: string;
        endTime?: string;
    }
): Promise<AdApiResponse<{
    id: string;
    submittedAt: string;
    fields: Record<string, string>;
}[]>> {
    const params = new URLSearchParams();
    if (options?.startTime) params.set('start', options.startTime);
    if (options?.endTime) params.set('end', options.endTime);

    const response = await fetch(`${API_BASE}/accounts/${accountId}/lead-gen-forms/${formId}/leads?${params}`);
    return response.json();
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(
    accountId: string,
    options: {
        campaignIds?: string[];
        dateRange: { start: string; end: string };
        granularity?: 'ALL' | 'DAILY' | 'MONTHLY';
        pivots?: ('CAMPAIGN' | 'CREATIVE' | 'MEMBER_COMPANY_SIZE' | 'MEMBER_INDUSTRY' | 'MEMBER_SENIORITY' | 'MEMBER_JOB_TITLE')[];
    }
): Promise<AdApiResponse<CampaignMetrics[]>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
    });
    return response.json();
}

// ============================================================================
// CONVERSIONS
// ============================================================================

/**
 * Create a conversion rule
 */
export async function createConversion(
    accountId: string,
    conversion: {
        name: string;
        type: 'PURCHASE' | 'SIGN_UP' | 'LEAD' | 'DOWNLOAD' | 'KEY_PAGE_VIEW' | 'ADD_TO_CART' | 'INSTALL' | 'OTHER';
        attributionType: 'LAST_TOUCH_BY_CAMPAIGN' | 'LAST_TOUCH_BY_CONVERSION';
        postClickAttributionWindowSize: 1 | 7 | 30 | 90;
        viewThroughAttributionWindowSize: 1 | 7 | 30;
        conversionMethod: 'URL' | 'INSIGHT_TAG_BASED';
        urlMatchRules?: Array<{
            type: 'EXACT' | 'STARTS_WITH' | 'CONTAINS' | 'REGEX';
            matchString: string;
        }>;
    }
): Promise<AdApiResponse<{ id: string }>> {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversion),
    });
    return response.json();
}

// ============================================================================
// FULL CAMPAIGN CREATION HELPER
// ============================================================================

/**
 * Create a complete LinkedIn campaign with creative
 */
export async function createFullCampaign(
    accountId: string,
    config: {
        name: string;
        objective: CampaignObjective;
        budget: { amount: number; type: 'daily' | 'lifetime' };
        schedule: { start: string; end?: string };
        targeting: AudienceTargeting;
        creative: {
            headline: string;
            commentary: string;
            imageFile?: File;
            destinationUrl: string;
            callToAction: string;
        };
    }
): Promise<AdApiResponse<{
    campaignGroup: { id: string };
    campaign: UnifiedCampaign;
    creative: { id: string };
}>> {
    const formData = new FormData();
    formData.append('config', JSON.stringify({
        name: config.name,
        objective: objectiveToLinkedIn[config.objective],
        budget: config.budget,
        schedule: config.schedule,
        targeting: toLinkedInTargeting(config.targeting),
        creative: {
            headline: config.creative.headline,
            commentary: config.creative.commentary,
            destinationUrl: config.creative.destinationUrl,
            callToAction: config.creative.callToAction,
        },
    }));

    if (config.creative.imageFile) {
        formData.append('image', config.creative.imageFile);
    }

    const response = await fetch(`${API_BASE}/accounts/${accountId}/campaigns/full`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toLinkedInTargeting(targeting: AudienceTargeting): LinkedInTargeting {
    const linkedInTargeting: LinkedInTargeting = {};

    // Locations (need to convert to URNs)
    if (targeting.locations?.length) {
        linkedInTargeting.locations = targeting.locations.map(loc => ({ urn: loc.value }));
    }

    // Industries
    if (targeting.industries?.length) {
        linkedInTargeting.industries = targeting.industries.map(id => ({ urn: id }));
    }

    // Companies
    if (targeting.companies?.length) {
        linkedInTargeting.companyNames = targeting.companies.map(id => ({ urn: id }));
    }

    // Job titles
    if (targeting.jobTitles?.length) {
        linkedInTargeting.jobTitles = targeting.jobTitles.map(id => ({ urn: id }));
    }

    // Skills
    if (targeting.skills?.length) {
        linkedInTargeting.skills = targeting.skills.map(id => ({ urn: id }));
    }

    // Seniorities
    if (targeting.seniorities?.length) {
        linkedInTargeting.seniorities = targeting.seniorities;
    }

    // Company size
    if (targeting.companySize?.length) {
        linkedInTargeting.companySizes = targeting.companySize;
    }

    return linkedInTargeting;
}