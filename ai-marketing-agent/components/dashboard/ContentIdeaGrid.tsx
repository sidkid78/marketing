import React from 'react';
import type { ContentIdea, ContentIdeaItem } from '../../types';
import { Card } from '../ui/Card';
import { PlatformIcon } from '../icons/PlatformIcons';
import { MARKETING_GOALS } from '../../constants';
import { ShareButtons } from '../ui/ShareButtons';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';

interface ContentIdeaGridProps {
  contentIdeas: ContentIdea[];
}

export const ContentIdeaGrid: React.FC<ContentIdeaGridProps> = ({ contentIdeas }) => {
  if (!contentIdeas || contentIdeas.length === 0) {
    return <Card><p>No content ideas were generated.</p></Card>;
  }
  
  const formatContentIdeaForSharing = (idea: ContentIdeaItem, platform: string): string => {
    const platformLabel = platform.replace('_', ' ');
    const hashtags = idea.hashtag_suggestions.map(t => `#${t}`).join(' ');
    return `💡 AI-generated content idea for ${platformLabel}!\n\nHeadline: "${idea.headline}"\n\nCaption: "${idea.caption}"\n\n${hashtags}\n\nSee more ideas from the AI Marketing Agent.`;
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
            {ci.ideas.map((idea, j) => (
              <div key={j} id={`content-idea-${i}-${j}`} className="border-t border-gray-200 pt-4 flex-grow flex flex-col">
                <div className="flex-grow">
                  <h4 className="font-bold text-neutral-dark mb-1">"{idea.headline}"</h4>
                  <p className="text-sm text-neutral mb-2"><strong className="text-neutral-dark">Visual:</strong> {idea.visual_direction}</p>
                  <p className="text-sm italic bg-gray-50 p-3 rounded-md text-neutral mb-3">"{idea.caption}"</p>
                  <div className="flex justify-between items-center">
                      <span className="text-white bg-accent font-bold text-xs px-3 py-1 rounded-full">{idea.cta}</span>
                      <div className="flex flex-wrap gap-1">
                          {idea.hashtag_suggestions.map(tag => (
                              <span key={tag} className="text-xs text-blue-600">#{tag}</span>
                          ))}
                      </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center gap-4">
                  <ClipboardCopyButton textToCopy={formatContentIdeaForClipboard(idea, ci.platform, ci.goal)} />
                  <ShareButtons textToShare={formatContentIdeaForSharing(idea, ci.platform)} anchorId={`content-idea-${i}-${j}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
