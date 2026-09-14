import React, { useState } from 'react';
import {
    RefreshCw,
    Search,
    Filter,
    Play,
    Pause,
    Trash2,
    MoreVertical,
    ExternalLink,
    Calendar,
    DollarSign,
    Eye,
    MousePointer,
    TrendingUp,
    ChevronDown
} from 'lucide-react';
import type { AdPlatform, UnifiedCampaign, CampaignStatus, CampaignObjective } from '../../services/ads/types';

interface CampaignListProps {
    campaigns: UnifiedCampaign[];
    onRefresh: () => void;
    isLoading: boolean;
}

const platformIcons: Record<AdPlatform, string> = {
    twitter: '𝕏',
    meta: '📘',
    google: '🔍',
    linkedin: '💼',
    tiktok: '🎵',
};

const statusColors: Record<CampaignStatus, string> = {
    active: 'bg-positive/20 text-positive border-positive/30',
    paused: 'bg-working/10 text-working border-working/30',
    draft: 'bg-muted text-ink-soft border-rule',
    completed: 'bg-muted text-ink border-rule',
    rejected: 'bg-destructive/10 text-destructive border-destructive/30',
    pending_review: 'bg-working/10 text-working border-working/30',
};

const objectiveLabels: Record<CampaignObjective, string> = {
    awareness: 'Brand Awareness',
    traffic: 'Website Traffic',
    engagement: 'Engagement',
    leads: 'Lead Generation',
    conversions: 'Conversions',
    app_installs: 'App Installs',
    video_views: 'Video Views',
    catalog_sales: 'Catalog Sales',
};

export function CampaignList({ campaigns, onRefresh, isLoading }: CampaignListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<AdPlatform | 'all'>('all');
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    // Group by platform for summary
    const platformSummary = campaigns.reduce((acc, campaign) => {
        acc[campaign.platform] = (acc[campaign.platform] || 0) + 1;
        return acc;
    }, {} as Record<AdPlatform, number>);

    const handleStatusChange = async (campaignId: string, newStatus: 'active' | 'paused') => {
        // This would call the appropriate platform API
        console.log('Changing status:', campaignId, newStatus);
    };

    return (
        <div className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-sheet border border-rule rounded-lg text-sm focus:border-rule focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${showFilters
                                ? 'bg-signal/20 text-ink border border-rule'
                                : 'bg-sheet border border-rule text-ink-soft hover:text-ink'
                            }`}
                    >
                        <Filter size={14} />
                        Filters
                        {(statusFilter !== 'all' || platformFilter !== 'all') && (
                            <span className="w-2 h-2 rounded-full bg-signal"></span>
                        )}
                    </button>

                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-signal/20 text-ink border border-rule rounded-lg text-sm hover:bg-signal/30 transition-all"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-sheet rounded-xl border border-rule p-4 flex flex-wrap gap-4">
                    <div>
                        <label className="text-xs text-ink mb-1 block">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
                            className="bg-sheet border border-rule rounded-lg px-3 py-1.5 text-sm focus:border-rule focus:outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="draft">Draft</option>
                            <option value="pending_review">Pending Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-ink mb-1 block">Platform</label>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value as AdPlatform | 'all')}
                            className="bg-sheet border border-rule rounded-lg px-3 py-1.5 text-sm focus:border-rule focus:outline-none"
                        >
                            <option value="all">All Platforms</option>
                            <option value="twitter">X (Twitter)</option>
                            <option value="meta">Meta (FB/IG)</option>
                            <option value="google">Google Ads</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="tiktok">TikTok</option>
                        </select>
                    </div>

                    {(statusFilter !== 'all' || platformFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setPlatformFilter('all');
                            }}
                            className="self-end text-xs text-ink hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Platform Summary */}
            {Object.keys(platformSummary).length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(platformSummary).map(([platform, count]) => (
                        <button
                            key={platform}
                            onClick={() => setPlatformFilter(platformFilter === platform ? 'all' : platform as AdPlatform)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${platformFilter === platform
                                    ? 'bg-signal/20 text-ink border border-rule'
                                    : 'bg-sheet border border-rule text-ink-soft hover:border-rule'
                                }`}
                        >
                            <span>{platformIcons[platform as AdPlatform]}</span>
                            <span>{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Campaign List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={24} className="animate-spin text-ink" />
                    <span className="ml-3 text-ink-soft">Loading campaigns...</span>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-ink-soft">
                        {campaigns.length === 0
                            ? 'No campaigns found'
                            : 'No campaigns match your filters'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            isExpanded={expandedCampaign === campaign.id}
                            onToggleExpand={() => setExpandedCampaign(
                                expandedCampaign === campaign.id ? null : campaign.id!
                            )}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}

            {/* Results count */}
            {!isLoading && filteredCampaigns.length > 0 && (
                <p className="text-center text-xs text-ink-soft">
                    Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                </p>
            )}
        </div>
    );
}

function CampaignCard({
    campaign,
    isExpanded,
    onToggleExpand,
    onStatusChange
}: {
    campaign: UnifiedCampaign;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onStatusChange: (id: string, status: 'active' | 'paused') => void;
}) {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="bg-sheet rounded-xl border border-rule hover:border-rule transition-all overflow-hidden">
            {/* Main Row */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{platformIcons[campaign.platform]}</span>
                    <div>
                        <h3 className="font-bold">{campaign.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[campaign.status]}`}>
                                {campaign.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-ink-soft">
                                {objectiveLabels[campaign.objective]}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Budget */}
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-ink-soft">Budget</p>
                        <p className="text-sm">
                            ${campaign.budget.amount.toLocaleString()}
                            <span className="text-ink-soft">/{campaign.budget.type === 'daily' ? 'day' : 'total'}</span>
                        </p>
                    </div>

                    {/* Schedule */}
                    <div className="text-right hidden lg:block">
                        <p className="text-xs text-ink-soft">Schedule</p>
                        <p className="text-xs text-ink-soft">
                            {new Date(campaign.schedule.start).toLocaleDateString()}
                            {campaign.schedule.end && ` - ${new Date(campaign.schedule.end).toLocaleDateString()}`}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(!showActions);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <MoreVertical size={16} className="text-ink-soft" />
                        </button>

                        {showActions && (
                            <div className="absolute right-0 top-full mt-1 bg-sheet border border-rule rounded-lg z-10 py-1 min-w-[150px]">
                                {campaign.status === 'active' ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(campaign.id!, 'paused');
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted text-working"
                                    >
                                        <Pause size={14} />
                                        Pause
                                    </button>
                                ) : campaign.status === 'paused' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(campaign.id!, 'active');
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted text-positive"
                                    >
                                        <Play size={14} />
                                        Activate
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Open in platform
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted text-ink-soft"
                                >
                                    <ExternalLink size={14} />
                                    Open in {campaign.platform}
                                </button>
                            </div>
                        )}
                    </div>

                    <ChevronDown
                        size={16}
                        className={`text-ink-soft transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-rule p-4 bg-sheet">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <MetricBox
                            label="Impressions"
                            value="--"
                            icon={<Eye size={14} />}
                        />
                        <MetricBox
                            label="Clicks"
                            value="--"
                            icon={<MousePointer size={14} />}
                        />
                        <MetricBox
                            label="CTR"
                            value="--"
                            icon={<TrendingUp size={14} />}
                        />
                        <MetricBox
                            label="Spend"
                            value="--"
                            icon={<DollarSign size={14} />}
                        />
                    </div>

                    {/* Targeting Summary */}
                    <div className="bg-sheet rounded-lg p-3 mb-4">
                        <h4 className="text-xs text-ink-soft mb-2">TARGETING</h4>
                        <div className="flex flex-wrap gap-2">
                            {campaign.targeting.ageMin && (
                                <span className="px-2 py-1 bg-sheet rounded text-xs text-ink-soft">
                                    Age: {campaign.targeting.ageMin}-{campaign.targeting.ageMax || '65+'}
                                </span>
                            )}
                            {campaign.targeting.genders?.length && campaign.targeting.genders[0] !== 'all' && (
                                <span className="px-2 py-1 bg-sheet rounded text-xs text-ink-soft">
                                    Gender: {campaign.targeting.genders.join(', ')}
                                </span>
                            )}
                            {campaign.targeting.locations?.slice(0, 3).map((loc, i) => (
                                <span key={i} className="px-2 py-1 bg-sheet rounded text-xs text-ink-soft">
                                    📍 {loc.value}
                                </span>
                            ))}
                            {campaign.targeting.interests?.slice(0, 3).map((interest, i) => (
                                <span key={i} className="px-2 py-1 bg-signal/10 rounded text-xs text-ink">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Creatives Preview */}
                    {campaign.creatives?.length > 0 && (
                        <div>
                            <h4 className="text-xs text-ink-soft mb-2">CREATIVES ({campaign.creatives.length})</h4>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {campaign.creatives.map((creative, i) => (
                                    <div
                                        key={i}
                                        className="flex-shrink-0 w-48 bg-sheet rounded-lg p-3 border border-rule"
                                    >
                                        <p className="text-sm truncate">{creative.headline || creative.name}</p>
                                        <p className="text-xs text-ink-soft mt-1 line-clamp-2">
                                            {creative.primaryText}
                                        </p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-signal/20 text-ink-soft rounded text-xs">
                                            {creative.format}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MetricBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-sheet rounded-lg p-3">
            <div className="flex items-center gap-2 text-ink-soft mb-1">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <p className="text-lg">{value}</p>
        </div>
    );
}