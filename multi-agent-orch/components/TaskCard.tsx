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
    pending: 'border-rule bg-sheet',
    running: 'border-rule bg-signal/5',
    completed: 'border-positive/30 bg-positive/5',
    failed: 'border-rule bg-signal/5',
    blocked: 'border-rule bg-sheet opacity-60',
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Circle className="w-5 h-5 text-ink-soft" />,
    running: <Clock className="w-5 h-5 text-ink animate-spin" />,
    completed: <CheckCircle2 className="w-5 h-5 text-positive" />,
    failed: <XCircle className="w-5 h-5 text-ink-soft" />,
    blocked: <Circle className="w-5 h-5 text-ink" />,
  };

  const currentStatus = result ? result.status : 'pending';

  // Calculate dynamic classes based on hover/dependency state
  const getWrapperClasses = () => {
    const base = 'rounded-xl border transition-all duration-300 relative backdrop-';

    // 1. Is Hovered (Primary Focus)
    if (isHovered) {
      return `${base} border-rule ring-1 ring-signal scale-[1.01] z-20 bg-sheet`;
    }

    // 2. Is Prerequisite (Parent / Upstream) - Neon Yellow
    if (isPrerequisite) {
      return `${base} border-[#fcee0a]/80 ring-1 ring-[#fcee0a]/50 scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }

    // 3. Is Dependent (Child / Downstream) - Magenta
    if (isDependent) {
      return `${base} border-rule ring-1 ring-signal scale-[1.005] z-10 ${statusColor[currentStatus]}`;
    }

    // Default
    return `${base} ${statusColor[currentStatus]} hover:border-rule`;
  };

  return (
    <div
      className={getWrapperClasses()}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Badges for relationship state */}
      {isPrerequisite && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-[#fcee0a] text-black text-[10px] font-bold rounded-sm uppercase flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20">
          <ArrowUpCircle className="w-3 h-3" />
          Prerequisite
        </div>
      )}

      {isDependent && (
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-signal text-black text-[10px] font-bold rounded-sm uppercase flex items-center gap-1 animate-in fade-in zoom-in duration-200 z-20">
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
            <h3 className="font-bold text-ink truncate tracking-wide">{task.name}</h3>
            <span className="text-[10px] text-ink px-2 py-0.5 rounded bg-signal/10 border border-rule shrink-0 uppercase">
              {task.model}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-4 text-xs text-ink">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                ID: {task.id}
              </span>
              {result && result.durationMs > 0 && (
                <span className="text-positive">{result.durationMs}ms</span>
              )}
            </div>

            {/* Dependency List - Highlighted if relevant */}
            {task.dependencies.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`flex items-center gap-1 text-[10px] transition-colors ${isPrerequisite || isDependent ? 'text-ink' : 'text-ink-soft'}`}>
                  <Workflow className="w-3 h-3" />
                  WAIT_FOR:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {task.dependencies.map(dep => (
                    <span
                      key={dep}
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] transition-all ${isHovered
                          ? 'bg-[#fcee0a]/20 border border-[#fcee0a]/40 text-[#fcee0a]'
                          : 'bg-muted border border-rule text-ink-soft'
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

        <div className="mt-1 text-ink">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-rule mt-2 animate-in slide-in-from-top-2">
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-ink uppercase mb-2">Prompt</h4>
              <div className="bg-sheet rounded border border-rule p-3 text-xs text-ink overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar shadow-inner">
                {task.prompt}
              </div>
            </div>

            {result && result.output && (
              <div>
                <h4 className="text-[10px] font-bold text-positive uppercase mb-2">Output</h4>
                <div className="bg-sheet rounded border border-positive/30 p-3 text-xs text-positive whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]">
                  {result.output}
                </div>
              </div>
            )}

            {result?.error && (
              <div>
                <h4 className="text-[10px] font-bold text-ink-soft uppercase mb-2">Error</h4>
                <div className="bg-signal/10 rounded border border-rule p-3 text-xs text-ink-soft">
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