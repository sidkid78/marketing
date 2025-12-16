
import React, { useState } from 'react';
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from './types';
import { generateStrategy, generateContentIdeas, analyzePerformance } from './services/geminiService';
import { Wizard } from './components/wizard/Wizard';
import { StrategyList } from './components/dashboard/StrategyList';
import { ContentIdeaGrid } from './components/dashboard/ContentIdeaGrid';
import { PerformanceInput } from './components/performance/PerformanceInput';
import { PerformanceAnalysisDashboard } from './components/dashboard/PerformanceAnalysisDashboard';
import { Spinner } from './components/ui/Spinner';
import { Target, RefreshCw } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[#00f0ff]/30 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 font-mono text-[#00f0ff] animate-pulse">NEURAL PROCESSING...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
            <p className="text-red-400 font-mono mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00a0ff] text-black font-mono font-medium rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
            >
              RESTART
            </button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 'wizard':
        return <Wizard onSubmit={handleWizardSubmit} />;
      case 'dashboard':
      case 'analysis':
        return (
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold font-mono">
                <span className="text-[#00f0ff]">AI</span>
                <span className="text-white">_</span>
                <span className="text-[#ff00ff]">MARKETING_PLAN</span>
              </h1>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-[#ff00ff]/50 text-[#ff00ff] font-mono text-sm rounded-lg hover:bg-[#ff00ff]/10 transition-all"
              >
                <RefreshCw size={14} />
                NEW PLAN
              </button>
            </div>

            <section id="strategies" className="mb-10">
              <h2 className="text-xl font-bold font-mono text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-[#00f0ff]"></div>
                GENERATED STRATEGIES
              </h2>
              <StrategyList strategies={strategies} />
            </section>

            <section id="content-ideas" className="mb-10">
              <h2 className="text-xl font-bold font-mono text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-[#ff00ff]"></div>
                CONTENT IDEAS
              </h2>
              <ContentIdeaGrid contentIdeas={contentIdeas} apiKey={apiKey || ''} />
            </section>

            {step === 'dashboard' && (
              <section id="performance-input" className="mb-10">
                <h2 className="text-xl font-bold font-mono text-white mb-4 flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#39ff14]"></div>
                  ANALYZE PERFORMANCE
                </h2>
                <PerformanceInput onSubmit={handlePerformanceSubmit} goal={userInput?.goals[0] || 'sales_conversions'} />
              </section>
            )}

            {step === 'analysis' && performanceAnalysis && (
              <section id="performance-analysis">
                <h2 className="text-xl font-bold font-mono text-white mb-4 flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#39ff14]"></div>
                  PERFORMANCE ANALYSIS
                </h2>
                <PerformanceAnalysisDashboard data={performanceAnalysis} />
              </section>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-white">
      {/* Header */}
      <header className="border-b border-[#00f0ff]/20 bg-black/40 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f0ff] blur-lg opacity-30"></div>
            <div className="relative bg-black/50 p-2 rounded-lg border border-[#00f0ff]/50">
              <Target size={20} className="text-[#00f0ff]" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg font-mono">
              <span className="text-[#00f0ff]">AI</span>
              <span className="text-white">_</span>
              <span className="text-[#ff00ff]">MARKETING</span>
              <span className="text-[#00f0ff] animate-pulse">_</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono">STRATEGIC INTELLIGENCE ENGINE</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00f0ff]/10 bg-black/20 text-center py-4 mt-8">
        <p className="text-xs font-mono text-gray-600">
          ◈ NEURAL_MARKETING v2.0 ◈ QUANTUM ANALYTICS ENABLED ◈
        </p>
      </footer>
    </div>
  );
}
