// import React, { useState } from 'react';
// import {
//     RefreshCw,
//     Search,
//     Filter,
//     Play,
//     Pause,
//     Trash2,
//     MoreVertical,
//     ExternalLink,
//     Calendar,
//     DollarSign,
//     Eye,
//     MousePointer,
//     TrendingUp,
//     ChevronDown
// } from 'lucide-react';
// import type { AdPlatform, UnifiedCampaign, CampaignStatus, CampaignObjective } from '../../services/ads/types';

// interface CampaignListProps {
//     campaigns: UnifiedCampaign[];
//     onRefresh: () => void;
//     isLoading: boolean;
// }

// const platformIcons: Record<AdPlatform, string> = {
//     twitter: '𝕏',
//     meta: '📘',
//     google: '🔍',
//     linkedin: '💼',
//     tiktok: '🎵',
// };

// const statusColors: Record<CampaignStatus, string> = {
//     active: 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14]/30',
//     paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
//     draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
//     completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
//     rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
//     pending_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
// };

// const objectiveLabels: Record<CampaignObjective, string> = {
//     awareness: 'Brand Awareness',
//     traffic: 'Website Traffic',
//     engagement: 'Engagement',
//     leads: 'Lead Generation',
//     conversions: 'Conversions',
//     app_installs: 'App Installs',
//     video_views: 'Video Views',
//     catalog_sales: 'Catalog Sales',
// };

// export function CampaignList({ campaigns, onRefresh, isLoading }: CampaignListProps) {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
//     const [platformFilter, setPlatformFilter] = useState<AdPlatform | 'all'>('all');
//     const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
//     const [showFilters, setShowFilters] = useState(false);

//     // Filter campaigns
//     const filteredCampaigns = campaigns.filter(campaign => {
//         const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
//         const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
//         return matchesSearch && matchesStatus && matchesPlatform;
//     });

//     // Group by platform for summary
//     const platformSummary = campaigns.reduce((acc, campaign) => {
//         acc[campaign.platform] = (acc[campaign.platform] || 0) + 1;
//         return acc;
//     }, {} as Record<AdPlatform, number>);

//     const handleStatusChange = async (campaignId: string, newStatus: 'active' | 'paused') => {
//         // This would call the appropriate platform API
//         console.log('Changing status:', campaignId, newStatus);
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header with Search and Filters */}
//             <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
//                 <div className="flex-1 w-full md:w-auto">
//                     <div className="relative">
//                         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                         <input
//                             type="text"
//                             placeholder="Search campaigns..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none transition-colors"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={() => setShowFilters(!showFilters)}
//                         className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-all ${showFilters
//                                 ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                 : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white'
//                             }`}
//                     >
//                         <Filter size={14} />
//                         Filters
//                         {(statusFilter !== 'all' || platformFilter !== 'all') && (
//                             <span className="w-2 h-2 rounded-full bg-[#ff00ff]"></span>
//                         )}
//                     </button>

//                     <button
//                         onClick={onRefresh}
//                         disabled={isLoading}
//                         className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg font-mono text-sm hover:bg-[#00f0ff]/30 transition-all"
//                     >
//                         <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
//                         Refresh
//                     </button>
//                 </div>
//             </div>

//             {/* Filters Panel */}
//             {showFilters && (
//                 <div className="bg-black/40 rounded-xl border border-gray-800 p-4 flex flex-wrap gap-4">
//                     <div>
//                         <label className="text-xs font-mono text-gray-500 mb-1 block">Status</label>
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
//                             className="bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none"
//                         >
//                             <option value="all">All Statuses</option>
//                             <option value="active">Active</option>
//                             <option value="paused">Paused</option>
//                             <option value="draft">Draft</option>
//                             <option value="pending_review">Pending Review</option>
//                             <option value="completed">Completed</option>
//                         </select>
//                     </div>

//                     <div>
//                         <label className="text-xs font-mono text-gray-500 mb-1 block">Platform</label>
//                         <select
//                             value={platformFilter}
//                             onChange={(e) => setPlatformFilter(e.target.value as AdPlatform | 'all')}
//                             className="bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none"
//                         >
//                             <option value="all">All Platforms</option>
//                             <option value="twitter">X (Twitter)</option>
//                             <option value="meta">Meta (FB/IG)</option>
//                             <option value="google">Google Ads</option>
//                             <option value="linkedin">LinkedIn</option>
//                             <option value="tiktok">TikTok</option>
//                         </select>
//                     </div>

//                     {(statusFilter !== 'all' || platformFilter !== 'all') && (
//                         <button
//                             onClick={() => {
//                                 setStatusFilter('all');
//                                 setPlatformFilter('all');
//                             }}
//                             className="self-end text-xs text-[#ff00ff] hover:underline font-mono"
//                         >
//                             Clear filters
//                         </button>
//                     )}
//                 </div>
//             )}

//             {/* Platform Summary */}
//             {Object.keys(platformSummary).length > 1 && (
//                 <div className="flex flex-wrap gap-2">
//                     {Object.entries(platformSummary).map(([platform, count]) => (
//                         <button
//                             key={platform}
//                             onClick={() => setPlatformFilter(platformFilter === platform ? 'all' : platform as AdPlatform)}
//                             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${platformFilter === platform
//                                     ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                     : 'bg-black/30 border border-gray-800 text-gray-400 hover:border-gray-600'
//                                 }`}
//                         >
//                             <span>{platformIcons[platform as AdPlatform]}</span>
//                             <span>{count}</span>
//                         </button>
//                     ))}
//                 </div>
//             )}

//             {/* Campaign List */}
//             {isLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                     <RefreshCw size={24} className="animate-spin text-[#00f0ff]" />
//                     <span className="ml-3 font-mono text-gray-400">Loading campaigns...</span>
//                 </div>
//             ) : filteredCampaigns.length === 0 ? (
//                 <div className="text-center py-12">
//                     <p className="text-gray-500 font-mono">
//                         {campaigns.length === 0
//                             ? 'No campaigns found'
//                             : 'No campaigns match your filters'}
//                     </p>
//                 </div>
//             ) : (
//                 <div className="space-y-3">
//                     {filteredCampaigns.map((campaign) => (
//                         <CampaignCard
//                             key={campaign.id}
//                             campaign={campaign}
//                             isExpanded={expandedCampaign === campaign.id}
//                             onToggleExpand={() => setExpandedCampaign(
//                                 expandedCampaign === campaign.id ? null : campaign.id!
//                             )}
//                             onStatusChange={handleStatusChange}
//                         />
//                     ))}
//                 </div>
//             )}

//             {/* Results count */}
//             {!isLoading && filteredCampaigns.length > 0 && (
//                 <p className="text-center text-xs text-gray-600 font-mono">
//                     Showing {filteredCampaigns.length} of {campaigns.length} campaigns
//                 </p>
//             )}
//         </div>
//     );
// }

// function CampaignCard({
//     campaign,
//     isExpanded,
//     onToggleExpand,
//     onStatusChange
// }: {
//     campaign: UnifiedCampaign;
//     isExpanded: boolean;
//     onToggleExpand: () => void;
//     onStatusChange: (id: string, status: 'active' | 'paused') => void;
// }) {
//     const [showActions, setShowActions] = useState(false);

//     return (
//         <div className="bg-black/40 rounded-xl border border-gray-800 hover:border-[#00f0ff]/30 transition-all overflow-hidden">
//             {/* Main Row */}
//             <div
//                 className="p-4 flex items-center justify-between cursor-pointer"
//                 onClick={onToggleExpand}
//             >
//                 <div className="flex items-center gap-4">
//                     <span className="text-2xl">{platformIcons[campaign.platform]}</span>
//                     <div>
//                         <h3 className="font-mono font-bold">{campaign.name}</h3>
//                         <div className="flex items-center gap-3 mt-1">
//                             <span className={`px-2 py-0.5 rounded text-xs font-mono border ${statusColors[campaign.status]}`}>
//                                 {campaign.status.replace('_', ' ').toUpperCase()}
//                             </span>
//                             <span className="text-xs text-gray-500">
//                                 {objectiveLabels[campaign.objective]}
//                             </span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-6">
//                     {/* Budget */}
//                     <div className="text-right hidden md:block">
//                         <p className="text-xs text-gray-500">Budget</p>
//                         <p className="font-mono text-sm">
//                             ${campaign.budget.amount.toLocaleString()}
//                             <span className="text-gray-500">/{campaign.budget.type === 'daily' ? 'day' : 'total'}</span>
//                         </p>
//                     </div>

//                     {/* Schedule */}
//                     <div className="text-right hidden lg:block">
//                         <p className="text-xs text-gray-500">Schedule</p>
//                         <p className="font-mono text-xs text-gray-400">
//                             {new Date(campaign.schedule.start).toLocaleDateString()}
//                             {campaign.schedule.end && ` - ${new Date(campaign.schedule.end).toLocaleDateString()}`}
//                         </p>
//                     </div>

//                     {/* Actions */}
//                     <div className="relative">
//                         <button
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowActions(!showActions);
//                             }}
//                             className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//                         >
//                             <MoreVertical size={16} className="text-gray-500" />
//                         </button>

//                         {showActions && (
//                             <div className="absolute right-0 top-full mt-1 bg-black/90 border border-gray-800 rounded-lg shadow-xl z-10 py-1 min-w-[150px]">
//                                 {campaign.status === 'active' ? (
//                                     <button
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             onStatusChange(campaign.id!, 'paused');
//                                             setShowActions(false);
//                                         }}
//                                         className="w-full px-4 py-2 text-left text-sm font-mono flex items-center gap-2 hover:bg-white/10 text-yellow-500"
//                                     >
//                                         <Pause size={14} />
//                                         Pause
//                                     </button>
//                                 ) : campaign.status === 'paused' && (
//                                     <button
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             onStatusChange(campaign.id!, 'active');
//                                             setShowActions(false);
//                                         }}
//                                         className="w-full px-4 py-2 text-left text-sm font-mono flex items-center gap-2 hover:bg-white/10 text-[#39ff14]"
//                                     >
//                                         <Play size={14} />
//                                         Activate
//                                     </button>
//                                 )}
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         // Open in platform
//                                         setShowActions(false);
//                                     }}
//                                     className="w-full px-4 py-2 text-left text-sm font-mono flex items-center gap-2 hover:bg-white/10 text-gray-400"
//                                 >
//                                     <ExternalLink size={14} />
//                                     Open in {campaign.platform}
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     <ChevronDown
//                         size={16}
//                         className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
//                     />
//                 </div>
//             </div>

//             {/* Expanded Details */}
//             {isExpanded && (
//                 <div className="border-t border-gray-800 p-4 bg-black/20">
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                         <MetricBox
//                             label="Impressions"
//                             value="--"
//                             icon={<Eye size={14} />}
//                         />
//                         <MetricBox
//                             label="Clicks"
//                             value="--"
//                             icon={<MousePointer size={14} />}
//                         />
//                         <MetricBox
//                             label="CTR"
//                             value="--"
//                             icon={<TrendingUp size={14} />}
//                         />
//                         <MetricBox
//                             label="Spend"
//                             value="--"
//                             icon={<DollarSign size={14} />}
//                         />
//                     </div>

//                     {/* Targeting Summary */}
//                     <div className="bg-black/30 rounded-lg p-3 mb-4">
//                         <h4 className="text-xs font-mono text-gray-500 mb-2">TARGETING</h4>
//                         <div className="flex flex-wrap gap-2">
//                             {campaign.targeting.ageMin && (
//                                 <span className="px-2 py-1 bg-black/40 rounded text-xs font-mono text-gray-400">
//                                     Age: {campaign.targeting.ageMin}-{campaign.targeting.ageMax || '65+'}
//                                 </span>
//                             )}
//                             {campaign.targeting.genders?.length && campaign.targeting.genders[0] !== 'all' && (
//                                 <span className="px-2 py-1 bg-black/40 rounded text-xs font-mono text-gray-400">
//                                     Gender: {campaign.targeting.genders.join(', ')}
//                                 </span>
//                             )}
//                             {campaign.targeting.locations?.slice(0, 3).map((loc, i) => (
//                                 <span key={i} className="px-2 py-1 bg-black/40 rounded text-xs font-mono text-gray-400">
//                                     📍 {loc.value}
//                                 </span>
//                             ))}
//                             {campaign.targeting.interests?.slice(0, 3).map((interest, i) => (
//                                 <span key={i} className="px-2 py-1 bg-[#00f0ff]/10 rounded text-xs font-mono text-[#00f0ff]">
//                                     {interest}
//                                 </span>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Creatives Preview */}
//                     {campaign.creatives?.length > 0 && (
//                         <div>
//                             <h4 className="text-xs font-mono text-gray-500 mb-2">CREATIVES ({campaign.creatives.length})</h4>
//                             <div className="flex gap-2 overflow-x-auto pb-2">
//                                 {campaign.creatives.map((creative, i) => (
//                                     <div
//                                         key={i}
//                                         className="flex-shrink-0 w-48 bg-black/30 rounded-lg p-3 border border-gray-800"
//                                     >
//                                         <p className="font-mono text-sm truncate">{creative.headline || creative.name}</p>
//                                         <p className="text-xs text-gray-500 mt-1 line-clamp-2">
//                                             {creative.primaryText}
//                                         </p>
//                                         <span className="inline-block mt-2 px-2 py-0.5 bg-[#ff00ff]/20 text-[#ff00ff] rounded text-xs font-mono">
//                                             {creative.format}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// function MetricBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
//     return (
//         <div className="bg-black/30 rounded-lg p-3">
//             <div className="flex items-center gap-2 text-gray-500 mb-1">
//                 {icon}
//                 <span className="text-xs font-mono">{label}</span>
//             </div>
//             <p className="font-mono text-lg">{value}</p>
//         </div>
//     );
// }