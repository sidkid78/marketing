
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LIFE_CYCLE_DATA } from '../constants';

const LifeCycleChart: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-extrabold mb-2">The Entrepreneur Life Cycle</h2>
        <p className="text-neutral-400">Every journey follows this emotional arc. The split at Phase 4 determines your life.</p>
      </header>

      <div className="glass rounded-3xl p-8 border border-white/5 h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={LIFE_CYCLE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMorale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDifficulty" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" fontSize={10} interval={0} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="morale" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMorale)" name="Morale" />
            <Area type="monotone" dataKey="difficulty" stroke="#ef4444" fillOpacity={1} fill="url(#colorDifficulty)" name="Complexity" />
            <ReferenceLine x="Valley of Despair" stroke="#ef4444" label={{ position: 'top', value: 'BOSS FIGHT', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-white/5">
          <h4 className="text-blue-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Phase 1 & 2</h4>
          <h3 className="text-lg font-bold mb-2 text-white">The Dive</h3>
          <p className="text-sm text-neutral-400">You start with Uninformed Optimism. You end with Informed Pessimism—realizing the task is significantly more difficult than you thought.</p>
        </div>
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <h4 className="text-red-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Phase 3 & 4</h4>
          <h3 className="text-lg font-bold mb-2 text-white">The Doom Loop Split</h3>
          <p className="text-sm text-neutral-400">In the Valley of Despair, the "Woman in the Red Dress" appears. If you jump ship, you live the same 6 months for 20 years.</p>
        </div>
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <h4 className="text-emerald-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Phase 5 & 6</h4>
          <h3 className="text-lg font-bold mb-2 text-white">The Ascent</h3>
          <p className="text-sm text-neutral-400">Informed Optimism is mastery. You understand the challenges AND the solutions. Compounding finally begins.</p>
        </div>
      </div>
    </div>
  );
};

export default LifeCycleChart;
