
import React from 'react';
import { AppSection } from '../types';
import { ICONS, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, onSectionChange }) => {
  const navItems = [
    { id: AppSection.DASHBOARD, label: 'Overview', icon: ICONS.Cycle },
    { id: AppSection.FEAR_NEUTRALIZER, label: 'Fear Tool', icon: ICONS.Fear },
    { id: AppSection.LIFE_CYCLE, label: 'The Journey', icon: ICONS.Cycle },
    { id: AppSection.BUSINESS_VALIDATOR, label: 'Idea Lab', icon: ICONS.Idea },
    { id: AppSection.BRAND_MOSAIC, label: 'Brand Mosaic', icon: ICONS.Mentor },
    { id: AppSection.CULTURE_COACH, label: 'Culture', icon: ICONS.Culture },
    { id: AppSection.MENTOR, label: 'Mentor', icon: ICONS.Mentor },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-950 text-neutral-100">
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass z-50 flex justify-around p-4 border-t border-white/10 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex flex-col items-center px-4 transition-colors shrink-0 ${
              activeSection === item.id ? 'text-blue-400' : 'text-neutral-500'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/10 h-screen sticky top-0">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter gradient-text">MINDSET OS</h1>
          <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mt-1">Based on Hormozi</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-neutral-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-3 text-xs text-neutral-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Missionary Mindset On</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
