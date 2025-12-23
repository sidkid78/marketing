import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeStory, generateSceneImages, generateSpeech, decodeAudioData, animateScene } from './services/genaiService';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import ImageGallery from './components/ImageGallery';
import { SparklesIcon, ArrowRightIcon } from './components/Icons';
import { WorkflowState, WorkflowStatus, StoryScene } from './types';

interface AppProps {
  apiKey?: string;
}

const App: React.FC<AppProps> = ({ apiKey: propApiKey }) => {
  const [apiKey, setApiKey] = useState(propApiKey || '');

  useEffect(() => {
    if (!propApiKey) {
      try {
        const saved = window.localStorage.getItem('GEMINI_API_KEY') || '';
        setApiKey(saved);
      } catch { }
    }
  }, [propApiKey]);

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

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;

    setState({
      status: WorkflowStatus.ANALYZING,
      originalStory: input,
      scenes: [],
      error: undefined
    });

    try {
      const analyzedScenes = await analyzeStory(apiKey, input);
      setState(prev => ({ ...prev, scenes: analyzedScenes, status: WorkflowStatus.GENERATING }));
      const completedScenes = await generateSceneImages(apiKey, analyzedScenes);
      setState(prev => ({ ...prev, scenes: completedScenes, status: WorkflowStatus.COMPLETED }));
    } catch (err: any) {
      setState(prev => ({ ...prev, status: WorkflowStatus.ERROR, error: err.message }));
    }
  }, [input, apiKey]);

  const handleNarrate = async (scene: StoryScene) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Update local state to show narrating
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: true } : s)
    }));

    try {
      const audioBytes = await generateSpeech(apiKey, scene.text);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        setState(prev => ({
          ...prev,
          scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: false } : s)
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
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, isAnimating: true } : s)
    }));

    try {
      if (!scene.imageUrl) throw new Error("Need an image to animate.");

      const videoUrl = await animateScene(apiKey, scene.imagePrompt, scene.imageUrl);

      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, videoUrl, isAnimating: false } : s)
      }));
    } catch (err: any) {
      console.error("Animation failed", err);
      if (err.message.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
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
    <div className="min-h-screen bg-black text-white pb-32 selection:bg-purple-500/30">
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg shadow-purple-500/20">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight uppercase">Artisan Studio</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Release v2.5</div>
        </div>
      </header>

      <main className="px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-12 mb-20">
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
      </main>
    </div>
  );
};

export default App;