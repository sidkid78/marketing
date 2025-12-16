import React from 'react';
import type { PerformanceAnalysis } from '../../types';
import { Card } from '../ui/Card';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';

interface PerformanceAnalysisDashboardProps {
  data: PerformanceAnalysis;
}

const statusClasses = {
  good: 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30',
  on_target: 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30',
  warning: 'bg-[#ff00ff]/10 text-[#ff00ff] border-[#ff00ff]/30',
};

export const PerformanceAnalysisDashboard: React.FC<PerformanceAnalysisDashboardProps> = ({ data }) => {
  const summaryFlag = data.summary.includes('⚠️') ? 'warning' : data.summary.includes('✅') ? 'good' : 'on_target';

  const formatRecommendationsForClipboard = (recommendations: string[]): string => {
    return `Adjustment Recommendations:\n${recommendations.map(r => `- ${r}`).join('\n')}`;
  };

  return (
    <Card className="!p-0 overflow-hidden bg-black/40 border-[#00f0ff]/20">
      <div className={`p-6 border-l-4 ${statusClasses[summaryFlag]}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold font-mono tracking-wider">CAMPAIGN SUMMARY</h3>
          <ClipboardCopyButton textToCopy={`Campaign Summary:\n${data.summary}`} />
        </div>
        <p className="mt-1 font-mono text-sm">{data.summary}</p>
      </div>

      <div className="p-6">
        <h4 className="text-md font-bold text-white mb-4 font-mono tracking-wider">METRIC BREAKDOWN</h4>
        <div className="space-y-4">
          {data.analysis.map((item, i) => (
            <div key={i} className={`p-4 border rounded-lg ${statusClasses[item.flag]} backdrop-blur-sm`}>
              <div className="flex justify-between items-center">
                <p className="font-bold font-mono">{item.label}: <span className="text-lg text-white ml-2">{item.value}</span></p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current bg-black/40 uppercase tracking-widest`}>{item.status}</span>
              </div>
              <p className="text-xs mt-1 opacity-80">{item.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-[#00f0ff]/5 border-t border-[#00f0ff]/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-bold text-[#00f0ff] font-mono tracking-wider">ADJUSTMENT RECOMMENDATIONS</h4>
          <ClipboardCopyButton textToCopy={formatRecommendationsForClipboard(data.adjustment_recommendations)} />
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-300 font-mono text-sm">
          {data.adjustment_recommendations.map((rec, i) => (
            <li key={i} className="marker:text-[#ff00ff]">{rec}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
