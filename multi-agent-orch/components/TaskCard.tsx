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
    pending: 'border-[#00f0ff]/10 bg-black/40',
    running: 'border-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]',
    completed: 'border-[#39ff14]/50 bg-[#39ff14]/5',
    failed: 'border-[#ff00ff]/50 bg-[#ff00ff]/5',
    blocked: 'border-white/10 bg-black/60 opacity-60',
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Circle className="w-5 h-5 text-gray-600" />,
    running: <Clock className="w-5 h-5 text-[#00f0ff] animate-spin" />,
    completed: <CheckCircle2 className="w-5 h-5 text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />,
    failed: <XCircle className="w-5 h-5 text-[#ff00ff] drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" />,
    blocked: <Circle className="w-5 h-5 text-gray-700" />,
  };

  const currentStatus = result ? result.status : 'pending';

  // Calculate dynamic classes based on hover/dependency state
  const getWrapperClasses = () => {
    const base = 'rounded-xl border transition-all duration-300 relative backdrop-blur-sm';

    // 1. Is Hovered (Primary Focus)
    if (isHovered) {
      return `${base} border-[#00f0ff] ring-1 ring-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-[1.01] z-20 bg-black/80`;
    }

    // 2. Is Prerequisite (Parent / Upstream) - Neon Yellow
    if (isPrerequisite) {
      return `${base} border-[#fcee0a]/80 ring-1 ring-[#fcee0a]/50 shadow-[0_0_15px_rgba(252,238,10,0.2)] scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }

    // 3. Is Dependent (Child / Downstream) - Magenta
    if (isDependent) {
      return `${base} border-[#ff00ff]/80 ring-1 ring-[#ff00ff]/50 shadow-[0_0_15px_rgba(255,0,255,0.2)] scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }

    // Default
    return `${base} ${statusColor[currentStatus]} hover:border-[#00f0ff]/50`;
  };

  return (
    <div
      className={getWrapperClasses()}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Badges for relationship state */}
      {isPrerequisite && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-[#fcee0a] text-black text-[10px] font-bold rounded-sm shadow-lg uppercase tracking-wider flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20 font-mono">
          <ArrowUpCircle className="w-3 h-3" />
          Prerequisite
        </div>
      )}

      {isDependent && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-[#ff00ff] text-black text-[10px] font-bold rounded-sm shadow-lg uppercase tracking-wider flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20 font-mono">
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
            <h3 className="font-bold text-white truncate font-mono tracking-wide">{task.name}</h3>
            <span className="text-[10px] font-mono text-[#00f0ff] px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/20 shrink-0 uppercase">
              {task.model}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                ID: {task.id}
              </span>
              {result && result.durationMs > 0 && (
                <span className="text-[#39ff14]">{result.durationMs}ms</span>
              )}
            </div>

            {/* Dependency List - Highlighted if relevant */}
            {task.dependencies.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5 font-mono">
                <span className={`flex items-center gap-1 text-[10px] transition-colors ${isPrerequisite || isDependent ? 'text-white' : 'text-gray-600'}`}>
                  <Workflow className="w-3 h-3" />
                  WAIT_FOR:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {task.dependencies.map(dep => (
                    <span
                      key={dep}
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] transition-all ${isHovered
                          ? 'bg-[#fcee0a]/20 border border-[#fcee0a]/40 text-[#fcee0a]'
                          : 'bg-white/5 border border-white/10 text-gray-400'
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

        <div className="mt-1 text-[#00f0ff]">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-2 animate-in slide-in-from-top-2">
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest mb-2 font-mono">Prompt</h4>
              <div className="bg-black/80 rounded border border-white/10 p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar shadow-inner">
                {task.prompt}
              </div>
            </div>

            {result && result.output && (
              <div>
                <h4 className="text-[10px] font-bold text-[#39ff14] uppercase tracking-widest mb-2 font-mono">Output</h4>
                <div className="bg-black/80 rounded border border-[#39ff14]/30 p-3 text-xs text-[#39ff14] whitespace-pre-wrap font-mono max-h-96 overflow-y-auto custom-scrollbar shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]">
                  {result.output}
                </div>
              </div>
            )}

            {result?.error && (
              <div>
                <h4 className="text-[10px] font-bold text-[#ff00ff] uppercase tracking-widest mb-2 font-mono">Error</h4>
                <div className="bg-[#ff00ff]/10 rounded border border-[#ff00ff]/50 p-3 text-xs text-[#ff00ff] font-mono shadow-[0_0_10px_rgba(255,0,255,0.2)]">
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