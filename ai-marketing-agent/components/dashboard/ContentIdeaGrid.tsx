import React, { useState } from 'react';
import type { ContentIdea, ContentIdeaItem } from '../../types';
import { Card } from '../ui/Card';
import { PlatformIcon } from '../icons/PlatformIcons';
import { MARKETING_GOALS } from '../../constants';
import { ShareButtons } from '../ui/ShareButtons';
import { generateAdImage, generateAdVideo } from '../../services/geminiService';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';

interface ContentIdeaGridProps {
  contentIdeas: ContentIdea[];
  apiKey: string;
}

export const ContentIdeaGrid: React.FC<ContentIdeaGridProps> = ({ contentIdeas, apiKey = '' }) => {
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [loadingIAdImages, setLoadingIAdImages] = useState<Record<string, boolean>>({});
  const [generatedVideos, setGeneratedVideos] = useState<Record<string, string>>({});
  const [loadingAdVideos, setLoadingAdVideos] = useState<Record<string, boolean>>({});

  if (!contentIdeas || contentIdeas.length === 0) {
    return <Card className="bg-black/40 border-[#ff00ff]/20 text-white"><p className="font-mono text-[#ff00ff]">No content ideas were generated.</p></Card>;
  }

  const formatContentIdeaForSharing = (idea: ContentIdeaItem, platform: string): string => {
    const platformLabel = platform.replace('_', ' ');
    const hashtags = idea.hashtag_suggestions.map(t => `#${t}`).join(' ');
    return `💡 AI-generated content idea for ${platformLabel}!\n\nHeadline: "${idea.headline}"\n\nCaption: "${idea.caption}"\n\n${hashtags}\n\nSee more ideas from the AI Marketing Agent.`;
  };

  const handleGenerateIAdImage = async (id: string, visualDescription: string) => {
    setLoadingIAdImages(prev => ({ ...prev, [id]: true }));
    try {
      const imageUrl = await generateAdImage(visualDescription, apiKey);
      if (imageUrl) {
        setGeneratedImages(prev => ({ ...prev, [id]: imageUrl }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoadingIAdImages(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleGenerateAdVideo = async (id: string, visualDescription: string) => {
    setLoadingAdVideos(prev => ({ ...prev, [id]: true }));
    try {
      const videoUrl = await generateAdVideo(visualDescription, apiKey);
      if (videoUrl) {
        setGeneratedVideos(prev => ({ ...prev, [id]: videoUrl }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate video. Please try again.");
    } finally {
      setLoadingAdVideos(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatContentIdeaForClipboard = (idea: ContentIdeaItem, platform: string, goal: string): string => {
    const platformLabel = platform.replace('_', ' ');
    const goalLabel = MARKETING_GOALS.find(g => g.id === goal)?.label || goal;
    const hashtags = idea.hashtag_suggestions.map(t => `#${t}`).join(' ');

    return `Content Idea
---
Platform: ${platformLabel}
Goal: ${goalLabel}
---
Headline: "${idea.headline}"
Visual Direction: ${idea.visual_direction}
Caption: "${idea.caption}"
Call to Action (CTA): ${idea.cta}
Hashtags: ${hashtags}
`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contentIdeas.map((ci, i) => (
        <Card key={i} className="flex flex-col bg-black/40 border border-[#ff00ff]/20 backdrop-blur-sm text-white shadow-lg hover:border-[#ff00ff]/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#ff00ff]/10">
            <PlatformIcon platform={ci.platform} className="h-8 w-8 text-[#ff00ff]" />
            <div>
              <h3 className="text-lg font-bold text-[#ff00ff] capitalize font-mono tracking-wider">{ci.platform.replace('_', ' ')}</h3>
              <p className="text-xs font-semibold text-[#00f0ff] uppercase tracking-wide font-mono">{MARKETING_GOALS.find(g => g.id === ci.goal)?.label}</p>
            </div>
          </div>
          <div className="space-y-6 flex-grow flex flex-col">
            {ci.ideas.map((idea, j) => {
              const uniqueId = `${i}-${j}`;
              const isLoadingIAdImage = loadingIAdImages[uniqueId];
              const isLoadingAdVideo = loadingAdVideos[uniqueId];
              const imageUrl = generatedImages[uniqueId];
              const videoUrl = generatedVideos[uniqueId];
              return (
                <div key={j} id={`content-idea-${i}-${j}`} className="border-t border-[#ff00ff]/10 pt-4 flex-grow flex flex-col first:border-0 first:pt-0">
                  <div className="flex-grow">
                    <h4 className="font-bold text-white mb-2 text-lg">"{idea.headline}"</h4>
                    <p className="text-sm text-gray-400 mb-4 font-mono"><strong className="text-[#00f0ff]">VISUAL:</strong> {idea.visual_direction}</p>

                    <div className="mb-4">
                      {imageUrl ? (
                        <div className="relative rounded-lg overflow-hidden shadow-sm border border-[#00f0ff]/30 group">
                          <img src={imageUrl} alt={idea.visual_direction} className="w-full h-auto object-cover" />
                          <a href={imageUrl} download={`ad-idea-${uniqueId}.png`} className="absolute top-2 right-2 bg-black/80 p-2 rounded-full text-[#00f0ff] border border-[#00f0ff] hover:bg-[#00f0ff] hover:text-black opacity-0 group-hover:opacity-100 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      ) : videoUrl ? (
                        <div className="relative rounded-lg overflow-hidden shadow-sm border border-[#00f0ff]/30 group">
                          <video src={videoUrl} controls className="w-full h-auto" />
                          <a href={videoUrl} download={`ad-video-${uniqueId}.mp4`} className="absolute top-2 right-2 bg-black/80 p-2 rounded-full text-[#00f0ff] border border-[#00f0ff] hover:bg-[#00f0ff] hover:text-black opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleGenerateIAdImage(uniqueId, idea.visual_direction)}
                            disabled={isLoadingIAdImage || isLoadingAdVideo}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#00f0ff] border border-[#00f0ff] rounded-lg hover:bg-[#00f0ff] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wide hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                          >
                            {isLoadingIAdImage ? (
                              <>
                                <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                GENERATING...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                GEN IMAGE
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleGenerateAdVideo(uniqueId, idea.visual_direction)}
                            disabled={isLoadingIAdImage || isLoadingAdVideo}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#ff00ff] border border-[#ff00ff] rounded-lg hover:bg-[#ff00ff] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wide hover:shadow-[0_0_10px_rgba(255,0,255,0.4)]"
                          >
                            {isLoadingAdVideo ? (
                              <>
                                <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                GENERATING...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                GEN VIDEO
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm italic bg-black/30 border border-[#ff00ff]/10 p-3 rounded-md text-gray-300 mb-3 font-mono">"{idea.caption}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#000] bg-[#00f0ff] font-bold text-xs px-3 py-1 rounded-full">{idea.cta}</span>
                    <div className="flex flex-wrap gap-1">
                      {idea.hashtag_suggestions.map(tag => (
                        <span key={tag} className="text-xs text-[#ff00ff]">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#ff00ff]/10 flex justify-end items-center gap-4">
                    <ClipboardCopyButton textToCopy={formatContentIdeaForClipboard(idea, ci.platform, ci.goal)} className="text-[#00f0ff] hover:text-white" />
                    <ShareButtons textToShare={formatContentIdeaForSharing(idea, ci.platform)} anchorId={`content-idea-${i}-${j}`} className="text-[#00f0ff]" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};
