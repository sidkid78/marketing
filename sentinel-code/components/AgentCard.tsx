import React from 'react';
import { AgentState, AgentStatus } from '../types';
import { ShieldAlert, Zap, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agent: AgentState;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getIcon = () => {
    switch (agent.id) {
      case 'security': return <ShieldAlert className="w-6 h-6" />;
      case 'performance': return <Zap className="w-6 h-6" />;
      case 'quality': return <Sparkles className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case AgentStatus.IDLE: return 'border-rule bg-sheet text-ink-soft opacity-60';
      case AgentStatus.ANALYZING: return 'border-rule bg-signal/10 text-ink animate-pulse';
      case AgentStatus.COMPLETED: return 'border-positive/30 bg-positive/10 text-positive shadow-none';
      case AgentStatus.ERROR: return 'border-rule bg-signal/10 text-ink-soft';
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case AgentStatus.IDLE: return <div className="w-4 h-4 rounded-full border-2 border-rule" />;
      case AgentStatus.ANALYZING: return <Loader2 className="w-4 h-4 animate-spin text-ink" />;
      case AgentStatus.COMPLETED: return <CheckCircle className="w-4 h-4 text-positive" />;
      case AgentStatus.ERROR: return <AlertCircle className="w-4 h-4 text-ink-soft" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-300 backdrop- ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-sheet shadow-inner">
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          {agent.status === AgentStatus.COMPLETED && (
            <span className="text-xs font-bold">{agent.findingsCount} ISSUES</span>
          )}
          {getStatusIcon()}
        </div>
      </div>
      <h3 className="font-bold text-lg capitalize mb-1 text-ink tracking-wide">{agent.name}</h3>
      <p className="text-xs opacity-80">{agent.description}</p>

      {agent.status === AgentStatus.ANALYZING && (
        <div className="absolute bottom-0 left-0 h-1 bg-signal/50 w-full overflow-hidden rounded-b-xl">
          <div className="h-full bg-signal animate-progress w-full origin-left scale-x-0 animate-[shimmer_2s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;