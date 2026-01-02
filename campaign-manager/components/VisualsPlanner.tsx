import React, { useState } from 'react';
import { generateVisualConcept } from '../services/geminiService';
import { VisualConcept } from '../types';
import { Image as ImageIcon, Sparkles, Loader2, Download } from 'lucide-react';

export const VisualsPlanner: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisualConcept | null>(null);

  const handleGenerate = async () => {
    if (!concept) return;
    setLoading(true);
    const data = await generateVisualConcept(concept);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Visual Asset Studio</h2>
          </div>
          
          <p className="text-slate-600 mb-6">
            Create on-brand visuals for your campaign. Describe a statistic or concept, and our AI will generate an infographic style image suitable for Twitter.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What do you want to visualize?
              </label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. A comparison chart showing the cost of assisted living vs. home modification..."
                className="w-full p-4 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !concept}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-white shadow-md flex justify-center items-center space-x-2
                ${loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}
                transition-all
              `}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              <span>{loading ? 'Designing...' : 'Generate Visual'}</span>
            </button>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <h3 className="font-bold text-purple-900 mb-2">Style Guide: Austin AgeTech</h3>
          <ul className="list-disc list-inside text-sm text-purple-800 space-y-2">
            <li>Use Blue (#2563EB) for trust and technology.</li>
            <li>Use Clean lines and ample whitespace.</li>
            <li>Avoid "frail" imagery; focus on empowerment and activity.</li>
            <li>Fonts should be highly legible (Sans-serif).</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-6 min-h-[400px]">
        {loading ? (
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Rendering pixels...</p>
          </div>
        ) : result ? (
          <div className="w-full space-y-4">
            <div className="bg-white p-2 rounded-lg shadow-lg">
              {result.imageBase64 ? (
                  <img 
                    src={`data:image/png;base64,${result.imageBase64}`} 
                    alt="Generated Visual" 
                    className="w-full h-auto rounded"
                  />
              ) : (
                  <div className="h-64 bg-slate-200 flex items-center justify-center text-slate-500 italic">
                      Image generation failed, but description is available.
                  </div>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">AI Description</p>
                <p className="text-slate-700 text-sm">{result.description}</p>
            </div>
            <button className="w-full py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center justify-center">
                <Download size={16} className="mr-2" /> Save to Assets
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Generated visuals will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
