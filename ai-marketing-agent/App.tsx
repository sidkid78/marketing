
import React, { useState } from 'react';
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from './types';
import { generateStrategy, generateContentIdeas, analyzePerformance } from './services/geminiService';
import { Wizard } from './components/wizard/Wizard';
import { StrategyList } from './components/dashboard/StrategyList';
import { ContentIdeaGrid } from './components/dashboard/ContentIdeaGrid';
import { PerformanceInput } from './components/performance/PerformanceInput';
import { PerformanceAnalysisDashboard } from './components/dashboard/PerformanceAnalysisDashboard';
import { Spinner } from './components/ui/Spinner';
import { RefreshCw } from 'lucide-react';

type AppStep = 'wizard' | 'dashboard' | 'analysis';

interface AppProps {
  apiKey: string;
}

export default function App({ apiKey }: AppProps) {
  const [step, setStep] = useState<AppStep>('wizard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);

  const handleWizardSubmit = async (data: UserInput) => {
    if (!apiKey) {
      setError('Please enter your Gemini API key above to continue.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setUserInput(data);
    try {
      const [strategyResponse, contentResponse] = await Promise.all([
        generateStrategy(data, apiKey),
        generateContentIdeas(data, apiKey)
      ]);
      setStrategies(strategyResponse);
      setContentIdeas(contentResponse);
      setStep('dashboard');
    } catch (e) {
      console.error(e);
      setError('Failed to generate marketing plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformanceSubmit = async (data: PerformanceData) => {
    if (!userInput) {
      setError('User input is missing. Please restart the process.');
      return;
    }
    if (!apiKey) {
      setError('Please enter your Gemini API key above to continue.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzePerformance(data, userInput.goals[0], apiKey);
      setPerformanceAnalysis(analysis);
      setStep('analysis');
    } catch (e) {
      console.error(e);
      setError('Failed to analyze performance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('wizard');
    setUserInput(null);
    setStrategies([]);
    setContentIdeas([]);
    setPerformanceAnalysis(null);
    setError(null);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-10">
          <Spinner label="Building your plan. This takes about a minute." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-md rounded-md border border-rule bg-sheet p-5">
          <p className="text-[14px] text-ink">{error}</p>
          <button
            onClick={handleReset}
            className="mt-4 rounded-sm bg-signal px-4 py-2 text-[13.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start over
          </button>
        </div>
      );
    }

    switch (step) {
      case 'wizard':
        return <Wizard onSubmit={handleWizardSubmit} />;
      case 'dashboard':
      case 'analysis':
        return (
          <div>
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="text-[13.5px] text-ink-soft">
                {strategies.length} strategies and {contentIdeas.length} content ideas for{' '}
                {userInput?.demographics.location}.
              </p>
              <button
                onClick={handleReset}
                className="flex shrink-0 items-center gap-1.5 rounded-sm border border-rule px-3 py-1.5 text-[13.5px] transition-colors hover:bg-muted"
              >
                <RefreshCw size={13} strokeWidth={1.75} />
                New plan
              </button>
            </div>

            <section id="strategies" className="mb-12">
              <h3 className="mb-4 text-[17px] font-semibold">Strategies</h3>
              <StrategyList strategies={strategies} />
            </section>

            <section id="content-ideas" className="mb-12">
              <h3 className="mb-4 text-[17px] font-semibold">Content ideas</h3>
              <ContentIdeaGrid contentIdeas={contentIdeas} apiKey={apiKey || ''} />
            </section>

            {step === 'dashboard' && (
              <section id="performance-input" className="mb-12">
                <h3 className="text-[17px] font-semibold">Analyse performance</h3>
                <p className="mt-1 mb-4 text-[13.5px] text-ink-soft">
                  Once the campaign has run, paste the numbers in to see what to change.
                </p>
                <PerformanceInput onSubmit={handlePerformanceSubmit} goal={userInput?.goals[0] || 'sales_conversions'} />
              </section>
            )}

            {step === 'analysis' && performanceAnalysis && (
              <section id="performance-analysis">
                <h3 className="mb-4 text-[17px] font-semibold">Performance analysis</h3>
                <PerformanceAnalysisDashboard data={performanceAnalysis} />
              </section>
            )}
          </div>
        );
    }
  };

  return <div className="min-w-0">{renderContent()}</div>;
}
