import React from 'react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import ContractClock from './ContractClock';
import { Transaction, TaskStatus, DocStatus } from '../types';
import { ArrowRight, FileText, CheckCircle2, AlertOctagon, Calendar, ArrowUpRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface DashboardProps {
  transaction: Transaction;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transaction, onNavigate }) => {
  const nextTask = transaction.tasks.find(t => t.status === TaskStatus.PENDING);
  const completedTasks = transaction.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalTasks = transaction.tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100);
  const missingDocs = transaction.documents.filter(d => d.status === DocStatus.MISSING).length;

  // PRD 4.1: Critical Dates Calculation
  const getCriticalDates = () => {
    const dates = [];
    if (transaction.executedDate) {
      const execDate = new Date(transaction.executedDate);
      dates.push({ label: 'Option Period Ends', date: addDays(execDate, transaction.optionPeriodDays || 7), risk: 'High' });
      dates.push({ label: 'Earnest Money Due', date: addDays(execDate, 3), risk: 'Medium' });
      if (transaction.closingDate) {
        dates.push({ label: 'Closing Date', date: new Date(transaction.closingDate), risk: 'High' });
      }
    } else {
       dates.push({ label: 'Listing Active', date: new Date(), risk: 'Low', isEstimated: true });
    }
    return dates;
  };

  const criticalDates = getCriticalDates();

  // PRD 4.1: Next Step CTA Logic
  const getNextStepAction = () => {
    if (!transaction.executedDate) {
      if (nextTask?.id === 'task_4') {
         return { label: 'Add Executed Date', action: () => onNavigate('offers') };
      }
      return { label: 'Go to Roadmap', action: () => onNavigate('roadmap') };
    }
    return { label: 'Confirm Key Dates', action: () => onNavigate('roadmap') };
  };

  const cta = getNextStepAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{transaction.address}</h1>
          <p className="text-slate-500">Transaction Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="default">{transaction.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* PRD 4.1: Texas Contract Clock Strip Pinned Under Header */}
      <ContractClock 
        executedDate={transaction.executedDate} 
        optionPeriodDays={transaction.optionPeriodDays}
        status={transaction.status}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Action Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* PRD 4.1: Next Step Module */}
          <Card className="border-l-4 border-l-slate-900 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Next Recommended Step</p>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{nextTask ? nextTask.title : "All Set!"}</h2>
                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-2">Why it matters:</p>
                    <p className="text-slate-600 text-sm">{nextTask ? nextTask.description : "You are up to date."}</p>
                    {nextTask?.whatToPrepare && (
                      <div className="mt-3">
                         <p className="text-xs font-semibold text-slate-500 uppercase">Prepare:</p>
                         <div className="flex flex-wrap gap-2 mt-1">
                            {nextTask.whatToPrepare.map((item, idx) => (
                               <span key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{item}</span>
                            ))}
                         </div>
                      </div>
                    )}
                </div>
                <Button onClick={cta.action} size="lg">
                  {cta.label} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <div className="hidden sm:block">
                 <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900">
                    <ArrowUpRight className="w-6 h-6" />
                 </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PRD 4.1: Docs Summary */}
            <Card title="Documents Status">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                       <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{missingDocs}</p>
                        <p className="text-xs text-slate-500">Missing required docs</p>
                    </div>
                 </div>
                 <Button variant="outline" size="sm" onClick={() => onNavigate('docs')}>View Vault</Button>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-slate-900 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${((transaction.documents.length - missingDocs) / transaction.documents.length) * 100}%` }}
                ></div>
              </div>
            </Card>

            {/* Deal Health/Progress */}
            <Card title="Deal Health">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                       <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900">On Track</p>
                        <p className="text-xs text-slate-500">{progress}% Complete</p>
                    </div>
                 </div>
                 <Button variant="outline" size="sm" onClick={() => onNavigate('roadmap')}>Timeline</Button>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* PRD 4.1: Critical Dates List */}
          <Card title="Critical Dates">
             <div className="space-y-4">
               {criticalDates.map((cd, idx) => (
                 <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                       <Calendar className={`w-4 h-4 ${cd.risk === 'High' ? 'text-red-500' : 'text-slate-400'}`} />
                       <div>
                          <p className="text-sm font-medium text-slate-900">{cd.label}</p>
                          <p className="text-xs text-slate-500">{cd.isEstimated ? 'Estimated' : format(cd.date, 'MMM d, yyyy')}</p>
                       </div>
                    </div>
                    {cd.risk === 'High' && <Badge variant="error">Urgent</Badge>}
                 </div>
               ))}
             </div>
          </Card>

          <Card title="Critical Warnings">
            <div className="space-y-4">
              {missingDocs > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Missing Disclosures</p>
                    <p className="text-xs text-red-600 mt-1">You must upload the SDN before accepting offers.</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic text-center py-4">No critical warnings.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;