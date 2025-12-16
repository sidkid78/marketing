import React from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#00f0ff]/40 font-mono text-xs">
        <p className="animate-pulse">WAITING FOR SYSTEM LOGS...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 font-mono text-xs p-2">
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-3 items-start border-l-2 border-transparent hover:border-[#00f0ff]/50 pl-2 transition-colors">
          <span className="text-[#00f0ff]/60 shrink-0">
            [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
          </span>
          <span className={`break-all ${log.level === 'error' ? 'text-[#ff00ff] drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]' :
              log.level === 'warning' ? 'text-[#fcee0a] drop-shadow-[0_0_5px_rgba(252,238,10,0.8)]' :
                log.level === 'success' ? 'text-[#39ff14] drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]' :
                  'text-white/90'
            }`}>
            <span className="opacity-50 mr-2">{'>'}</span>{log.message}
          </span>
        </div>
      ))}
      <div className="h-4 w-2 bg-[#00f0ff] animate-pulse mt-2 ml-2" />
    </div>
  );
};