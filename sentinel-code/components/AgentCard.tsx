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
      case AgentStatus.IDLE: return 'border-white/10 bg-black/40 text-gray-500 opacity-60';
      case AgentStatus.ANALYZING: return 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-pulse';
      case AgentStatus.COMPLETED: return 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14] shadow-none';
      case AgentStatus.ERROR: return 'border-[#ff00ff] bg-[#ff00ff]/10 text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.2)]';
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case AgentStatus.IDLE: return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
      case AgentStatus.ANALYZING: return <Loader2 className="w-4 h-4 animate-spin text-[#00f0ff]" />;
      case AgentStatus.COMPLETED: return <CheckCircle className="w-4 h-4 text-[#39ff14]" />;
      case AgentStatus.ERROR: return <AlertCircle className="w-4 h-4 text-[#ff00ff]" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-black/60 shadow-inner">
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          {agent.status === AgentStatus.COMPLETED && (
            <span className="text-xs font-mono font-bold tracking-wider">{agent.findingsCount} ISSUES</span>
          )}
          {getStatusIcon()}
        </div>
      </div>
      <h3 className="font-bold text-lg capitalize mb-1 text-white font-mono tracking-wide">{agent.name}</h3>
      <p className="text-xs opacity-80 font-mono">{agent.description}</p>

      {agent.status === AgentStatus.ANALYZING && (
        <div className="absolute bottom-0 left-0 h-1 bg-[#00f0ff]/50 w-full overflow-hidden rounded-b-xl">
          <div className="h-full bg-[#00f0ff] animate-progress w-full origin-left scale-x-0 animate-[shimmer_2s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;