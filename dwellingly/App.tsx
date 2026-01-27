import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Roadmap from './components/Roadmap';
import DocumentVault from './components/DocumentVault';
import OptionCommandCenter from './components/OptionCommandCenter';
import OfferLog from './components/OfferLog';
import DisclosuresHelper from './components/DisclosuresHelper';
import AIGuide from './components/AIGuide';
import { INITIAL_TRANSACTION } from './constants';
import { Transaction, TaskStatus, DocStatus, DealStatus, Offer } from './types';

interface AppProps {
  apiKey?: string;
}

function App({ apiKey = '' }: AppProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transaction, setTransaction] = useState<Transaction>(INITIAL_TRANSACTION);

  const addEvent = (description: string, actionType: string) => {
    setTransaction(prev => ({
      ...prev,
      events: [
        {
          id: `evt_${Date.now()}`,
          actionType,
          description,
          timestamp: new Date(),
          userId: 'u_1'
        },
        ...prev.events
      ]
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTransaction(prev => {
      const newTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, status } : t
      );

      const currentTask = prev.tasks.find(t => t.id === taskId);

      // Unlock next task
      const currentTaskIndex = newTasks.findIndex(t => t.id === taskId);
      if (status === TaskStatus.COMPLETED && currentTaskIndex < newTasks.length - 1) {
        newTasks[currentTaskIndex + 1].status = TaskStatus.PENDING;
      }

      return {
        ...prev,
        tasks: newTasks,
        events: [
          {
            id: `evt_${Date.now()}`,
            actionType: 'task_updated',
            description: `Task completed: ${currentTask?.title}`,
            timestamp: new Date(),
            userId: 'u_1'
          },
          ...prev.events
        ]
      };
    });
  };

  const handleUpload = (docId: string) => {
    const confirmUpload = window.confirm("Simulate file upload?");
    if (confirmUpload) {
      setTransaction(prev => {
        const doc = prev.documents.find(d => d.id === docId);
        return {
          ...prev,
          documents: prev.documents.map(d =>
            d.id === docId ? { ...d, status: DocStatus.UPLOADED, uploadedAt: new Date(), version: 1 } : d
          ),
          events: [
            {
              id: `evt_${Date.now()}`,
              actionType: 'doc_uploaded',
              description: `Document uploaded: ${doc?.name}`,
              timestamp: new Date(),
              userId: 'u_1'
            },
            ...prev.events
          ]
        };
      });
    }
  };

  const handleAddOffer = (newOffer: Omit<Offer, 'id'>) => {
    const offer: Offer = { ...newOffer, id: `off_${Date.now()}` };
    setTransaction(prev => ({
      ...prev,
      offers: [...prev.offers, offer],
      events: [
        {
          id: `evt_${Date.now()}`,
          actionType: 'offer_received',
          description: `Offer received from ${newOffer.buyerName}`,
          timestamp: new Date(),
          userId: 'u_1'
        },
        ...prev.events
      ]
    }));
  };

  const handleExecuteOffer = (offerId: string, executedDate: Date) => {
    setTransaction(prev => {
      const updatedOffers = prev.offers.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o);

      // Update tasks logic: Mark "Log Offers" and "Execute Contract" as complete
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === 'task_3' || t.id === 'task_4') return { ...t, status: TaskStatus.COMPLETED };
        if (t.id === 'task_5') return { ...t, status: TaskStatus.PENDING }; // Unlock Option Period
        return t;
      });

      return {
        ...prev,
        status: DealStatus.OPTION_PERIOD,
        executedDate: executedDate,
        offers: updatedOffers,
        tasks: updatedTasks,
        events: [
          {
            id: `evt_${Date.now()}`,
            actionType: 'contract_executed',
            description: `Contract executed with effective date ${executedDate.toLocaleDateString()}`,
            timestamp: new Date(),
            userId: 'u_1'
          },
          ...prev.events
        ]
      };
    });
    setActiveTab('dashboard');
  };

  const updateDealStatus = (status: DealStatus) => {
    setTransaction(prev => ({ ...prev, status }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transaction={transaction} onNavigate={setActiveTab} />;
      case 'roadmap':
        return <Roadmap transaction={transaction} updateTaskStatus={updateTaskStatus} onNavigate={setActiveTab} />;
      case 'docs':
        return <DocumentVault transaction={transaction} onUpload={handleUpload} />;
      case 'offers':
        return <OfferLog transaction={transaction} onAddOffer={handleAddOffer} onExecuteOffer={handleExecuteOffer} />;
      case 'disclosures':
        return <DisclosuresHelper />;
      case 'option':
        return <OptionCommandCenter transaction={transaction} updateDealStatus={updateDealStatus} />;
      case 'ai':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Transaction Assistant</h2>
            <AIGuide apiKey={apiKey} />
          </div>
        );
      default:
        return <Dashboard transaction={transaction} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;