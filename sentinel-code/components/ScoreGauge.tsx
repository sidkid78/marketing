import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score }];

  let fill = '#00f0ff'; // low (cyan)
  if (score >= 80) fill = '#39ff14'; // high (green)
  else if (score >= 50) fill = '#fcee0a'; // med (yellow)
  else fill = '#ff00ff'; // critical (magenta/red)

  return (
    <div className="relative w-48 h-48 mx-auto filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
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
            className="filter drop-shadow-[0_0_5px_currentColor]"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-5xl font-bold font-mono text-white drop-shadow-md">{score}</span>
        <span className="text-[10px] text-[#00f0ff] uppercase tracking-[0.2em] mt-1 font-mono">System Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;