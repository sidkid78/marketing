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
        <div className="bg-bench rounded-lg overflow-hidden border border-rule flex flex-col h-64 md:h-auto md:min-h-[300px] relative">
            {/* Scanline Effect */}

            <div className="bg-bench px-4 py-2 flex items-center gap-3 border-b border-rule">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/10"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-working/10"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-positive/10"></div>
                </div>
                <div className="flex items-center gap-2 text-ink ml-2">
                    <Activity size={12} />
                    <span className="text-[10px]">AGENT_STREAM_V2</span>
                </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar relative z-0">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-ink gap-2">
                        <Terminal size={32} />
                        <p className="text-xs uppercase">System Idle. Awaiting Command.</p>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 group">
                        <span className="text-ink text-[10px] whitespace-nowrap pt-1">
                            [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <div className="flex-1">
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 font-bold ${
                                log.stage === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/30' : 
                                log.stage === 'complete' ? 'bg-positive/10 text-positive border border-rule' :
                                'bg-muted text-ink border border-rule'
                            }`}>
                                {log.stage}
                            </span>
                            <span className="text-ink text-xs leading-relaxed group-hover:text-ink transition-colors">{log.message}</span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default AgentTerminal;