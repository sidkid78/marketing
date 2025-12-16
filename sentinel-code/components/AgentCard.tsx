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
      case AgentStatus.IDLE: return 'border-surface bg-surface/50 text-secondary';
      case AgentStatus.ANALYZING: return 'border-primary bg-primary/10 text-primary animate-pulse';
      case AgentStatus.COMPLETED: return 'border-success bg-success/10 text-success';
      case AgentStatus.ERROR: return 'border-danger bg-danger/10 text-danger';
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case AgentStatus.IDLE: return <div className="w-4 h-4 rounded-full border-2 border-secondary" />;
      case AgentStatus.ANALYZING: return <Loader2 className="w-4 h-4 animate-spin" />;
      case AgentStatus.COMPLETED: return <CheckCircle className="w-4 h-4" />;
      case AgentStatus.ERROR: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
            {agent.status === AgentStatus.COMPLETED && (
                <span className="text-sm font-mono font-bold">{agent.findingsCount} Issues</span>
            )}
            {getStatusIcon()}
        </div>
      </div>
      <h3 className="font-bold text-lg capitalize mb-1 text-white">{agent.name}</h3>
      <p className="text-xs opacity-80">{agent.description}</p>
      
      {agent.status === AgentStatus.ANALYZING && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/50 w-full overflow-hidden rounded-b-xl">
           <div className="h-full bg-primary animate-progress w-full origin-left scale-x-0 animate-[shimmer_2s_infinite]"></div> 
        </div>
      )}
    </div>
  );
};

export default AgentCard;