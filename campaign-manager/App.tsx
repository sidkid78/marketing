import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContentGenerator } from './components/ContentGenerator';
import { VisualsPlanner } from './components/VisualsPlanner';
import { EngagementHub } from './components/EngagementHub';
import { AccountManager } from './components/AccountManager';
import { ScheduleManager } from './components/ScheduleManager';
import { View, Account, ScheduledTweet } from './types';

// Mock data pool for simulation
const MOCK_ACCOUNTS_POOL = [
  { name: 'Austin AgeTech', handle: '@ATXAgeTech', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Austin' },
  { name: 'Senior Living TX', handle: '@SeniorLivingTX', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Senior' },
  { name: 'SafeHome Daily', handle: '@SafeHomeDaily', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Safe' },
  { name: 'TechForSeniors', handle: '@TechForSeniors', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech' }
];

export default function App({ apiKey }: { apiKey?: string }) {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  // State for managing linked accounts
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      name: 'HOMEase | AI',
      handle: '@HOMEaseAI',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HOMEase',
      status: 'active'
    }
  ]);

  // State for scheduled content
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([]);

  const activeAccount = accounts.find(a => a.status === 'active') || accounts[0];

  const handleAddAccount = () => {
    // Find an account from the pool that isn't already added
    const available = MOCK_ACCOUNTS_POOL.filter(poolAcct =>
      !accounts.find(existing => existing.handle === poolAcct.handle)
    );

    if (available.length === 0) {
      alert("All demo accounts have been connected!");
      return;
    }

    const newAccountBase = available[0];
    const newAccount: Account = {
      id: Date.now().toString(),
      ...newAccountBase,
      status: 'connected'
    };

    setAccounts([...accounts, newAccount]);
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const handleSetActiveAccount = (id: string) => {
    setAccounts(accounts.map(a => ({
      ...a,
      status: a.id === id ? 'active' : 'connected'
    })));
  };

  const handleTweetScheduled = (tweet: ScheduledTweet) => {
    setScheduledTweets([...scheduledTweets, tweet]);
  };

  const handleRemoveScheduled = (id: string) => {
    setScheduledTweets(scheduledTweets.filter(t => t.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.CONTENT_GENERATOR:
        return <ContentGenerator activeAccount={activeAccount} onTweetScheduled={handleTweetScheduled} />;
      case View.SCHEDULE:
        return <ScheduleManager scheduledTweets={scheduledTweets} onRemoveScheduled={handleRemoveScheduled} />;
      case View.VISUALS:
        return <VisualsPlanner />;
      case View.ENGAGEMENT:
        return <EngagementHub activeAccount={activeAccount} />;
      case View.ACCOUNTS:
        return (
          <AccountManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            onSetActiveAccount={handleSetActiveAccount}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
