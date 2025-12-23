
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
    { label: 'Mindset', value: 'Missionary', icon: ICONS.Fear, color: 'text-blue-400' },
    { label: 'Asset', icon: ICONS.Mentor, value: 'Brand Mosaic', color: 'text-purple-400' },
    { label: 'Edge', value: '3Ps Aligned', icon: ICONS.Idea, color: 'text-emerald-400' },
    { label: 'Strategy', value: 'Compounding', icon: ICONS.Cycle, color: 'text-red-400' },
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
        <p className="text-lg text-neutral-400 leading-relaxed">
          The ultimate control center for building <span className="text-white font-bold">Enterprise Value</span> through authentic narrative and unwavering focus. Move from logic-driven mercenary to obsession-driven missionary.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center group hover:border-white/20 transition-all cursor-default">
            <stat.icon className={`w-8 h-8 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => onNavigate(card.section)}
            className="group glass p-10 rounded-[2.5rem] border border-white/5 text-left hover:border-white/20 hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className="bg-neutral-800/80 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-1 transition-transform">{card.title}</h3>
            <p className="text-neutral-500 group-hover:text-neutral-300 transition-colors">{card.desc}</p>
          </button>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent doom-loop-glow">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-white mb-4 italic">"Mercenaries time the market. Missionaries build the future."</h3>
            <p className="text-neutral-300 leading-relaxed text-lg">
              The goal is to build an audience interested in <span className="text-red-400 font-bold">you for being you</span>, who will buy your (often commoditized) products as a result of that affinity.
            </p>
          </div>
          <button
            onClick={() => onNavigate(AppSection.BRAND_MOSAIC)}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-900/40 uppercase tracking-tighter"
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
