import React, { useState } from 'react';
import { ContentConfig, ContentType, ToneStyle } from '../types';
import { Wand2, Zap } from 'lucide-react';

interface PipelineFormProps {
    onStart: (config: ContentConfig) => void;
    isLoading: boolean;
}

const PipelineForm: React.FC<PipelineFormProps> = ({ onStart, isLoading }) => {
    const [config, setConfig] = useState<ContentConfig>({
        topic: '',
        contentType: ContentType.BLOG_POST,
        tone: ToneStyle.PROFESSIONAL,
        targetAudience: 'General Audience',
        wordCountTarget: 1000
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(config);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-cyber-panel/60 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyber-primary/10 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-cyber-accent/10 to-transparent pointer-events-none"></div>

            <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2 font-mono">
                    <Zap size={16} className="text-cyber-primary" />
                    PROJECT_BRIEF
                </h2>
                <p className="text-xs text-cyber-text font-mono">Configure autonomous agents.</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-cyber-text mb-2 uppercase tracking-wider font-mono">Topic / Query</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded bg-cyber-dark border border-white/10 text-white placeholder-slate-600 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all font-mono text-sm"
                        placeholder="e.g. The Future of Quantum Computing"
                        value={config.topic}
                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-cyber-text mb-2 uppercase tracking-wider font-mono">Type</label>
                        <select
                            className="w-full px-4 py-2.5 rounded bg-cyber-dark border border-white/10 text-slate-300 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all text-sm appearance-none"
                            value={config.contentType}
                            onChange={(e) => setConfig({ ...config, contentType: e.target.value as ContentType })}
                            disabled={isLoading}
                        >
                            {Object.values(ContentType).map((t) => (
                                <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-cyber-text mb-2 uppercase tracking-wider font-mono">Tone</label>
                        <select
                            className="w-full px-4 py-2.5 rounded bg-cyber-dark border border-white/10 text-slate-300 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all text-sm appearance-none"
                            value={config.tone}
                            onChange={(e) => setConfig({ ...config, tone: e.target.value as ToneStyle })}
                            disabled={isLoading}
                        >
                            {Object.values(ToneStyle).map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-cyber-text mb-2 uppercase tracking-wider font-mono">Audience</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded bg-cyber-dark border border-white/10 text-white placeholder-slate-600 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all font-mono text-sm"
                            placeholder="e.g. Developers"
                            value={config.targetAudience}
                            onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-cyber-text mb-2 uppercase tracking-wider font-mono">Length (Words)</label>
                        <input
                            type="number"
                            min="300"
                            max="5000"
                            step="100"
                            required
                            className="w-full px-4 py-3 rounded bg-cyber-dark border border-white/10 text-white placeholder-slate-600 focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary outline-none transition-all font-mono text-sm"
                            value={config.wordCountTarget}
                            onChange={(e) => setConfig({ ...config, wordCountTarget: parseInt(e.target.value) })}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group
                    ${isLoading 
                        ? 'bg-cyber-panel border border-white/5 text-cyber-text cursor-not-allowed' 
                        : 'bg-cyber-primary/20 hover:bg-cyber-primary/30 text-cyber-primary border border-cyber-primary hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    }`}
            >
                {isLoading ? (
                    <span className="animate-pulse">Initializing...</span>
                ) : (
                    <>
                        <Wand2 size={18} />
                        Execute Pipeline
                    </>
                )}
            </button>
        </form>
    );
};

export default PipelineForm;