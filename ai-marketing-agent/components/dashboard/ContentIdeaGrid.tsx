
import React from 'react';
import type { ContentIdea } from '../../types';
import { Card } from '../ui/Card';
import { PlatformIcon } from '../icons/PlatformIcons';
import { MARKETING_GOALS } from '../../constants';

interface ContentIdeaGridProps {
  contentIdeas: ContentIdea[];
}

export const ContentIdeaGrid: React.FC<ContentIdeaGridProps> = ({ contentIdeas }) => {
  if (!contentIdeas || contentIdeas.length === 0) {
    return <Card><p>No content ideas were generated.</p></Card>;
  }

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
          <div className="space-y-6 flex-grow">
            {ci.ideas.map((idea, j) => (
              <div key={j} className="border-t border-gray-200 pt-4">
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
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
