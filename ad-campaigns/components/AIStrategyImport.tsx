// import React, { useState } from 'react';
// import {
//     X,
//     Zap,
//     Upload,
//     Loader2,
//     CheckCircle2,
//     AlertCircle,
//     FileText,
//     Sparkles,
//     ChevronRight
// } from 'lucide-react';
// import type { AdPlatform, UnifiedCampaign, CampaignObjective } from '../../services/ads/types';

// interface AIStrategyImportProps {
//     apiKey: string;
//     connectedPlatforms: Set<AdPlatform>;
//     onClose: () => void;
//     onImport: (campaigns: UnifiedCampaign[]) => void;
// }

// interface ParsedStrategy {
//     name: string;
//     objective: CampaignObjective;
//     targetAudience: string;
//     budget: { amount: number; type: 'daily' | 'lifetime' };
//     platforms: AdPlatform[];
//     headlines: string[];
//     adCopy: string[];
//     keywords: string[];
// }

// const platformInfo: Record<AdPlatform, { name: string; icon: string }> = {
//     twitter: { name: 'X (Twitter)', icon: '𝕏' },
//     meta: { name: 'Meta (FB/IG)', icon: '📘' },
//     google: { name: 'Google Ads', icon: '🔍' },
//     linkedin: { name: 'LinkedIn', icon: '💼' },
//     tiktok: { name: 'TikTok', icon: '🎵' },
// };

// export function AIStrategyImport({ apiKey, connectedPlatforms, onClose, onImport }: AIStrategyImportProps) {
//     const [strategyText, setStrategyText] = useState('');
//     const [isAnalyzing, setIsAnalyzing] = useState(false);
//     const [parsedStrategy, setParsedStrategy] = useState<ParsedStrategy | null>(null);
//     const [selectedPlatforms, setSelectedPlatforms] = useState<Set<AdPlatform>>(new Set());
//     const [error, setError] = useState<string | null>(null);
//     const [step, setStep] = useState<'input' | 'review' | 'complete'>('input');

//     const analyzeStrategy = async () => {
//         if (!strategyText.trim()) {
//             setError('Please paste your AI-generated strategy');
//             return;
//         }

//         setIsAnalyzing(true);
//         setError(null);

//         try {
//             // Call AI to parse the strategy
//             const response = await fetch('/api/ai/generate_strategy', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     action: 'parse',
//                     content: strategyText,
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to analyze strategy');
//             }

//             const data = await response.json();

//             if (data.error) {
//                 throw new Error(data.error);
//             }

//             // Parse the response into structured data
//             const parsed: ParsedStrategy = {
//                 name: data.campaignName || 'AI Strategy Campaign',
//                 objective: data.objective || 'traffic',
//                 targetAudience: data.targetAudience || '',
//                 budget: data.budget || { amount: 50, type: 'daily' },
//                 platforms: data.platforms || ['twitter'],
//                 headlines: data.headlines || [],
//                 adCopy: data.adCopy || [],
//                 keywords: data.keywords || [],
//             };

//             setParsedStrategy(parsed);

//             // Pre-select platforms that are both recommended and connected
//             const availablePlatforms = parsed.platforms.filter(p => connectedPlatforms.has(p));
//             setSelectedPlatforms(new Set(availablePlatforms.length > 0 ? availablePlatforms : Array.from(connectedPlatforms).slice(0, 1)));

//             setStep('review');
//         } catch (err) {
//             // Fallback: try simple parsing if API fails
//             const parsed = simpleParseStrategy(strategyText);
//             setParsedStrategy(parsed);
//             setSelectedPlatforms(new Set(Array.from(connectedPlatforms).slice(0, 1)));
//             setStep('review');
//         } finally {
//             setIsAnalyzing(false);
//         }
//     };

//     const simpleParseStrategy = (text: string): ParsedStrategy => {
//         // Basic parsing logic for common strategy formats
//         const lines = text.split('\n').filter(l => l.trim());

//         // Try to extract headlines (look for short punchy lines)
//         const headlines = lines
//             .filter(l => l.length < 100 && !l.includes(':') && l.trim().length > 10)
//             .slice(0, 3);

//         // Try to extract keywords
//         const keywordLine = lines.find(l => l.toLowerCase().includes('keyword'));
//         const keywords = keywordLine
//             ? keywordLine.split(/[,;]/).map(k => k.trim()).filter(k => k.length > 2)
//             : [];

//         return {
//             name: 'AI Strategy Campaign',
//             objective: 'traffic',
//             targetAudience: '',
//             budget: { amount: 50, type: 'daily' },
//             platforms: ['twitter'],
//             headlines,
//             adCopy: lines.filter(l => l.length > 100).slice(0, 2),
//             keywords,
//         };
//     };

//     const handleImport = () => {
//         if (!parsedStrategy || selectedPlatforms.size === 0) return;

//         const campaigns: UnifiedCampaign[] = Array.from(selectedPlatforms).map(platform => ({
//             platform,
//             name: parsedStrategy.name,
//             status: 'draft',
//             objective: parsedStrategy.objective,
//             schedule: {
//                 start: new Date().toISOString().split('T')[0],
//                 end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//             },
//             budget: {
//                 ...parsedStrategy.budget,
//                 currency: 'USD',
//             },
//             bidStrategy: 'lowest_cost',
//             targeting: {
//                 ageMin: 18,
//                 ageMax: 65,
//                 keywords: parsedStrategy.keywords,
//                 interests: parsedStrategy.keywords,
//             },
//             creatives: parsedStrategy.headlines.map((headline, i) => ({
//                 name: `Creative ${i + 1}`,
//                 format: 'single_image' as const,
//                 headline,
//                 primaryText: parsedStrategy.adCopy[i] || parsedStrategy.adCopy[0] || '',
//             })),
//         }));

//         setStep('complete');

//         setTimeout(() => {
//             onImport(campaigns);
//         }, 1500);
//     };

//     const togglePlatform = (platform: AdPlatform) => {
//         setSelectedPlatforms(prev => {
//             const next = new Set(prev);
//             if (next.has(platform)) {
//                 next.delete(platform);
//             } else {
//                 next.add(platform);
//             }
//             return next;
//         });
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             {/* Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
//                 onClick={onClose}
//             />

//             {/* Modal */}
//             <div className="relative bg-[#0a0a0a] border border-[#00f0ff]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)]">
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-6 border-b border-[#00f0ff]/20">
//                     <div className="flex items-center gap-3">
//                         <div className="relative">
//                             <div className="absolute inset-0 bg-[#ff00ff] blur-lg opacity-30"></div>
//                             <div className="relative bg-black/50 p-2 rounded-lg border border-[#ff00ff]/50">
//                                 <Zap size={20} className="text-[#ff00ff]" />
//                             </div>
//                         </div>
//                         <div>
//                             <h2 className="font-mono font-bold text-lg">AI Strategy Import</h2>
//                             <p className="text-xs text-gray-500">Convert AI strategies to live campaigns</p>
//                         </div>
//                     </div>
//                     <button
//                         title="Close"
//                         onClick={onClose}
//                         className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//                     >
//                         <X size={20} className="text-gray-400" />
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
//                     {/* Input Step */}
//                     {step === 'input' && (
//                         <div className="space-y-6">
//                             <div>
//                                 <label className="block text-sm font-mono text-gray-400 mb-2">
//                                     Paste your AI-generated marketing strategy
//                                 </label>
//                                 <textarea
//                                     value={strategyText}
//                                     onChange={(e) => setStrategyText(e.target.value)}
//                                     placeholder="Paste your strategy from ChatGPT, Claude, or other AI tools here...

// Example:
// Campaign: Summer Sale 2024
// Target Audience: Young professionals aged 25-40
// Headlines:
// - Transform Your Summer Style
// - Exclusive Deals Inside
// Ad Copy: Discover our curated collection..."
//                                     rows={12}
//                                     className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl font-mono text-sm focus:border-[#00f0ff]/50 focus:outline-none resize-none placeholder:text-gray-600"
//                                 />
//                             </div>

//                             {error && (
//                                 <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
//                                     <AlertCircle size={16} className="text-red-500" />
//                                     <p className="text-sm text-red-400">{error}</p>
//                                 </div>
//                             )}

//                             <div className="flex items-center gap-4 p-4 bg-[#ff00ff]/5 border border-[#ff00ff]/20 rounded-xl">
//                                 <FileText size={24} className="text-[#ff00ff]" />
//                                 <div className="flex-1">
//                                     <p className="font-mono text-sm">Supported Formats</p>
//                                     <p className="text-xs text-gray-500">
//                                         ChatGPT, Claude, Gemini outputs • Marketing plans • Campaign briefs
//                                     </p>
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={analyzeStrategy}
//                                 disabled={isAnalyzing || !strategyText.trim()}
//                                 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] text-black font-mono font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                             >
//                                 {isAnalyzing ? (
//                                     <>
//                                         <Loader2 size={18} className="animate-spin" />
//                                         Analyzing Strategy...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Sparkles size={18} />
//                                         Analyze & Import
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     )}

//                     {/* Review Step */}
//                     {step === 'review' && parsedStrategy && (
//                         <div className="space-y-6">
//                             <div className="bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-xl p-4 flex items-center gap-3">
//                                 <CheckCircle2 size={20} className="text-[#39ff14]" />
//                                 <p className="font-mono text-sm text-[#39ff14]">Strategy analyzed successfully!</p>
//                             </div>

//                             {/* Campaign Name */}
//                             <div>
//                                 <label className="block text-xs font-mono text-gray-500 mb-1">CAMPAIGN NAME</label>
//                                 <input
//                                     title="Campaign Name"
//                                     type="text"
//                                     value={parsedStrategy.name}
//                                     onChange={(e) => setParsedStrategy({ ...parsedStrategy, name: e.target.value })}
//                                     className="w-full px-4 py-2 bg-black/40 border border-gray-800 rounded-lg font-mono focus:border-[#00f0ff]/50 focus:outline-none"
//                                 />
//                             </div>

//                             {/* Platform Selection */}
//                             <div>
//                                 <label className="block text-xs font-mono text-gray-500 mb-2">SELECT PLATFORMS</label>
//                                 <div className="flex flex-wrap gap-2">
//                                     {Array.from(connectedPlatforms).map(platform => {
//                                         const info = platformInfo[platform];
//                                         const isSelected = selectedPlatforms.has(platform);
//                                         return (
//                                             <button
//                                                 key={platform}
//                                                 onClick={() => togglePlatform(platform)}
//                                                 className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isSelected
//                                                         ? 'bg-[#00f0ff]/20 border-[#00f0ff]/50 text-[#00f0ff]'
//                                                         : 'bg-black/30 border-gray-800 text-gray-400 hover:border-gray-600'
//                                                     }`}
//                                             >
//                                                 <span className="text-lg">{info.icon}</span>
//                                                 <span className="font-mono text-sm">{info.name}</span>
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                                 {connectedPlatforms.size === 0 && (
//                                     <p className="text-sm text-yellow-500 mt-2">No platforms connected. Go to Settings to configure.</p>
//                                 )}
//                             </div>

//                             {/* Extracted Content */}
//                             {parsedStrategy.headlines.length > 0 && (
//                                 <div>
//                                     <label className="block text-xs font-mono text-gray-500 mb-2">EXTRACTED HEADLINES</label>
//                                     <div className="space-y-2">
//                                         {parsedStrategy.headlines.map((headline, i) => (
//                                             <div key={i} className="px-4 py-2 bg-black/30 border border-gray-800 rounded-lg font-mono text-sm">
//                                                 {headline}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {parsedStrategy.keywords.length > 0 && (
//                                 <div>
//                                     <label className="block text-xs font-mono text-gray-500 mb-2">KEYWORDS</label>
//                                     <div className="flex flex-wrap gap-2">
//                                         {parsedStrategy.keywords.map((keyword, i) => (
//                                             <span key={i} className="px-3 py-1 bg-[#ff00ff]/20 text-[#ff00ff] rounded-full text-xs font-mono">
//                                                 {keyword}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Actions */}
//                             <div className="flex gap-3 pt-4">
//                                 <button
//                                     onClick={() => setStep('input')}
//                                     className="flex-1 px-4 py-3 border border-gray-800 text-gray-400 font-mono rounded-xl hover:bg-white/5 transition-colors"
//                                 >
//                                     Back
//                                 </button>
//                                 <button
//                                     onClick={handleImport}
//                                     disabled={selectedPlatforms.size === 0}
//                                     className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] text-black font-mono font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                                 >
//                                     Create Campaigns
//                                     <ChevronRight size={18} />
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Complete Step */}
//                     {step === 'complete' && (
//                         <div className="text-center py-12">
//                             <div className="relative inline-block mb-6">
//                                 <div className="absolute inset-0 bg-[#39ff14] blur-xl opacity-30 animate-pulse"></div>
//                                 <CheckCircle2 size={64} className="relative text-[#39ff14]" />
//                             </div>
//                             <h3 className="font-mono font-bold text-xl mb-2">Campaigns Created!</h3>
//                             <p className="text-gray-500">
//                                 {selectedPlatforms.size} campaign draft{selectedPlatforms.size > 1 ? 's' : ''} ready for review
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
