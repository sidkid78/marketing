import React, { useState } from 'react';
import { WorkflowStatus, StoryScene } from '../types';
// Fixed: Removed CopyIcon as it is not exported from Icons.tsx
import { BrainIcon, ImageIcon } from './Icons';

interface WorkflowVisualizerProps {
  status: WorkflowStatus;
  originalStory: string;
  scenes: StoryScene[];
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  status,
  originalStory,
  scenes,
}) => {

  if (status === WorkflowStatus.IDLE && scenes.length === 0) {
    return null;
  }

  const isAnalyzing = status === WorkflowStatus.ANALYZING;
  const isGenerating = status === WorkflowStatus.GENERATING;
  const isCompleted = status === WorkflowStatus.COMPLETED;
  const hasScenes = scenes.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">

      {/* Step 1: Story Analysis */}
      <div className={`relative p-6 rounded-2xl border transition-all duration-500 ${hasScenes ? 'bg-zinc-900/50 border-purple-500/30' : 'bg-transparent border-transparent'}`}>

        {/* Connection Line */}
        {hasScenes && (
          <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-purple-500/30 to-transparent z-0"></div>
        )}

        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-3 rounded-full shrink-0 ${isAnalyzing ? 'bg-purple-500/20 text-purple-400 animate-pulse' : hasScenes ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <BrainIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                {isAnalyzing ? 'Analyzing Story Arc...' : 'Narrative Agent'}
              </h3>
              {hasScenes && <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Analysis Complete</span>}
            </div>

            <div className="space-y-4">
              {/* Original Input */}
              {!hasScenes && (
                <div className="text-sm text-zinc-500 italic">
                  "{originalStory}"
                </div>
              )}

              {/* Scene Breakdown */}
              {hasScenes && (
                <div className="grid gap-3">
                  <div className="uppercase text-xs font-bold tracking-wider text-purple-400 mb-1">Detected Scenes: </div>
                  {scenes.map((scene, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 rounded-lg border border-purple-500/20 flex gap-3">
                      <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded h-fit">Scene {idx + 1}</span>
                      <div className="space-y-1">
                        <p className="text-zinc-300 text-sm leading-relaxed">"{scene.text}"</p>
                        <p className="text-zinc-600 text-xs font-mono line-clamp-1">Prompt: {scene.imagePrompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAnalyzing && (
                <div className="h-12 w-full bg-zinc-800/50 rounded-lg animate-pulse flex items-center px-4">
                  <span className="text-xs text-zinc-500">Breaking down story into visual segments...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Image Generation */}
      {(hasScenes || isGenerating) && (
        <div className={`p-6 rounded-2xl border transition-all duration-500 ${isGenerating ? 'bg-blue-900/10 border-blue-500/30' : isCompleted ? 'bg-transparent border-transparent' : 'opacity-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isGenerating ? 'bg-blue-500/20 text-blue-400 animate-pulse' : isCompleted ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">
                {isGenerating ? 'Rendering Storyboard...' : 'Scene Generation'}
              </h3>
              <p className="text-sm text-zinc-400">
                {isGenerating ? `Generating visuals for ${scenes.length} scenes...` : isCompleted ? 'Storyboard created successfully.' : 'Waiting for scene analysis...'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowVisualizer;