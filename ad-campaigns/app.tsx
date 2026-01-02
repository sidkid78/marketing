// import React, { useState, useEffect } from 'react';
// import {
//     Megaphone,
//     Plus,
//     BarChart3,
//     Settings,
//     RefreshCw,
//     Zap,
//     Globe,
//     DollarSign,
//     MousePointer,
//     Eye,
//     TrendingUp,
//     AlertCircle,
//     CheckCircle2,
//     Clock,
//     Pause,
//     Play,
//     ExternalLink
// } from 'lucide-react';
// import { PlatformConnector } from './components/platformconnector';
// import { CampaignList } from './components/campaignlist';
// import { CampaignCreator } from './components/campaigncreator';
// import { AnalyticsDashboard } from './components/analyticsdashboard';
// import { AIStrategyImport } from './components/app/aistrategyimport';
// import type { AdPlatform, UnifiedCampaign, CampaignMetrics } from '../services/ads/types';

// type TabId = 'overview' | 'campaigns' | 'create' | 'analytics' | 'settings';

// interface AppProps {
//     apiKey: string;
// }

// // Platform configuration
// const PLATFORMS: { id: AdPlatform; name: string; icon: string; color: string }[] = [
//     { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
//     { id: 'meta', name: 'Meta (FB/IG)', icon: '📘', color: '#1877F2' },
//     { id: 'google', name: 'Google Ads', icon: '🔍', color: '#4285F4' },
//     { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
//     { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
// ];

// export default function App({ apiKey }: AppProps) {
//     const [activeTab, setActiveTab] = useState<TabId>('overview');
//     const [connectedPlatforms, setConnectedPlatforms] = useState<Set<AdPlatform>>(new Set());
//     const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
//     const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [showAIImport, setShowAIImport] = useState(false);

//     // Check which platforms are connected on mount
//     useEffect(() => {
//         checkPlatformConnections();
//     }, []);

//     const checkPlatformConnections = async () => {
//         // Check Twitter connection
//         try {
//             const response = await fetch('/api/ads/twitter/accounts');
//             const data = await response.json();
//             if (data.success && data.data?.length > 0) {
//                 setConnectedPlatforms(prev => new Set([...prev, 'twitter']));
//             }
//         } catch (e) {
//             // Not connected
//         }
//         // Add checks for other platforms as they're implemented
//     };

//     const loadCampaigns = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const allCampaigns: UnifiedCampaign[] = [];

//             // Load from each connected platform
//             for (const platform of connectedPlatforms) {
//                 if (platform === 'twitter') {
//                     const accountsRes = await fetch('/api/ads/twitter/accounts');
//                     const accountsData = await accountsRes.json();

//                     if (accountsData.success && accountsData.data?.[0]) {
//                         const accountId = accountsData.data[0].id;
//                         const campaignsRes = await fetch(`/api/ads/twitter/accounts/${accountId}/campaigns`);
//                         const campaignsData = await campaignsRes.json();

//                         if (campaignsData.success && campaignsData.data?.items) {
//                             allCampaigns.push(...campaignsData.data.items);
//                         }
//                     }
//                 }
//                 // Add other platforms as implemented
//             }

//             setCampaigns(allCampaigns);
//         } catch (e) {
//             setError('Failed to load campaigns');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Calculate overview stats
//     const stats = {
//         totalCampaigns: campaigns.length,
//         activeCampaigns: campaigns.filter(c => c.status === 'active').length,
//         totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
//         totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
//         totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
//         avgCtr: metrics.length > 0
//             ? metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length
//             : 0,
//     };

//     const tabs = [
//         { id: 'overview' as TabId, label: 'Overview', icon: <BarChart3 size={16} /> },
//         { id: 'campaigns' as TabId, label: 'Campaigns', icon: <Megaphone size={16} /> },
//         { id: 'create' as TabId, label: 'Create', icon: <Plus size={16} /> },
//         { id: 'analytics' as TabId, label: 'Analytics', icon: <TrendingUp size={16} /> },
//         { id: 'settings' as TabId, label: 'Settings', icon: <Settings size={16} /> },
//     ];

//     return (
//         <div className="min-h-[600px] bg-transparent text-white">
//             {/* Header */}
//             <div className="border-b border-[#00f0ff]/20 bg-black/40 backdrop-blur-sm">
//                 <div className="px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="relative">
//                                 <div className="absolute inset-0 bg-[#ff00ff] blur-lg opacity-30"></div>
//                                 <div className="relative bg-black/50 p-2 rounded-lg border border-[#ff00ff]/50">
//                                     <Megaphone size={20} className="text-[#ff00ff]" />
//                                 </div>
//                             </div>
//                             <div>
//                                 <h1 className="font-bold text-lg font-mono">
//                                     <span className="text-[#ff00ff]">AD</span>
//                                     <span className="text-white">_</span>
//                                     <span className="text-[#00f0ff]">COMMAND</span>
//                                     <span className="text-[#ff00ff] animate-pulse">_</span>
//                                 </h1>
//                                 <p className="text-xs text-gray-500 font-mono">MULTI-PLATFORM CAMPAIGN CONTROL</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             {/* Connected platforms indicator */}
//                             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-[#00f0ff]/20">
//                                 <Globe size={14} className="text-[#00f0ff]" />
//                                 <span className="text-xs font-mono text-gray-400">
//                                     {connectedPlatforms.size} PLATFORMS
//                                 </span>
//                             </div>

//                             <button
//                                 onClick={() => setShowAIImport(true)}
//                                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] text-black font-mono text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all"
//                             >
//                                 <Zap size={14} />
//                                 AI IMPORT
//                             </button>
//                         </div>
//                     </div>

//                     {/* Tab Navigation */}
//                     <nav className="flex gap-1 mt-4">
//                         {tabs.map((tab) => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveTab(tab.id)}
//                                 className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-all ${activeTab === tab.id
//                                     ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-t border-x border-[#00f0ff]/30'
//                                     : 'text-gray-500 hover:text-white hover:bg-white/5'
//                                     }`}
//                             >
//                                 {tab.icon}
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </nav>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="p-6">
//                 {/* Overview Tab */}
//                 {activeTab === 'overview' && (
//                     <div className="space-y-6">
//                         {/* Stats Grid */}
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             <StatCard
//                                 label="Total Campaigns"
//                                 value={stats.totalCampaigns.toString()}
//                                 icon={<Megaphone size={20} />}
//                                 color="cyan"
//                             />
//                             <StatCard
//                                 label="Active"
//                                 value={stats.activeCampaigns.toString()}
//                                 icon={<Play size={20} />}
//                                 color="green"
//                             />
//                             <StatCard
//                                 label="Total Spend"
//                                 value={`$${stats.totalSpend.toLocaleString()}`}
//                                 icon={<DollarSign size={20} />}
//                                 color="magenta"
//                             />
//                             <StatCard
//                                 label="Avg CTR"
//                                 value={`${stats.avgCtr.toFixed(2)}%`}
//                                 icon={<MousePointer size={20} />}
//                                 color="yellow"
//                             />
//                         </div>

//                         {/* Platform Status */}
//                         <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                             <h2 className="text-lg font-mono font-bold mb-4 flex items-center gap-2">
//                                 <div className="w-1 h-5 bg-[#00f0ff]"></div>
//                                 PLATFORM STATUS
//                             </h2>
//                             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                                 {PLATFORMS.map((platform) => {
//                                     const isConnected = connectedPlatforms.has(platform.id);
//                                     return (
//                                         <div
//                                             key={platform.id}
//                                             className={`p-4 rounded-lg border transition-all ${isConnected
//                                                 ? 'bg-[#39ff14]/10 border-[#39ff14]/30'
//                                                 : 'bg-black/30 border-gray-800 opacity-50'
//                                                 }`}
//                                         >
//                                             <div className="flex items-center gap-2 mb-2">
//                                                 <span className="text-2xl">{platform.icon}</span>
//                                                 {isConnected ? (
//                                                     <CheckCircle2 size={16} className="text-[#39ff14]" />
//                                                 ) : (
//                                                     <AlertCircle size={16} className="text-gray-600" />
//                                                 )}
//                                             </div>
//                                             <p className="font-mono text-sm">{platform.name}</p>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 {isConnected ? 'Connected' : 'Not configured'}
//                                             </p>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         {/* Quick Actions */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <QuickActionCard
//                                 title="Create Campaign"
//                                 description="Launch a new ad campaign across platforms"
//                                 icon={<Plus size={24} />}
//                                 onClick={() => setActiveTab('create')}
//                                 color="cyan"
//                             />
//                             <QuickActionCard
//                                 title="Import AI Strategy"
//                                 description="Convert AI-generated strategies to live campaigns"
//                                 icon={<Zap size={24} />}
//                                 onClick={() => setShowAIImport(true)}
//                                 color="magenta"
//                             />
//                             <QuickActionCard
//                                 title="View Analytics"
//                                 description="Cross-platform performance insights"
//                                 icon={<BarChart3 size={24} />}
//                                 onClick={() => setActiveTab('analytics')}
//                                 color="yellow"
//                             />
//                         </div>

//                         {/* Recent Campaigns */}
//                         {campaigns.length > 0 && (
//                             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h2 className="text-lg font-mono font-bold flex items-center gap-2">
//                                         <div className="w-1 h-5 bg-[#ff00ff]"></div>
//                                         RECENT CAMPAIGNS
//                                     </h2>
//                                     <button
//                                         onClick={() => setActiveTab('campaigns')}
//                                         className="text-sm font-mono text-[#00f0ff] hover:underline flex items-center gap-1"
//                                     >
//                                         View All <ExternalLink size={12} />
//                                     </button>
//                                 </div>
//                                 <div className="space-y-2">
//                                     {campaigns.slice(0, 5).map((campaign) => (
//                                         <CampaignRow key={campaign.id} campaign={campaign} />
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {campaigns.length === 0 && connectedPlatforms.size > 0 && (
//                             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-12 text-center">
//                                 <Megaphone size={48} className="mx-auto text-gray-600 mb-4" />
//                                 <h3 className="font-mono text-lg mb-2">No Campaigns Yet</h3>
//                                 <p className="text-gray-500 text-sm mb-4">
//                                     Create your first campaign or import from AI Strategy
//                                 </p>
//                                 <div className="flex justify-center gap-3">
//                                     <button
//                                         onClick={() => setActiveTab('create')}
//                                         className="px-4 py-2 bg-[#00f0ff] text-black font-mono text-sm rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
//                                     >
//                                         Create Campaign
//                                     </button>
//                                     <button
//                                         onClick={() => setShowAIImport(true)}
//                                         className="px-4 py-2 border border-[#ff00ff]/50 text-[#ff00ff] font-mono text-sm rounded-lg hover:bg-[#ff00ff]/10 transition-all"
//                                     >
//                                         AI Import
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {connectedPlatforms.size === 0 && (
//                             <div className="bg-black/40 rounded-xl border border-yellow-500/30 p-6">
//                                 <div className="flex items-start gap-4">
//                                     <AlertCircle size={24} className="text-yellow-500 flex-shrink-0 mt-1" />
//                                     <div>
//                                         <h3 className="font-mono font-bold text-yellow-500 mb-2">No Platforms Connected</h3>
//                                         <p className="text-gray-400 text-sm mb-4">
//                                             Connect at least one advertising platform to start creating campaigns.
//                                             Go to Settings to configure your API credentials.
//                                         </p>
//                                         <button
//                                             onClick={() => setActiveTab('settings')}
//                                             className="px-4 py-2 border border-yellow-500/50 text-yellow-500 font-mono text-sm rounded-lg hover:bg-yellow-500/10 transition-all"
//                                         >
//                                             Configure Platforms
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Campaigns Tab */}
//                 {activeTab === 'campaigns' && (
//                     <CampaignList
//                         campaigns={campaigns}
//                         onRefresh={loadCampaigns}
//                         isLoading={isLoading}
//                     />
//                 )}

//                 {/* Create Tab */}
//                 {activeTab === 'create' && (
//                     <CampaignCreator
//                         connectedPlatforms={connectedPlatforms}
//                         onCampaignCreated={(campaign: UnifiedCampaign) => {
//                             setCampaigns(prev => [campaign, ...prev]);
//                             setActiveTab('campaigns');
//                         }}
//                     />
//                 )}

//                 {/* Analytics Tab */}
//                 {activeTab === 'analytics' && (
//                     <AnalyticsDashboard
//                         campaigns={campaigns}
//                         metrics={metrics}
//                         connectedPlatforms={connectedPlatforms}
//                     />
//                 )}

//                 {/* Settings Tab */}
//                 {activeTab === 'settings' && (
//                     <PlatformConnector
//                         platforms={PLATFORMS}
//                         connectedPlatforms={connectedPlatforms}
//                         onConnectionChange={(platform: AdPlatform, connected: boolean) => {
//                             setConnectedPlatforms(prev => {
//                                 const next = new Set(prev);
//                                 if (connected) {
//                                     next.add(platform);
//                                 } else {
//                                     next.delete(platform);
//                                 }
//                                 return next;
//                             });
//                         }}
//                     />
//                 )}
//             </div>

//             {/* AI Strategy Import Modal */}
//             {showAIImport && (
//                 <AIStrategyImport
//                     apiKey={apiKey}
//                     connectedPlatforms={connectedPlatforms}
//                     onClose={() => setShowAIImport(false)}
//                     onImport={(campaigns: any[]) => {
//                         setCampaigns(prev => [...campaigns, ...prev]);
//                         setShowAIImport(false);
//                         setActiveTab('campaigns');
//                     }}
//                 />
//             )}
//         </div>
//     );
// }

// // Helper Components
// function StatCard({ label, value, icon, color }: {
//     label: string;
//     value: string;
//     icon: React.ReactNode;
//     color: 'cyan' | 'magenta' | 'green' | 'yellow'
// }) {
//     const colors = {
//         cyan: 'border-[#00f0ff]/30 text-[#00f0ff]',
//         magenta: 'border-[#ff00ff]/30 text-[#ff00ff]',
//         green: 'border-[#39ff14]/30 text-[#39ff14]',
//         yellow: 'border-yellow-500/30 text-yellow-500',
//     };

//     return (
//         <div className={`bg-black/40 rounded-xl border ${colors[color]} p-4`}>
//             <div className="flex items-center justify-between mb-2">
//                 <span className="text-gray-500 text-xs font-mono">{label}</span>
//                 {icon}
//             </div>
//             <p className="text-2xl font-bold font-mono">{value}</p>
//         </div>
//     );
// }

// function QuickActionCard({ title, description, icon, onClick, color }: {
//     title: string;
//     description: string;
//     icon: React.ReactNode;
//     onClick: () => void;
//     color: 'cyan' | 'magenta' | 'yellow';
// }) {
//     const colors = {
//         cyan: 'border-[#00f0ff]/30 hover:border-[#00f0ff]/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]',
//         magenta: 'border-[#ff00ff]/30 hover:border-[#ff00ff]/60 hover:shadow-[0_0_20px_rgba(255,0,255,0.2)]',
//         yellow: 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
//     };

//     return (
//         <button
//             onClick={onClick}
//             className={`bg-black/40 rounded-xl border ${colors[color]} p-6 text-left transition-all group`}
//         >
//             <div className="mb-3 text-gray-400 group-hover:text-white transition-colors">
//                 {icon}
//             </div>
//             <h3 className="font-mono font-bold mb-1">{title}</h3>
//             <p className="text-sm text-gray-500">{description}</p>
//         </button>
//     );
// }

// function CampaignRow({ campaign }: { campaign: UnifiedCampaign }) {
//     const statusColors = {
//         active: 'bg-[#39ff14]/20 text-[#39ff14]',
//         paused: 'bg-yellow-500/20 text-yellow-500',
//         draft: 'bg-gray-500/20 text-gray-400',
//         completed: 'bg-blue-500/20 text-blue-400',
//         rejected: 'bg-red-500/20 text-red-400',
//         pending_review: 'bg-orange-500/20 text-orange-400',
//     };

//     const platformIcons: Record<AdPlatform, string> = {
//         twitter: '𝕏',
//         meta: '📘',
//         google: '🔍',
//         linkedin: '💼',
//         tiktok: '🎵',
//     };

//     return (
//         <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800 hover:border-[#00f0ff]/30 transition-all">
//             <div className="flex items-center gap-3">
//                 <span className="text-xl">{platformIcons[campaign.platform]}</span>
//                 <div>
//                     <p className="font-mono text-sm">{campaign.name}</p>
//                     <p className="text-xs text-gray-500">{campaign.objective}</p>
//                 </div>
//             </div>
//             <div className="flex items-center gap-4">
//                 <span className={`px-2 py-1 rounded text-xs font-mono ${statusColors[campaign.status]}`}>
//                     {campaign.status.toUpperCase()}
//                 </span>
//                 <span className="text-sm font-mono text-gray-400">
//                     ${campaign.budget.amount.toLocaleString()}/{campaign.budget.type === 'daily' ? 'day' : 'total'}
//                 </span>
//             </div>
//         </div>
//     );
// }

