import React, { useMemo, useState, useCallback, useRef } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);

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
  }, [formData, service]);

  const getBlobAsBase64 = (url: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleDownload = async () => {
    if (!generatedContent || !contentRef.current) return;

    // Sanitize topic for filename
    const baseName = formData.topic.trim().toLowerCase().replace(/[\s\W-]+/g, '-').substring(0, 50) || 'generated-content';
    
    // Create a clone of the rendered content to manipulate for export
    const containerClone = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Process all media elements to embed as base64
    const mediaElements = containerClone.querySelectorAll('img, video');
    for (const el of Array.from(mediaElements)) {
      const mediaEl = el as HTMLImageElement | HTMLVideoElement;
      if (mediaEl.src && mediaEl.src.startsWith('blob:')) {
        try {
          const base64 = await getBlobAsBase64(mediaEl.src);
          mediaEl.src = base64;
          // For videos, make sure they don't try to load the blob again
          if (mediaEl.tagName === 'VIDEO') {
            mediaEl.removeAttribute('src'); // Use the source child approach if needed, but direct src works
            mediaEl.setAttribute('src', base64);
          }
        } catch (e) {
          console.warn("Could not embed media:", mediaEl.src);
        }
      }
    }

    // Wrap in a high-fidelity HTML template
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.topic} | CONTENT_STUDIO Export</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bench: #e9e7e0;
            --sheet: #f8f7f4;
            --ink: #1e2420;
            --ink-soft: #6a706a;
            --rule: #d2cfc6;
        }
        body {
            background-color: var(--bench);
            color: var(--ink);
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            line-height: 1.6;
        }
        .export-container {
            max-width: 68ch;
            margin: 0 auto;
            background: var(--sheet);
            padding: 3rem;
            border-radius: 4px;
            border: 1px solid var(--rule);
        }
        .no-export { display: none !important; }
        code { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
        h1, h2, h3, h4 { font-family: 'Inter', sans-serif; letter-spacing: -0.021em; }

        img, video {
            border-radius: 4px;
            border: 1px solid var(--rule);
            margin: 2rem 0;
            width: 100%;
        }
        [data-export-media="quiz"] {
            background: var(--bench);
            padding: 2rem;
            border-radius: 4px;
            border: 1px solid var(--rule);
        }
        @media print {
            body { background: #fff; padding: 0; }
            .export-container { border: 0; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="export-container">
        <div style="margin-bottom: 2rem; border-bottom: 1px solid var(--rule); padding-bottom: 1rem; color: var(--ink-soft); font-size: 0.8rem;">
            ${formData.topic}
        </div>
        ${containerClone.innerHTML}
        <footer style="margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--rule); color: var(--ink-soft); font-size: 0.75rem;">
            Generated with Neural Core
        </footer>
    </div>
</body>
</html>
    `.trim();

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-ink">
      {/* Header */}
      <header className="border-b border-rule bg-sheet backdrop-">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-signal opacity-30"></div>
            <div className="relative bg-sheet p-2 rounded-lg border border-rule">
              <BookOpenIcon className="w-5 h-5 text-ink-soft" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg">
              <span className="text-ink-soft">CONTENT</span>
              <span className="text-ink">_</span>
              <span className="text-ink">STUDIO</span>
              <span className="text-ink-soft animate-pulse">_</span>
            </h1>
            <p className="text-xs text-ink-soft">AI-POWERED CONTENT GENERATION</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Form */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-sheet backdrop- p-6 rounded-xl border border-rule relative overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-rule"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-rule"></div>

                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-5 h-5 text-ink" />
                  <h2 className="text-sm font-bold text-ink">CREATE CONTENT</h2>
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
            <div className="bg-sheet backdrop- p-6 rounded-xl border border-rule min-h-[600px] relative overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-rule"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-rule"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-ink-soft">◈ GENERATED OUTPUT</h2>
                {generatedContent && !isLoading && !error && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-rule text-xs rounded-lg text-ink bg-sheet hover:bg-signal/10 transition-all group"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    EXPORT HIGH-FIDELITY
                  </button>
                )}
              </div>
              <ContentDisplay
                ref={contentRef}
                content={generatedContent}
                isLoading={isLoading}
                error={error}
                generateImagePreview={service?.generateImagePreview || (async () => '')}
                generateQuizPreview={service?.generateQuizPreview || (async () => ({ question: '', options: [], answer: '' }))}
                generateVideoPreview={service?.generateVideoPreview || (async () => '')}
              />
              {!apiKey && (
                <div className="mt-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-xs text-destructive flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                    ◈ WARNING: NO ACTIVE API_LINK_KEY DETECTED.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center py-10 text-[10px] text-ink-soft tracking-[0.3em] uppercase">
        ◈ CONTENT_STUDIO_NODE_01 ◈ GEN_CORE_INIT ◈ SYSTEM_READY ◈
      </footer>
    </div>
  );
};

export default App;