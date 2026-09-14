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
      <div className="bg-sheet text-ink p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-ink-soft" />
          <div>
            <p className="text-sm text-ink font-medium">Contract Clock</p>
            <p className="text-base font-semibold">Waiting for Execution Date</p>
          </div>
        </div>
        <span className="text-xs bg-muted px-2 py-1 rounded text-ink">Inactive</span>
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
    <div className={`p-4 rounded-lg border-l-4 ${isOptionActive ? 'bg-white border-rule' : 'bg-muted border-rule'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOptionActive ? (
            <Clock className="w-6 h-6 text-ink animate-pulse" />
          ) : (
             <AlertTriangle className="w-6 h-6 text-working" />
          )}
          <div>
            <p className="text-sm text-ink0 font-medium uppercase">Option Period Clock</p>
            <div className="flex items-baseline gap-2">
              {isOptionActive ? (
                <>
                  <span className="text-2xl font-bold text-ink">{daysRemainingInOption}</span>
                  <span className="text-sm text-ink-soft">days remaining</span>
                </>
              ) : (
                <span className="text-lg font-semibold text-ink">Option Period Ended</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft">Ends on</p>
          <p className="text-sm font-semibold text-ink">{format(optionPeriodEndDate, 'MMM d, yyyy')}</p>
          <p className="text-xs text-ink-soft">@ 5:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContractClock;