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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <header className="bg-white dark:bg-slate-800/50 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Content Generation Studio</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered educational content creation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                 <div className="flex items-center space-x-3 mb-6">
                    <SparklesIcon className="w-6 h-6 text-indigo-500"/>
                    <h2 className="text-lg font-semibold">Create Your Content</h2>
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

          <section className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Generated Output</h2>
                {generatedContent && !isLoading && !error && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
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
                <p className="mt-4 text-sm text-red-600">No Gemini API key provided. Please enter your API key above.</p>
              )}
            </div>
          </section>
        </div>
      </main>
      
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;