// import React, { useState, useEffect } from 'react';
// import {
//     Megaphone,
//     Target,
//     DollarSign,
//     Calendar,
//     Users,
//     Image,
//     Type,
//     Link,
//     ChevronRight,
//     ChevronLeft,
//     Check,
//     AlertCircle,
//     Sparkles,
//     Globe,
//     Loader2
// } from 'lucide-react';
// import type {
//     AdPlatform,
//     UnifiedCampaign,
//     CampaignObjective,
//     AudienceTargeting,
//     AdCreative,
//     BidStrategy
// } from '../../services/ads/types';
// import * as twitter from '../../services/ads/twitter';

// interface CampaignCreatorProps {
//     connectedPlatforms: Set<AdPlatform>;
//     onCampaignCreated: (campaign: UnifiedCampaign) => void;
//     prefillData?: Partial<CampaignCreatorData>;
// }

// interface CampaignCreatorData {
//     platforms: AdPlatform[];
//     name: string;
//     objective: CampaignObjective;
//     budget: { amount: number; type: 'daily' | 'lifetime' };
//     schedule: { start: string; end: string };
//     targeting: AudienceTargeting;
//     creative: {
//         headline: string;
//         primaryText: string;
//         destinationUrl: string;
//         callToAction: string;
//         imageUrl?: string;
//     };
// }

// const STEPS = [
//     { id: 'platform', title: 'Platform', icon: <Globe size={16} /> },
//     { id: 'basics', title: 'Basics', icon: <Megaphone size={16} /> },
//     { id: 'budget', title: 'Budget', icon: <DollarSign size={16} /> },
//     { id: 'targeting', title: 'Audience', icon: <Users size={16} /> },
//     { id: 'creative', title: 'Creative', icon: <Image size={16} /> },
//     { id: 'review', title: 'Review', icon: <Check size={16} /> },
// ];

// const OBJECTIVES: { value: CampaignObjective; label: string; description: string }[] = [
//     { value: 'awareness', label: 'Brand Awareness', description: 'Reach people likely to remember your ads' },
//     { value: 'traffic', label: 'Website Traffic', description: 'Drive visitors to your website' },
//     { value: 'engagement', label: 'Engagement', description: 'Get more likes, comments, and shares' },
//     { value: 'leads', label: 'Lead Generation', description: 'Collect leads with forms' },
//     { value: 'conversions', label: 'Conversions', description: 'Drive valuable actions on your website' },
//     { value: 'video_views', label: 'Video Views', description: 'Get more people to watch your videos' },
// ];

// const CTA_OPTIONS = [
//     'Learn More', 'Shop Now', 'Sign Up', 'Contact Us', 'Download',
//     'Get Quote', 'Book Now', 'Apply Now', 'Subscribe', 'Get Offer'
// ];

// const platformInfo: Record<AdPlatform, { name: string; icon: string; color: string }> = {
//     twitter: { name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
//     meta: { name: 'Meta (FB/IG)', icon: '📘', color: '#1877F2' },
//     google: { name: 'Google Ads', icon: '🔍', color: '#4285F4' },
//     linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
//     tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
// };

// export function CampaignCreator({ connectedPlatforms, onCampaignCreated, prefillData }: CampaignCreatorProps) {
//     const [currentStep, setCurrentStep] = useState(0);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const [data, setData] = useState<CampaignCreatorData>({
//         platforms: prefillData?.platforms || [],
//         name: prefillData?.name || '',
//         objective: prefillData?.objective || 'traffic',
//         budget: prefillData?.budget || { amount: 50, type: 'daily' },
//         schedule: prefillData?.schedule || {
//             start: new Date().toISOString().split('T')[0],
//             end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
//         },
//         targeting: prefillData?.targeting || {
//             ageMin: 18,
//             ageMax: 65,
//             genders: ['all'],
//             locations: [],
//             interests: [],
//         },
//         creative: prefillData?.creative || {
//             headline: '',
//             primaryText: '',
//             destinationUrl: '',
//             callToAction: 'Learn More',
//         },
//     });

//     const updateData = (updates: Partial<CampaignCreatorData>) => {
//         setData(prev => ({ ...prev, ...updates }));
//     };

//     const canProceed = (): boolean => {
//         switch (STEPS[currentStep].id) {
//             case 'platform':
//                 return data.platforms.length > 0;
//             case 'basics':
//                 return data.name.trim().length > 0;
//             case 'budget':
//                 return data.budget.amount > 0;
//             case 'targeting':
//                 return true; // Targeting is optional
//             case 'creative':
//                 return data.creative.headline.trim().length > 0 &&
//                     data.creative.primaryText.trim().length > 0;
//             default:
//                 return true;
//         }
//     };

//     const handleSubmit = async () => {
//         setIsSubmitting(true);
//         setError(null);

//         try {
//             // Create campaign on each selected platform
//             for (const platform of data.platforms) {
//                 if (platform === 'twitter') {
//                     // Get account ID first
//                     const accountsRes = await fetch('/api/ads/twitter/accounts');
//                     const accountsData = await accountsRes.json();

//                     if (!accountsData.success || !accountsData.data?.[0]) {
//                         throw new Error('No Twitter ad account found');
//                     }

//                     const accountId = accountsData.data[0].id;

//                     // Get funding instrument
//                     const fundingRes = await fetch(`/api/ads/twitter/accounts/${accountId}/funding-instruments`);
//                     const fundingData = await fundingRes.json();

//                     if (!fundingData.success || !fundingData.data?.[0]) {
//                         throw new Error('No funding instrument found. Please add a payment method to your Twitter Ads account.');
//                     }

//                     const fundingInstrumentId = fundingData.data[0].id;

//                     // Create full campaign
//                     const result = await twitter.createFullCampaign(accountId, fundingInstrumentId, {
//                         name: data.name,
//                         objective: data.objective,
//                         budget: data.budget,
//                         schedule: data.schedule,
//                         targeting: data.targeting,
//                         creative: {
//                             tweetText: `${data.creative.headline}\n\n${data.creative.primaryText}`,
//                             websiteUrl: data.creative.destinationUrl,
//                         },
//                     });

//                     if (!result.success) {
//                         throw new Error(result.error?.message || 'Failed to create Twitter campaign');
//                     }

//                     if (result.data?.campaign) {
//                         onCampaignCreated(result.data.campaign);
//                     }
//                 }
//                 // Add other platforms as they're implemented
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Failed to create campaign');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="max-w-4xl mx-auto">
//             {/* Progress Steps */}
//             <div className="mb-8">
//                 <div className="flex items-center justify-between">
//                     {STEPS.map((step, index) => (
//                         <React.Fragment key={step.id}>
//                             <button
//                                 onClick={() => index < currentStep && setCurrentStep(index)}
//                                 disabled={index > currentStep}
//                                 className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${index === currentStep
//                                     ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                     : index < currentStep
//                                         ? 'bg-[#39ff14]/10 text-[#39ff14] cursor-pointer hover:bg-[#39ff14]/20'
//                                         : 'bg-black/30 text-gray-600 cursor-not-allowed'
//                                     }`}
//                             >
//                                 {index < currentStep ? (
//                                     <Check size={16} />
//                                 ) : (
//                                     step.icon
//                                 )}
//                                 <span className="font-mono text-sm hidden md:inline">{step.title}</span>
//                             </button>
//                             {index < STEPS.length - 1 && (
//                                 <div className={`flex-1 h-px mx-2 ${index < currentStep ? 'bg-[#39ff14]/50' : 'bg-gray-800'
//                                     }`} />
//                             )}
//                         </React.Fragment>
//                     ))}
//                 </div>
//             </div>

//             {/* Step Content */}
//             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                 {/* Platform Selection */}
//                 {STEPS[currentStep].id === 'platform' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Select Platforms</h2>
//                             <p className="text-gray-500 text-sm">Choose where to run your campaign</p>
//                         </div>

//                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                             {Array.from(connectedPlatforms).map((platform) => {
//                                 const info = platformInfo[platform];
//                                 const isSelected = data.platforms.includes(platform);

//                                 return (
//                                     <button
//                                         key={platform}
//                                         onClick={() => {
//                                             updateData({
//                                                 platforms: isSelected
//                                                     ? data.platforms.filter(p => p !== platform)
//                                                     : [...data.platforms, platform]
//                                             });
//                                         }}
//                                         className={`p-4 rounded-xl border transition-all text-left ${isSelected
//                                             ? 'bg-[#00f0ff]/10 border-[#00f0ff]/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
//                                             : 'bg-black/30 border-gray-800 hover:border-gray-600'
//                                             }`}
//                                     >
//                                         <div className="flex items-center gap-3 mb-2">
//                                             <span className="text-3xl">{info.icon}</span>
//                                             {isSelected && <Check size={16} className="text-[#00f0ff]" />}
//                                         </div>
//                                         <p className="font-mono font-bold">{info.name}</p>
//                                     </button>
//                                 );
//                             })}
//                         </div>

//                         {connectedPlatforms.size === 0 && (
//                             <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
//                                 <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
//                                 <div>
//                                     <p className="font-mono text-yellow-500 font-bold">No platforms connected</p>
//                                     <p className="text-sm text-gray-400 mt-1">
//                                         Go to Settings to configure your ad platform credentials.
//                                     </p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Basic Info */}
//                 {STEPS[currentStep].id === 'basics' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Campaign Basics</h2>
//                             <p className="text-gray-500 text-sm">Name your campaign and set your objective</p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Campaign Name</label>
//                             <input
//                                 type="text"
//                                 value={data.name}
//                                 onChange={(e) => updateData({ name: e.target.value })}
//                                 placeholder="e.g., Holiday Sale 2024"
//                                 className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none transition-colors"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Campaign Objective</label>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 {OBJECTIVES.map((obj) => (
//                                     <button
//                                         key={obj.value}
//                                         onClick={() => updateData({ objective: obj.value })}
//                                         className={`p-4 rounded-lg border text-left transition-all ${data.objective === obj.value
//                                             ? 'bg-[#ff00ff]/10 border-[#ff00ff]/50'
//                                             : 'bg-black/30 border-gray-800 hover:border-gray-600'
//                                             }`}
//                                     >
//                                         <p className="font-mono font-bold">{obj.label}</p>
//                                         <p className="text-xs text-gray-500 mt-1">{obj.description}</p>
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Budget & Schedule */}
//                 {STEPS[currentStep].id === 'budget' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Budget & Schedule</h2>
//                             <p className="text-gray-500 text-sm">Set your spending limits and campaign duration</p>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">Budget Type</label>
//                                 <div className="flex gap-2">
//                                     <button
//                                         onClick={() => updateData({ budget: { ...data.budget, type: 'daily' } })}
//                                         className={`flex-1 py-2 px-4 rounded-lg font-mono text-sm transition-all ${data.budget.type === 'daily'
//                                             ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                             : 'bg-black/30 border border-gray-800'
//                                             }`}
//                                     >
//                                         Daily
//                                     </button>
//                                     <button
//                                         onClick={() => updateData({ budget: { ...data.budget, type: 'lifetime' } })}
//                                         className={`flex-1 py-2 px-4 rounded-lg font-mono text-sm transition-all ${data.budget.type === 'lifetime'
//                                             ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                             : 'bg-black/30 border border-gray-800'
//                                             }`}
//                                     >
//                                         Lifetime
//                                     </button>
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">
//                                     {data.budget.type === 'daily' ? 'Daily Budget' : 'Total Budget'}
//                                 </label>
//                                 <div className="relative">
//                                     <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                                     <input
//                                         type="number"
//                                         value={data.budget.amount}
//                                         onChange={(e) => updateData({ budget: { ...data.budget, amount: Number(e.target.value) } })}
//                                         min={1}
//                                         title="Budget Amount"
//                                         className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">Start Date</label>
//                                 <div className="relative">
//                                     <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                                     <input
//                                         title="Start Date"
//                                         type="date"
//                                         value={data.schedule.start}
//                                         onChange={(e) => updateData({ schedule: { ...data.schedule, start: e.target.value } })}
//                                         className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">End Date</label>
//                                 <div className="relative">
//                                     <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                                     <input
//                                         title="End Date"
//                                         type="date"
//                                         value={data.schedule.end}
//                                         onChange={(e) => updateData({ schedule: { ...data.schedule, end: e.target.value } })}
//                                         className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Budget Estimate */}
//                         <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-lg p-4">
//                             <p className="text-sm text-gray-400">
//                                 Estimated total spend: <span className="text-[#00f0ff] font-mono font-bold">
//                                     ${data.budget.type === 'daily'
//                                         ? (data.budget.amount * Math.ceil((new Date(data.schedule.end).getTime() - new Date(data.schedule.start).getTime()) / (1000 * 60 * 60 * 24))).toLocaleString()
//                                         : data.budget.amount.toLocaleString()
//                                     }
//                                 </span>
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Targeting */}
//                 {STEPS[currentStep].id === 'targeting' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Audience Targeting</h2>
//                             <p className="text-gray-500 text-sm">Define who should see your ads</p>
//                         </div>

//                         {/* Age Range */}
//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Age Range</label>
//                             <div className="flex items-center gap-4">
//                                 <input
//                                     title="Minimum Age"
//                                     type="number"
//                                     value={data.targeting.ageMin || 18}
//                                     onChange={(e) => updateData({
//                                         targeting: { ...data.targeting, ageMin: Number(e.target.value) }
//                                     })}
//                                     min={13}
//                                     max={65}
//                                     className="w-24 px-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono text-center focus:border-[#00f0ff]/50 focus:outline-none"
//                                 />
//                                 <span className="text-gray-500">to</span>
//                                 <input
//                                     title="Maximum Age"
//                                     type="number"
//                                     value={data.targeting.ageMax || 65}
//                                     onChange={(e) => updateData({
//                                         targeting: { ...data.targeting, ageMax: Number(e.target.value) }
//                                     })}
//                                     min={13}
//                                     max={65}
//                                     className="w-24 px-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono text-center focus:border-[#00f0ff]/50 focus:outline-none"
//                                 />
//                             </div>
//                         </div>

//                         {/* Gender */}
//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Gender</label>
//                             <div className="flex gap-2">
//                                 {['all', 'male', 'female'].map((gender) => (
//                                     <button
//                                         key={gender}
//                                         onClick={() => updateData({
//                                             targeting: { ...data.targeting, genders: [gender as 'all' | 'male' | 'female'] }
//                                         })}
//                                         className={`px-4 py-2 rounded-lg font-mono text-sm capitalize transition-all ${data.targeting.genders?.includes(gender as any)
//                                             ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30'
//                                             : 'bg-black/30 border border-gray-800'
//                                             }`}
//                                     >
//                                         {gender}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Interests (Twitter Keywords) */}
//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">
//                                 Interests / Keywords
//                             </label>
//                             <div className="flex flex-wrap gap-2 mb-2">
//                                 {data.targeting.interests?.map((interest, i) => (
//                                     <span
//                                         key={i}
//                                         className="px-3 py-1 bg-[#ff00ff]/20 text-[#ff00ff] rounded-full text-sm font-mono flex items-center gap-2"
//                                     >
//                                         {interest}
//                                         <button
//                                             onClick={() => updateData({
//                                                 targeting: {
//                                                     ...data.targeting,
//                                                     interests: data.targeting.interests?.filter((_, idx) => idx !== i)
//                                                 }
//                                             })}
//                                             className="hover:text-white"
//                                         >
//                                             ×
//                                         </button>
//                                     </span>
//                                 ))}
//                             </div>
//                             <input
//                                 type="text"
//                                 placeholder="Type and press Enter to add..."
//                                 onKeyDown={(e) => {
//                                     if (e.key === 'Enter' && e.currentTarget.value.trim()) {
//                                         updateData({
//                                             targeting: {
//                                                 ...data.targeting,
//                                                 interests: [...(data.targeting.interests || []), e.currentTarget.value.trim()]
//                                             }
//                                         });
//                                         e.currentTarget.value = '';
//                                     }
//                                 }}
//                                 className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none"
//                             />
//                         </div>

//                         {/* Twitter-specific: Follower Lookalikes */}
//                         {data.platforms.includes('twitter') && (
//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">
//                                     Target followers similar to (Twitter handles)
//                                 </label>
//                                 <div className="flex flex-wrap gap-2 mb-2">
//                                     {data.targeting.followerLookalikes?.map((handle, i) => (
//                                         <span
//                                             key={i}
//                                             className="px-3 py-1 bg-black/50 text-[#00f0ff] rounded-full text-sm font-mono flex items-center gap-2"
//                                         >
//                                             @{handle}
//                                             <button
//                                                 onClick={() => updateData({
//                                                     targeting: {
//                                                         ...data.targeting,
//                                                         followerLookalikes: data.targeting.followerLookalikes?.filter((_, idx) => idx !== i)
//                                                     }
//                                                 })}
//                                                 className="hover:text-white"
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="@username (press Enter to add)"
//                                     onKeyDown={(e) => {
//                                         if (e.key === 'Enter' && e.currentTarget.value.trim()) {
//                                             const handle = e.currentTarget.value.trim().replace('@', '');
//                                             updateData({
//                                                 targeting: {
//                                                     ...data.targeting,
//                                                     followerLookalikes: [...(data.targeting.followerLookalikes || []), handle]
//                                                 }
//                                             });
//                                             e.currentTarget.value = '';
//                                         }
//                                     }}
//                                     className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none"
//                                 />
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Creative */}
//                 {STEPS[currentStep].id === 'creative' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Ad Creative</h2>
//                             <p className="text-gray-500 text-sm">Create your ad content</p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Headline</label>
//                             <input
//                                 type="text"
//                                 value={data.creative.headline}
//                                 onChange={(e) => updateData({ creative: { ...data.creative, headline: e.target.value } })}
//                                 placeholder="Grab attention with a strong headline"
//                                 maxLength={100}
//                                 className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                             />
//                             <p className="text-xs text-gray-600 mt-1">{data.creative.headline.length}/100</p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Primary Text</label>
//                             <textarea
//                                 value={data.creative.primaryText}
//                                 onChange={(e) => updateData({ creative: { ...data.creative, primaryText: e.target.value } })}
//                                 placeholder="Tell your story..."
//                                 rows={4}
//                                 maxLength={280}
//                                 className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none resize-none"
//                             />
//                             <p className="text-xs text-gray-600 mt-1">{data.creative.primaryText.length}/280</p>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Destination URL</label>
//                             <div className="relative">
//                                 <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                                 <input
//                                     type="url"
//                                     value={data.creative.destinationUrl}
//                                     onChange={(e) => updateData({ creative: { ...data.creative, destinationUrl: e.target.value } })}
//                                     placeholder="https://yourwebsite.com/landing-page"
//                                     className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-mono text-gray-400 mb-2">Call to Action</label>
//                             <div className="flex flex-wrap gap-2">
//                                 {CTA_OPTIONS.map((cta) => (
//                                     <button
//                                         key={cta}
//                                         onClick={() => updateData({ creative: { ...data.creative, callToAction: cta } })}
//                                         className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${data.creative.callToAction === cta
//                                             ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/30'
//                                             : 'bg-black/30 border border-gray-800 hover:border-gray-600'
//                                             }`}
//                                     >
//                                         {cta}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Ad Preview */}
//                         <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
//                             <h4 className="text-xs font-mono text-gray-500 mb-3">PREVIEW</h4>
//                             <div className="bg-white/5 rounded-lg p-4">
//                                 <p className="font-bold text-white">{data.creative.headline || 'Your headline here'}</p>
//                                 <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">
//                                     {data.creative.primaryText || 'Your ad copy will appear here...'}
//                                 </p>
//                                 {data.creative.destinationUrl && (
//                                     <p className="text-[#00f0ff] text-xs mt-2 truncate">{data.creative.destinationUrl}</p>
//                                 )}
//                                 <button className="mt-3 px-4 py-1.5 bg-[#00f0ff] text-black font-mono text-sm rounded">
//                                     {data.creative.callToAction}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Review */}
//                 {STEPS[currentStep].id === 'review' && (
//                     <div className="space-y-6">
//                         <div>
//                             <h2 className="text-xl font-mono font-bold mb-2">Review Campaign</h2>
//                             <p className="text-gray-500 text-sm">Check everything before launching</p>
//                         </div>

//                         {error && (
//                             <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
//                                 <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
//                                 <p className="text-red-400 text-sm">{error}</p>
//                             </div>
//                         )}

//                         <div className="space-y-4">
//                             <ReviewSection title="Platforms">
//                                 <div className="flex gap-2">
//                                     {data.platforms.map((p) => (
//                                         <span key={p} className="text-2xl">{platformInfo[p].icon}</span>
//                                     ))}
//                                 </div>
//                             </ReviewSection>

//                             <ReviewSection title="Campaign">
//                                 <p className="font-mono">{data.name}</p>
//                                 <p className="text-sm text-gray-500">{OBJECTIVES.find(o => o.value === data.objective)?.label}</p>
//                             </ReviewSection>

//                             <ReviewSection title="Budget">
//                                 <p className="font-mono">${data.budget.amount.toLocaleString()} / {data.budget.type}</p>
//                                 <p className="text-sm text-gray-500">
//                                     {data.schedule.start} to {data.schedule.end}
//                                 </p>
//                             </ReviewSection>

//                             <ReviewSection title="Targeting">
//                                 <p className="text-sm">Age: {data.targeting.ageMin}-{data.targeting.ageMax}</p>
//                                 {data.targeting.interests?.length > 0 && (
//                                     <p className="text-sm text-gray-500">
//                                         Interests: {data.targeting.interests.join(', ')}
//                                     </p>
//                                 )}
//                             </ReviewSection>

//                             <ReviewSection title="Creative">
//                                 <p className="font-mono">{data.creative.headline}</p>
//                                 <p className="text-sm text-gray-500 line-clamp-2">{data.creative.primaryText}</p>
//                             </ReviewSection>
//                         </div>
//                     </div>
//                 )}

//                 {/* Navigation */}
//                 <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
//                     <button
//                         onClick={() => setCurrentStep(prev => prev - 1)}
//                         disabled={currentStep === 0}
//                         className="flex items-center gap-2 px-4 py-2 font-mono text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                         <ChevronLeft size={16} />
//                         Back
//                     </button>

//                     {currentStep < STEPS.length - 1 ? (
//                         <button
//                             onClick={() => setCurrentStep(prev => prev + 1)}
//                             disabled={!canProceed()}
//                             className="flex items-center gap-2 px-6 py-2 bg-[#00f0ff] text-black font-mono text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                         >
//                             Continue
//                             <ChevronRight size={16} />
//                         </button>
//                     ) : (
//                         <button
//                             onClick={handleSubmit}
//                             disabled={isSubmitting}
//                             className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] text-black font-mono text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] disabled:opacity-50 transition-all"
//                         >
//                             {isSubmitting ? (
//                                 <>
//                                     <Loader2 size={16} className="animate-spin" />
//                                     Creating...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Sparkles size={16} />
//                                     Launch Campaign
//                                 </>
//                             )}
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
//     return (
//         <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
//             <h4 className="text-xs font-mono text-gray-500 mb-2">{title.toUpperCase()}</h4>
//             {children}
//         </div>
//     );
// }