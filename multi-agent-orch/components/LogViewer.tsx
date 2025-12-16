import React from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600">
        <p>Logs will appear here...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-2 items-start font-mono text-xs">
          <span className="text-slate-600 shrink-0">
            [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
          </span>
          <span className={`break-all ${
            log.level === 'error' ? 'text-red-400' : 
            log.level === 'warning' ? 'text-amber-400' :
            log.level === 'success' ? 'text-emerald-400' :
            'text-slate-300'
          }`}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
};