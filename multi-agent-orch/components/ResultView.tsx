import React from 'react';
import { OrchestratorResult } from '../types';
import { Sparkles, Timer, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultViewProps {
  result: OrchestratorResult;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in fade-in duration-700">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-1"></div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
             <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Final Synthesis</h2>
        </div>
        
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-indigo-200 prose-a:text-indigo-400">
          <ReactMarkdown>{result.summary}</ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-6 text-sm text-slate-500">
           <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <span>Total Time: {(result.totalDurationMs / 1000).toFixed(2)}s</span>
           </div>
           <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Total Tokens: {result.totalTokens.toLocaleString()}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>Status: {result.success ? 'Success' : 'Partial/Failed'}</span>
           </div>
        </div>
      </div>
    </div>
  );
};