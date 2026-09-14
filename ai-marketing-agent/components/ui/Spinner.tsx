import React from 'react';

/**
 * Generation takes tens of seconds, so this reads as a job in progress rather
 * than a momentary pause. Amber is the system's one "working" colour.
 */
export const Spinner: React.FC<{ label?: string }> = ({ label = 'Working' }) => {
  return (
    <div className="w-full max-w-sm" role="status" aria-live="polite">
      <div className="working-bar h-[3px] w-full rounded-full" />
      <p className="mt-3 text-[13px] text-ink-soft">{label}</p>
    </div>
  );
};
