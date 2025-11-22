import React, { useState } from 'react';
import type { ContentIdea, ContentIdeaItem } from '../../types';
import { Card } from '../ui/Card';
import { PlatformIcon } from '../icons/PlatformIcons';
import { MARKETING_GOALS } from '../../constants';
import { ShareButtons } from '../ui/ShareButtons';
import { generateAdImage } from '../../services/geminiService';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';

interface ContentIdeaGridProps {
  contentIdeas: ContentIdea[];
  apiKey: string;
}

export const ContentIdeaGrid: React.FC<ContentIdeaGridProps> = ({ contentIdeas, apiKey = '' }) => {
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [loadingIAdImages, setLoadingIAdImages] = useState<Record<string, boolean>>({});

  if (!contentIdeas || contentIdeas.length === 0) {
    return <Card><p>No content ideas were generated.</p></Card>;
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
        <Card key={i} className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <PlatformIcon platform={ci.platform} className="h-8 w-8"/>
            <div>
              <h3 className="text-lg font-bold text-primary-dark capitalize">{ci.platform.replace('_', ' ')}</h3>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{MARKETING_GOALS.find(g => g.id === ci.goal)?.label}</p>
            </div>
          </div>
          <div className="space-y-6 flex-grow flex flex-col">
          {ci.ideas.map((idea, j) => {
              const uniqueId = `${i}-${j}`;
              const isLoadingIAdImage = loadingIAdImages[uniqueId];
              const imageUrl = generatedImages[uniqueId];
              return (
                <div key={j} id={`content-idea-${i}-${j}`} className="border-t border-gray-200 pt-4 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h4 className="font-bold text-foreground mb-1">"{idea.headline}"</h4>
                    <p className="text-sm text-muted-foreground mb-2"><strong className="text-foreground">Visual:</strong> {idea.visual_direction}</p>

                    <div className="mb-4">
                        {imageUrl ? (
                            <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-100 group">
                                <img src={imageUrl} alt={idea.visual_direction} className="w-full h-auto object-cover" />
                                <a href={imageUrl} download={`ad-idea-${uniqueId}.png`} className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-700 hover:text-primary hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleGenerateIAdImage(uniqueId, idea.visual_direction)}
                                disabled={loadingIAdImages[uniqueId]}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-full hover:bg-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingIAdImages[uniqueId] ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Image...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Visualize Idea
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                  </div>  
                  <p className="text-sm italic bg-muted p-3 rounded-md text-foreground mb-3">"{idea.caption}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-accent-foreground bg-accent font-bold text-xs px-3 py-1 rounded-full">{idea.cta}</span>
                    <div className="flex flex-wrap gap-1">
                      {idea.hashtag_suggestions.map(tag => (
                        <span key={tag} className="text-xs text-primary">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center gap-4">
                    <ClipboardCopyButton textToCopy={formatContentIdeaForClipboard(idea, ci.platform, ci.goal)} />
                    <ShareButtons textToShare={formatContentIdeaForSharing(idea, ci.platform)} anchorId={`content-idea-${i}-${j}`} />
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
