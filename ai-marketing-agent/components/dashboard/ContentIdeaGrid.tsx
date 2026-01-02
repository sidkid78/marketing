import React, { useState, useEffect } from 'react';
import type { ContentIdea, ContentIdeaItem, MarketingGoal } from '../../types';
import { Card } from '../ui/Card';
import { PlatformIcon } from '../icons/PlatformIcons';
import { MARKETING_GOALS } from '../../constants';
import { ShareButtons } from '../ui/ShareButtons';
import { generateAdImage, generateAdVideo } from '../../services/geminiService';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';
import { SocialMediaService } from '../../services/socialMediaService';
import { Spinner } from '../ui/Spinner';

interface ContentIdeaGridProps {
  contentIdeas: ContentIdea[];
  apiKey: string;
}

const formatContentIdeaForSharing = (idea: ContentIdeaItem, platform: string): string => {
  const platformLabel = platform.replace('_', ' ');
  const hashtags = idea.hashtag_suggestions.map(t => `#${t}`).join(' ');
  return `💡 AI-generated content idea for ${platformLabel}!\n\nHeadline: "${idea.headline}"\n\nCaption: "${idea.caption}"\n\n${hashtags}`;
};

export const ContentIdeaGrid: React.FC<ContentIdeaGridProps> = ({ contentIdeas, apiKey }) => {
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<string, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Social Publishing State
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [publishingStatus, setPublishingStatus] = useState<Record<string, 'idle' | 'publishing' | 'published' | 'error'>>({});

  useEffect(() => {
    // Check initial connection status for platforms present in ideas
    const platformsToCheck = Array.from(new Set(contentIdeas.map(ci => ci.platform))) as string[];
    platformsToCheck.forEach(async (platform) => {
      const isConnected = await SocialMediaService.checkConnection(platform);
      setConnectedPlatforms(prev => ({ ...prev, [platform]: isConnected }));
    });
  }, [contentIdeas]);

  if (!contentIdeas || contentIdeas.length === 0) {
    return <Card><p>No content ideas were generated.</p></Card>;
  }

  const handleGenerateVideo = async (id: string, prompt: string) => {
    try {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    } catch (e) {
      console.warn("API Key check skipped or failed", e);
    }

    setLoadingVideos(prev => ({ ...prev, [id]: true }));
    try {
      const url = await generateAdVideo(prompt, apiKey);
      if (url) {
        setVideoUrls(prev => ({ ...prev, [id]: url }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate video. Please try again.");
    } finally {
      setLoadingVideos(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleGenerateImage = async (id: string, prompt: string) => {
    setLoadingImages(prev => ({ ...prev, [id]: true }));
    try {
      const url = await generateAdImage(prompt, apiKey);
      if (url) {
        setImageUrls(prev => ({ ...prev, [id]: url }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoadingImages(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      await SocialMediaService.connect(platform);
      setConnectedPlatforms(prev => ({ ...prev, [platform]: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handlePublish = async (id: string, platform: string, idea: ContentIdeaItem, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    setPublishingStatus(prev => ({ ...prev, [id]: 'publishing' }));

    // Construct the full post text
    const fullText = `${idea.caption}\n\n${idea.hashtag_suggestions.map(t => `#${t}`).join(' ')}`;

    try {
      await SocialMediaService.post(platform, fullText, mediaUrl, mediaType);
      setPublishingStatus(prev => ({ ...prev, [id]: 'published' }));
    } catch (e) {
      setPublishingStatus(prev => ({ ...prev, [id]: 'error' }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contentIdeas.map((ci, i) => (
        <Card key={i} className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PlatformIcon platform={ci.platform} className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-bold text-primary-dark capitalize">{ci.platform.replace('_', ' ')}</h3>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{MARKETING_GOALS.find(g => g.id === ci.goal)?.label}</p>
              </div>
            </div>
            {/* Connection Status / Button */}
            <div>
              {!connectedPlatforms[ci.platform] ? (
                <button
                  onClick={() => handleConnectPlatform(ci.platform)}
                  disabled={!!connectingPlatform}
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-1"
                >
                  {connectingPlatform === ci.platform ? (
                    <>Connecting...</>
                  ) : (
                    <>Connect {ci.platform === 'twitter_x' ? 'X' : 'Account'}</>
                  )}
                </button>
              ) : (
                <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Connected
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 flex-grow flex flex-col">
            {ci.ideas.map((idea, j) => {
              const id = `${i}-${j}`;
              const isVideoSuggested = idea.visual_direction.toLowerCase().includes('video');
              const hasMedia = imageUrls[id] || videoUrls[id];
              const mediaType = videoUrls[id] ? 'video' : 'image';
              const activeMediaUrl = videoUrls[id] || imageUrls[id];

              return (
                <div key={j} className="border-t border-gray-200 pt-4 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h4 className="font-bold text-neutral-dark mb-1">"{idea.headline}"</h4>
                    <p className="text-sm text-neutral mb-2"><strong className="text-neutral-dark">Visual:</strong> {idea.visual_direction}</p>

                    {/* Media Generation Controls */}
                    <div className="flex flex-wrap gap-2 my-3">
                      {!imageUrls[id] && !loadingImages[id] && (
                        <button
                          onClick={() => handleGenerateImage(id, idea.visual_direction)}
                          className="flex items-center gap-2 text-xs font-bold text-primary bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Generate Image
                        </button>
                      )}

                      {isVideoSuggested && !videoUrls[id] && !loadingVideos[id] && (
                        <button
                          onClick={() => handleGenerateVideo(id, idea.visual_direction)}
                          className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                          Generate Video
                        </button>
                      )}
                    </div>

                    {/* Media Content Display */}
                    <div className="space-y-4 mb-4">
                      {/* Image Loading/Display */}
                      {loadingImages[id] && (
                        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center border border-gray-100 min-h-[160px]">
                          <Spinner />
                          <p className="text-xs text-neutral-dark font-medium mt-3">Generating image...</p>
                        </div>
                      )}
                      {imageUrls[id] && (
                        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 relative group">
                          <img src={imageUrls[id]} alt="Generated content visual" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {/* Video Loading/Display */}
                      {loadingVideos[id] && (
                        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center border border-gray-100 min-h-[160px]">
                          <Spinner />
                          <p className="text-xs text-neutral-dark font-medium mt-3">Generating video preview...</p>
                          <p className="text-xs text-neutral mt-1">This takes about a minute.</p>
                        </div>
                      )}
                      {videoUrls[id] && (
                        <div className="rounded-lg overflow-hidden bg-black shadow-md">
                          <video controls className="w-full h-auto max-h-[240px]" src={videoUrls[id]} />
                        </div>
                      )}
                    </div>

                    <p className="text-sm italic bg-gray-50 p-3 rounded-md text-neutral mb-3">"{idea.caption}"</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white bg-accent font-bold text-xs px-3 py-1 rounded-full">{idea.cta}</span>
                      <div className="flex flex-wrap gap-1">
                        {idea.hashtag_suggestions.map(tag => (
                          <span key={tag} className="text-xs text-blue-600">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Publishing Action */}
                    {hasMedia && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                        <div className="text-xs text-blue-800">
                          <strong>Ready to post?</strong>
                          <p>Publish directly to {ci.platform.replace('_', ' ')}.</p>
                        </div>

                        {!connectedPlatforms[ci.platform] ? (
                          <button
                            onClick={() => handleConnectPlatform(ci.platform)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow hover:bg-blue-700"
                          >
                            Connect Account
                          </button>
                        ) : publishingStatus[id] === 'published' ? (
                          <button disabled className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1 cursor-default">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Posted
                          </button>
                        ) : publishingStatus[id] === 'publishing' ? (
                          <button disabled className="px-3 py-1.5 bg-gray-400 text-white text-xs font-bold rounded flex items-center gap-1 cursor-wait">
                            <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                            Posting...
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(id, ci.platform, idea, activeMediaUrl, mediaType)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow hover:bg-blue-700 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Post Now
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <ShareButtons textToShare={formatContentIdeaForSharing(idea, ci.platform)} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};
