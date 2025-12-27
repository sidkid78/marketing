/**
 * Unified Ad Platform Services
 * 
 * This module provides a unified interface for managing ads across
 * multiple platforms: Twitter/X, Meta (Facebook/Instagram), Google Ads,
 * LinkedIn, and TikTok.
 * 
 * Each platform service follows the same patterns:
 * - Normalized types from ./types.ts
 * - API calls go through Next.js API routes (credentials stay server-side)
 * - createFullCampaign() helper for complete campaign setup
 */

// Types
export * from './types';

// Platform services
export * as twitter from './twitter';
export * as meta from './meta';
export * as google from './google';
export * as linkedin from './linkedin';
export * as tiktok from './tiktok';

// Re-export commonly used types for convenience
export type {
    AdPlatform,
    UnifiedCampaign,
    CampaignMetrics,
    CampaignObjective,
    AudienceTargeting,
    AdCreative,
    Budget,
    GeoTarget,
    AdApiResponse,
} from './types';

// ============================================================================
// UNIFIED CAMPAIGN MANAGER
// ============================================================================

import type {
    AdPlatform,
    UnifiedCampaign,
    CampaignMetrics,
    CampaignObjective,
    AudienceTargeting,
    AdCreative,
    Budget,
    AdApiResponse,
    PaginatedResponse,
} from './types';

import * as twitter from './twitter';
import * as meta from './meta';
import * as google from './google';
import * as linkedin from './linkedin';
import * as tiktok from './tiktok';

/**
 * Unified interface for cross-platform campaign management
 */
export class CampaignManager {
    private accountIds: Partial<Record<AdPlatform, string>> = {};

    /**
     * Set the account ID for a platform
     */
    setAccountId(platform: AdPlatform, accountId: string): void {
        this.accountIds[platform] = accountId;
    }

    /**
     * Get configured account IDs
     */
    getAccountIds(): Partial<Record<AdPlatform, string>> {
        return { ...this.accountIds };
    }

    /**
     * List campaigns across all configured platforms
     */
    async listAllCampaigns(): Promise<{
        platform: AdPlatform;
        campaigns: UnifiedCampaign[];
        error?: string;
    }[]> {
        const results: {
            platform: AdPlatform;
            campaigns: UnifiedCampaign[];
            error?: string;
        }[] = [];

        const platforms: AdPlatform[] = ['twitter', 'meta', 'google', 'linkedin', 'tiktok'];

        for (const platform of platforms) {
            const accountId = this.accountIds[platform];
            if (!accountId) continue;

            try {
                let response: AdApiResponse<PaginatedResponse<UnifiedCampaign>>;

                switch (platform) {
                    case 'twitter':
                        response = await twitter.listCampaigns(accountId);
                        break;
                    case 'meta':
                        response = await meta.listCampaigns(accountId);
                        break;
                    case 'google':
                        response = await google.listCampaigns(accountId);
                        break;
                    case 'linkedin':
                        response = await linkedin.listCampaigns(accountId);
                        break;
                    case 'tiktok':
                        response = await tiktok.listCampaigns(accountId);
                        break;
                }

                if (response.success && response.data) {
                    results.push({
                        platform,
                        campaigns: response.data.items.map(c => ({ ...c, platform })),
                    });
                } else {
                    results.push({
                        platform,
                        campaigns: [],
                        error: response.error?.message,
                    });
                }
            } catch (error) {
                results.push({
                    platform,
                    campaigns: [],
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return results;
    }

    /**
     * Get campaign metrics across platforms
     */
    async getCampaignMetrics(
        dateRange: { start: string; end: string }
    ): Promise<{
        platform: AdPlatform;
        metrics: CampaignMetrics[];
        error?: string;
    }[]> {
        const results: {
            platform: AdPlatform;
            metrics: CampaignMetrics[];
            error?: string;
        }[] = [];

        // First get all campaigns
        const allCampaigns = await this.listAllCampaigns();

        for (const { platform, campaigns, error: listError } of allCampaigns) {
            if (listError || !campaigns.length) {
                results.push({ platform, metrics: [], error: listError });
                continue;
            }

            const accountId = this.accountIds[platform]!;
            const campaignIds = campaigns.map(c => c.externalId || c.id!);

            try {
                let response: AdApiResponse<CampaignMetrics[]>;

                switch (platform) {
                    case 'twitter':
                        response = await twitter.getCampaignMetrics(accountId, campaignIds, {
                            startDate: dateRange.start,
                            endDate: dateRange.end,
                        });
                        break;
                    case 'meta':
                        response = await meta.getCampaignInsights(accountId, campaignIds, {
                            timeRange: { since: dateRange.start, until: dateRange.end },
                        });
                        break;
                    case 'google':
                        response = await google.getCampaignMetrics(accountId, {
                            campaignIds,
                            dateRange: { startDate: dateRange.start, endDate: dateRange.end },
                        });
                        break;
                    case 'linkedin':
                        response = await linkedin.getCampaignAnalytics(accountId, {
                            campaignIds,
                            dateRange: { start: dateRange.start, end: dateRange.end },
                        });
                        break;
                    case 'tiktok':
                        response = await tiktok.getCampaignMetrics(accountId, {
                            campaignIds,
                            dateRange: { startDate: dateRange.start, endDate: dateRange.end },
                        });
                        break;
                }

                if (response.success && response.data) {
                    results.push({
                        platform,
                        metrics: response.data.map(m => ({ ...m, platform })),
                    });
                } else {
                    results.push({
                        platform,
                        metrics: [],
                        error: response.error?.message,
                    });
                }
            } catch (error) {
                results.push({
                    platform,
                    metrics: [],
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return results;
    }

    /**
     * Calculate aggregated metrics across all platforms
     */
    async getAggregatedMetrics(
        dateRange: { start: string; end: string }
    ): Promise<{
        totalSpend: number;
        totalImpressions: number;
        totalClicks: number;
        totalConversions: number;
        avgCtr: number;
        avgCpc: number;
        avgCpm: number;
        byPlatform: Record<AdPlatform, {
            spend: number;
            impressions: number;
            clicks: number;
            conversions: number;
        }>;
    }> {
        const allMetrics = await this.getCampaignMetrics(dateRange);

        const byPlatform: Record<AdPlatform, {
            spend: number;
            impressions: number;
            clicks: number;
            conversions: number;
        }> = {
            twitter: { spend: 0, impressions: 0, clicks: 0, conversions: 0 },
            meta: { spend: 0, impressions: 0, clicks: 0, conversions: 0 },
            google: { spend: 0, impressions: 0, clicks: 0, conversions: 0 },
            linkedin: { spend: 0, impressions: 0, clicks: 0, conversions: 0 },
            tiktok: { spend: 0, impressions: 0, clicks: 0, conversions: 0 },
        };

        let totalSpend = 0;
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalConversions = 0;

        for (const { platform, metrics } of allMetrics) {
            for (const m of metrics) {
                totalSpend += m.spend;
                totalImpressions += m.impressions;
                totalClicks += m.clicks;
                totalConversions += m.conversions || 0;

                byPlatform[platform].spend += m.spend;
                byPlatform[platform].impressions += m.impressions;
                byPlatform[platform].clicks += m.clicks;
                byPlatform[platform].conversions += m.conversions || 0;
            }
        }

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalConversions,
            avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
            avgCpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
            byPlatform,
        };
    }
}

// Export a singleton instance for convenience
export const campaignManager = new CampaignManager();