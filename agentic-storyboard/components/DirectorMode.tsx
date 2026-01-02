import React, { useState, useRef, useEffect } from 'react';
import { StoryScene } from '../types';
import { PlayIcon, PauseIcon, UploadIcon, MusicIcon, VideoIcon, XIcon, FilmIcon } from './Icons';

interface DirectorModeProps {
    scenes: StoryScene[];
    onUpdateScene: (id: string, updates: Partial<StoryScene>) => void;
}

const DirectorMode: React.FC<DirectorModeProps> = ({ scenes, onUpdateScene }) => {
    const [activeSceneIndex, setActiveSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const activeScene = scenes[activeSceneIndex];

    // Auto-advance logic
    useEffect(() => {
        if (!isPlaying || !activeScene) return;

        // We primarily drive timing with audio if it exists, otherwise video duration or fixed timer
        const handleMediaEnd = () => {
            if (activeSceneIndex < scenes.length - 1) {
                // Simple fade transition logic would go here (e.g., setTransitioning(true))
                // For now, hard cut to next
                setActiveSceneIndex(prev => prev + 1);
            } else {
                setIsPlaying(false);
                setActiveSceneIndex(0);
            }
        };

        let timer: NodeJS.Timeout;

        // Scenario 1: Audio Exists
        if (activeScene.audioUrl && audioRef.current) {
            const audio = audioRef.current;
            audio.onended = handleMediaEnd;
            audio.play().catch(e => console.log("Audio play failed", e));
        }
        // Scenario 2: Video Only (no audio)
        else if (activeScene.videoUrl && videoRef.current) {
            // If we have video but no audio file, we rely on video duration
            // Note: video usually loops in other views, but here it should play once per scene turn?
            // Let's assume for cinematic mode, video loops, but we need a duration.
            // If no audio, let's just use a fixed 5s timer for the "cinematic feel"
            timer = setTimeout(handleMediaEnd, 6000);
        }
        // Scenario 3: Image Only
        else {
            timer = setTimeout(handleMediaEnd, 5000);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current.pause();
            }
            clearTimeout(timer);
        };
    }, [isPlaying, activeSceneIndex, activeScene, scenes.length]);

    // Ensure video plays when index changes
    useEffect(() => {
        if (isPlaying && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Video play failed", e));
        }
    }, [isPlaying, activeSceneIndex]);

    const handleFileUpload = (sceneId: string, type: 'video' | 'audio', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        if (type === 'video') {
            onUpdateScene(sceneId, { videoUrl: url, imageUrl: undefined }); // Video replaces image
        } else {
            onUpdateScene(sceneId, { audioUrl: url });
        }
    };

    const togglePlay = () => {
        if (scenes.length === 0) return;
        if (!isPlaying && activeSceneIndex === scenes.length - 1) {
            setActiveSceneIndex(0); // Restart if at end
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 p-6">

            {/* Sidebar: Timeline / Sequencer */}
            <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest sticky top-0 bg-black/90 backdrop-blur z-10 py-2 border-b border-zinc-800">
                    Sequence Editor
                </h3>

                {scenes.length === 0 && (
                    <div className="text-zinc-600 text-sm italic text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                        No scenes generated yet. <br /> Switch to Studio to create scenes.
                    </div>
                )}

                {scenes.map((scene, idx) => (
                    <div
                        key={scene.id}
                        className={`p-4 rounded-xl border transition-all ${idx === activeSceneIndex
                                ? 'bg-zinc-900 border-purple-500/50 shadow-lg shadow-purple-900/10'
                                : 'bg-black border-zinc-800 hover:border-zinc-700'
                            }`}
                        onClick={() => { setActiveSceneIndex(idx); setIsPlaying(false); }}
                    >
                        <div className="flex gap-4">
                            {/* Thumbnail */}
                            <div className="w-24 h-16 bg-zinc-900 rounded-lg overflow-hidden shrink-0 relative group">
                                {scene.videoUrl ? (
                                    <video src={scene.videoUrl} className="w-full h-full object-cover" />
                                ) : scene.imageUrl ? (
                                    <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <VideoIcon className="w-6 h-6" />
                                    </div>
                                )}

                                {/* Visual Upload Overlay */}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <UploadIcon className="w-5 h-5 text-white" />
                                    <input type="file" className="hidden" accept="video/*,image/*" title="Upload Visual" onChange={(e) => handleFileUpload(scene.id, 'video', e)} />
                                </label>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scene {idx + 1}</span>
                                        {scene.audioUrl && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                                    </div>
                                    <p className="text-zinc-300 text-sm truncate mt-1">{scene.text}</p>
                                </div>

                                {/* Audio Upload */}
                                <div className="flex items-center gap-2 mt-2">
                                    <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer text-[10px] text-zinc-400 hover:text-white transition-colors">
                                        <MusicIcon className="w-3 h-3" />
                                        <span>{scene.audioUrl ? 'Replace Audio' : 'Add Audio'}</span>
                                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(scene.id, 'audio', e)} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Stage: Player */}
            <div className="flex-1 flex flex-col bg-[#0c0c0e] rounded-3xl border border-zinc-800 overflow-hidden relative">

                {/* Screen */}
                <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                    {activeScene ? (
                        <>
                            {/* Visual Layer */}
                            <div key={activeScene.id} className="animate-fadeIn w-full h-full flex items-center justify-center">
                                {activeScene.videoUrl ? (
                                    <video
                                        ref={videoRef}
                                        src={activeScene.videoUrl}
                                        className="w-full h-full object-contain"
                                        muted // Muted because we handle audio separately if needed, OR unmuted if sound is embedded in video? 
                                        // Actually, Veo videos have no sound. So we rely on audioRef.
                                        loop={true}
                                        autoPlay={isPlaying}
                                    />
                                ) : activeScene.imageUrl ? (
                                    <img src={activeScene.imageUrl} className="w-full h-full object-contain animate-kenBurns" alt="Scene" />
                                ) : (
                                    <div className="text-zinc-600 flex flex-col items-center gap-4">
                                        <FilmIcon className="w-12 h-12 opacity-50" />
                                        <p className="uppercase tracking-widest text-sm">No Visual Asset</p>
                                    </div>
                                )}
                            </div>

                            {/* Audio Layer (Invisible) */}
                            {activeScene.audioUrl && (
                                <audio ref={audioRef} src={activeScene.audioUrl} />
                            )}
                        </>
                    ) : (
                        <div className="text-zinc-700 uppercase tracking-[0.2em] font-black text-2xl">
                            Director Mode
                        </div>
                    )}

                    {/* Play Overlay (If paused) */}
                    {!isPlaying && activeScene && (
                        <button
                            title="Play"
                            onClick={togglePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors group"
                        >
                            <div className="p-6 bg-white/10 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform">
                                <PlayIcon className="w-12 h-12 text-white fill-white" />
                            </div>
                        </button>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-8">
                    <div className="text-xs font-mono text-zinc-500">
                        {activeSceneIndex + 1} <span className="text-zinc-700">/</span> {scenes.length}
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-zinc-400 hover:text-white" title="Previous Scene" onClick={() => setActiveSceneIndex(Math.max(0, activeSceneIndex - 1))}>
                            <svg className="w-5 h-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </button>

                        <button
                            onClick={togglePlay}
                            className="p-4 bg-white text-black rounded-full hover:bg-purple-100 hover:text-purple-900 transition-colors shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <PauseIcon className="w-6 h-6 fill-current" /> : <PlayIcon className="w-6 h-6 fill-current" />}
                        </button>

                        <button className="text-zinc-400 hover:text-white" title="Next Scene" onClick={() => setActiveSceneIndex(Math.min(scenes.length - 1, activeSceneIndex + 1))}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </button>
                    </div>

                    <div className="w-24"></div> {/* Spacer for balance */}
                </div>
            </div>
        </div>
    );
};

export default DirectorMode;
