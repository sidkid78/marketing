
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FearNeutralizer from './components/FearNeutralizer';
import LifeCycleChart from './components/LifeCycleChart';
import IdeaValidator from './components/IdeaValidator';
import CultureCoach from './components/CultureCoach';
import ChatMentor from './components/ChatMentor';
import BrandMosaic from './components/BrandMosaic';
import { AppSection } from './types';
import { ICONS } from './constants';

interface AppProps {
  apiKey?: string;
}

const Dashboard: React.FC<{ onNavigate: (s: AppSection) => void }> = ({ onNavigate }) => {
  const stats = [
    { label: 'Mindset', value: 'Missionary', icon: ICONS.Fear, color: 'text-ink' },
    { label: 'Asset', icon: ICONS.Mentor, value: 'Brand Mosaic', color: 'text-ink' },
    { label: 'Edge', value: '3Ps Aligned', icon: ICONS.Idea, color: 'text-positive' },
    { label: 'Strategy', value: 'Compounding', icon: ICONS.Cycle, color: 'text-destructive' },
  ];

  const cards = [
    { section: AppSection.BRAND_MOSAIC, title: 'Build Your Mosaic', desc: 'Identify the 4 unique tiles that make your brand non-commoditized.' },
    { section: AppSection.FEAR_NEUTRALIZER, title: 'Face The Shame', desc: 'Accept the courage to be wrong in front of those you care about.' },
    { section: AppSection.BUSINESS_VALIDATOR, title: 'Missionary Audit', desc: 'Stop logic-driven features. Lean into visceral obsession.' },
    { section: AppSection.LIFE_CYCLE, title: 'Commitment Cycle', desc: 'Burn the boats. Eliminate alternatives to survive the valley.' },
  ];

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-6xl font-black mb-6 tracking-tighter leading-none">MINDSET <span className="gradient-text">OS</span></h1>
        <h3 className="text-2xl font-bold mb-4">Features are commoditized. Narrative is defensible.</h3>
        <p className="text-lg text-ink-soft leading-relaxed">
          The ultimate control center for building <span className="text-ink font-bold">Enterprise Value</span> through authentic narrative and unwavering focus. Move from logic-driven mercenary to obsession-driven missionary.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-rule flex flex-col items-center justify-center text-center group hover:border-rule transition-all cursor-default">
            <stat.icon className={`w-8 h-8 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
            <div className="text-[10px] font-bold text-ink0 uppercase">{stat.label}</div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => onNavigate(card.section)}
            className="group glass p-10 rounded-[2.5rem] border border-rule text-left hover:border-rule hover:bg-muted transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-muted rounded-full group-hover:bg-muted transition-all"></div>
            <div className="bg-sheet w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-signal transition-colors">
              <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-1 transition-transform">{card.title}</h3>
            <p className="text-ink0 group-hover:text-ink transition-colors">{card.desc}</p>
          </button>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] border border-destructive/30 bg-muted to-transparent doom-loop-glow">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-ink mb-4 italic">"Mercenaries time the market. Missionaries build the future."</h3>
            <p className="text-ink leading-relaxed text-lg">
              The goal is to build an audience interested in <span className="text-destructive font-bold">you for being you</span>, who will buy your (often commoditized) products as a result of that affinity.
            </p>
          </div>
          <button
            onClick={() => onNavigate(AppSection.BRAND_MOSAIC)}
            className="px-10 py-5 bg-signal hover:bg-signal text-primary-foreground rounded-2xl font-black transition-all uppercase tracking-tighter"
          >
            Audit Your Narrative
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC<AppProps> = ({ apiKey: propApiKey }) => {
  const [apiKey, setApiKey] = useState(propApiKey || '');
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);

  useEffect(() => {
    if (!propApiKey) {
      try {
        const saved = window.localStorage.getItem('GEMINI_API_KEY') || '';
        setApiKey(saved);
      } catch { }
    }
  }, [propApiKey]);

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD:
        return <Dashboard onNavigate={setActiveSection} />;
      case AppSection.FEAR_NEUTRALIZER:
        return <FearNeutralizer />;
      case AppSection.LIFE_CYCLE:
        return <LifeCycleChart />;
      case AppSection.BUSINESS_VALIDATOR:
        return <IdeaValidator apiKey={apiKey} />;
      case AppSection.BRAND_MOSAIC:
        return <BrandMosaic />;
      case AppSection.CULTURE_COACH:
        return <CultureCoach apiKey={apiKey} />;
      case AppSection.MENTOR:
        return <ChatMentor apiKey={apiKey} />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </Layout>
  );
};

export default App;
