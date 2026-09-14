
import React, { useState } from 'react';
import { FearScenario } from '../types';

const FearNeutralizer: React.FC = () => {
  const [scenarios, setScenarios] = useState<FearScenario[]>([
    { 
      id: '1', 
      step: 'I quit my job to start a business.', 
      impact: 'I fail publicly and everyone whose opinion I care about thinks I am a joke (SHAME).', 
      mitigation: 'I realize shame is just a feeling; I have a concrete story for my next job interview; I won\'t die.' 
    },
  ]);

  const addScenario = () => {
    setScenarios([...scenarios, { id: Date.now().toString(), step: '', impact: '', mitigation: '' }]);
  };

  const updateScenario = (id: string, field: keyof FearScenario, value: string) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-extrabold mb-2">The Fear Neutralizer</h2>
        <p className="text-ink-soft">Fear thrives in the vague. Let's engage your Prefrontal Cortex with specifics.</p>
      </header>

      <div className="bg-destructive/10 border border-destructive/30 p-8 rounded-3xl">
        <h3 className="text-destructive font-bold flex items-center gap-2 mb-4 uppercase text-xs">
          The Boss Fight: Shame
        </h3>
        <p className="text-ink italic mb-6">
          "The first step is the courage to be willing to be wrong and to have Shame by failing at things in front of people whose opinions you care about."
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/30">
            <span className="font-bold text-destructive block mb-1">Guaranteed Bad (Safe Job)</span>
            Staying miserable is 100% certainty of a life you don't want. This is a "Guaranteed Bad."
          </div>
          <div className="bg-positive/10 p-4 rounded-xl border border-positive/30">
            <span className="font-bold text-positive block mb-1">Chance at Good (Starting)</span>
            Uncertainty is where the "Chance at Good" lives. It is the only way his dream dies and yours lives.
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 border border-rule">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="bg-muted text-ink p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </span>
          Amygdala-to-Logic Mapping
        </h3>

        <div className="space-y-4">
          {scenarios.map((s) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-bench rounded-2xl border border-rule relative group">
              <div>
                <label className="text-[10px] uppercase font-bold text-ink0 mb-2 block">Vague Terror (Amygdala)</label>
                <textarea 
                  value={s.step} 
                  onChange={(e) => updateScenario(s.id, 'step', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none" 
                  placeholder="e.g. 'I'll fail and everyone will hate me'"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-ink0 mb-2 block">Actual Cost (The Shame)</label>
                <textarea 
                  value={s.impact} 
                  onChange={(e) => updateScenario(s.id, 'impact', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none text-destructive" 
                  placeholder="Who will actually judge you?"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-ink0 mb-2 block">If-Then Logic (Prefrontal)</label>
                <textarea 
                  value={s.mitigation} 
                  onChange={(e) => updateScenario(s.id, 'mitigation', e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none text-positive" 
                  placeholder="What is your plan when this happens?"
                />
              </div>
              <button 
                onClick={() => removeScenario(s.id)}
                className="absolute -top-2 -right-2 bg-destructive/10 text-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={addScenario}
          className="mt-6 w-full py-4 border-2 border-dashed border-rule rounded-2xl text-ink0 hover:text-ink hover:border-rule transition-all font-bold uppercase text-xs"
        >
          + Break Down Another Fear
        </button>
      </div>

      <div className="glass p-8 rounded-3xl border border-rule">
        <h4 className="text-lg font-bold mb-4">"Mile Wide, Inch Deep"</h4>
        <p className="text-sm text-ink-soft leading-relaxed italic">
          From a distance, the ocean of risk looks monstrous and impossible to cross. But once you step in, you realize it's only an inch deep. You won't drown. You'll just find solid ground.
        </p>
      </div>
    </div>
  );
};

export default FearNeutralizer;
