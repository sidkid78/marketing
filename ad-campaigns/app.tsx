import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    BarChart3,
    Settings,
    RefreshCw,
    Zap,
    Globe,
    DollarSign,
    MousePointer,
    Eye,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Pause,
    Play,
    ExternalLink
} from 'lucide-react';
import { PlatformConnector } from './components/platformconnector';
import { CampaignList } from './components/campaignlist';
import { CampaignCreator } from './components/campaigncreator';
import { AnalyticsDashboard } from './components/analyticsdashboard';
import { AIStrategyImport } from './components/AIStrategyImport';
import type { AdPlatform, UnifiedCampaign, CampaignMetrics } from '../services/ads/types';

type TabId = 'overview' | 'campaigns' | 'create' | 'analytics' | 'settings';

interface AppProps {
    apiKey: string;
}

// Platform configuration
const PLATFORMS: { id: AdPlatform; name: string; icon: string; color: string }[] = [
    { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
    { id: 'meta', name: 'Meta (FB/IG)', icon: '📘', color: '#1877F2' },
    { id: 'google', name: 'Google Ads', icon: '🔍', color: '#4285F4' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
];

export default function App({ apiKey }: AppProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [connectedPlatforms, setConnectedPlatforms] = useState<Set<AdPlatform>>(new Set());
    const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
    const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAIImport, setShowAIImport] = useState(false);

    // Check which platforms are connected on mount
    useEffect(() => {
        checkPlatformConnections();
    }, []);

    const checkPlatformConnections = async () => {
        // Check Twitter connection
        try {
            const response = await fetch('/api/ads/twitter/accounts');
            const data = await response.json();
            if (data.success && data.data?.length > 0) {
                setConnectedPlatforms(prev => new Set([...prev, 'twitter']));
            }
        } catch (e) {
            // Not connected
        }
        // Add checks for other platforms as they're implemented
    };

    const loadCampaigns = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const allCampaigns: UnifiedCampaign[] = [];

            // Load from each connected platform
            for (const platform of connectedPlatforms) {
                if (platform === 'twitter') {
                    const accountsRes = await fetch('/api/ads/twitter/accounts');
                    const accountsData = await accountsRes.json();

                    if (accountsData.success && accountsData.data?.[0]) {
                        const accountId = accountsData.data[0].id;
                        const campaignsRes = await fetch(`/api/ads/twitter/accounts/${accountId}/campaigns`);
                        const campaignsData = await campaignsRes.json();

                        if (campaignsData.success && campaignsData.data?.items) {
                            allCampaigns.push(...campaignsData.data.items);
                        }
                    }
                }
                // Add other platforms as implemented
            }

            setCampaigns(allCampaigns);
        } catch (e) {
            setError('Failed to load campaigns');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate overview stats
    const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
        avgCtr: metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length
            : 0,
    };

    const tabs = [
        { id: 'overview' as TabId, label: 'Overview', icon: <BarChart3 size={16} /> },
        { id: 'campaigns' as TabId, label: 'Campaigns', icon: <Megaphone size={16} /> },
        { id: 'create' as TabId, label: 'Create', icon: <Plus size={16} /> },
        { id: 'analytics' as TabId, label: 'Analytics', icon: <TrendingUp size={16} /> },
        { id: 'settings' as TabId, label: 'Settings', icon: <Settings size={16} /> },
    ];

    return (
        <div className="min-h-[600px] bg-transparent text-ink">
            {/* Header */}
            <div className="border-b border-rule bg-sheet backdrop-">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-signal opacity-30"></div>
                                <div className="relative bg-sheet p-2 rounded-lg border border-rule">
                                    <Megaphone size={20} className="text-ink" />
                                </div>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">
                                    <span className="text-ink">AD</span>
                                    <span className="text-ink">_</span>
                                    <span className="text-ink">COMMAND</span>
                                    <span className="text-ink animate-pulse">_</span>
                                </h1>
                                <p className="text-xs text-ink">MULTI-PLATFORM CAMPAIGN CONTROL</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Connected platforms indicator */}
                            <div className="flex items-center gap-2 bg-sheet px-3 py-1.5 rounded-lg border border-rule">
                                <Globe size={14} className="text-ink" />
                                <span className="text-xs text-ink">
                                    {connectedPlatforms.size} PLATFORMS
                                </span>
                            </div>

                            <button
                                onClick={() => setShowAIImport(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-signal text-black text-sm font-medium rounded-lg transition-all"
                            >
                                <Zap size={14} />
                                AI IMPORT
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex gap-1 mt-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-signal/10 text-ink border-t border-x border-rule'
                                    : 'text-ink-soft hover:text-ink hover:bg-muted'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Campaigns"
                                value={stats.totalCampaigns.toString()}
                                icon={<Megaphone size={20} />}
                                color="cyan"
                            />
                            <StatCard
                                label="Active"
                                value={stats.activeCampaigns.toString()}
                                icon={<Play size={20} />}
                                color="green"
                            />
                            <StatCard
                                label="Total Spend"
                                value={`$${stats.totalSpend.toLocaleString()}`}
                                icon={<DollarSign size={20} />}
                                color="magenta"
                            />
                            <StatCard
                                label="Avg CTR"
                                value={`${stats.avgCtr.toFixed(2)}%`}
                                icon={<MousePointer size={20} />}
                                color="yellow"
                            />
                        </div>

                        {/* Platform Status */}
                        <div className="bg-sheet rounded-xl border border-rule p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-signal"></div>
                                PLATFORM STATUS
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {PLATFORMS.map((platform) => {
                                    const isConnected = connectedPlatforms.has(platform.id);
                                    return (
                                        <div
                                            key={platform.id}
                                            className={`p-4 rounded-lg border transition-all ${isConnected
                                                ? 'bg-positive/10 border-positive/30'
                                                : 'bg-sheet border-rule opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{platform.icon}</span>
                                                {isConnected ? (
                                                    <CheckCircle2 size={16} className="text-positive" />
                                                ) : (
                                                    <AlertCircle size={16} className="text-ink" />
                                                )}
                                            </div>
                                            <p className="text-sm">{platform.name}</p>
                                            <p className="text-xs text-ink mt-1">
                                                {isConnected ? 'Connected' : 'Not configured'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <QuickActionCard
                                title="Create Campaign"
                                description="Launch a new ad campaign across platforms"
                                icon={<Plus size={24} />}
                                onClick={() => setActiveTab('create')}
                                color="cyan"
                            />
                            <QuickActionCard
                                title="Import AI Strategy"
                                description="Convert AI-generated strategies to live campaigns"
                                icon={<Zap size={24} />}
                                onClick={() => setShowAIImport(true)}
                                color="magenta"
                            />
                            <QuickActionCard
                                title="View Analytics"
                                description="Cross-platform performance insights"
                                icon={<BarChart3 size={24} />}
                                onClick={() => setActiveTab('analytics')}
                                color="yellow"
                            />
                        </div>

                        {/* Recent Campaigns */}
                        {campaigns.length > 0 && (
                            <div className="bg-sheet rounded-xl border border-rule p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <div className="w-1 h-5 bg-signal"></div>
                                        RECENT CAMPAIGNS
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('campaigns')}
                                        className="text-sm text-ink hover:underline flex items-center gap-1"
                                    >
                                        View All <ExternalLink size={12} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {campaigns.slice(0, 5).map((campaign) => (
                                        <CampaignRow key={campaign.id} campaign={campaign} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {campaigns.length === 0 && connectedPlatforms.size > 0 && (
                            <div className="bg-sheet rounded-xl border border-rule p-12 text-center">
                                <Megaphone size={48} className="mx-auto text-ink mb-4" />
                                <h3 className="text-lg mb-2">No Campaigns Yet</h3>
                                <p className="text-ink text-sm mb-4">
                                    Create your first campaign or import from AI Strategy
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="px-4 py-2 bg-signal text-black text-sm rounded-lg transition-all"
                                    >
                                        Create Campaign
                                    </button>
                                    <button
                                        onClick={() => setShowAIImport(true)}
                                        className="px-4 py-2 border border-rule text-ink text-sm rounded-lg hover:bg-signal/10 transition-all"
                                    >
                                        AI Import
                                    </button>
                                </div>
                            </div>
                        )}

                        {connectedPlatforms.size === 0 && (
                            <div className="bg-sheet rounded-xl border border-working/30 p-6">
                                <div className="flex items-start gap-4">
                                    <AlertCircle size={24} className="text-working flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-working mb-2">No Platforms Connected</h3>
                                        <p className="text-ink text-sm mb-4">
                                            Connect at least one advertising platform to start creating campaigns.
                                            Go to Settings to configure your API credentials.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('settings')}
                                            className="px-4 py-2 border border-working/30 text-working text-sm rounded-lg hover:bg-working/10 transition-all"
                                        >
                                            Configure Platforms
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <CampaignList
                        campaigns={campaigns}
                        onRefresh={loadCampaigns}
                        isLoading={isLoading}
                    />
                )}

                {/* Create Tab */}
                {activeTab === 'create' && (
                    <CampaignCreator
                        connectedPlatforms={connectedPlatforms}
                        onCampaignCreated={(campaign: UnifiedCampaign) => {
                            setCampaigns(prev => [campaign, ...prev]);
                            setActiveTab('campaigns');
                        }}
                    />
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <AnalyticsDashboard
                        campaigns={campaigns}
                        metrics={metrics}
                        connectedPlatforms={connectedPlatforms}
                    />
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <PlatformConnector
                        platforms={PLATFORMS}
                        connectedPlatforms={connectedPlatforms}
                        onConnectionChange={(platform: AdPlatform, connected: boolean) => {
                            setConnectedPlatforms(prev => {
                                const next = new Set(prev);
                                if (connected) {
                                    next.add(platform);
                                } else {
                                    next.delete(platform);
                                }
                                return next;
                            });
                        }}
                    />
                )}
            </div>

            {/* AI Strategy Import Modal */}
            {showAIImport && (
                <AIStrategyImport
                    apiKey={apiKey}
                    connectedPlatforms={connectedPlatforms}
                    onClose={() => setShowAIImport(false)}
                    onImport={(campaigns: any[]) => {
                        setCampaigns(prev => [...campaigns, ...prev]);
                        setShowAIImport(false);
                        setActiveTab('campaigns');
                    }}
                />
            )}
        </div>
    );
}

// Helper Components
function StatCard({ label, value, icon, color }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: 'cyan' | 'magenta' | 'green' | 'yellow'
}) {
    const colors = {
        cyan: 'border-rule text-ink',
        magenta: 'border-rule text-ink',
        green: 'border-positive/30 text-positive',
        yellow: 'border-working/30 text-working',
    };

    return (
        <div className={`bg-sheet rounded-xl border ${colors[color]} p-4`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-ink-soft text-xs">{label}</span>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function QuickActionCard({ title, description, icon, onClick, color }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: 'cyan' | 'magenta' | 'yellow';
}) {
    const colors = {
        cyan: 'border-rule hover:border-rule',
        magenta: 'border-rule hover:border-rule',
        yellow: 'border-working/30 hover:border-working/30',
    };

    return (
        <button
            onClick={onClick}
            className={`bg-sheet rounded-xl border ${colors[color]} p-6 text-left transition-all group`}
        >
            <div className="mb-3 text-ink-soft group-hover:text-ink transition-colors">
                {icon}
            </div>
            <h3 className="font-bold mb-1">{title}</h3>
            <p className="text-sm text-ink-soft">{description}</p>
        </button>
    );
}

function CampaignRow({ campaign }: { campaign: UnifiedCampaign }) {
    const statusColors = {
        active: 'bg-positive/20 text-positive',
        paused: 'bg-working/10 text-working',
        draft: 'bg-muted text-ink-soft',
        completed: 'bg-muted text-ink',
        rejected: 'bg-destructive/10 text-destructive',
        pending_review: 'bg-working/10 text-working',
    };

    const platformIcons: Record<AdPlatform, string> = {
        twitter: '𝕏',
        meta: '📘',
        google: '🔍',
        linkedin: '💼',
        tiktok: '🎵',
    };

    return (
        <div className="flex items-center justify-between p-3 bg-sheet rounded-lg border border-rule hover:border-rule transition-all">
            <div className="flex items-center gap-3">
                <span className="text-xl">{platformIcons[campaign.platform]}</span>
                <div>
                    <p className="text-sm">{campaign.name}</p>
                    <p className="text-xs text-ink-soft">{campaign.objective}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[campaign.status]}`}>
                    {campaign.status.toUpperCase()}
                </span>
                <span className="text-sm text-ink-soft">
                    ${campaign.budget.amount.toLocaleString()}/{campaign.budget.type === 'daily' ? 'day' : 'total'}
                </span>
            </div>
        </div>
    );
}

