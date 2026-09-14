import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score }];

  // Read the state tokens so the gauge follows the active theme.
  const token = (name: string, fallback: string) =>
    typeof window === 'undefined'
      ? fallback
      : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  const fill =
    score >= 80 ? token('--positive', '#2f6f4e')
    : score >= 50 ? token('--working', '#b5730a')
    : token('--destructive', '#a32f1e');

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#333' }}
            dataKey="value"
            cornerRadius={30}
            fill={fill}
            className="filter"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-5xl font-bold text-ink drop-">{score}</span>
        <span className="text-[10px] text-ink uppercase tracking-[0.2em] mt-1">System Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;