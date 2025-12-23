
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as gemini from './services/geminiService';
import { WorkflowState, PromptLevel } from './types';
import AgentResponseCard from './components/AgentResponseCard';

interface AppProps {
  apiKey?: string;
}

const App: React.FC<AppProps> = ({ apiKey: propApiKey }) => {
  const [apiKey, setApiKey] = useState(propApiKey || '');

  useEffect(() => {
    if (!propApiKey) {
      try {
        const saved = window.localStorage.getItem('GEMINI_API_KEY') || '';
        setApiKey(saved);
      } catch { }
    }
  }, [propApiKey]);
  const [query, setQuery] = useState('');
  const [complexity, setComplexity] = useState('auto');
  const [model, setModel] = useState('auto');
  const [examples, setExamples] = useState(true);

  const [state, setState] = useState<WorkflowState>({
    isProcessing: false,
    currentStep: 0,
  });

  const runWorkflow = async () => {
    if (!query.trim()) return;

    setState({ isProcessing: true, currentStep: 1, analysis: undefined, generation: undefined, review: undefined, error: undefined });

    try {
      const analysis = await gemini.analyzeTask(apiKey, query, complexity);
      setState(prev => ({ ...prev, analysis, currentStep: 2 }));

      const generation = await gemini.generatePrompt(apiKey, query, analysis, model, examples);
      setState(prev => ({ ...prev, generation, currentStep: 3 }));

      const review = await gemini.reviewPrompt(apiKey, query, generation);
      setState(prev => ({ ...prev, review, currentStep: 4, isProcessing: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, error: err.message || 'CRITICAL_SYSTEM_BREACH: Unexpected error.' }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple non-intrusive alert logic
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.05)_0%,transparent_100%)]"></div>

      {/* Header HUD */}
      <header className="border-b border-cyan-500/30 bg-black/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-500/20 group-hover:translate-y-full transition-transform duration-500"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text-cyan flex items-center gap-2">
                PROMPT_ARCHITECT <span className="text-[10px] bg-cyan-500 text-black px-0.5 rounded">v3.0.PRO</span>
              </h1>
              <p className="text-[9px] text-cyan-500/60 font-mono tracking-[0.3em]">NEURAL_INTERFACE_READY</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 1, label: 'SCAN' },
              { id: 2, label: 'SYTH' },
              { id: 3, label: 'AUTH' }
            ].map(step => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rotate-45 ${state.currentStep >= step.id ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,243,255,1)]' : 'bg-slate-800'}`}></div>
                <span className={`text-[10px] font-bold tracking-widest ${state.currentStep >= step.id ? 'text-cyan-400' : 'text-slate-600'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Terminal */}
        <div className="lg:col-span-4 space-y-8">
          <div className="cyber-panel p-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest">DATA_INPUT_STREAM</label>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-cyan-500"></div>
                <div className="w-1 h-1 bg-cyan-500"></div>
              </div>
            </div>

            <textarea
              className="w-full h-48 cyber-input p-5 text-sm font-mono focus:ring-0 resize-none mb-6 placeholder:text-slate-700"
              placeholder="Inject task parameters here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={state.isProcessing}
            />

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">COMPLEXITY_MODE</label>
                <select
                  title="Select the complexity mode for the prompt generation"
                  className="w-full cyber-input p-3 text-xs outline-none bg-black cursor-pointer"
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  disabled={state.isProcessing}
                >
                  <option value="auto">✨ AI_OPTIMIZED</option>
                  <option value="low">SIMPLE_NODE</option>
                  <option value="medium">LINEAR_WORKFLOW</option>
                  <option value="high">MULTIPLE_AGENT_LOGIC</option>
                  <option value="autonomous">FULL_AUTONOMY</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">NEURAL_TARGET</label>
                <select
                  title="Select the neural target for the prompt generation"
                  className="w-full cyber-input p-3 text-xs outline-none bg-black cursor-pointer"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={state.isProcessing}
                >
                  <option value="auto">🎯 AUTO_ROUTING</option>
                  <option value="gemini-3-pro-preview">GEMINI_3_PRO_MAX</option>
                  <option value="gemini-3-flash-preview">GEMINI_3_FLASH_FAST</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 border border-cyan-500/10 bg-white/5 group hover:border-cyan-500/30 transition-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">INJECT_EXAMPLES</span>
                <button
                  title="Toggle examples"
                  onClick={() => setExamples(!examples)}
                  disabled={state.isProcessing}
                  className={`relative w-10 h-5 rounded-none border transition-all ${examples ? 'border-cyan-500 bg-cyan-500/20' : 'border-slate-800 bg-slate-900'}`}
                >
                  <div className={`absolute top-1 w-2.5 h-2.5 transition-all ${examples ? 'right-1 bg-cyan-400 shadow-[0_0_5px_rgba(0,243,255,1)]' : 'left-1 bg-slate-700'}`}></div>
                </button>
              </div>
            </div>

            <button
              onClick={runWorkflow}
              disabled={state.isProcessing || !query.trim()}
              className={`w-full mt-10 py-4 font-bold text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden group
                ${state.isProcessing || !query.trim()
                  ? 'border border-slate-800 text-slate-700'
                  : 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] active:scale-[0.98]'}`}
            >
              {state.isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  OVERRIDING_LOGIC...
                </span>
              ) : (
                'INITIATE_GENERATION'
              )}
            </button>
          </div>

          {state.error && (
            <div className="p-5 border border-red-500 bg-red-950/20 text-red-500 text-[10px] font-bold font-mono uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                SYSTEM_BREACH_DETECTED
              </div>
              <p>{state.error}</p>
            </div>
          )}
        </div>

        {/* Neural Output Stream */}
        <div className="lg:col-span-8 space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analysis Card */}
            <AgentResponseCard
              role="ANALYST_NODE"
              title="Structural Intelligence"
              status={state.currentStep === 1 ? 'loading' : state.analysis ? 'completed' : 'pending'}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            >
              {state.analysis && (
                <div className="space-y-4">
                  <p className="text-xs opacity-80"><span className="text-cyan-400">// SUMMARY:</span> {state.analysis.task_summary}</p>

                  {state.analysis.grounding_sources && state.analysis.grounding_sources.length > 0 && (
                    <div className="py-3 border-y border-cyan-500/10">
                      <p className="text-[9px] font-bold text-cyan-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse"></div>
                        DATA_GROUNDING_NODES
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {state.analysis.grounding_sources.slice(0, 3).map((source, i) => (
                          <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                            {source.title.substring(0, 20)}...
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className="flex-1 border border-slate-800 p-2 bg-black/30">
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">LOGIC_TIER</p>
                      <p className="text-xs text-green-400 font-bold">{state.analysis.recommended_level}</p>
                    </div>
                    <div className="flex-1 border border-slate-800 p-2 bg-black/30">
                      <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mb-1">NEURAL_ROUTING</p>
                      <p className="text-xs text-purple-400 font-bold truncate">{state.analysis.recommended_target_model.split('-').pop()}</p>
                    </div>
                  </div>
                </div>
              )}
            </AgentResponseCard>

            {/* Engineer Card */}
            <AgentResponseCard
              role="SYNTH_CORE"
              title="Neural Synthesis"
              status={state.currentStep === 2 ? 'loading' : state.generation ? 'completed' : 'pending'}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
            >
              {state.generation && (
                <div className="space-y-4">
                  <p className="text-xs opacity-80 italic"><span className="text-magenta-400">// DESIGN_CHOICE:</span> {state.generation.design_rationale}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/5 border border-white/10">
                      <span className="block text-[8px] text-slate-500">VARS</span>
                      <span className="text-xs font-bold text-cyan-400">{state.generation.variables.length}</span>
                    </div>
                    <div className="text-center p-2 bg-white/5 border border-white/10">
                      <span className="block text-[8px] text-slate-500">STEPS</span>
                      <span className="text-xs font-bold text-magenta-400">{state.generation.workflow.length}</span>
                    </div>
                    <div className="text-center p-2 bg-white/5 border border-white/10">
                      <span className="block text-[8px] text-slate-500">TEMP</span>
                      <span className="text-xs font-bold text-yellow-400">{state.generation.metadata.temperature}</span>
                    </div>
                  </div>
                </div>
              )}
            </AgentResponseCard>
          </div>

          {/* Validation Card - Full Width */}
          <AgentResponseCard
            role="VALIDATOR_AGENT"
            title="System Verification"
            status={state.currentStep === 3 ? 'loading' : state.review ? 'completed' : 'pending'}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          >
            {state.review && (
              <div className="bg-black/40 p-6 border border-white/10 markdown-container prose prose-invert prose-sm max-w-none prose-cyan">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.review}</ReactMarkdown>
              </div>
            )}
          </AgentResponseCard>

          {/* Final Neural Artifact */}
          {state.generation && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-white font-['Orbitron'] tracking-widest flex items-center gap-3">
                  <div className="w-4 h-4 bg-cyan-500 animate-ping absolute rounded-full opacity-20"></div>
                  <div className="w-4 h-4 bg-cyan-500 rounded-full relative"></div>
                  FINAL_ARTIFACT_DECRYPTED
                </h2>
                <button
                  onClick={() => copyToClipboard(state.generation!.rendered_prompt)}
                  className="cyber-button px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  DOWNLOAD_RAW_BUFFER
                </button>
              </div>

              <div className="relative group">
                {/* Glitch Overlay Decorations */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 group-hover:scale-110 transition-transform"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 group-hover:scale-110 transition-transform"></div>

                <div className="bg-slate-900/90 border border-cyan-500/40 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,1)]">
                  <div className="px-8 py-4 bg-black/60 flex items-center justify-between border-b border-cyan-500/20">
                    <div className="flex items-center gap-5">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 tracking-widest font-bold uppercase">{state.generation.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-mono font-bold">
                      <span className="text-slate-600">ENCRYPTION: 256_AES</span>
                      <span className="text-cyan-500/50 tracking-tighter uppercase">{state.generation.metadata.recommended_model}</span>
                    </div>
                  </div>

                  <div className="p-10 overflow-auto max-h-[700px] custom-scrollbar bg-[rgba(0,0,0,0.4)] markdown-container">
                    <div className="prose prose-invert max-w-none prose-emerald prose-headings:text-cyan-400 prose-strong:text-cyan-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.generation.rendered_prompt}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="px-8 py-3 bg-black/60 border-t border-cyan-500/10 flex justify-between items-center">
                    <span className="text-[8px] text-slate-600 font-mono italic">Compiled by ARCHITECT_OS on decentralized_node_77</span>
                    <span className="text-[8px] text-cyan-500/40 font-mono uppercase tracking-[0.5em]">END_OF_TRANSMISSION</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
