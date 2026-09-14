import React, { useState } from 'react';
import { Youtube, Copy, Download, Loader2, AlertCircle, Check } from 'lucide-react';

interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
}

export default function YoutubeExtractor() {
    const [urlOrId, setUrlOrId] = useState('');
    const [transcript, setTranscript] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const extractVideoId = (input: string) => {
        // Handle full URLs and raw IDs
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = input.match(regex);
        return match ? match[1] : input.length === 11 ? input : null;
    };

    const formatTimestamp = (offsetSec: number) => {
        const minutes = Math.floor(offsetSec / 60);
        const seconds = Math.floor(offsetSec % 60);
        return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
    };

    const handleExtract = async () => {
        const videoId = extractVideoId(urlOrId);

        if (!videoId) {
            setError('Please enter a valid YouTube Video URL or ID');
            return;
        }

        setLoading(true);
        setError('');
        setTranscript('');
        setCopied(false);

        try {
            const response = await fetch(`/api/transcript?videoId=${encodeURIComponent(videoId)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch transcript');
            }

            if (!data.transcript || data.transcript.length === 0) {
                throw new Error('No transcript found for this video');
            }

            const formatted = data.transcript
                .map((item: TranscriptItem) => `${formatTimestamp(item.offset / 1000 || item.offset)} ${item.text}`)
                .join('\n');

            setTranscript(formatted);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred while fetching the transcript');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!transcript) return;
        navigator.clipboard.writeText(transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!transcript) return;
        const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${extractVideoId(urlOrId) || 'video'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-sheet text-ink p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#ff0000] opacity-30 animate-pulse"></div>
                    <div className="relative bg-sheet p-3 rounded-xl border border-[#ff0000]/50 backdrop-">
                        <Youtube size={28} className="text-[#ff0000]" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <span className="text-[#ff0000]">YT</span>
                        <span className="text-ink">_</span>
                        <span className="text-ink">EXTRACTOR</span>
                    </h2>
                    <p className="text-sm text-ink-soft mt-1">
                        TRANSCRIPT RETRIEVAL SYSTEM
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-sheet backdrop- rounded-xl border border-[#ff0000]/30 p-6 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-[#ff0000]/30"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-rule"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs text-ink mb-2 block">
                            TARGET URL OR VIDEO ID
                        </label>
                        <input
                            type="text"
                            className="w-full bg-sheet border border-[#ff0000]/40 rounded-lg px-4 py-3 text-ink focus:border-[#ff0000] focus:ring-1 focus:ring-[#ff0000] focus:outline-none transition-all placeholder:text-ink-soft"
                            placeholder="e.g., https://youtube.com/watch?v=... or RpUTF_U4kiw"
                            value={urlOrId}
                            onChange={(e) => setUrlOrId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                        />
                    </div>
                    <button
                        onClick={handleExtract}
                        disabled={loading || !urlOrId}
                        className="w-full md:w-auto px-8 py-3 rounded-lg text-sm font-bold bg-signal text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase whitespace-nowrap"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                EXTRACTING...
                            </span>
                        ) : (
                            'EXTRACT'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                        <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {transcript && (
                <div className="mt-6 flexflex-col flex-1 h-0 overflow-hidden bg-sheet backdrop- rounded-xl border border-rule relative flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-rule bg-sheet shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-positive"></div>
                            <span className="text-xs text-ink">TRANSCRIPT INJECTED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 rounded bg-sheet border border-rule text-ink hover:bg-signal/20 transition-all text-xs"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'COPIED' : 'COPY'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-1.5 rounded bg-sheet border border-rule text-ink-soft hover:bg-signal/20 transition-all text-xs"
                            >
                                <Download size={14} />
                                SAVE
                            </button>
                        </div>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                        <pre className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                            {transcript}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
