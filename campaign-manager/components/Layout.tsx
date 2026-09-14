import React from 'react';
import { View } from '../types';
import { LayoutDashboard, PenTool, Image as ImageIcon, MessageSquare, Menu, X, Users, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { view: View.DASHBOARD, label: 'Campaign Dashboard', icon: LayoutDashboard },
    { view: View.CONTENT_GENERATOR, label: 'Content Studio', icon: PenTool },
    { view: View.SCHEDULE, label: 'Content Calendar', icon: Calendar },
    { view: View.VISUALS, label: 'Visual Assets', icon: ImageIcon },
    { view: View.ENGAGEMENT, label: 'Engagement Hub', icon: MessageSquare },
    { view: View.ACCOUNTS, label: 'Accounts', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-bench text-ink z-50 p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">HOMEase | AI</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-bench text-ink transition-transform transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-rule hidden lg:block">
            <h1 className="text-2xl font-bold text-ink tracking-tight">HOMEase | AI</h1>
            <p className="text-xs text-ink-soft mt-1">Campaign Manager</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.view 
                    ? 'bg-signal text-primary-foreground' 
                    : 'hover:bg-sheet text-ink hover:text-ink'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-rule">
            <div className="bg-sheet rounded p-3 text-xs text-ink-soft">
              <p className="font-semibold text-ink mb-1">Campaign Goal</p>
              Brand Awareness & Thought Leadership in Austin AgeTech.
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full pt-16 lg:pt-0">
        <header className="bg-white border-b border-rule px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-ink">
            {navItems.find(i => i.view === currentView)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-positive bg-positive/10 px-3 py-1 rounded-full border border-positive/30">
              API Active
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
