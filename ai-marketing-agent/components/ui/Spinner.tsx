
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="relative">
      <div className="border-4 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full w-12 h-12 animate-spin shadow-[0_0_15px_rgba(0,240,255,0.4)]"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-[#ff00ff] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
