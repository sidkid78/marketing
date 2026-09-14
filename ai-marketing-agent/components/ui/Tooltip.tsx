import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={text}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-rule text-[10px] leading-none text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[15rem] -translate-x-1/2 rounded-sm border border-rule bg-sheet px-2.5 py-1.5 text-[12.5px] leading-snug text-ink opacity-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
};
