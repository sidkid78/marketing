import React from 'react';
import { StoryScene } from '../types';
import { DownloadIcon, PlayIcon, VideoIcon } from './Icons';

interface ImageGalleryProps {
  scenes: StoryScene[];
  onNarrate: (scene: StoryScene) => void;
  onAnimate: (scene: StoryScene) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ scenes, onNarrate, onAnimate }) => {
  if (scenes.length === 0) return null;

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 space-y-8">
      {scenes.map((scene, index) => (
         <div key={scene.id} className="relative group">
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:border-zinc-700">
               <div className="flex flex-col lg:flex-row">
                  
                  {/* Visual Container */}
                  <div className="relative lg:w-[55%] aspect-video bg-black overflow-hidden flex items-center justify-center">
                    {scene.videoUrl ? (
                      <video 
                        src={scene.videoUrl} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                        loop
                      />
                    ) : scene.imageUrl ? (
                        <img 
                          src={scene.imageUrl} 
                          alt={`Scene ${index + 1}`} 
                          className={`w-full h-full object-cover transition-all duration-1000 ${scene.isAnimating ? 'opacity-30 blur-md scale-105' : 'group-hover:scale-105'}`}
                        />
                    ) : (
                        <div className="text-zinc-800 font-display uppercase tracking-widest text-sm">Visualizing...</div>
                    )}

                    {scene.isAnimating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6 text-center z-10">
                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold uppercase tracking-widest text-white">Generating Motion</p>
                          <p className="text-xs text-zinc-400 max-w-[200px] leading-relaxed italic">"Breathing life into the artisan's vision..."</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Download Button for Image/Video */}
                    {(scene.imageUrl || scene.videoUrl) && !scene.isAnimating && (
                      <button 
                        onClick={() => downloadFile(scene.videoUrl || scene.imageUrl!, `scene-${index + 1}.${scene.videoUrl ? 'mp4' : 'jpg'}`)}
                        className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                        title="Download Source"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Narrative Container */}
                  <div className="flex-1 p-10 md:p-14 flex flex-col justify-center relative">
                      <div className="flex items-center gap-4 mb-8">
                          <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase whitespace-nowrap">Scene {index + 1}</span>
                          <div className="h-px bg-zinc-800/60 w-full max-w-[100px]"></div>
                      </div>
                      
                      <div className="relative mb-12">
                        <span className="absolute -top-6 -left-4 text-6xl text-zinc-800 font-serif opacity-50">"</span>
                        <p className={`text-xl md:text-2xl font-light leading-[1.6] text-zinc-100 transition-all duration-500 ${scene.isNarrating ? 'text-purple-400' : ''}`}>
                          {scene.text}
                        </p>
                        <span className="absolute -bottom-10 right-0 text-6xl text-zinc-800 font-serif opacity-50">"</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <button 
                          onClick={() => onNarrate(scene)}
                          disabled={scene.isNarrating || scene.isAnimating}
                          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold tracking-tight transition-all active:scale-95 ${
                            scene.isNarrating 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/50'
                          } disabled:opacity-40`}
                        >
                          <PlayIcon className={`w-4 h-4 ${scene.isNarrating ? 'animate-pulse' : ''}`} />
                          {scene.isNarrating ? 'Narrating...' : 'Narrate'}
                        </button>

                        <button 
                          onClick={() => onAnimate(scene)}
                          disabled={scene.isAnimating || !!scene.videoUrl}
                          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-sm font-bold tracking-tight transition-all active:scale-95 ${
                            scene.videoUrl 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <VideoIcon className={`w-4 h-4 ${scene.isAnimating ? 'animate-bounce' : ''}`} />
                          {scene.videoUrl ? 'Rendered' : scene.isAnimating ? 'Animating...' : 'Animate'}
                        </button>

                        {scene.videoUrl && (
                           <button 
                             onClick={() => downloadFile(scene.videoUrl!, `animation-${index + 1}.mp4`)}
                             className="p-3 bg-zinc-800/30 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-zinc-700/50"
                             title="Save Animation"
                           >
                             <DownloadIcon className="w-5 h-5" />
                           </button>
                        )}
                      </div>
                  </div>

               </div>
            </div>
         </div>
      ))}
    </div>
  );
};

export default ImageGallery;