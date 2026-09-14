
import React, { useState, useMemo } from 'react';
import { BusinessIdea } from '../types';
import { GeminiService } from '../services/gemini';

interface IdeaValidatorProps {
  apiKey: string;
}

const IdeaValidator: React.FC<IdeaValidatorProps> = ({ apiKey }) => {
  const gemini = useMemo(() => apiKey ? new GeminiService(apiKey) : null, [apiKey]);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([
    { name: 'Nasal Breathing Solution', category: 'Pain', description: 'Decades of personal struggle and failed surgeries turned into product expertise.', score: 95, isMissionary: true },
  ]);
  const [newIdea, setNewIdea] = useState<Partial<BusinessIdea>>({ category: 'Pain', isMissionary: true });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addIdea = () => {
    if (!newIdea.name || !newIdea.description) return;
    const base = newIdea.category === 'Profession' ? 85 : newIdea.category === 'Pain' ? 80 : 70;
    setIdeas([...ideas, { ...newIdea, score: Math.floor(Math.random() * 15) + base } as BusinessIdea]);
    setNewIdea({ name: '', description: '', category: 'Pain', isMissionary: true });
  };

  const handleAudit = async () => {
    if (!newIdea.description) return;
    setLoading(true);
    try {
      if (!gemini) throw new Error('API Key not configured');
      const result = await gemini.auditBrandStory(newIdea.description);
      setAnalysis(result ?? "No analysis returned.");
    } catch (e) {
      setAnalysis("Audit failed. Check API key.");
    } finally {
      setLoading(false);
    }
  };

  const getAdvantageText = (category?: string) => {
    switch (category) {
      case 'Pain': return "The Story Advantage: You are the customer. Your deep knowledge of the nuances makes you the most authentic marketer in the world.";
      case 'Profession': return "The Validated Shortcut: People have already proven they will exchange money for this. Fractionalize it and keep the margin.";
      case 'Passion': return "The Obsession Edge: You know the business down to the 'cost of a single kernel of popcorn.' Competitors cannot replicate your depth.";
      default: return "";
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-extrabold mb-2">The 3Ps Framework</h2>
        <p className="text-ink-soft">Features are commoditized. Is your business logic or narrative-driven?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-8 border border-rule space-y-6">
          <h3 className="text-xl font-bold">Concept Analysis</h3>
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-bench rounded-xl border border-rule">
              <button
                onClick={() => setNewIdea({ ...newIdea, isMissionary: true })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newIdea.isMissionary ? 'bg-signal text-primary-foreground' : 'text-ink0'}`}
              >
                MISSIONARY (Narrative)
              </button>
              <button
                onClick={() => setNewIdea({ ...newIdea, isMissionary: false })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!newIdea.isMissionary ? 'bg-destructive/10 text-destructive' : 'text-ink0'}`}
              >
                MERCENARY (Logic)
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-ink0 uppercase mb-1 block">Idea Name</label>
              <input
                type="text"
                value={newIdea.name || ''}
                onChange={(e) => setNewIdea({ ...newIdea, name: e.target.value })}
                className="w-full bg-bench border border-rule rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rule"
                placeholder="e.g. Fractional Marketing Lead"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink0 uppercase mb-1 block">Pathway</label>
              <select
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value as any })}
                className="w-full bg-bench border border-rule rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rule"
              >
                <option value="Pain">Pain (Personal Frustration)</option>
                <option value="Profession">Profession (Proven Economy)</option>
                <option value="Passion">Passion (Obsessive Expertise)</option>
              </select>
            </div>
            <div className="p-5 bg-positive/10 rounded-2xl border border-positive/30 text-xs text-positive leading-relaxed italic">
              {getAdvantageText(newIdea.category)}
            </div>
            <div>
              <label className="text-xs font-bold text-ink0 uppercase mb-1 block">The Brand Narrative</label>
              <textarea
                value={newIdea.description || ''}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="w-full bg-bench border border-rule rounded-xl px-4 py-3 h-24 focus:outline-none focus:ring-2 focus:ring-rule"
                placeholder="What is the visceral 'Why' behind this business?"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAudit}
                disabled={loading}
                className="flex-1 py-4 bg-sheet hover:bg-muted rounded-xl font-bold transition-all text-sm border border-rule"
              >
                {loading ? 'Auditing...' : 'Audit Narrative'}
              </button>
              <button
                onClick={addIdea}
                className="flex-1 py-4 bg-positive hover:bg-positive rounded-xl font-bold transition-all text-sm"
              >
                Add Concept
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {analysis ? (
            <div className="glass p-6 rounded-3xl border border-rule bg-muted animate-in slide-in-from-right-4">
              <h3 className="text-sm font-bold text-ink uppercase mb-4">Story Audit Results</h3>
              <div className="text-xs text-ink whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
              <button onClick={() => setAnalysis(null)} className="mt-4 text-[10px] text-ink0 hover:text-ink underline">Close Audit</button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold">Validated Paths</h3>
                <span className="text-[10px] text-ink0 font-bold uppercase">Compounding Intensity</span>
              </div>
              {ideas.map((idea, i) => (
                <div key={i} className="glass p-6 rounded-2xl border border-rule flex items-center justify-between group hover:border-positive/30 transition-all">
                  <div className="flex-1 mr-4">
                    <div className="flex gap-2 mb-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${idea.category === 'Pain' ? 'bg-destructive/10 text-destructive' :
                        idea.category === 'Profession' ? 'bg-muted text-ink' :
                          'bg-muted text-ink'
                        }`}>
                        {idea.category}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${idea.isMissionary ? 'bg-muted text-ink' : 'bg-muted text-ink-soft'
                        }`}>
                        {idea.isMissionary ? 'Missionary' : 'Mercenary'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold">{idea.name}</h4>
                    <p className="text-xs text-ink0 line-clamp-2">{idea.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-positive">{idea.score}%</div>
                    <div className="text-[9px] text-ink0 uppercase font-bold">Enterprise Value</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaValidator;
