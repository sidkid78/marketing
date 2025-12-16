import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="relative flex items-center group">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00f0ff]/70 cursor-help hover:text-[#00f0ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-[#00f0ff] bg-black/90 rounded border border-[#00f0ff]/30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-mono tracking-wide backdrop-blur-sm">
        {text}
      </div>
    </div>
  );
};
