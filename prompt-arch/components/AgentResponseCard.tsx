
import React from 'react';

interface Props {
  role: string;
  title: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  children: React.ReactNode;
  icon: React.ReactNode;
}

const AgentResponseCard: React.FC<Props> = ({ role, title, status, children, icon }) => {
  const statusStyles = {
    pending: 'border-rule opacity-40 grayscale',
    loading: 'border-rule bg-muted animate-pulse',
    completed: 'border-positive/30 bg-bench',
    error: 'border-destructive/30 bg-destructive/10',
  };

  const textColors = {
    pending: 'text-ink0',
    loading: 'text-ink',
    completed: 'text-ink',
    error: 'text-destructive',
  };

  return (
    <div className={`relative rounded-none border-l-4 p-6 transition-all duration-500 ${statusStyles[status]} overflow-hidden`}>
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className={`absolute top-0 right-0 w-2 h-2 ${status === 'loading' ? 'bg-signal' : 'bg-muted'}`}></div>
      </div>
      
      <div className="flex items-center gap-4 mb-5">
        <div className={`p-2.5 bg-sheet border border-current flex items-center justify-center ${status === 'loading' ? 'text-ink animate-pulse' : status === 'completed' ? 'text-positive' : 'text-ink-soft'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${status === 'loading' ? 'text-ink' : 'text-ink0'}`}>{role}</h3>
            {status === 'loading' && <span className="text-[10px] text-ink animate-pulse-fast font-bold">// LINK_ESTABLISHED</span>}
          </div>
          <h2 className="text-sm font-bold text-ink uppercase font-['Orbitron']">{title}</h2>
        </div>
      </div>
      
      <div className={`text-sm leading-relaxed space-y-3 ${textColors[status]}`}>
        {status === 'pending' ? <p className="opacity-50 tracking-tighter">// WAITING_FOR_UPLINK</p> : children}
      </div>
    </div>
  );
};

export default AgentResponseCard;
