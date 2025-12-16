import React, { useState } from 'react';

interface ClipboardCopyButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const ClipboardCopyButton: React.FC<ClipboardCopyButtonProps> = ({ textToCopy, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to Clipboard"}
      aria-label={copied ? "Copied!" : "Copy to Clipboard"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded font-mono uppercase tracking-wider transition-all border ${copied
          ? 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
          : 'bg-black/50 hover:bg-[#00f0ff]/10 text-gray-400 hover:text-[#00f0ff] border-[#00f0ff]/30 hover:border-[#00f0ff]'
        } ${className}`}
      disabled={typeof navigator === 'undefined' || !navigator.clipboard}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
};
