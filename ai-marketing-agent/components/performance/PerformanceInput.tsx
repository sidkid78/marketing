
import React, { useState } from 'react';
import type { PerformanceData, MarketingGoal } from '../../types';
import { PERFORMANCE_METRICS } from '../../constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PerformanceInputProps {
  onSubmit: (data: PerformanceData) => void;
  goal: MarketingGoal;
}

export const PerformanceInput: React.FC<PerformanceInputProps> = ({ onSubmit, goal }) => {
  const [mode, setMode] = useState<'manual' | 'csv'>('manual');
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const relevantMetrics = PERFORMANCE_METRICS[goal] || [];

  const handleManualChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value);
    setMetrics(prev => ({
      ...prev,
      [metricId]: isNaN(numValue) ? 0 : numValue
    }));
  };
  
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].trim().split(',');
        const values = lines[1].trim().split(',');
        const parsedMetrics: Record<string, number> = {};
        headers.forEach((header, index) => {
            const value = parseFloat(values[index]);
            if(!isNaN(value)) {
                parsedMetrics[header.trim()] = value;
            }
        });
        setMetrics(parsedMetrics);
      } catch (err) {
        setError('Failed to parse CSV file. Please ensure it has a header row and one data row.');
      }
    };
    reader.readAsText(file);
  };


  const handleSubmit = () => {
    if (Object.keys(metrics).length === 0) {
      setError('Please enter at least one metric value.');
      return;
    }
    setError('');
    onSubmit({ metrics });
  };

  return (
    <Card>
      <div className="flex border-b border-border mb-6">
        <button className={`px-4 py-2 font-semibold ${mode === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`} onClick={() => setMode('manual')}>Manual Entry</button>
        <button className={`px-4 py-2 font-semibold ${mode === 'csv' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`} onClick={() => setMode('csv')}>Upload CSV</button>
      </div>
      
      {mode === 'manual' ? (
        <div className="space-y-4">
          {relevantMetrics.map(metric => (
            <div key={metric.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label htmlFor={metric.id} className="font-semibold">{metric.label}</label>
              <input 
                type="number" 
                id={metric.id} 
                className="col-span-2 p-2 border border-gray-300 rounded-lg"
                placeholder={metric.description}
                value={metrics[metric.id] || ''}
                onChange={(e) => handleManualChange(metric.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Upload a CSV file with a header row and one data row. Headers should match metric IDs (e.g., `leads`, `cvr`, `cpl`).</p>
          <input type="file" accept=".csv" title="Upload CSV" onChange={handleCsvUpload} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
           {Object.keys(metrics).length > 0 && <p className="text-chart-2 text-sm mt-2">CSV data loaded successfully.</p>}
        </div>
      )}

      {error && <p className="text-destructive mt-4">{error}</p>}
      
      <div className="mt-8 text-right">
        <Button onClick={handleSubmit}>Analyze Performance</Button>
      </div>
    </Card>
  );
};
