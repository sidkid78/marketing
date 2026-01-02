// import React, { useState } from 'react';
// import {
//     CheckCircle2,
//     AlertCircle,
//     ExternalLink,
//     Key,
//     Shield,
//     RefreshCw,
//     ChevronDown,
//     ChevronUp
// } from 'lucide-react';
// import type { AdPlatform } from '../../services/ads/types';

// interface PlatformConfig {
//     id: AdPlatform;
//     name: string;
//     icon: string;
//     color: string;
// }

// interface PlatformConnectorProps {
//     platforms: PlatformConfig[];
//     connectedPlatforms: Set<AdPlatform>;
//     onConnectionChange: (platform: AdPlatform, connected: boolean) => void;
// }

// // Platform setup documentation
// const PLATFORM_DOCS: Record<AdPlatform, {
//     docsUrl: string;
//     envVars: string[];
//     instructions: string[];
// }> = {
//     twitter: {
//         docsUrl: 'https://developer.x.com/en/docs/twitter-ads-api',
//         envVars: [
//             'TWITTER_API_KEY',
//             'TWITTER_API_SECRET',
//             'TWITTER_ACCESS_TOKEN',
//             'TWITTER_ACCESS_TOKEN_SECRET',
//         ],
//         instructions: [
//             'Create a developer account at developer.x.com',
//             'Create a new app with Ads API access',
//             'Apply for Elevated access if needed',
//             'Generate OAuth 1.0a credentials',
//             'Add credentials to .env.local',
//         ],
//     },
//     meta: {
//         docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
//         envVars: [
//             'META_ACCESS_TOKEN',
//             'META_APP_ID',
//             'META_APP_SECRET',
//             'META_AD_ACCOUNT_ID',
//         ],
//         instructions: [
//             'Create a Meta Business account',
//             'Create an app at developers.facebook.com',
//             'Request Marketing API access (requires review)',
//             'Generate a System User access token',
//             'Add credentials to .env.local',
//         ],
//     },
//     google: {
//         docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
//         envVars: [
//             'GOOGLE_ADS_CLIENT_ID',
//             'GOOGLE_ADS_CLIENT_SECRET',
//             'GOOGLE_ADS_DEVELOPER_TOKEN',
//             'GOOGLE_ADS_REFRESH_TOKEN',
//             'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
//         ],
//         instructions: [
//             'Create a Google Cloud project',
//             'Enable Google Ads API',
//             'Apply for Developer Token (takes time)',
//             'Create OAuth 2.0 credentials',
//             'Link to Google Ads Manager account',
//         ],
//     },
//     linkedin: {
//         docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
//         envVars: [
//             'LINKEDIN_CLIENT_ID',
//             'LINKEDIN_CLIENT_SECRET',
//             'LINKEDIN_ACCESS_TOKEN',
//             'LINKEDIN_AD_ACCOUNT_ID',
//         ],
//         instructions: [
//             'Create a LinkedIn Marketing Solutions account',
//             'Apply for Marketing Developer Platform access',
//             'Create an OAuth app with Marketing API product',
//             'Authenticate with rw_ads, r_ads_reporting permissions',
//             'Add credentials to .env.local',
//         ],
//     },
//     tiktok: {
//         docsUrl: 'https://business-api.tiktok.com/portal/docs',
//         envVars: [
//             'TIKTOK_APP_ID',
//             'TIKTOK_APP_SECRET',
//             'TIKTOK_ACCESS_TOKEN',
//             'TIKTOK_ADVERTISER_ID',
//         ],
//         instructions: [
//             'Create a TikTok for Business account',
//             'Create app in Marketing API portal',
//             'Submit for app review',
//             'Authenticate via OAuth',
//             'Add credentials to .env.local',
//         ],
//     },
// };

// export function PlatformConnector({
//     platforms,
//     connectedPlatforms,
//     onConnectionChange
// }: PlatformConnectorProps) {
//     const [expandedPlatform, setExpandedPlatform] = useState<AdPlatform | null>(null);
//     const [testingPlatform, setTestingPlatform] = useState<AdPlatform | null>(null);

//     const testConnection = async (platform: AdPlatform) => {
//         setTestingPlatform(platform);

//         try {
//             let response;

//             switch (platform) {
//                 case 'twitter':
//                     response = await fetch('/api/ads/twitter/accounts');
//                     break;
//                 // Add other platforms as API routes are implemented
//                 default:
//                     throw new Error('Platform API not yet implemented');
//             }

//             const data = await response.json();

//             if (data.success) {
//                 onConnectionChange(platform, true);
//             } else {
//                 onConnectionChange(platform, false);
//                 alert(`Connection failed: ${data.error?.message || 'Unknown error'}`);
//             }
//         } catch (error) {
//             onConnectionChange(platform, false);
//             alert(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         } finally {
//             setTestingPlatform(null);
//         }
//     };

//     return (
//         <div className="space-y-6">
//             <div className="bg-black/40 rounded-xl border border-[#00f0ff]/20 p-6">
//                 <h2 className="text-xl font-mono font-bold mb-2 flex items-center gap-2">
//                     <Shield size={20} className="text-[#00f0ff]" />
//                     Platform Connections
//                 </h2>
//                 <p className="text-gray-500 text-sm mb-6">
//                     Configure API credentials for each advertising platform. Credentials are stored securely in environment variables.
//                 </p>

//                 <div className="space-y-4">
//                     {platforms.map((platform) => {
//                         const isConnected = connectedPlatforms.has(platform.id);
//                         const isExpanded = expandedPlatform === platform.id;
//                         const isTesting = testingPlatform === platform.id;
//                         const docs = PLATFORM_DOCS[platform.id];

//                         return (
//                             <div
//                                 key={platform.id}
//                                 className={`border rounded-xl overflow-hidden transition-all ${isConnected
//                                         ? 'border-[#39ff14]/30 bg-[#39ff14]/5'
//                                         : 'border-gray-800 bg-black/30'
//                                     }`}
//                             >
//                                 {/* Platform Header */}
//                                 <div
//                                     className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
//                                     onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
//                                 >
//                                     <div className="flex items-center gap-4">
//                                         <span className="text-3xl">{platform.icon}</span>
//                                         <div>
//                                             <h3 className="font-mono font-bold">{platform.name}</h3>
//                                             <div className="flex items-center gap-2 mt-1">
//                                                 {isConnected ? (
//                                                     <>
//                                                         <CheckCircle2 size={14} className="text-[#39ff14]" />
//                                                         <span className="text-xs text-[#39ff14]">Connected</span>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <AlertCircle size={14} className="text-gray-500" />
//                                                         <span className="text-xs text-gray-500">Not configured</span>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 testConnection(platform.id);
//                                             }}
//                                             disabled={isTesting}
//                                             className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-2 transition-all ${isConnected
//                                                     ? 'bg-[#39ff14]/20 text-[#39ff14] hover:bg-[#39ff14]/30'
//                                                     : 'bg-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/30'
//                                                 }`}
//                                         >
//                                             {isTesting ? (
//                                                 <>
//                                                     <RefreshCw size={12} className="animate-spin" />
//                                                     Testing...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <RefreshCw size={12} />
//                                                     Test
//                                                 </>
//                                             )}
//                                         </button>
//                                         {isExpanded ? (
//                                             <ChevronUp size={20} className="text-gray-500" />
//                                         ) : (
//                                             <ChevronDown size={20} className="text-gray-500" />
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Expanded Setup Instructions */}
//                                 {isExpanded && (
//                                     <div className="border-t border-gray-800 p-4 bg-black/20">
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                             {/* Environment Variables */}
//                                             <div>
//                                                 <h4 className="font-mono text-sm font-bold mb-3 flex items-center gap-2">
//                                                     <Key size={14} className="text-[#ff00ff]" />
//                                                     Required Environment Variables
//                                                 </h4>
//                                                 <div className="bg-black/40 rounded-lg p-3 font-mono text-xs space-y-1">
//                                                     {docs.envVars.map((envVar) => (
//                                                         <div key={envVar} className="flex items-center gap-2">
//                                                             <span className="text-gray-500">#</span>
//                                                             <span className="text-[#00f0ff]">{envVar}</span>
//                                                             <span className="text-gray-600">=your_value_here</span>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 <p className="text-xs text-gray-500 mt-2">
//                                                     Add these to your <code className="text-[#ff00ff]">.env.local</code> file
//                                                 </p>
//                                             </div>

//                                             {/* Setup Instructions */}
//                                             <div>
//                                                 <h4 className="font-mono text-sm font-bold mb-3">Setup Steps</h4>
//                                                 <ol className="space-y-2">
//                                                     {docs.instructions.map((instruction, index) => (
//                                                         <li key={index} className="flex items-start gap-2 text-sm">
//                                                             <span className="text-[#00f0ff] font-mono text-xs mt-0.5">
//                                                                 {(index + 1).toString().padStart(2, '0')}
//                                                             </span>
//                                                             <span className="text-gray-400">{instruction}</span>
//                                                         </li>
//                                                     ))}
//                                                 </ol>
//                                                 <a
//                                                     href={docs.docsUrl}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="inline-flex items-center gap-1 text-sm text-[#00f0ff] hover:underline mt-4"
//                                                 >
//                                                     View Documentation <ExternalLink size={12} />
//                                                 </a>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>

//             {/* Security Notice */}
//             <div className="bg-black/40 rounded-xl border border-yellow-500/30 p-4">
//                 <div className="flex items-start gap-3">
//                     <Shield size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <h4 className="font-mono font-bold text-yellow-500 mb-1">Security Notice</h4>
//                         <p className="text-sm text-gray-400">
//                             API credentials are stored in server-side environment variables and never exposed to the browser.
//                             All API calls are proxied through Next.js API routes to keep your credentials secure.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }