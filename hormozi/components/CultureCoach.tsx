
import React, { useState, useMemo } from 'react';
import { GeminiService } from '../services/gemini';

interface CultureCoachProps {
  apiKey: string;
}

const CultureCoach: React.FC<CultureCoachProps> = ({ apiKey }) => {
  const gemini = useMemo(() => apiKey ? new GeminiService(apiKey) : null, [apiKey]);
  const [feedback, setFeedback] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      if (!gemini) throw new Error('API Key not configured');
      const result = await gemini.auditCultureFeedback(feedback);
      setAnalysis(result || 'No analysis available.');
    } catch (err) {
      setAnalysis('Error connecting to AI mentor. Ensure API Key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-extrabold mb-2">Culture Coach</h2>
        <p className="text-neutral-400">Moving from conflict-avoidant (Nice) to growth-focused (Kind).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col h-fit">
          <h3 className="text-xl font-bold mb-4">Feedback Auditor</h3>
          <p className="text-sm text-neutral-500 mb-6 italic">"Nice is avoiding difficult conversations to spare feelings. Kind is having them to help the person succeed."</p>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-4 h-40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
            placeholder="Type the feedback you plan to give (e.g., 'You've been slacking lately and it's annoying')"
          />

          <button
            onClick={handleAudit}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
          >
            {loading ? 'Analyzing Feedback...' : 'Audit for Hormozi Standard'}
          </button>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5 bg-neutral-900/30 overflow-y-auto max-h-[500px]">
          <h3 className="text-xl font-bold mb-4">The "Kind" Reframe</h3>
          {analysis ? (
            <div className="prose prose-invert prose-sm">
              <div className="whitespace-pre-wrap text-neutral-300">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-600 py-12">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Audit your feedback to see the analysis here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-neutral-900">
          <span className="text-xs font-bold text-red-500 uppercase tracking-tighter">Avoid</span>
          <h4 className="font-bold">Insult</h4>
          <p className="text-xs text-neutral-500">Emotional and non-actionable judgements like "You're lazy."</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-neutral-900">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Practice</span>
          <h4 className="font-bold">Criticism</h4>
          <p className="text-xs text-neutral-500">Objective discrepancy between outcome and target.</p>
        </div>
      </div>
    </div>
  );
};

export default CultureCoach;
