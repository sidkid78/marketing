import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Zap, Code, RefreshCw, Image as ImageIcon, Trash2, ArrowRight, Loader2, Cpu, Terminal } from 'lucide-react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { generateArtifact, fileToGenerativePart } from './services/geminiService';
import { AppStatus, FileData } from './types';
import { Button } from './components/Button';
import { CodePreview } from './components/CodePreview';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// --- Sub-Components ---

const BackgroundEffect = () => (
  <>
    <div className="fixed inset-0 z-0 pointer-events-none animate-grid-scroll"
      style={{
        backgroundImage: 'linear-gradient(to right, #111827 1px, transparent 1px), linear-gradient(to bottom, #111827 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.2
      }}>
    </div>
    <div className="fixed top-0 left-1/4 w-1/2 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none z-0"></div>
  </>
);

const Header = ({ showReset, onReset }: { showReset: boolean; onReset: () => void }) => (
  <header className="border-b border-cyan-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
      <div className="flex items-center space-x-3 group cursor-default">
        <div className="w-10 h-10 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500 rounded-sm skew-x-[-10deg] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          <Cpu className="w-6 h-6 text-cyan-400 relative z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold font-cyber tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-neon-pulse">
            ARTIFACT_TO_LIFE
          </span>
          <span className="text-[10px] text-cyan-700 font-mono tracking-[0.2em] uppercase">System v2.5 Online</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {showReset && (
          <Button variant="secondary" size="sm" onClick={onReset} icon={<RefreshCw className="w-4 h-4" />}>
            Reset System
          </Button>
        )}
      </div>
    </div>
  </header>
);

// --- Views ---

interface WelcomeViewProps {
  prompt: string;
  setPrompt: (s: string) => void;
  fileData: FileData | null;
  setFileData: (f: FileData | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleGenerate: () => void;
  status: AppStatus;
  errorMsg: string | null;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  prompt, setPrompt, fileData, setFileData, handleFileSelect, handleDrop, handleDragOver, handleGenerate, status, errorMsg
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col space-y-8 animate-fade-in-up">
      <div className="space-y-4 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black font-cyber leading-tight">
          INITIATE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            MATERIALIZATION
          </span>
        </h1>
        <p className="text-slate-400 font-mono text-sm leading-relaxed border-l-2 border-cyan-900 pl-4 max-w-2xl">
          // Upload visual data (sketch, photo, schematic).<br />
          // Neural network will compile functional interface.<br />
          // Execute build protocol.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-sm p-8 transition-all duration-300 group ${fileData
          ? 'border-cyan-500 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Corner Accents */}
        <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 transition-colors ${fileData ? 'border-cyan-400' : 'border-slate-600 group-hover:border-cyan-400'}`}></div>
        <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 transition-colors ${fileData ? 'border-cyan-400' : 'border-slate-600 group-hover:border-cyan-400'}`}></div>
        <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 transition-colors ${fileData ? 'border-cyan-400' : 'border-slate-600 group-hover:border-cyan-400'}`}></div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 transition-colors ${fileData ? 'border-cyan-400' : 'border-slate-600 group-hover:border-cyan-400'}`}></div>

        {fileData ? (
          <div className="relative w-full h-64 group-image">
            <img
              src={fileData.previewUrl}
              alt="Preview"
              className="w-full h-full object-contain bg-black/40 border border-cyan-900/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-image-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFileData(null);
                }}
                className="p-2 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-wider"
              >
                Purge Data
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-64 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-800 group-hover:border-cyan-500/50 shadow-[0_0_0_1px_rgba(0,0,0,0)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-lg font-cyber text-slate-300 group-hover:text-cyan-200 transition-colors">INITIATE UPLOAD</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">DRAG & DROP OR CLICK [MAX 5MB]</p>
          </div>
        )}
        <input
          title="Upload Image"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      {/* Text Input */}
      <div className="space-y-2 group">
        <label className="text-xs font-bold text-cyan-700 uppercase tracking-widest flex items-center">
          <Terminal className="w-3 h-3 mr-2" />
          Additional Parameters
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter custom directives..."
          className="w-full bg-slate-900/50 border border-slate-800 text-cyan-100 p-4 font-mono text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] outline-none resize-none h-32 transition-all placeholder:text-slate-600"
        />
      </div>

      {/* Error Display */}
      {errorMsg && (
        <div className="p-4 bg-red-950/30 border border-red-500/50 text-red-400 text-sm font-mono flex items-center animate-pulse">
          <span className="mr-2">⚠</span> {errorMsg}
        </div>
      )}

      {/* Action Button */}
      <Button
        size="lg"
        className="w-full py-6 text-lg tracking-widest"
        onClick={handleGenerate}
        disabled={status === AppStatus.ANALYZING || status === AppStatus.GENERATING}
        isLoading={status === AppStatus.ANALYZING || status === AppStatus.GENERATING}
        icon={<Zap className="w-5 h-5" />}
      >
        {status === AppStatus.ANALYZING ? 'ANALYZING DATA...' :
          status === AppStatus.GENERATING ? 'COMPILING CODE...' :
            'EXECUTE BUILD'}
      </Button>
    </div>
  );
};

interface GeneratedAppViewProps {
  status: AppStatus;
  generatedCode: string;
}

const GeneratedAppView: React.FC<GeneratedAppViewProps> = ({ status, generatedCode }) => {
  if (status === AppStatus.IDLE) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-[600px] animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-cyber text-cyan-50 flex items-center">
          <span className="w-2 h-2 bg-cyan-500 shadow-[0_0_10px_#06b6d4] mr-3 animate-pulse"></span>
          OUTPUT_STREAM
        </h2>
        {status === AppStatus.COMPLETE && (
          <div className="text-[10px] text-cyan-800 font-mono border border-cyan-900/30 px-2 py-1">
            GEMINI_2.5_FLASH // RENDER_COMPLETE
          </div>
        )}
      </div>

      {status === AppStatus.GENERATING || status === AppStatus.ANALYZING ? (
        <div className="flex-1 bg-black border border-cyan-900/50 rounded-sm flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
          {/* Scanning Grid Background */}
          <div className="absolute inset-0 z-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(6, 182, 212, .3) 25%, rgba(6, 182, 212, .3) 26%, transparent 27%, transparent 74%, rgba(6, 182, 212, .3) 75%, rgba(6, 182, 212, .3) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>

          <div className="relative z-10">
            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <Loader2 className="w-20 h-20 text-cyan-400 animate-spin relative z-10" />
          </div>

          <div className="space-y-3 z-10 max-w-md">
            <h3 className="text-2xl font-cyber text-white tracking-wider animate-pulse">PROCESSING...</h3>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-progress"></div>
            </div>
            <p className="text-cyan-700 font-mono text-xs mt-2">
              {'>'} Parsing Visual Data...<br />
              {'>'} Generating Component Logic...<br />
              {'>'} Applying Styles...
            </p>
          </div>
        </div>
      ) : (
        <CodePreview code={generatedCode} />
      )}
    </div>
  );
};

// --- Main Logic ---

interface AppContentProps {
  apiKey: string;
}

const AppContent: React.FC<AppContentProps> = ({ apiKey }) => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [prompt, setPrompt] = useState('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Route Synchronization
  // This ensures that if the user hits the browser Back button to go to '/',
  // the app status resets to IDLE so the WelcomeView renders correctly with inputs preserved.
  useEffect(() => {
    if (location.pathname === '/' && status === AppStatus.COMPLETE) {
      setStatus(AppStatus.IDLE);
      setGeneratedCode('');
      setErrorMsg(null);
    }
  }, [location.pathname, status]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("File size too large. Please upload an image under 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Only image files are supported.");
      return;
    }

    try {
      const { base64, mimeType } = await fileToGenerativePart(file);
      const previewUrl = URL.createObjectURL(file);
      setFileData({ file, base64, mimeType, previewUrl });
    } catch (err) {
      setErrorMsg("Failed to process image.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleGenerate = async () => {
    if (!prompt && !fileData) {
      setErrorMsg("Please provide a prompt or an image.");
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setErrorMsg(null);

    // Navigate immediately to the artifact view to show loading state
    navigate('/artifact');

    try {
      setStatus(AppStatus.GENERATING);

      const code = await generateArtifact(
        prompt,
        fileData?.base64,
        fileData?.mimeType,
        apiKey
      );

      setGeneratedCode(code);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Something went wrong during generation.");
      // On error, stay on artifact view but maybe we could go back. 
      // For now, let's go back so they can retry.
      navigate('/');
    }
  };

  const handleReset = () => {
    // We reset the system status and errors, but we PRESERVE the prompt and fileData.
    // This allows the user to click "Reset System" to go back and edit their input
    // without having to re-upload or re-type everything.
    setStatus(AppStatus.IDLE);
    setGeneratedCode('');
    setErrorMsg(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-cyan-50 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      <BackgroundEffect />
      <Header showReset={status === AppStatus.COMPLETE} onReset={handleReset} />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <WelcomeView
                prompt={prompt}
                setPrompt={setPrompt}
                fileData={fileData}
                setFileData={setFileData}
                handleFileSelect={handleFileSelect}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleGenerate={handleGenerate}
                status={status}
                errorMsg={errorMsg}
              />
            }
          />
          <Route
            path="/artifact"
            element={
              <GeneratedAppView
                status={status}
                generatedCode={generatedCode}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .animate-grid-scroll {
          animation: grid-move 4s linear infinite;
        }
        @keyframes neon-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 5px rgba(6,182,212,0.6));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(6,182,212,0.9)) drop-shadow(0 0 10px rgba(168,85,247,0.5));
          }
        }
        .animate-neon-pulse {
          animation: neon-pulse 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

interface AppProps {
  apiKey?: string;
}

const App: React.FC<AppProps> = ({ apiKey }) => {
  // Get API key from props, or try localStorage as fallback for standalone mode
  const effectiveApiKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') || '' : '');

  return (
    <HashRouter>
      <AppContent apiKey={effectiveApiKey} />
    </HashRouter>
  );
};

export default App;