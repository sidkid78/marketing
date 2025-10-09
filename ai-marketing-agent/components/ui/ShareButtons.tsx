import React, { useState } from 'react';

interface ShareButtonsProps {
  textToShare: string;
  anchorId?: string;
}

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.581-.666 2.477 0 1.694.86 3.198 2.16 4.078-.796-.025-1.548-.244-2.204-.61v.053c0 2.366 1.68 4.332 3.904 4.782-.408.111-.837.17-1.28.17-.313 0-.618-.03-.916-.086.621 1.935 2.426 3.342 4.566 3.38-1.669 1.306-3.775 2.085-6.052 2.085-.394 0-.783-.023-1.165-.068 2.159 1.387 4.723 2.199 7.456 2.199 8.941 0 13.84-7.406 13.84-13.841 0-.21 0-.42-.015-.63.95-.686 1.776-1.547 2.434-2.525z"/>
    </svg>
);

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
    </svg>
);

const CopyLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const ShareButtons: React.FC<ShareButtonsProps> = ({ textToShare, anchorId }) => {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const shareUrl = anchorId ? `${baseUrl}#${anchorId}` : baseUrl;
  const encodedText = encodeURIComponent(textToShare);
  const encodedShareUrl = encodeURIComponent(shareUrl);

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedShareUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyLink = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-neutral">Share:</span>
      <button 
        onClick={shareOnTwitter} 
        title="Share on Twitter" 
        aria-label="Share on Twitter"
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black transition-colors"
      >
        <TwitterIcon />
      </button>
      <button 
        onClick={shareOnLinkedIn} 
        title="Share on LinkedIn" 
        aria-label="Share on LinkedIn"
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-blue-700 transition-colors"
      >
        <LinkedInIcon />
      </button>
      <button
        onClick={copyLink}
        title={copied ? "Link Copied!" : "Copy Link"}
        aria-label={copied ? "Link Copied!" : "Copy Link"}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={typeof navigator === 'undefined' || !navigator.clipboard}
      >
        {copied ? <CheckIcon /> : <CopyLinkIcon />}
      </button>
    </div>
  );
};