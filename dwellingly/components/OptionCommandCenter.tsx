import React, { useState } from 'react';
import { Transaction, DealStatus } from '../types';
import Card from './Card';
import Button from './Button';
import ContractClock from './ContractClock';
import { Shield, Hammer, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OptionCommandCenterProps {
  transaction: Transaction;
  updateDealStatus: (status: DealStatus) => void;
}

const OptionCommandCenter: React.FC<OptionCommandCenterProps> = ({ transaction, updateDealStatus }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'requests'>('status');

  const checklist = [
    { id: 1, label: 'Buyer pays Option Fee', done: true },
    { id: 2, label: 'Buyer books General Inspection', done: false },
    { id: 3, label: 'Buyer books Termite Inspection', done: false },
    { id: 4, label: 'Receive Amendment for Repairs', done: false },
  ];

  if (transaction.status === DealStatus.PRE_LISTING) {
     return (
        <div className="text-center py-12 max-w-lg mx-auto">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-slate-400" />
           </div>
           <h2 className="text-xl font-bold text-slate-900 mb-2">Option Period Inactive</h2>
           <p className="text-slate-500 mb-6">This feature activates once you have an Executed Contract. It helps you track inspections and repair requests to prevent deal failure.</p>
           <Button variant="outline" disabled>Requires Executed Contract</Button>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Option Period Command Center</h2>
      </div>

      <ContractClock 
         executedDate={transaction.executedDate} 
         optionPeriodDays={transaction.optionPeriodDays}
         status={transaction.status}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inspection Checklist */}
        <Card title="Activity Checklist" description="Keep track of typical buyer activities">
          <div className="space-y-3">
             {checklist.map(item => (
                <div key={item.id} className="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                   <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${item.done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                      {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                   </div>
                   <span className={`text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.label}</span>
                </div>
             ))}
          </div>
        </Card>

        {/* Repair Request Helper */}
        <Card title="Repair Request Log" description="Log requests for your records only.">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
             <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-800">
                   <strong>Warning:</strong> Do not agree to repairs verbally. All agreements must be in a written Amendment signed by both parties.
                </p>
             </div>
          </div>
          
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
             <Hammer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
             <p className="text-sm text-slate-500">No repair requests logged yet.</p>
             <Button variant="outline" size="sm" className="mt-4">Log Request</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OptionCommandCenter;