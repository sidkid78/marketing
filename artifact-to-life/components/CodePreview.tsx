import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  refreshKey?: number; // Used to force reload
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, refreshKey }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code;
    }
  }, [code, refreshKey]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const openInNewTab = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`
        transition-all duration-300 bg-black border border-cyan-900 shadow-[0_0_40px_-10px_rgba(8,145,178,0.3)] group flex flex-col
        ${isFullscreen 
          ? 'fixed inset-0 z-[100] rounded-none' 
          : 'w-full h-full rounded-sm relative'
        }
      `}
    >
      {/* Decorative corners - visible when not fullscreen */}
      {!isFullscreen && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500 z-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500 z-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500 z-20 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500 z-20 pointer-events-none"></div>
        </>
      )}

      {/* Toolbar */}
      <div className="h-12 bg-slate-900/90 border-b border-cyan-900/50 flex items-center justify-between px-4 z-10 backdrop-blur-sm shrink-0">
        <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
        </div>
        
        <div className="flex-1 text-center px-4">
            <span className="text-xs text-cyan-400/70 font-mono uppercase tracking-widest hidden sm:inline-block">Running Artifact Protocol</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={openInNewTab} 
            className="p-2 hover:bg-cyan-900/30 rounded-sm text-cyan-400 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            title="Open in New Tab"
          >
             <ExternalLink size={16} />
          </button>
          <button 
            onClick={toggleFullscreen} 
            className="p-2 hover:bg-cyan-900/30 rounded-sm text-cyan-400 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
             {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        title="Preview"
        className="w-full flex-1 bg-white"
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
      />
    </div>
  );
};