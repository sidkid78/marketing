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
        <div className="flex flex-col h-full cyber-panel bg-black/40 text-white p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#ff0000] blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-black/50 p-3 rounded-xl border border-[#ff0000]/50 backdrop-blur-sm">
                        <Youtube size={28} className="text-[#ff0000]" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
                        <span className="text-[#ff0000] neon-text">YT</span>
                        <span className="text-white">_</span>
                        <span className="text-[#00f0ff] neon-text">EXTRACTOR</span>
                    </h2>
                    <p className="text-sm text-gray-400 font-mono tracking-widest mt-1">
                        TRANSCRIPT RETRIEVAL SYSTEM
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-[#ff0000]/30 p-6 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-[#ff0000]/30"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-[#00f0ff]/30"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-mono text-[#00f0ff] mb-2 block tracking-wider">
                            TARGET URL OR VIDEO ID
                        </label>
                        <input
                            type="text"
                            className="w-full bg-black/60 border border-[#ff0000]/40 rounded-lg px-4 py-3 text-white font-mono focus:border-[#ff0000] focus:ring-1 focus:ring-[#ff0000] focus:outline-none transition-all placeholder:text-gray-600"
                            placeholder="e.g., https://youtube.com/watch?v=... or RpUTF_U4kiw"
                            value={urlOrId}
                            onChange={(e) => setUrlOrId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                        />
                    </div>
                    <button
                        onClick={handleExtract}
                        disabled={loading || !urlOrId}
                        className="w-full md:w-auto px-8 py-3 rounded-lg font-mono text-sm font-bold bg-gradient-to-r from-[#ff0000] to-[#aa0000] text-white hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase whitespace-nowrap"
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
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3">
                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-mono text-red-200">{error}</p>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {transcript && (
                <div className="mt-6 flexflex-col flex-1 h-0 overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl border border-[#00f0ff]/30 relative flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-[#00f0ff]/20 bg-black/60 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]"></div>
                            <span className="text-xs font-mono tracking-widest text-[#00f0ff]">TRANSCRIPT INJECTED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/50 border border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-all font-mono text-xs"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'COPIED' : 'COPY'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/50 border border-[#ff00ff]/50 text-[#ff00ff] hover:bg-[#ff00ff]/20 transition-all font-mono text-xs"
                            >
                                <Download size={14} />
                                SAVE
                            </button>
                        </div>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {transcript}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
