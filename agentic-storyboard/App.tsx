import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeStory, generateSceneImages, generateSpeech, decodeAudioData, animateScene, generateVideoPrompt, createWavUrl } from './services/genaiService';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import ImageGallery from './components/ImageGallery';
import DirectorMode from './components/DirectorMode';
import { SparklesIcon, ArrowRightIcon, FilmIcon, BrainIcon } from './components/Icons';
import { WorkflowState, WorkflowStatus, StoryScene } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'director'>('studio');
  const [state, setState] = useState<WorkflowState>({
    status: WorkflowStatus.IDLE,
    originalStory: '',
    scenes: [],
    error: undefined
  });

  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleUpdateScene = (id: string, updates: Partial<StoryScene>) => {
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;

    setState({
      status: WorkflowStatus.ANALYZING,
      originalStory: input,
      scenes: [],
      error: undefined
    });

    try {
      const analyzedScenes = await analyzeStory(input);
      setState(prev => ({ ...prev, scenes: analyzedScenes, status: WorkflowStatus.GENERATING }));
      const completedScenes = await generateSceneImages(analyzedScenes);
      setState(prev => ({ ...prev, scenes: completedScenes, status: WorkflowStatus.COMPLETED }));
    } catch (err: any) {
      setState(prev => ({ ...prev, status: WorkflowStatus.ERROR, error: err.message }));
    }
  }, [input]);

  const handleNarrate = async (scene: StoryScene) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: true } : s)
    }));

    try {
      const audioBytes = await generateSpeech(scene.text);

      // Create downloadable WAV
      const audioUrl = createWavUrl(audioBytes);

      // Play audio
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        setState(prev => ({
          ...prev,
          scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: false, audioUrl } : s)
        }));
      };

      source.start();
    } catch (error) {
      console.error("Speech failed", error);
      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: false } : s)
      }));
    }
  };

  const handleAnimate = async (scene: StoryScene) => {
    // Check if key is selected - wait, we are using env var now, but the user code had this. 
    // If the window.aistudio stuff is for a Chrome extension or similar, we might keep it or remove it.
    // The user's intent to switch to env var suggests we might not need this manual key selection dialog.
    // However, the previous user code explicitly added this.
    // But since the service now uses process.env, passing the key from a popup seems redundant unless that's a fallback?
    // The service DOES NOT take a key argument anymore. 
    // So I should REMOVE the manual key selection logic to be consistent with the service signature.

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isAnimating: true } : s)
    }));

    try {
      if (!scene.imageUrl) throw new Error("Need an image to animate.");

      // 1. Generate a specific motion prompt for this scene based on text and image context
      const videoPrompt = await generateVideoPrompt(scene.text, scene.imagePrompt);

      // 2. Animate using the generated prompt
      const videoUrl = await animateScene(videoPrompt, scene.imageUrl);

      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, videoUrl, isAnimating: false } : s)
      }));
    } catch (err: any) {
      console.error("Animation failed", err);
      // Removed the specific "Requested entity was not found" retry logic as it relied on key selection
      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isAnimating: false } : s)
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isLoading = state.status === WorkflowStatus.ANALYZING || state.status === WorkflowStatus.GENERATING;

  return (
    <div className="min-h-screen bg-black text-white pb-32 selection:bg-purple-500/30 font-sans">
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg shadow-purple-500/20">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight uppercase">Artisan Studio</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <BrainIcon className="w-3 h-3" />
            Studio
          </button>
          <button
            onClick={() => setActiveTab('director')}
            className={`flex items-center gap-2 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'director' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <FilmIcon className="w-3 h-3" />
            Director
          </button>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-[0.2em] font-black border border-zinc-800 px-3 py-1.5 rounded-full"
          >
            Billing Info
          </a>
        </div>
      </header>

      <main className="px-6 pt-10 max-w-7xl mx-auto">

        {activeTab === 'studio' ? (
          <>
            <div className="max-w-4xl mx-auto text-center space-y-12 mb-20 mt-10">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                  Manifest Your <span className="text-purple-500 italic">Vision.</span>
                </h2>
                <p className="text-zinc-500 text-lg md:text-xl font-light max-w-2xl mx-auto">
                  Transform raw narrative into cinematic sequences. <br />Analyze, visualize, narrate, and breathe life into every frame.
                </p>
              </div>

              <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800 p-2 shadow-2xl relative group max-w-3xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                <div className="relative bg-zinc-950 rounded-2xl overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your story arc... 'At Passy, we have a singular obsession...'"
                    disabled={isLoading}
                    className="w-full bg-transparent px-8 py-10 text-xl font-light focus:outline-none text-white placeholder-zinc-800 resize-none min-h-[160px] leading-relaxed"
                  />
                  <div className="flex justify-between items-center px-8 py-6 bg-zinc-900/30 border-t border-zinc-900/50">
                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Neural Narrative Engine</span>
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading || !input.trim()}
                      className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-20 shadow-xl"
                    >
                      {isLoading ? 'Processing' : 'Visualize'}
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <WorkflowVisualizer status={state.status} originalStory={state.originalStory} scenes={state.scenes} />

            {state.status === WorkflowStatus.COMPLETED && (
              <ImageGallery
                scenes={state.scenes}
                onNarrate={handleNarrate}
                onAnimate={handleAnimate}
              />
            )}

            {state.error && (
              <div className="max-w-xl mx-auto mt-20 p-6 bg-red-950/20 border border-red-900/30 rounded-2xl text-red-500 text-center text-sm font-medium backdrop-blur-md">
                {state.error}
              </div>
            )}
          </>
        ) : (
          <DirectorMode scenes={state.scenes} onUpdateScene={handleUpdateScene} />
        )}

      </main>
    </div>
  );
};

export default App;
