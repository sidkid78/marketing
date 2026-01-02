// import React, { useState, useEffect } from 'react';
// import {
//     BarChart3,
//     TrendingUp,
//     TrendingDown,
//     DollarSign,
//     Eye,
//     MousePointer,
//     Target,
//     RefreshCw,
//     Calendar,
//     Download,
//     Filter
// } from 'lucide-react';
// import type { AdPlatform, UnifiedCampaign, CampaignMetrics } from '../../services/ads/types';

// interface AnalyticsDashboardProps {
//     campaigns: UnifiedCampaign[];
//     metrics: CampaignMetrics[];
//     connectedPlatforms: Set<AdPlatform>;
// }

// type DateRange = '7d' | '14d' | '30d' | '90d' | 'custom';

// const platformColors: Record<AdPlatform, string> = {
//     twitter: '#1DA1F2',
//     meta: '#1877F2',
//     google: '#4285F4',
//     linkedin: '#0A66C2',
//     tiktok: '#FF0050',
// };

// const platformIcons: Record<AdPlatform, string> = {
//     twitter: '𝕏',
//     meta: '📘',
//     google: '🔍',
//     linkedin: '💼',
//     tiktok: '🎵',
// };

// export function AnalyticsDashboard({ campaigns, metrics, connectedPlatforms }: AnalyticsDashboardProps) {
//     const [dateRange, setDateRange] = useState<DateRange>('30d');
//     const [isLoading, setIsLoading] = useState(false);
//     const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | 'all'>('all');

//     // Calculate aggregate metrics
//     const aggregateMetrics = {
//         totalSpend: metrics.reduce((sum, m) => sum + m.spend, 0),
//         totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
//         totalClicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
//         totalConversions: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0),
//         avgCtr: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.ctr, 0) / metrics.length : 0,
//         avgCpc: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpc, 0) / metrics.length : 0,
//         avgCpm: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cpm, 0) / metrics.length : 0,
//     };

//     // Group metrics by platform
//     const metricsByPlatform = metrics.reduce((acc, m) => {
//         if (!acc[m.platform]) {
//             acc[m.platform] = {
//                 spend: 0,
//                 impressions: 0,
//                 clicks: 0,
//                 conversions: 0,
//             };
//         }
//         acc[m.platform].spend += m.spend;
//         acc[m.platform].impressions += m.impressions;
//         acc[m.platform].clicks += m.clicks;
//         acc[m.platform].conversions += m.conversions || 0;
//         return acc;
//     }, {} as Record<AdPlatform, { spend: number; impressions: number; clicks: number; conversions: number }>);

//     // Filter metrics for display
//     const filteredMetrics = selectedPlatform === 'all'
//         ? metrics
//         : metrics.filter(m => m.platform === selectedPlatform);

//     // Mock trend data (would come from comparing to previous period)
//     const trends = {
//         spend: 12.5,
//         impressions: -3.2,
//         clicks: 8.7,
//         conversions: 15.3,
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header with Controls */}
//             <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
//                 <div>
//                     <h2 className="text-xl font-mono font-bold flex items-center gap-2">
//                         <BarChart3 size={20} className="text-[#00f0ff]" />
//                         Performance Analytics
//                     </h2>
//                     <p className="text-gray-500 text-sm mt-1">Cross-platform campaign insights</p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     {/* Date Range Selector */}
//                     <div className="flex bg-black/40 rounded-lg border border-gray-800 p-1">
//                         {(['7d', '14d', '30d', '90d'] as DateRange[]).map((range) => (
//                             <button
//                                 key={range}
//                                 onClick={() => setDateRange(range)}
//                                 className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${dateRange === range
//                                         ? 'bg-[#00f0ff]/20 text-[#00f0ff]'
//                                         : 'text-gray-500 hover:text-white'
//                                     }`}
//                             >
//                                 {range}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Platform Filter */}
//                     <select
//                         value={selectedPlatform}
//                         onChange={(e) => setSelectedPlatform(e.target.value as AdPlatform | 'all')}
//                         className="bg-black/40 border border-gray-800 rounded-lg px-3 py-1.5 font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none"
//                     >
//                         <option value="all">All Platforms</option>
//                         {Array.from(connectedPlatforms).map((platform) => (
//                             <option key={platform} value={platform}>
//                                 {platformIcons[platform]} {platform}
//                             </option>
//                         ))}
//                     </select>

//                     {/* Export Button */}
//                     <button className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-gray-800 rounded-lg font-mono text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
//                         <Download size={14} />
//                         Export
//                     </button>
//                 </div>
//             </div>

//             {/* Main KPI Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <KPICard
//                     label="Total Spend"
//                     value={`$${aggregateMetrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
//                     trend={trends.spend}
//                     icon={<DollarSign size={20} />}
//                     color="magenta"
//                 />
//                 <KPICard
//                     label="Impressions"
//                     value={formatNumber(aggregateMetrics.totalImpressions)}
//                     trend={trends.impressions}
//                     icon={<Eye size={20} />}
//                     color="cyan"
//                 />
//                 <KPICard
//                     label="Clicks"
//                     value={formatNumber(aggregateMetrics.totalClicks)}
//                     trend={trends.clicks}
//                     icon={<MousePointer size={20} />}
//                     color="green"
//                 />
//                 <KPICard
//                     label="Conversions"
//                     value={formatNumber(aggregateMetrics.totalConversions)}
//                     trend={trends.conversions}
//                     icon={<Target size={20} />}
//                     color="yellow"
//                 />
//             </div>

//             {/* Secondary Metrics */}
//             <div className="grid grid-cols-3 gap-4">
//                 <div className="bg-black/40 rounded-xl border border-gray-800 p-4">
//                     <p className="text-xs font-mono text-gray-500 mb-1">AVG CTR</p>
//                     <p className="text-2xl font-mono font-bold text-[#00f0ff]">
//                         {aggregateMetrics.avgCtr.toFixed(2)}%
//                     </p>
//                 </div>
//                 <div className="bg-black/40 rounded-xl border border-gray-800 p-4">
//                     <p className="text-xs font-mono text-gray-500 mb-1">AVG CPC</p>
//                     <p className="text-2xl font-mono font-bold text-[#ff00ff]">
//                         ${aggregateMetrics.avgCpc.toFixed(2)}
//                     </p>
//                 </div>
//                 <div className="bg-black/40 rounded-xl border border-gray-800 p-4">
//                     <p className="text-xs font-mono text-gray-500 mb-1">AVG CPM</p>
//                     <p className="text-2xl font-mono font-bold text-yellow-500">
//                         ${aggregateMetrics.avgCpm.toFixed(2)}
//                     </p>
//                 </div>
//             </div>

//             {/* Platform Breakdown */}
//             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                 <h3 className="text-lg font-mono font-bold mb-4 flex items-center gap-2">
//                     <div className="w-1 h-5 bg-[#00f0ff]"></div>
//                     Platform Performance
//                 </h3>

//                 {Object.keys(metricsByPlatform).length > 0 ? (
//                     <div className="space-y-4">
//                         {Object.entries(metricsByPlatform).map(([platform, data]) => {
//                             const totalSpend = aggregateMetrics.totalSpend || 1;
//                             const percentage = (data.spend / totalSpend) * 100;

//                             return (
//                                 <div key={platform} className="space-y-2">
//                                     <div className="flex items-center justify-between">
//                                         <div className="flex items-center gap-2">
//                                             <span className="text-xl">{platformIcons[platform as AdPlatform]}</span>
//                                             <span className="font-mono text-sm">{platform}</span>
//                                         </div>
//                                         <div className="flex items-center gap-6 text-sm font-mono">
//                                             <span className="text-gray-400">
//                                                 ${data.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//                                             </span>
//                                             <span className="text-gray-500">
//                                                 {formatNumber(data.impressions)} imp
//                                             </span>
//                                             <span className="text-gray-500">
//                                                 {formatNumber(data.clicks)} clicks
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <div className="h-2 bg-black/40 rounded-full overflow-hidden">
//                                         <div
//                                             className="h-full rounded-full transition-all duration-500"
//                                             style={{
//                                                 width: `${percentage}%`,
//                                                 backgroundColor: platformColors[platform as AdPlatform],
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div className="text-center py-8">
//                         <BarChart3 size={48} className="mx-auto text-gray-700 mb-4" />
//                         <p className="text-gray-500 font-mono">No performance data available</p>
//                         <p className="text-gray-600 text-sm mt-1">Create campaigns to see analytics</p>
//                     </div>
//                 )}
//             </div>

//             {/* Campaign Performance Table */}
//             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                 <h3 className="text-lg font-mono font-bold mb-4 flex items-center gap-2">
//                     <div className="w-1 h-5 bg-[#ff00ff]"></div>
//                     Campaign Performance
//                 </h3>

//                 {campaigns.length > 0 ? (
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="text-left text-xs font-mono text-gray-500 border-b border-gray-800">
//                                     <th className="pb-3 pr-4">Campaign</th>
//                                     <th className="pb-3 px-4">Platform</th>
//                                     <th className="pb-3 px-4 text-right">Spend</th>
//                                     <th className="pb-3 px-4 text-right">Impressions</th>
//                                     <th className="pb-3 px-4 text-right">Clicks</th>
//                                     <th className="pb-3 px-4 text-right">CTR</th>
//                                     <th className="pb-3 pl-4 text-right">CPC</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {campaigns.slice(0, 10).map((campaign) => {
//                                     const campaignMetrics = metrics.find(m => m.campaignId === campaign.id);
//                                     return (
//                                         <tr
//                                             key={campaign.id}
//                                             className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
//                                         >
//                                             <td className="py-3 pr-4">
//                                                 <p className="font-mono text-sm truncate max-w-[200px]">{campaign.name}</p>
//                                                 <p className="text-xs text-gray-600">{campaign.objective}</p>
//                                             </td>
//                                             <td className="py-3 px-4">
//                                                 <span className="text-xl">{platformIcons[campaign.platform]}</span>
//                                             </td>
//                                             <td className="py-3 px-4 text-right font-mono text-sm">
//                                                 ${campaignMetrics?.spend.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'}
//                                             </td>
//                                             <td className="py-3 px-4 text-right font-mono text-sm text-gray-400">
//                                                 {formatNumber(campaignMetrics?.impressions || 0)}
//                                             </td>
//                                             <td className="py-3 px-4 text-right font-mono text-sm text-gray-400">
//                                                 {formatNumber(campaignMetrics?.clicks || 0)}
//                                             </td>
//                                             <td className="py-3 px-4 text-right font-mono text-sm">
//                                                 <span className={getCtrColor(campaignMetrics?.ctr || 0)}>
//                                                     {campaignMetrics?.ctr.toFixed(2) || '0.00'}%
//                                                 </span>
//                                             </td>
//                                             <td className="py-3 pl-4 text-right font-mono text-sm text-gray-400">
//                                                 ${campaignMetrics?.cpc.toFixed(2) || '0.00'}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 ) : (
//                     <div className="text-center py-8">
//                         <p className="text-gray-500 font-mono">No campaigns to display</p>
//                     </div>
//                 )}
//             </div>

//             {/* Insights Section */}
//             <div className="bg-black/40 rounded-xl border border-yellow-500/20 p-6">
//                 <h3 className="text-lg font-mono font-bold mb-4 flex items-center gap-2">
//                     <div className="w-1 h-5 bg-yellow-500"></div>
//                     AI Insights
//                     <span className="ml-auto text-xs text-gray-600 font-normal">Powered by Gemini</span>
//                 </h3>

//                 <div className="space-y-3">
//                     <InsightCard
//                         type="success"
//                         title="Top Performer"
//                         description="Your Twitter engagement campaign is outperforming industry benchmarks by 23%. Consider increasing budget allocation."
//                     />
//                     <InsightCard
//                         type="warning"
//                         title="Optimization Opportunity"
//                         description="Meta campaigns have a higher CPC than average. Review targeting to improve efficiency."
//                     />
//                     <InsightCard
//                         type="info"
//                         title="Trend Alert"
//                         description="Video content is generating 3x more engagement. Consider creating more video ads."
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

// function KPICard({
//     label,
//     value,
//     trend,
//     icon,
//     color
// }: {
//     label: string;
//     value: string;
//     trend: number;
//     icon: React.ReactNode;
//     color: 'cyan' | 'magenta' | 'green' | 'yellow';
// }) {
//     const colors = {
//         cyan: 'border-[#00f0ff]/30 text-[#00f0ff]',
//         magenta: 'border-[#ff00ff]/30 text-[#ff00ff]',
//         green: 'border-[#39ff14]/30 text-[#39ff14]',
//         yellow: 'border-yellow-500/30 text-yellow-500',
//     };

//     const isPositive = trend >= 0;

//     return (
//         <div className={`bg-black/40 rounded-xl border ${colors[color]} p-4`}>
//             <div className="flex items-center justify-between mb-2">
//                 <span className="text-gray-500 text-xs font-mono">{label}</span>
//                 {icon}
//             </div>
//             <p className="text-2xl font-bold font-mono">{value}</p>
//             <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${isPositive ? 'text-[#39ff14]' : 'text-red-500'
//                 }`}>
//                 {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
//                 <span>{isPositive ? '+' : ''}{trend.toFixed(1)}%</span>
//                 <span className="text-gray-600">vs last period</span>
//             </div>
//         </div>
//     );
// }

// function InsightCard({
//     type,
//     title,
//     description
// }: {
//     type: 'success' | 'warning' | 'info';
//     title: string;
//     description: string;
// }) {
//     const styles = {
//         success: 'border-[#39ff14]/30 bg-[#39ff14]/5',
//         warning: 'border-yellow-500/30 bg-yellow-500/5',
//         info: 'border-[#00f0ff]/30 bg-[#00f0ff]/5',
//     };

//     const iconColors = {
//         success: 'text-[#39ff14]',
//         warning: 'text-yellow-500',
//         info: 'text-[#00f0ff]',
//     };

//     return (
//         <div className={`rounded-lg border p-4 ${styles[type]}`}>
//             <div className="flex items-start gap-3">
//                 <TrendingUp size={16} className={`flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
//                 <div>
//                     <p className="font-mono font-bold text-sm">{title}</p>
//                     <p className="text-gray-400 text-sm mt-1">{description}</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function formatNumber(num: number): string {
//     if (num >= 1000000) {
//         return (num / 1000000).toFixed(1) + 'M';
//     }
//     if (num >= 1000) {
//         return (num / 1000).toFixed(1) + 'K';
//     }
//     return num.toLocaleString();
// }

// function getCtrColor(ctr: number): string {
//     if (ctr >= 2) return 'text-[#39ff14]';
//     if (ctr >= 1) return 'text-yellow-500';
//     return 'text-gray-400';
// }