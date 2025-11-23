
import React, { useState } from 'react';
import type { UserInput, Strategy, ContentIdea, PerformanceData, PerformanceAnalysis } from './types';
import { generateStrategy, generateContentIdeas, analyzePerformance } from './services/geminiService';
import { Wizard } from './components/wizard/Wizard';
import { StrategyList } from './components/dashboard/StrategyList';
import { ContentIdeaGrid } from './components/dashboard/ContentIdeaGrid';
import { PerformanceInput } from './components/performance/PerformanceInput';
import { PerformanceAnalysisDashboard } from './components/dashboard/PerformanceAnalysisDashboard';
import { Spinner } from './components/ui/Spinner';

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
      return <div className="flex flex-col items-center justify-center h-screen"><Spinner /><p className="mt-4 text-foreground font-semibold">AI is thinking...</p></div>;
    }
    
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <p className="text-destructive font-bold mb-4">{error}</p>
            <button onClick={handleReset} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
                Start Over
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
          <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your AI Marketing Plan</h1>
               <button onClick={handleReset} className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
                Create New Plan
              </button>
            </div>
            
            <section id="strategies" className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 border-b-2 border-primary pb-2">Generated Strategies</h2>
              <StrategyList strategies={strategies} />
            </section>

            <section id="content-ideas" className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 border-b-2 border-secondary pb-2">Content Ideas</h2>
              <ContentIdeaGrid contentIdeas={contentIdeas} apiKey={apiKey || ''} />
            </section>

            {step === 'dashboard' && (
              <section id="performance-input" className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b-2 border-accent pb-2">Analyze Campaign Performance</h2>
                <PerformanceInput onSubmit={handlePerformanceSubmit} goal={userInput?.goals[0] || 'sales_conversions'} />
              </section>
            )}

            {step === 'analysis' && performanceAnalysis && (
              <section id="performance-analysis">
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b-2 border-accent pb-2">Performance Analysis & Recommendations</h2>
                <PerformanceAnalysisDashboard data={performanceAnalysis} />
              </section>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7zm2 2h2v5H7V9zm4 0h2v5h-2V9z" />
          </svg>
          <h1 className="text-2xl font-bold text-primary-foreground">AI Marketing Agent</h1>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer className="bg-card border-t border-border text-card-foreground text-center py-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} AI Marketing Agent. All rights reserved.</p>
      </footer>
    </div>
  );
}
