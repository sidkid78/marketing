import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';
import { Terminal, Activity } from 'lucide-react';

interface AgentTerminalProps {
    logs: AgentLog[];
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-cyber-black rounded-lg overflow-hidden border border-cyber-text/20 shadow-xl flex flex-col h-64 md:h-auto md:min-h-[300px] relative font-mono">
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-primary/5 to-transparent h-[10%] w-full animate-scanline pointer-events-none z-10"></div>

            <div className="bg-cyber-dark/80 px-4 py-2 flex items-center gap-3 border-b border-white/10">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex items-center gap-2 text-cyber-text/60 ml-2">
                    <Activity size={12} />
                    <span className="text-[10px] tracking-widest">AGENT_STREAM_V2</span>
                </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar relative z-0">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-cyber-text/30 gap-2">
                        <Terminal size={32} />
                        <p className="text-xs uppercase tracking-widest">System Idle. Awaiting Command.</p>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 group">
                        <span className="text-cyber-text/40 text-[10px] whitespace-nowrap pt-1">
                            [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex-1">
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 font-bold tracking-wider ${
                                log.stage === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                log.stage === 'complete' ? 'bg-cyber-success/10 text-cyber-success border border-cyber-success/20' :
                                'bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20'
                            }`}>
                                {log.stage}
                            </span>
                            <span className="text-slate-300 text-xs leading-relaxed group-hover:text-white transition-colors">{log.message}</span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default AgentTerminal;