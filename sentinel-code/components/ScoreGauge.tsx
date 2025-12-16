import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score }];
  
  let fill = '#3b82f6'; // primary
  if (score >= 80) fill = '#10b981'; // success
  else if (score >= 50) fill = '#f59e0b'; // warning
  else fill = '#ef4444'; // danger

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={10} 
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
            background
            dataKey="value"
            cornerRadius={30}
            fill={fill}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold font-mono text-white">{score}</span>
        <span className="text-xs text-secondary uppercase tracking-wider">Overall Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;