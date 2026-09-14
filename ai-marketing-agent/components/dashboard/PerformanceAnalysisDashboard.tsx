import React from 'react';
import type { PerformanceAnalysis } from '../../types';
import { Card } from '../ui/Card';
import { ClipboardCopyButton } from '../ui/ClipboardCopyButton';

interface PerformanceAnalysisDashboardProps {
  data: PerformanceAnalysis;
}

const statusClasses = {
  good: 'bg-positive/10 text-positive border-positive/30',
  on_target: 'bg-signal/10 text-ink border-rule',
  warning: 'bg-signal/10 text-ink-soft border-rule',
};

export const PerformanceAnalysisDashboard: React.FC<PerformanceAnalysisDashboardProps> = ({ data }) => {
  const summaryFlag = data.summary.includes('⚠️') ? 'warning' : data.summary.includes('✅') ? 'good' : 'on_target';

  const formatRecommendationsForClipboard = (recommendations: string[]): string => {
    return `Adjustment Recommendations:\n${recommendations.map(r => `- ${r}`).join('\n')}`;
  };

  return (
    <Card className="!p-0 overflow-hidden bg-sheet border-rule">
      <div className={`p-6 border-l-4 ${statusClasses[summaryFlag]}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">CAMPAIGN SUMMARY</h3>
          <ClipboardCopyButton textToCopy={`Campaign Summary:\n${data.summary}`} />
        </div>
        <p className="mt-1 text-sm">{data.summary}</p>
      </div>

      <div className="p-6">
        <h4 className="text-md font-semibold text-ink mb-4">METRIC BREAKDOWN</h4>
        <div className="space-y-4">
          {data.analysis.map((item, i) => (
            <div key={i} className={`p-4 border rounded-sm ${statusClasses[item.flag]} backdrop-`}>
              <div className="flex justify-between items-center">
                <p className="font-semibold">{item.label}: <span className="text-lg text-ink ml-2">{item.value}</span></p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border border-current bg-sheet uppercase`}>{item.status}</span>
              </div>
              <p className="text-xs mt-1 opacity-80">{item.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-signal/5 border-t border-rule">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-ink">ADJUSTMENT RECOMMENDATIONS</h4>
          <ClipboardCopyButton textToCopy={formatRecommendationsForClipboard(data.adjustment_recommendations)} />
        </div>
        <ul className="list-disc list-inside space-y-2 text-ink text-sm">
          {data.adjustment_recommendations.map((rec, i) => (
            <li key={i} className="marker:text-ink-soft">{rec}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
