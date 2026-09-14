import React, { useState } from 'react';
import { Menu, Home, FileText, CheckSquare, MessageSquare, AlertCircle, Shield, ClipboardList, DollarSign } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'roadmap', label: 'Deal Roadmap', icon: CheckSquare },
    { id: 'disclosures', label: 'Disclosures Helper', icon: ClipboardList },
    { id: 'docs', label: 'Document Vault', icon: FileText },
    { id: 'offers', label: 'Offer Log', icon: DollarSign },
    { id: 'option', label: 'Option Center', icon: Shield },
    { id: 'ai', label: 'AI Guide', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Compliance Disclaimer Banner */}
      <div className="bg-bench text-ink text-xs py-2 px-4 text-center font-medium">
        <span className="flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Dwellingly is a coordination tool only. We are not attorneys or brokers. We do not provide legal advice.
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-sheet z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-rule transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-rule">
              <div className="w-8 h-8 bg-bench rounded-lg flex items-center justify-center mr-3">
                <span className="text-ink font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl text-ink tracking-tight">{APP_NAME}</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-bench text-ink' 
                        : 'text-ink-soft hover:bg-muted hover:text-ink'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-ink' : 'text-ink-soft'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-rule">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs font-semibold text-ink mb-1">Need a Pro?</p>
                <p className="text-xs text-ink mb-3">Stuck? Get help from a licensed attorney.</p>
                <button className="w-full bg-white text-ink border border-rule text-xs font-medium py-2 rounded hover:bg-muted transition-colors">
                  Find Directory
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden h-16 bg-white border-b border-rule flex items-center px-4 justify-between">
            <span className="font-semibold text-ink">{APP_NAME}</span>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-ink0 hover:bg-muted"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;