import React from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-ink/40 text-xs">
        <p className="animate-pulse">WAITING FOR SYSTEM LOGS...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-xs p-2">
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-3 items-start border-l-2 border-transparent hover:border-rule pl-2 transition-colors">
          <span className="text-ink/60 shrink-0">
            [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
          </span>
          <span className={`break-all ${log.level === 'error' ? 'text-ink-soft' :
              log.level === 'warning' ? 'text-[#fcee0a]' :
                log.level === 'success' ? 'text-positive' :
                  'text-ink/90'
            }`}>
            <span className="opacity-50 mr-2">{'>'}</span>{log.message}
          </span>
        </div>
      ))}
      <div className="h-4 w-2 bg-signal animate-pulse mt-2 ml-2" />
    </div>
  );
};