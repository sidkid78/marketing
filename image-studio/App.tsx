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
    <div className="min-h-screen bg-transparent selection:bg-signal/30 text-ink pb-20">

      {/* Header */}
      <header className="border-b border-rule bg-sheet backdrop-">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-signal opacity-40"></div>
              <div className="relative bg-sheet p-2 rounded-lg border border-rule">
                <SparklesIcon className="w-5 h-5 text-ink" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg">
                <span className="text-ink">AGENTIC</span>
                <span className="text-ink">_</span>
                <span className="text-ink">IMAGE_STUDIO</span>
                <span className="text-ink animate-pulse">_</span>
              </h1>
              <p className="text-xs text-ink">VISUAL GENERATION ENGINE</p>
            </div>
          </div>
          <div className="text-xs text-ink border border-rule px-3 py-1 rounded-full bg-sheet">
            ◈ GEMINI 2.5 + IMAGEN 4 ◈
          </div>
        </div>
      </header>

      <main className="px-6 pt-12">

        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-ink">DESCRIBE IT.</span>
              <br />
              <span className="bg-signal bg-clip-text text-transparent">WE&apos;LL PERFECT IT.</span>
            </h2>
            <p className="text-ink text-lg max-w-xl mx-auto text-sm">
              A two-step agentic workflow. First, our neural agent expands your concept into a professional prompt. Then, it generates high-fidelity visuals.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-signal rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-sheet rounded-xl border border-rule p-2 backdrop-">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., a futuristic city on mars at sunset"
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-lg focus:outline-none text-ink placeholder:text-ink disabled:opacity-50"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200
                  ${isLoading || !input.trim()
                    ? 'bg-muted text-ink-soft cursor-not-allowed'
                    : 'bg-signal text-black'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-rule border-t-signal rounded-full animate-spin"></div>
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
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-center text-sm">
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
              <div className="h-px bg-rule flex-1"></div>
              <span className="text-sm text-ink uppercase">◈ RESULTS ◈</span>
              <div className="h-px bg-rule flex-1"></div>
            </div>
            <ImageGallery images={state.images} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;