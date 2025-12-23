
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
    pending: 'border-slate-800 opacity-40 grayscale',
    loading: 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse',
    completed: 'border-green-500/50 bg-slate-900/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
    error: 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };

  const textColors = {
    pending: 'text-slate-500',
    loading: 'text-cyan-400',
    completed: 'text-slate-300',
    error: 'text-red-400',
  };

  return (
    <div className={`relative rounded-none border-l-4 p-6 transition-all duration-500 ${statusStyles[status]} overflow-hidden`}>
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className={`absolute top-0 right-0 w-2 h-2 ${status === 'loading' ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
      </div>
      
      <div className="flex items-center gap-4 mb-5">
        <div className={`p-2.5 bg-black/50 border border-current flex items-center justify-center ${status === 'loading' ? 'text-cyan-400 animate-pulse' : status === 'completed' ? 'text-green-400' : 'text-slate-600'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${status === 'loading' ? 'text-cyan-400' : 'text-slate-500'}`}>{role}</h3>
            {status === 'loading' && <span className="text-[10px] text-cyan-400 animate-pulse-fast font-bold">// LINK_ESTABLISHED</span>}
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-['Orbitron']">{title}</h2>
        </div>
      </div>
      
      <div className={`text-sm leading-relaxed space-y-3 font-mono ${textColors[status]}`}>
        {status === 'pending' ? <p className="opacity-50 tracking-tighter">// WAITING_FOR_UPLINK</p> : children}
      </div>
    </div>
  );
};

export default AgentResponseCard;
