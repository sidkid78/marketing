import React from 'react';
import { differenceInDays, format, isValid } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';
import { DealStatus } from '../types';

interface ContractClockProps {
  executedDate: Date | null | undefined;
  optionPeriodDays: number | undefined;
  status: DealStatus;
}

const ContractClock: React.FC<ContractClockProps> = ({ executedDate, optionPeriodDays = 0, status }) => {
  if (!executedDate || !isValid(executedDate) || status === DealStatus.PRE_LISTING) {
    return (
      <div className="bg-slate-800 text-white p-4 rounded-lg flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-slate-400" />
          <div>
            <p className="text-sm text-slate-300 font-medium">Contract Clock</p>
            <p className="text-base font-semibold">Waiting for Execution Date</p>
          </div>
        </div>
        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Inactive</span>
      </div>
    );
  }

  const today = new Date();
  // In Texas, Option Period ends at 5pm on the last day. For simplicity, we calculate days remaining.
  // Effective Date is Day 0.
  const optionPeriodEndDate = new Date(executedDate);
  optionPeriodEndDate.setDate(executedDate.getDate() + optionPeriodDays);
  
  const daysRemainingInOption = differenceInDays(optionPeriodEndDate, today);
  const isOptionActive = daysRemainingInOption >= 0;

  return (
    <div className={`p-4 rounded-lg shadow-md border-l-4 ${isOptionActive ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-300'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOptionActive ? (
            <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
          ) : (
             <AlertTriangle className="w-6 h-6 text-amber-500" />
          )}
          <div>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Option Period Clock</p>
            <div className="flex items-baseline gap-2">
              {isOptionActive ? (
                <>
                  <span className="text-2xl font-bold text-slate-900">{daysRemainingInOption}</span>
                  <span className="text-sm text-slate-600">days remaining</span>
                </>
              ) : (
                <span className="text-lg font-semibold text-slate-700">Option Period Ended</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Ends on</p>
          <p className="text-sm font-semibold text-slate-800">{format(optionPeriodEndDate, 'MMM d, yyyy')}</p>
          <p className="text-xs text-slate-400">@ 5:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContractClock;