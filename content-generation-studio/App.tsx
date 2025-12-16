import React, { useMemo, useState, useCallback } from 'react';
import type { GeneratorFormState } from './types';
import { CONTENT_TYPES, TARGET_AUDIENCES, FORMAT_PREFERENCES } from './constants';
import GeneratorForm from './components/GeneratorForm';
import ContentDisplay from './components/ContentDisplay';
import { createContentStudioService } from './services/geminiService';
import { BookOpenIcon, SparklesIcon, DownloadIcon } from './components/icons';

interface AppProps { apiKey: string }

const App: React.FC<AppProps> = ({ apiKey }) => {
  const [formData, setFormData] = useState<GeneratorFormState>({
    contentType: CONTENT_TYPES[0],
    targetAudience: TARGET_AUDIENCES[0],
    topic: '',
    formatPreference: FORMAT_PREFERENCES[0],
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => {
    try {
      return createContentStudioService(apiKey);
    } catch (e) {
      return null;
    }
  }, [apiKey]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter a topic or subject.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent('');

    try {
      if (!service) throw new Error('Missing API key');
      const content = await service.generateContent(formData);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleDownload = () => {
    if (!generatedContent) return;

    // Sanitize topic for filename
    const filename = (formData.topic.trim().toLowerCase().replace(/[\s\W-]+/g, '-').substring(0, 50) || 'generated-content') + '.md';

    const blob = new Blob([generatedContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-transparent font-sans text-white">
      {/* Header */}
      <header className="border-b border-[#00f0ff]/20 bg-black/40 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#ff00ff] blur-lg opacity-30"></div>
            <div className="relative bg-black/50 p-2 rounded-lg border border-[#ff00ff]/50">
              <BookOpenIcon className="w-5 h-5 text-[#ff00ff]" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg font-mono">
              <span className="text-[#ff00ff]">CONTENT</span>
              <span className="text-white">_</span>
              <span className="text-[#00f0ff]">STUDIO</span>
              <span className="text-[#ff00ff] animate-pulse">_</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">AI-POWERED CONTENT GENERATION</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Form */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#00f0ff]/20 relative overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-[#00f0ff]/30"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-[#ff00ff]/30"></div>

                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-5 h-5 text-[#00f0ff]" />
                  <h2 className="text-sm font-mono font-bold text-[#00f0ff]">CREATE CONTENT</h2>
                </div>
                <GeneratorForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </aside>

          {/* Content Display */}
          <section className="lg:col-span-8 xl:col-span-9">
            <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-[#ff00ff]/20 min-h-[600px] relative overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-[#ff00ff]/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-[#00f0ff]/30"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-mono font-bold text-[#ff00ff]">◈ GENERATED OUTPUT</h2>
                {generatedContent && !isLoading && !error && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-[#00f0ff]/50 text-xs font-mono rounded-lg text-[#00f0ff] bg-black/30 hover:bg-[#00f0ff]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    DOWNLOAD
                  </button>
                )}
              </div>
              <ContentDisplay
                content={generatedContent}
                isLoading={isLoading}
                error={error}
                generateImagePreview={service?.generateImagePreview}
                generateQuizPreview={service?.generateQuizPreview}
                generateVideoPreview={service?.generateVideoPreview}
              />
              {!apiKey && (
                <p className="mt-4 text-sm text-red-400 font-mono">◈ WARNING: No API key detected. Enter your Gemini API key above.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-xs font-mono text-gray-600">
        ◈ CONTENT_STUDIO v2.0 ◈ POWERED BY GEMINI API ◈
      </footer>
    </div>
  );
};

export default App;