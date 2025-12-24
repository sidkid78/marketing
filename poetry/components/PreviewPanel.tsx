import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Monitor, Smartphone, Download, AlertCircle, Eye } from 'lucide-react';

interface PreviewPanelProps {
  htmlContent: string;
  isLoading: boolean;
  error: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ htmlContent, isLoading, error }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kinetic-card.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
      const elem = document.getElementById('preview-container');
      if (!elem) return;

      if (!document.fullscreenElement) {
          elem.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
          setIsFullscreen(true);
      } else {
          document.exitFullscreen();
          setIsFullscreen(false);
      }
  };
  
  // Listen for fullscreen change events to update state if user exits via ESC
  useEffect(() => {
      const handleFsChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);


  return (
    <div className="flex flex-col h-full bg-[#e7e5e4] relative transition-colors" id="preview-container">
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-6 py-3 bg-white border-b border-stone-200 shadow-sm ${isFullscreen ? 'hidden group-hover:flex absolute top-0 left-0 right-0 z-50 opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mr-4">Preview Canvas</span>
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'desktop' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'mobile' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
           <button
            onClick={handleDownload}
            disabled={!htmlContent}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-stone-500 hover:text-rose-600 hover:bg-stone-50 rounded-md transition-colors disabled:opacity-30"
          >
            <Download className="w-4 h-4" />
            Save HTML
          </button>
          <button
            onClick={toggleFullscreen}
            disabled={!htmlContent}
            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-50 rounded-md transition-colors disabled:opacity-30"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#e7e5e4]">
        {/* Subtle background texture/dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/60 backdrop-blur-md">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-stone-500 font-serif text-lg animate-pulse italic">Weaving words into motion...</p>
          </div>
        )}
        
        {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
                <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif">Something went wrong</h3>
                <p className="text-stone-500 max-w-md">{error}</p>
            </div>
        )}

        {!htmlContent && !isLoading && !error && (
          <div className="text-center p-8 select-none">
             <div className="inline-block p-6 rounded-full bg-white shadow-sm mb-6">
                <Eye className="w-12 h-12 text-stone-300" />
             </div>
             <h2 className="text-4xl font-serif text-stone-400 mb-2 font-light italic">Your Canvas Awaits</h2>
             <p className="text-stone-400 text-sm uppercase tracking-widest">Enter text to begin</p>
          </div>
        )}

        <div
          className={`transition-all duration-700 ease-in-out shadow-2xl bg-white relative z-20 ${
            viewMode === 'mobile'
              ? 'w-[375px] h-[667px] rounded-[3rem] border-[12px] border-white ring-1 ring-stone-200 shadow-xl overflow-hidden'
              : 'w-full h-full shadow-none'
          }`}
        >
          <iframe
            ref={iframeRef}
            title="Art Preview"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;