import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import PreviewPanel from './components/PreviewPanel';
import { generateKineticArt } from './services/geminiService';
import { ArtResult, GenerationStatus } from './types';

interface AppProps {
  apiKey?: string;
}

const App: React.FC<AppProps> = ({ apiKey: propApiKey }) => {
  const [apiKey, setApiKey] = useState(propApiKey || '');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [currentResult, setCurrentResult] = useState<ArtResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propApiKey) {
      try {
        const saved = window.localStorage.getItem('GEMINI_API_KEY') || '';
        setApiKey(saved);
      } catch { }
    }
  }, [propApiKey]);

  const handleGenerate = async (text: string, images: string[] = []) => {
    setStatus('generating');
    setError(null);
    try {
      const result = await generateKineticArt(apiKey, text, images);
      setCurrentResult(result);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'Failed to generate art. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fdfbf7] text-stone-800 font-sans selection:bg-rose-200">

      {/* Mobile Layout: Stacked (Input hides when preview active? Or just scroll) */}
      {/* Desktop Layout: Split Panel */}

      <div className="flex flex-col md:flex-row w-full h-full">

        {/* Left Panel: Input & Rationale */}
        <div className="w-full md:w-[400px] lg:w-[480px] h-1/2 md:h-full z-10 shrink-0">
          <InputPanel
            onGenerate={handleGenerate}
            status={status}
            currentResult={currentResult}
          />
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 h-1/2 md:h-full relative z-0">
          <PreviewPanel
            htmlContent={currentResult?.html || ''}
            isLoading={status === 'generating'}
            error={error}
          />
        </div>

      </div>
    </div>
  );
};

export default App;