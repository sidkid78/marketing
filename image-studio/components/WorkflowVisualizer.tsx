import React, { useState } from 'react';
import { WorkflowStatus } from '../types';
import { BrainIcon, ImageIcon, CopyIcon } from './Icons';

interface WorkflowVisualizerProps {
  status: WorkflowStatus;
  originalPrompt: string;
  optimizedPrompt: string;
  onCopyPrompt: (text: string) => void;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ 
  status, 
  originalPrompt, 
  optimizedPrompt,
  onCopyPrompt
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyPrompt(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === WorkflowStatus.IDLE && !optimizedPrompt) {
    return null;
  }

  const isOptimizing = status === WorkflowStatus.OPTIMIZING;
  const isGenerating = status === WorkflowStatus.GENERATING;
  const isCompleted = status === WorkflowStatus.COMPLETED;
  const hasOptimized = !!optimizedPrompt;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6">
      
      {/* Step 1: The Agentic Refinement */}
      <div className={`relative p-6 rounded-2xl border transition-all duration-500 ${hasOptimized ? 'bg-zinc-900/50 border-purple-500/30' : 'bg-transparent border-transparent'}`}>
        
        {/* Connection Line */}
        {hasOptimized && (
           <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-purple-500/30 to-transparent z-0"></div>
        )}

        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-3 rounded-full shrink-0 ${isOptimizing ? 'bg-purple-500/20 text-purple-400 animate-pulse' : hasOptimized ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <BrainIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                {isOptimizing ? 'Agent Optimizing...' : 'Prompt Agent'}
              </h3>
              {hasOptimized && <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Completed</span>}
            </div>

            {/* Prompt Transition Display */}
            <div className="space-y-4">
               {/* Original User Input */}
               <div className="text-sm text-zinc-500">
                  <span className="uppercase text-xs font-bold tracking-wider opacity-70">Input: </span>
                  &quot;{originalPrompt}&quot;
               </div>

               {/* Optimized Output */}
               {hasOptimized && (
                 <div className="relative group">
                   <div className="p-4 bg-zinc-950 rounded-xl border border-purple-500/20 shadow-inner shadow-purple-900/10">
                     <span className="uppercase text-xs font-bold tracking-wider text-purple-400 block mb-2">Optimized Prompt: </span>
                     <p className="text-zinc-300 text-sm leading-relaxed font-light italic">
                       {optimizedPrompt}
                     </p>
                   </div>
                   <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy Prompt"
                   >
                     {copied ? <span className="text-xs font-bold text-green-400">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                   </button>
                 </div>
               )}
               
               {isOptimizing && (
                 <div className="h-12 w-full bg-zinc-800/50 rounded-lg animate-pulse flex items-center px-4">
                    <span className="text-xs text-zinc-500">Analyzing context and enhancing details...</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Image Generation */}
      {(hasOptimized || isGenerating) && (
        <div className={`p-6 rounded-2xl border transition-all duration-500 ${isGenerating ? 'bg-blue-900/10 border-blue-500/30' : isCompleted ? 'bg-transparent border-transparent' : 'opacity-50'}`}>
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full shrink-0 ${isGenerating ? 'bg-blue-500/20 text-blue-400 animate-pulse' : isCompleted ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-semibold text-zinc-100">
                {isGenerating ? 'Visualizing...' : 'Imagen Generation'}
              </h3>
               <p className="text-sm text-zinc-400">
                 {isGenerating ? 'Generating high-fidelity variations...' : isCompleted ? 'Images generated successfully.' : 'Waiting for optimized prompt...'}
               </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowVisualizer;