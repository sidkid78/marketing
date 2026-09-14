import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    MousePointer,
    Target,
    RefreshCw,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import type { AdPlatform, UnifiedCampaign, CampaignMetrics } from '../../services/ads/types';

interface AnalyticsDashboardProps {
    campaigns: UnifiedCampaign[];
    metrics: CampaignMetrics[];
    connectedPlatforms: Set<AdPlatform>;
}

type DateRange = '7d' | '14d' | '30d' | '90d' | 'custom';

const platformColors: Record<AdPlatform, string> = {
    twitter: '#1DA1F2',
    meta: '#1877F2',
    google: '#4285F4',
    linkedin: '#0A66C2',
    tiktok: '#FF0050',
};

const platformIcons: Record<AdPlatform, string> = {
    twitter: '𝕏',
    meta: '📘',
    google: '🔍',
    linkedin: '💼',
    tiktok: '🎵',
};

export function AnalyticsDashboard({ campaigns, metrics, connectedPlatforms }: AnalyticsDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | 'all'>('all');

    // Calculate aggregate metrics
    const aggregateMetrics = {
        totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
        totalConversions: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
        avgCtr: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length : 0,
        avgCpc: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpc, 0) / metrics.length : 0,
        avgCpm: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpm, 0) / metrics.length : 0,
    };

    // Group metrics by platform
    const metricsByPlatform = metrics.reduce((acc, m) => {
        if (!acc[m.platform]) {
            acc[m.platform] = {
                spend: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0,
            };
        }
        acc[m.platform].spend += m.spend;
        acc[m.platform].impressions += m.impressions;
        acc[m.platform].clicks += m.clicks;
        acc[m.platform].conversions += m.conversions || 0;
        return acc;
    }, {} as Record<AdPlatform, { spend: number; impressions: number; clicks: number; conversions: number }>);

    // Filter metrics for display
    const filteredMetrics = selectedPlatform === 'all'
        ? metrics
        : metrics.filter(m => m.platform === selectedPlatform);

    // Mock trend data (would come from comparing to previous period)
    const trends = {
        spend: 12.5,
        impressions: -3.2,
        clicks: 8.7,
        conversions: 15.3,
    };

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 size={20} className="text-ink" />
                        Performance Analytics
                    </h2>
                    <p className="text-ink-soft text-sm mt-1">Cross-platform campaign insights</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex bg-sheet rounded-lg border border-rule p-1">
                        {(['7d', '14d', '30d', '90d'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded text-xs transition-all ${dateRange === range
                                        ? 'bg-signal/20 text-ink'
                                        : 'text-ink-soft hover:text-ink'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Platform Filter */}
                    <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value as AdPlatform | 'all')}
                        className="bg-sheet border border-rule rounded-lg px-3 py-1.5 text-sm focus:border-rule focus:outline-none"
                    >
                        <option value="all">All Platforms</option>
                        {Array.from(connectedPlatforms).map((platform) => (
                            <option key={platform} value={platform}>
                                {platformIcons[platform]} {platform}
                            </option>
                        ))}
                    </select>

                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-sheet border border-rule rounded-lg text-xs text-ink-soft hover:text-ink hover:border-rule transition-all">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard
                    label="Total Spend"
                    value={`$${aggregateMetrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    trend={trends.spend}
                    icon={<DollarSign size={20} />}
                    color="magenta"
                />
                <KPICard
                    label="Impressions"
                    value={formatNumber(aggregateMetrics.totalImpressions)}
                    trend={trends.impressions}
                    icon={<Eye size={20} />}
                    color="cyan"
                />
                <KPICard
                    label="Clicks"
                    value={formatNumber(aggregateMetrics.totalClicks)}
                    trend={trends.clicks}
                    icon={<MousePointer size={20} />}
                    color="green"
                />
                <KPICard
                    label="Conversions"
                    value={formatNumber(aggregateMetrics.totalConversions)}
                    trend={trends.conversions}
                    icon={<Target size={20} />}
                    color="yellow"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-sheet rounded-xl border border-rule p-4">
                    <p className="text-xs text-ink mb-1">AVG CTR</p>
                    <p className="text-2xl font-bold text-ink">
                        {aggregateMetrics.avgCtr.toFixed(2)}%
                    </p>
                </div>
                <div className="bg-sheet rounded-xl border border-rule p-4">
                    <p className="text-xs text-ink mb-1">AVG CPC</p>
                    <p className="text-2xl font-bold text-ink">
                        ${aggregateMetrics.avgCpc.toFixed(2)}
                    </p>
                </div>
                <div className="bg-sheet rounded-xl border border-rule p-4">
                    <p className="text-xs text-ink mb-1">AVG CPM</p>
                    <p className="text-2xl font-bold text-working">
                        ${aggregateMetrics.avgCpm.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-sheet rounded-xl border border-rule p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-signal"></div>
                    Platform Performance
                </h3>

                {Object.keys(metricsByPlatform).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(metricsByPlatform).map(([platform, data]) => {
                            const totalSpend = aggregateMetrics.totalSpend || 1;
                            const percentage = (data.spend / totalSpend) * 100;

                            return (
                                <div key={platform} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{platformIcons[platform as AdPlatform]}</span>
                                            <span className="text-sm">{platform}</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <span className="text-ink">
                                                ${data.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-ink">
                                                {formatNumber(data.impressions)} imp
                                            </span>
                                            <span className="text-ink">
                                                {formatNumber(data.clicks)} clicks
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-sheet rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: platformColors[platform as AdPlatform],
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <BarChart3 size={48} className="mx-auto text-ink mb-4" />
                        <p className="text-ink">No performance data available</p>
                        <p className="text-ink text-sm mt-1">Create campaigns to see analytics</p>
                    </div>
                )}
            </div>

            {/* Campaign Performance Table */}
            <div className="bg-sheet rounded-xl border border-rule p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-signal"></div>
                    Campaign Performance
                </h3>

                {campaigns.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-ink border-b border-rule">
                                    <th className="pb-3 pr-4">Campaign</th>
                                    <th className="pb-3 px-4">Platform</th>
                                    <th className="pb-3 px-4 text-right">Spend</th>
                                    <th className="pb-3 px-4 text-right">Impressions</th>
                                    <th className="pb-3 px-4 text-right">Clicks</th>
                                    <th className="pb-3 px-4 text-right">CTR</th>
                                    <th className="pb-3 pl-4 text-right">CPC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.slice(0, 10).map((campaign) => {
                                    const campaignMetrics = metrics.find(m => m.campaignId === campaign.id);
                                    return (
                                        <tr
                                            key={campaign.id}
                                            className="border-b border-rule/50 hover:bg-muted transition-colors"
                                        >
                                            <td className="py-3 pr-4">
                                                <p className="text-sm truncate max-w-[200px]">{campaign.name}</p>
                                                <p className="text-xs text-ink">{campaign.objective}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xl">{platformIcons[campaign.platform]}</span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm">
                                                ${campaignMetrics?.spend.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-ink">
                                                {formatNumber(campaignMetrics?.impressions || 0)}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-ink">
                                                {formatNumber(campaignMetrics?.clicks || 0)}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm">
                                                <span className={getCtrColor(campaignMetrics?.ctr || 0)}>
                                                    {campaignMetrics?.ctr.toFixed(2) || '0.00'}%
                                                </span>
                                            </td>
                                            <td className="py-3 pl-4 text-right text-sm text-ink">
                                                ${campaignMetrics?.cpc.toFixed(2) || '0.00'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-ink">No campaigns to display</p>
                    </div>
                )}
            </div>

            {/* Insights Section */}
            <div className="bg-sheet rounded-xl border border-working/30 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-working"></div>
                    AI Insights
                    <span className="ml-auto text-xs text-ink font-normal">Powered by Gemini</span>
                </h3>

                <div className="space-y-3">
                    <InsightCard
                        type="success"
                        title="Top Performer"
                        description="Your Twitter engagement campaign is outperforming industry benchmarks by 23%. Consider increasing budget allocation."
                    />
                    <InsightCard
                        type="warning"
                        title="Optimization Opportunity"
                        description="Meta campaigns have a higher CPC than average. Review targeting to improve efficiency."
                    />
                    <InsightCard
                        type="info"
                        title="Trend Alert"
                        description="Video content is generating 3x more engagement. Consider creating more video ads."
                    />
                </div>
            </div>
        </div>
    );
}

function KPICard({
    label,
    value,
    trend,
    icon,
    color
}: {
    label: string;
    value: string;
    trend: number;
    icon: React.ReactNode;
    color: 'cyan' | 'magenta' | 'green' | 'yellow';
}) {
    const colors = {
        cyan: 'border-rule text-ink',
        magenta: 'border-rule text-ink',
        green: 'border-positive/30 text-positive',
        yellow: 'border-working/30 text-working',
    };

    const isPositive = trend >= 0;

    return (
        <div className={`bg-sheet rounded-xl border ${colors[color]} p-4`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-ink-soft text-xs">{label}</span>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs ${isPositive ? 'text-positive' : 'text-destructive'
                }`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{trend.toFixed(1)}%</span>
                <span className="text-ink-soft">vs last period</span>
            </div>
        </div>
    );
}

function InsightCard({
    type,
    title,
    description
}: {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
}) {
    const styles = {
        success: 'border-positive/30 bg-positive/5',
        warning: 'border-working/30 bg-working/10',
        info: 'border-rule bg-signal/5',
    };

    const iconColors = {
        success: 'text-positive',
        warning: 'text-working',
        info: 'text-ink',
    };

    return (
        <div className={`rounded-lg border p-4 ${styles[type]}`}>
            <div className="flex items-start gap-3">
                <TrendingUp size={16} className={`flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
                <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-ink-soft text-sm mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

function getCtrColor(ctr: number): string {
    if (ctr >= 2) return 'text-positive';
    if (ctr >= 1) return 'text-working';
    return 'text-ink-soft';
}