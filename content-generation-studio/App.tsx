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
            --cyber-blue: #00f0ff;
            --cyber-pink: #ff00ff;
            --cyber-green: #39ff14;
        }
        body { 
            background-color: #050510; 
            color: #e2e8f0; 
            font-family: 'Inter', sans-serif; 
            padding: 2rem; 
            line-height: 1.6;
        }
        .export-container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(10, 10, 25, 0.8);
            padding: 3rem;
            border-radius: 1.5rem;
            border: 1px solid rgba(255, 0, 255, 0.2);
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        }
        .no-export { display: none !important; }
        code { font-family: 'JetBrains Mono', monospace; }
        h1, h2, h3, h4 { font-family: 'JetBrains Mono', monospace; }
        
        /* Interactive Media Styling preservation */
        img, video { 
            border-radius: 0.75rem; 
            border: 1px solid rgba(0, 240, 255, 0.2);
            margin: 2rem 0;
            width: 100%;
        }
        [data-export-media="quiz"] {
            background: rgba(0,0,0,0.4);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--cyber-green);
        }
    </style>
</head>
<body>
    <div class="export-container">
        <div style="margin-bottom: 2rem; border-bottom: 1px solid rgba(0,240,255,0.1); padding-bottom: 1rem;">
            <div style="font-family: 'JetBrains Mono'; font-size: 0.75rem; color: var(--cyber-blue);">SOURCE: CONTENT_STUDIO_V2.0</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 0.75rem; color: var(--cyber-pink);">STATUS: EXPORT_FINALIZED</div>
        </div>
        ${containerClone.innerHTML}
        <footer style="margin-top: 4rem; text-align: center; color: #475569; font-size: 0.7rem; font-family: 'JetBrains Mono';">
            ◈ GENERATED BY ARCHITECT_AGENT ◈ VALDIATION_TOKEN: ${Math.random().toString(36).substring(7).toUpperCase()} ◈
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
                    className="inline-flex items-center px-4 py-2 border border-[#00f0ff]/50 text-xs font-mono rounded-lg text-[#00f0ff] bg-black/30 hover:bg-[#00f0ff]/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all group"
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
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-400 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    ◈ WARNING: NO ACTIVE API_LINK_KEY DETECTED.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center py-10 text-[10px] font-mono text-gray-600 tracking-[0.3em] uppercase">
        ◈ CONTENT_STUDIO_NODE_01 ◈ GEN_CORE_INIT ◈ SYSTEM_READY ◈
      </footer>
    </div>
  );
};

export default App;