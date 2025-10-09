
import React from 'react';
import type { PerformanceAnalysis } from '../../types';
import { Card } from '../ui/Card';

interface PerformanceAnalysisDashboardProps {
  data: PerformanceAnalysis;
}

const statusClasses = {
  good: 'bg-green-100 text-green-800 border-green-300',
  on_target: 'bg-blue-100 text-blue-800 border-blue-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export const PerformanceAnalysisDashboard: React.FC<PerformanceAnalysisDashboardProps> = ({ data }) => {
  const summaryFlag = data.summary.includes('⚠️') ? 'warning' : data.summary.includes('✅') ? 'good' : 'on_target';

  return (
    <Card className="!p-0 overflow-hidden">
      <div className={`p-6 border-l-4 ${statusClasses[summaryFlag]}`}>
        <h3 className="text-lg font-bold">Campaign Summary</h3>
        <p className="mt-1">{data.summary}</p>
      </div>
      
      <div className="p-6">
        <h4 className="text-md font-bold text-neutral-dark mb-4">Metric Breakdown</h4>
        <div className="space-y-4">
          {data.analysis.map((item, i) => (
            <div key={i} className={`p-4 border rounded-lg ${statusClasses[item.flag]}`}>
              <div className="flex justify-between items-center">
                <p className="font-bold">{item.label}: <span className="font-mono text-lg">{item.value}</span></p>
                <span className="text-xs font-bold px-2 py-1 rounded-full border bg-white">{item.status}</span>
              </div>
              <p className="text-sm mt-1">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 bg-gray-50">
        <h4 className="text-md font-bold text-neutral-dark mb-3">Adjustment Recommendations</h4>
        <ul className="list-disc list-inside space-y-2 text-neutral">
          {data.adjustment_recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
