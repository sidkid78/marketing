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
      <div className={`relative p-6 rounded-2xl border transition-all duration-500 ${hasOptimized ? 'bg-bench border-rule' : 'bg-transparent border-transparent'}`}>
        
        {/* Connection Line */}
        {hasOptimized && (
           <div className="absolute left-8 top-full h-6 w-0.5 bg-rule z-0"></div>
        )}

        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-3 rounded-full shrink-0 ${isOptimizing ? 'bg-muted text-ink animate-pulse' : hasOptimized ? 'bg-muted text-ink' : 'bg-sheet text-ink0'}`}>
            <BrainIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">
                {isOptimizing ? 'Agent Optimizing...' : 'Prompt Agent'}
              </h3>
              {hasOptimized && <span className="text-xs font-medium px-2 py-1 rounded-full bg-positive/10 text-positive border border-positive/30">Completed</span>}
            </div>

            {/* Prompt Transition Display */}
            <div className="space-y-4">
               {/* Original User Input */}
               <div className="text-sm text-ink0">
                  <span className="uppercase text-xs font-bold opacity-70">Input: </span>
                  &quot;{originalPrompt}&quot;
               </div>

               {/* Optimized Output */}
               {hasOptimized && (
                 <div className="relative group">
                   <div className="p-4 bg-bench rounded-xl border border-rule shadow-inner">
                     <span className="uppercase text-xs font-bold text-ink block mb-2">Optimized Prompt: </span>
                     <p className="text-ink text-sm leading-relaxed font-light italic">
                       {optimizedPrompt}
                     </p>
                   </div>
                   <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-sheet hover:bg-muted rounded-lg text-ink-soft hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy Prompt"
                   >
                     {copied ? <span className="text-xs font-bold text-positive">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                   </button>
                 </div>
               )}
               
               {isOptimizing && (
                 <div className="h-12 w-full bg-sheet rounded-lg animate-pulse flex items-center px-4">
                    <span className="text-xs text-ink0">Analyzing context and enhancing details...</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Image Generation */}
      {(hasOptimized || isGenerating) && (
        <div className={`p-6 rounded-2xl border transition-all duration-500 ${isGenerating ? 'bg-muted border-rule' : isCompleted ? 'bg-transparent border-transparent' : 'opacity-50'}`}>
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full shrink-0 ${isGenerating ? 'bg-muted text-ink animate-pulse' : isCompleted ? 'bg-muted text-ink' : 'bg-sheet text-ink0'}`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-semibold text-ink">
                {isGenerating ? 'Visualizing...' : 'Imagen Generation'}
              </h3>
               <p className="text-sm text-ink-soft">
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