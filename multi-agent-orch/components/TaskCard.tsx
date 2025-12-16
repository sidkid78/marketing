import React, { useState } from 'react';
import { SubTask, TaskResult } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  ArrowRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Workflow
} from 'lucide-react';

interface TaskCardProps {
  task: SubTask;
  result?: TaskResult;
  isPending: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  isHovered?: boolean;
  isPrerequisite?: boolean;
  isDependent?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  result, 
  isPending,
  onEnter,
  onLeave,
  isHovered,
  isPrerequisite,
  isDependent
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    pending: 'border-slate-700 bg-slate-800/50',
    running: 'border-indigo-500/50 bg-indigo-500/5',
    completed: 'border-emerald-500/50 bg-emerald-500/5',
    failed: 'border-red-500/50 bg-red-500/5',
    blocked: 'border-slate-700 bg-slate-900',
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Circle className="w-5 h-5 text-slate-600" />,
    running: <Clock className="w-5 h-5 text-indigo-400 animate-spin" />,
    completed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    failed: <XCircle className="w-5 h-5 text-red-400" />,
    blocked: <Circle className="w-5 h-5 text-slate-700" />,
  };

  const currentStatus = result ? result.status : 'pending';
  
  // Calculate dynamic classes based on hover/dependency state
  const getWrapperClasses = () => {
    const base = 'rounded-xl border transition-all duration-300 relative';
    
    // 1. Is Hovered (Primary Focus)
    if (isHovered) {
      return `${base} border-indigo-400 ring-1 ring-indigo-400 shadow-xl shadow-indigo-500/10 scale-[1.01] z-20 bg-slate-800`;
    }
    
    // 2. Is Prerequisite (Parent / Upstream) - Amber/Yellow
    if (isPrerequisite) {
      return `${base} border-amber-500/80 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }

    // 3. Is Dependent (Child / Downstream) - Pink/Rose
    if (isDependent) {
      return `${base} border-pink-500/80 ring-1 ring-pink-500/50 shadow-lg shadow-pink-500/10 scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }
    
    // Default
    return `${base} ${statusColor[currentStatus]} hover:border-slate-600`;
  };

  return (
    <div 
      className={getWrapperClasses()}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Badges for relationship state */}
      {isPrerequisite && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20">
            <ArrowUpCircle className="w-3 h-3" />
            Prerequisite
        </div>
      )}
      
      {isDependent && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20">
            <ArrowDownCircle className="w-3 h-3" />
            Dependent
        </div>
      )}

      <div 
        className="p-4 flex items-start gap-4 cursor-pointer relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mt-1 shrink-0">
          {statusIcon[currentStatus]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-200 truncate">{task.name}</h3>
            <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0">
              {task.model}
            </span>
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
             <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  ID: {task.id}
                </span>
                {result && result.durationMs > 0 && (
                   <span>{result.durationMs}ms</span>
                )}
             </div>

             {/* Dependency List - Highlighted if relevant */}
             {task.dependencies.length > 0 && (
               <div className="flex items-center gap-2 mt-1.5">
                 <span className={`flex items-center gap-1 text-xs transition-colors ${isPrerequisite || isDependent ? 'text-slate-300' : 'text-slate-500'}`}>
                   <Workflow className="w-3 h-3" />
                   Depends on:
                 </span>
                 <div className="flex gap-1 flex-wrap">
                    {task.dependencies.map(dep => (
                        <span 
                          key={dep} 
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            isHovered 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                          title={`Task ${task.id} requires ${dep} to finish first`}
                        >
                            {dep}
                        </span>
                    ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className="mt-1 text-slate-500">
           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 mt-2 animate-in slide-in-from-top-2">
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prompt</h4>
              <div className="bg-slate-950 rounded-lg p-3 text-sm text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                {task.prompt}
              </div>
            </div>

            {result && result.output && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Output</h4>
                <div className="bg-slate-900/80 rounded-lg p-3 text-sm text-slate-300 whitespace-pre-wrap font-mono border border-slate-800 max-h-96 overflow-y-auto custom-scrollbar">
                  {result.output}
                </div>
              </div>
            )}

            {result?.error && (
               <div>
               <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Error</h4>
               <div className="bg-red-950/30 rounded-lg p-3 text-sm text-red-300 border border-red-900/50">
                 {result.error}
               </div>
             </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};