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
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
        copied
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'bg-gray-100 hover:bg-gray-200 text-neutral border-gray-300'
      } ${className}`}
      disabled={typeof navigator === 'undefined' || !navigator.clipboard}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};
