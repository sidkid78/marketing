import React, { useState, useCallback } from 'react';
import { optimizePrompt, generateImages } from './services/genaiServices';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import ImageGallery from './components/ImageGallery';
import { SparklesIcon, ArrowRightIcon } from './components/Icons';
import { WorkflowState, WorkflowStatus, GeneratedImage } from './types';

interface ImageStudioAppProps {
  apiKey: string;
}

const App: React.FC<ImageStudioAppProps> = ({ apiKey }) => {
  const [state, setState] = useState<WorkflowState>({
    status: WorkflowStatus.IDLE,
    originalPrompt: '',
    optimizedPrompt: '',
    images: [],
    error: undefined
  });

  const [input, setInput] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!input.trim() || !apiKey) return;

    // Reset state for new run
    setState({
      status: WorkflowStatus.OPTIMIZING,
      originalPrompt: input,
      optimizedPrompt: '',
      images: [],
      error: undefined
    });

    try {
      // Step 1: Optimize Prompt
      const optimized = await optimizePrompt(input, apiKey);

      setState(prev => ({
        ...prev,
        optimizedPrompt: optimized,
        status: WorkflowStatus.GENERATING
      }));

      // Step 2: Generate Images
      const imageUrls = await generateImages(optimized, apiKey);

      const newImages: GeneratedImage[] = imageUrls.map((url: string, i: number) => ({
        id: `img-${Date.now()}-${i}`,
        url
      }));

      setState(prev => ({
        ...prev,
        images: newImages,
        status: WorkflowStatus.COMPLETED
      }));

    } catch (err: unknown) {
      setState(prev => ({
        ...prev,
        status: WorkflowStatus.ERROR,
        error: err instanceof Error ? err.message : String(err) || "An unexpected error occurred"
      }));
    }
  }, [apiKey, input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    navigator.clipboard.writeText(text);
  };

  const isLoading = state.status === WorkflowStatus.OPTIMIZING || state.status === WorkflowStatus.GENERATING;

  return (
    <div className="min-h-screen bg-transparent selection:bg-[#ff00ff]/30 text-white pb-20">

      {/* Header */}
      <header className="border-b border-[#00f0ff]/20 bg-black/40 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff] to-[#00f0ff] blur-lg opacity-40"></div>
              <div className="relative bg-black/50 p-2 rounded-lg border border-[#ff00ff]/50">
                <SparklesIcon className="w-5 h-5 text-[#ff00ff]" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg font-mono">
                <span className="text-[#ff00ff]">AGENTIC</span>
                <span className="text-white">_</span>
                <span className="text-[#00f0ff]">IMAGE_STUDIO</span>
                <span className="text-[#ff00ff] animate-pulse">_</span>
              </h1>
              <p className="text-xs text-gray-500 font-mono">VISUAL GENERATION ENGINE</p>
            </div>
          </div>
          <div className="text-xs font-mono text-gray-500 border border-[#00f0ff]/20 px-3 py-1 rounded-full bg-black/30">
            ◈ GEMINI 2.5 + IMAGEN 4 ◈
          </div>
        </div>
      </header>

      <main className="px-6 pt-12">

        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold font-mono">
              <span className="text-white">DESCRIBE IT.</span>
              <br />
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#ff00ff] bg-clip-text text-transparent">WE&apos;LL PERFECT IT.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto font-mono text-sm">
              A two-step agentic workflow. First, our neural agent expands your concept into a professional prompt. Then, it generates high-fidelity visuals.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff] to-[#ff00ff] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-black/60 rounded-xl border border-[#00f0ff]/30 p-2 shadow-2xl backdrop-blur-sm">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., a futuristic city on mars at sunset"
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-lg focus:outline-none text-white placeholder-gray-600 disabled:opacity-50 font-mono"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 rounded-lg font-mono font-medium flex items-center gap-2 transition-all duration-200
                  ${isLoading || !input.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00f0ff] to-[#00a0ff] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-[#00f0ff] rounded-full animate-spin"></div>
                    <span>PROCESSING</span>
                  </div>
                ) : (
                  <>
                    <span>CREATE</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.status === WorkflowStatus.ERROR && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center font-mono text-sm">
            ◈ ERROR: {state.error}
          </div>
        )}

        {/* Visualizer Pipeline */}
        <WorkflowVisualizer
          status={state.status}
          originalPrompt={state.originalPrompt}
          optimizedPrompt={state.optimizedPrompt}
          onCopyPrompt={copyToClipboard}
        />

        {/* Results Gallery */}
        {state.status === WorkflowStatus.COMPLETED && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="max-w-7xl mx-auto flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent flex-1"></div>
              <span className="text-sm font-mono text-[#00f0ff] uppercase tracking-widest">◈ RESULTS ◈</span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#ff00ff]/50 to-transparent flex-1"></div>
            </div>
            <ImageGallery images={state.images} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;