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
    <div className="min-h-screen bg-black selection:bg-purple-500/30 text-zinc-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
               <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Agentic Image Studio</h1>
          </div>
          <div className="text-xs font-medium text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">
             Powered by Gemini 2.5 & Imagen 4
          </div>
        </div>
      </header>

      <main className="px-6 pt-12">
        
        {/* Hero / Input Section */}
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
              Describe it. <br/> We&apos;ll perfect it.
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              A two-step agentic workflow. First, our agent expands your idea into a professional prompt. Then, it generates high-fidelity visuals.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-2 shadow-2xl">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., a futuristic city on mars at sunset"
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-lg focus:outline-none text-white placeholder-zinc-600 disabled:opacity-50"
              />
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200
                  ${isLoading || !input.trim() 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                     <span>Working</span>
                  </div>
                ) : (
                  <>
                    <span>Create</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.status === WorkflowStatus.ERROR && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {state.error}
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
                 <div className="h-px bg-zinc-800 flex-1"></div>
                 <span className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Results</span>
                 <div className="h-px bg-zinc-800 flex-1"></div>
              </div>
              <ImageGallery images={state.images} />
           </div>
        )}

      </main>
    </div>
  );
};

export default App;