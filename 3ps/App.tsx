
import React, { useState, useCallback, useEffect } from 'react';
import {
  Briefcase,
  Target,
  Settings,
  Zap,
  ChevronRight,
  RefreshCcw,
  Download,
  AlertCircle,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  ImageIcon,
  Moon,
  Sun,
  Terminal,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { AppStatus, StrategistInput, StrategistOutput } from './types';
import { generateStrategy } from './services/geminiService';

interface AppProps {
  apiKey?: string;
}

const App: React.FC<AppProps> = ({ apiKey }) => {
  const [input, setInput] = useState<StrategistInput>({
    userContext: '',
    targetAudience: '',
    outputStyle: 'Strategic Report'
  });
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [output, setOutput] = useState<StrategistOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleGenerate = async () => {
    if (!input.userContext.trim()) return;

    setStatus(AppStatus.THINKING);
    setError(null);
    setOutput(null);

    try {
      const result = await generateStrategy(input, apiKey);
      setOutput(result);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'System Overload: Failed to decrypt niche strategy.');
      setStatus(AppStatus.ERROR);
    }
  };

  const copyToClipboard = () => {
    if (output?.synthesis?.markdown) {
      navigator.clipboard.writeText(output.synthesis.markdown);
      alert('Report uploaded to local buffer.');
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setOutput(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      {/* HUD Header */}
      <header className="bg-white/80 dark:bg-black/90 backdrop-blur-md border-b-2 border-cyan-500/30 dark:border-cyan-500/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-fuchsia-600 rounded-sm flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] glitch-hover cursor-pointer">
              <Terminal size={24} />
            </div>
            <div>
              <h1 className="mono text-xl font-bold tracking-tighter uppercase neon-text-cyan italic">
                3Ps_Strategist <span className="text-fuchsia-500 font-black">v2.0</span>
              </h1>
              <p className="text-[10px] mono text-slate-500 dark:text-cyan-400 font-bold uppercase tracking-widest leading-none">
                Neural Niche Interface // High_Leverage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-none border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              aria-label="Toggle HUD Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {status === AppStatus.COMPLETED && (
              <div className="flex items-center gap-3">
                <button
                  onClick={reset}
                  className="hidden sm:flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/10 px-3 py-1.5 border border-fuchsia-500/50 text-xs font-bold uppercase transition-all"
                >
                  <RefreshCcw size={14} />
                  Re-Init
                </button>
                <button
                  onClick={copyToClipboard}
                  className="bg-cyan-600 dark:bg-cyan-700 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-cyan-500 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                >
                  <Download size={14} />
                  Download Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Interface */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white dark:bg-slate-950 p-6 rounded-none border-t-4 border-l-4 border-cyan-500 dark:border-cyan-600 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rotate-45 translate-x-8 -translate-y-8"></div>

            <h2 className="mono text-sm font-black uppercase flex items-center gap-2 border-b dark:border-cyan-900 pb-4 text-cyan-600 dark:text-cyan-400 tracking-tighter">
              <Settings size={18} />
              Input_Buffer.sys
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-cyan-600 uppercase mb-2 flex items-center gap-1.5 tracking-widest">
                  <Briefcase size={12} /> Neural_History.log
                </label>
                <textarea
                  className="w-full min-h-[160px] p-3 border-2 border-slate-200 dark:border-cyan-900 dark:bg-black dark:text-cyan-100 rounded-none focus:border-fuchsia-500 transition-all text-xs outline-none resize-none mono"
                  placeholder="[System Prompt: Share professional trajectory + solving key friction + obsessive edge details...]"
                  value={input.userContext}
                  onChange={(e) => setInput({ ...input, userContext: e.target.value })}
                  disabled={status === AppStatus.THINKING}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-cyan-600 uppercase mb-2 flex items-center gap-1.5 tracking-widest">
                  <Target size={12} /> Target_Sector
                </label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-slate-200 dark:border-cyan-900 dark:bg-black dark:text-cyan-100 rounded-none focus:border-fuchsia-500 transition-all text-xs outline-none mono"
                  placeholder="[Node ID: e.g. Solo Ops, Mid-Market HR...]"
                  value={input.targetAudience}
                  onChange={(e) => setInput({ ...input, targetAudience: e.target.value })}
                  disabled={status === AppStatus.THINKING}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-cyan-600 uppercase mb-2 flex items-center gap-1.5 tracking-widest">
                  <ChevronRight size={12} /> Format_Stream
                </label>
                <select
                  className="w-full p-3 border-2 border-slate-200 dark:border-cyan-900 dark:bg-black dark:text-cyan-100 rounded-none focus:border-fuchsia-500 transition-all text-xs outline-none bg-white dark:bg-black mono"
                  value={input.outputStyle}
                  onChange={(e) => setInput({ ...input, outputStyle: e.target.value })}
                  disabled={status === AppStatus.THINKING}
                >
                  <option>Strategic Report</option>
                  <option>Marketing Brief</option>
                  <option>Executive Summary</option>
                  <option>Investor Pitch Narrative</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === AppStatus.THINKING || !input.userContext}
                className={`w-full py-5 rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden ${status === AppStatus.THINKING
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white glitch-hover active:scale-[0.98]'
                  }`}
              >
                {status === AppStatus.THINKING ? (
                  <>
                    <RefreshCcw className="animate-spin" size={18} />
                    Processing_Core...
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    Engage_Synthesis
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Cyber Tips */}
          <div className="bg-black text-cyan-400 p-6 rounded-none border-b-4 border-r-4 border-fuchsia-600 shadow-xl relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-500"></div>
              <div className="w-1.5 h-1.5 bg-fuchsia-500"></div>
            </div>
            <h3 className="mono text-xs font-black mb-4 flex items-center gap-2 uppercase">
              <Cpu size={16} className="text-fuchsia-500" />
              Niche_Logic.exe
            </h3>
            <ul className="text-[11px] mono space-y-4 font-medium">
              <li className="flex gap-3 border-l-2 border-cyan-500/30 pl-3">
                <span className="text-fuchsia-500 font-bold">PAIN:</span>
                <span>Deep empathy triggers high-conversion neural responses.</span>
              </li>
              <li className="flex gap-3 border-l-2 border-cyan-500/30 pl-3">
                <span className="text-fuchsia-500 font-bold">PROF:</span>
                <span>Fractionalize proven high-value economic channels.</span>
              </li>
              <li className="flex gap-3 border-l-2 border-cyan-500/30 pl-3">
                <span className="text-fuchsia-500 font-bold">PASS:</span>
                <span>Obsessive depth creates an uncopyable moated edge.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* HUD Output */}
        <div className="lg:col-span-8">
          {status === AppStatus.IDLE && (
            <div className="h-full min-h-[600px] border-2 border-dashed border-cyan-500/20 dark:border-cyan-500/10 rounded-none flex flex-col items-center justify-center text-slate-400 dark:text-cyan-900 p-8 text-center relative">
              <div className="w-20 h-20 border border-cyan-500/20 rounded-none flex items-center justify-center mb-6">
                <BrainCircuit size={40} className="opacity-20" />
              </div>
              <h3 className="mono text-lg font-black uppercase text-slate-400 dark:text-cyan-800 tracking-tighter mb-2">Interface_Ready</h3>
              <p className="max-w-xs text-[10px] mono uppercase font-bold tracking-widest opacity-60">Waiting for user telemetry data stream...</p>
            </div>
          )}

          {status === AppStatus.THINKING && (
            <div className="h-full min-h-[600px] bg-white dark:bg-slate-950 border border-cyan-500/30 dark:border-cyan-500/20 rounded-none p-12 flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
              <div className="cyber-scanner"></div>
              <div className="relative">
                <div className="w-32 h-32 border border-fuchsia-500/30 dark:border-fuchsia-500/10 rounded-full flex items-center justify-center">
                  <Zap size={48} className="text-fuchsia-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 w-32 h-32 border-2 border-cyan-500 rounded-full animate-spin border-t-transparent border-l-transparent"></div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-black mono uppercase italic text-cyan-600 dark:text-cyan-400 neon-text-cyan">Decompiling_Leverage</h3>
                <p className="text-slate-400 dark:text-cyan-700 max-w-sm text-xs mono uppercase font-bold tracking-tighter">
                  Critiquing assumptions // Mapping neural corridors // Painting visual vision...
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-[10px] mono font-black text-cyan-600 dark:text-cyan-700 uppercase tracking-widest">
                  <span>Logic_Core_Sync</span>
                  <span className="text-fuchsia-500">99%</span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-cyan-950 rounded-none overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 animate-[loading_1.5s_linear_infinite]" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="bg-white dark:bg-black border-2 border-red-500 p-8 flex items-start gap-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <div className="bg-red-500/10 p-3 border border-red-500">
                <ShieldAlert className="text-red-500" size={32} />
              </div>
              <div>
                <h3 className="text-red-500 mono font-black text-xl uppercase italic mb-2 tracking-tighter">Critical_Failure.sys</h3>
                <p className="text-slate-600 dark:text-red-400 text-xs mono font-bold uppercase mb-6 leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={handleGenerate}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Force_Restart
                </button>
              </div>
            </div>
          )}

          {status === AppStatus.COMPLETED && output && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
              {/* Quick Look HUD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-black p-5 border-l-4 border-rose-500 dark:border-rose-600 shadow-md">
                  <div className="text-rose-500 font-black text-[9px] uppercase tracking-[0.2em] mb-3 mono">01_Pain_Node</div>
                  <h4 className="font-bold text-xs uppercase mono text-slate-800 dark:text-slate-200 leading-tight">{output.painAnalysis?.storyAdvantage || 'NULL'}</h4>
                </div>
                <div className="bg-white dark:bg-black p-5 border-l-4 border-cyan-500 dark:border-cyan-600 shadow-md">
                  <div className="text-cyan-500 font-black text-[9px] uppercase tracking-[0.2em] mb-3 mono">02_Economy_Node</div>
                  <h4 className="font-bold text-xs uppercase mono text-slate-800 dark:text-slate-200 leading-tight">{output.professionAnalysis?.provenEconomy || 'NULL'}</h4>
                </div>
                <div className="bg-white dark:bg-black p-5 border-l-4 border-fuchsia-500 dark:border-fuchsia-600 shadow-md">
                  <div className="text-fuchsia-500 font-black text-[9px] uppercase tracking-[0.2em] mb-3 mono">03_Edge_Node</div>
                  <h4 className="font-bold text-xs uppercase mono text-slate-800 dark:text-slate-200 leading-tight">{output.passionAnalysis?.obsessiveEdge || 'NULL'}</h4>
                </div>
              </div>

              {/* Neural Vision */}
              {output.imageUrl && (
                <div className="bg-white dark:bg-black border-2 border-cyan-500/50 dark:border-cyan-500/30 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-cyan-500/10 pointer-events-none"></div>
                  <div className="bg-cyan-500/10 dark:bg-cyan-950/40 border-b border-cyan-500/50 px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={14} className="text-cyan-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mono">Visual_Projection.hologram</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75"></div>
                    </div>
                  </div>
                  <img
                    src={output.imageUrl}
                    alt="Synthesis Visualization"
                    className="w-full aspect-[21/9] object-cover filter brightness-90 contrast-110 group-hover:brightness-100 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-6 bg-black/60 backdrop-blur-sm px-3 py-1 border-l-2 border-fuchsia-500">
                    <span className="text-[8px] mono text-white uppercase font-bold tracking-widest">Render_Success // High_Leverage_Visual</span>
                  </div>
                </div>
              )}

              {/* Main Core Synthesis */}
              <div className="bg-white dark:bg-black border-2 border-slate-200 dark:border-cyan-900 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 dark:bg-black text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-cyan-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-cyan-500 flex items-center justify-center text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h3 className="mono text-2xl font-black italic uppercase text-cyan-400 neon-text-cyan tracking-tighter">{output.synthesis?.concept || 'STRATEGY_CONCEPT'}</h3>
                      <p className="text-fuchsia-400 text-[9px] font-black uppercase tracking-[0.3em] mono mt-1">Master_Synthesis_Complete</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowThinking(!showThinking)}
                    className="flex items-center gap-2 text-[10px] mono font-black bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-4 py-2 uppercase tracking-widest transition-all self-end sm:self-auto"
                  >
                    <BrainCircuit size={14} />
                    {showThinking ? 'Hide_Critique' : 'View_Critique'}
                  </button>
                </div>

                {showThinking && (
                  <div className="bg-amber-950/10 dark:bg-cyan-950/20 p-6 border-b border-cyan-500/20 dark:border-cyan-500/10 relative">
                    <div className="absolute top-0 right-0 p-2 text-[8px] mono text-cyan-800 dark:text-cyan-700 font-bold">LOG_ID: {Math.random().toString(36).substr(2, 9)}</div>
                    <h5 className="text-cyan-600 dark:text-cyan-400 font-black text-[10px] mb-3 flex items-center gap-2 uppercase mono">
                      <Terminal size={12} className="text-fuchsia-500" /> System_Critique_Kernel
                    </h5>
                    <p className="text-slate-600 dark:text-cyan-200 text-xs leading-relaxed mono p-4 bg-slate-50 dark:bg-black/40 border-l-2 border-fuchsia-500">
                      "{output.thinkingProcess || 'Thinking process encrypted...'}"
                    </p>
                  </div>
                )}

                <div className="p-10 space-y-10">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-10 h-0.5 bg-fuchsia-500"></span>
                      <h2 className="mono text-lg font-black uppercase italic text-slate-800 dark:text-cyan-400 tracking-tighter">01_Pain_Node</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 mono font-medium">
                      {output.painAnalysis?.frustration || 'NULL'}
                    </p>
                    <div className="bg-slate-50 dark:bg-black p-4 border-l-2 border-fuchsia-500 italic text-slate-500 dark:text-cyan-600 text-xs mono font-bold relative">
                      <div className="absolute -top-2 left-4 px-2 bg-white dark:bg-black text-[8px] text-fuchsia-500 uppercase font-black">Story_Advantage</div>
                      "{output.painAnalysis?.storyAdvantage || 'NULL'}"
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-10 h-0.5 bg-cyan-500"></span>
                      <h2 className="mono text-lg font-black uppercase italic text-slate-800 dark:text-cyan-400 tracking-tighter">02_Economy_Node</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-cyan-900 p-5 relative">
                        <h4 className="text-[9px] font-black text-slate-400 dark:text-cyan-800 uppercase tracking-widest mb-3 mono">Proven_Sector</h4>
                        <p className="text-slate-700 dark:text-cyan-200 font-bold text-xs mono">{output.professionAnalysis?.provenEconomy || 'NULL'}</p>
                      </div>
                      <div className="bg-cyan-500/5 dark:bg-fuchsia-500/5 border border-cyan-500/30 dark:border-fuchsia-500/30 p-5 relative">
                        <h4 className="text-[9px] font-black text-cyan-600 dark:text-fuchsia-400 uppercase tracking-widest mb-3 mono">Fraction_Strategy</h4>
                        <p className="text-cyan-900 dark:text-fuchsia-300 font-black text-xs mono uppercase tracking-tight">{output.professionAnalysis?.fractionalizationStrategy || 'NULL'}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-10 h-0.5 bg-fuchsia-500"></span>
                      <h2 className="mono text-lg font-black uppercase italic text-slate-800 dark:text-cyan-400 tracking-tighter">03_Edge_Node</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 mono font-medium">
                      {output.passionAnalysis?.obsessiveEdge || 'NULL'}
                    </p>
                    <div className="bg-rose-500/5 dark:bg-rose-950/10 border-2 border-rose-500/20 p-6 relative">
                      <div className="absolute -top-3 left-4 px-3 bg-white dark:bg-black text-[9px] text-rose-500 uppercase font-black border border-rose-500/20">Metric: Kernel_Of_Popcorn</div>
                      <p className="text-rose-900 dark:text-rose-400 font-bold text-xs mono italic uppercase leading-tight">
                        {output.passionAnalysis?.selfCorrection || 'NULL'}
                      </p>
                    </div>
                  </section>

                  <section className="bg-black text-cyan-400 p-8 border-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] mt-12 relative">
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-cyan-500 flex items-center justify-center text-black">
                      <Zap size={14} fill="currentColor" />
                    </div>
                    <h2 className="mono text-xl font-black italic uppercase text-white mb-6 border-b border-cyan-500/30 pb-4 tracking-tighter">The_Unfair_Moat</h2>
                    <p className="text-cyan-200 leading-relaxed text-sm font-bold mono uppercase tracking-tight">
                      {output.unfairAdvantage || 'NULL'}
                    </p>
                    <div className="mt-8 pt-6 border-t border-cyan-500/20 flex justify-between items-center text-[8px] mono font-black uppercase text-cyan-700 tracking-[0.4em]">
                      <span>Authorization_Verified</span>
                      <span>Execution_Imminent</span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/50 dark:bg-black border-t border-slate-200 dark:border-cyan-900/50 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mono text-[10px] text-slate-400 dark:text-cyan-900 font-black uppercase tracking-[0.5em]">
            System.Core // Powered_By_Gemini_3_Pro // 3Ps_Logic_Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
