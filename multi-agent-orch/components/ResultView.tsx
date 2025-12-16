import React from 'react';
import { OrchestratorResult } from '../types';
import { Sparkles, Timer, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultViewProps {
  result: OrchestratorResult;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] overflow-hidden animate-in fade-in duration-700 relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] via-[#ff00ff] to-[#00f0ff] animate-gradient-x"></div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20"></div>

      <div className="p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6 border-b border-[#00f0ff]/20 pb-4">
          <div className="p-2 bg-[#00f0ff]/10 rounded-lg border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <Sparkles className="w-6 h-6 text-[#00f0ff]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-widest font-mono uppercase">Final Synthesis</h2>
            <p className="text-[10px] text-[#00f0ff] tracking-[0.2em] font-mono">ORCHESTRATION COMPLETE</p>
          </div>
        </div>

        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-[#00f0ff] prose-strong:text-[#ff00ff] prose-code:text-[#39ff14] max-w-none font-mono text-sm leading-relaxed">
          <ReactMarkdown>{result.summary}</ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t border-[#00f0ff]/20 flex flex-wrap gap-6 text-sm font-mono">
          <div className="flex items-center gap-2 text-[#00f0ff]">
            <Timer className="w-4 h-4" />
            <span>TIME: {(result.totalDurationMs / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex items-center gap-2 text-[#ff00ff]">
            <Zap className="w-4 h-4" />
            <span>TOKENS: {result.totalTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-sm ${result.success ? 'bg-[#39ff14] shadow-[0_0_10px_#39ff14]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
            <span className={result.success ? 'text-[#39ff14]' : 'text-red-500'}>STATUS: {result.success ? 'SUCCESS' : 'FAILED'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};