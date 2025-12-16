import React, { useState } from 'react';
import { ResearchBrief, ContentDraft, EditSuggestions, FinalContent, GeneratedImage } from '../types';
import { Search, FileText, CheckCircle, Sparkles, Copy, Check, Terminal, Cpu, Image as ImageIcon, Download } from 'lucide-react';

interface ResultViewerProps {
    research: ResearchBrief | null;
    draft: ContentDraft | null;
    edits: EditSuggestions | null;
    final: FinalContent | null;
    images: GeneratedImage[];
}

// --- Specialized Components ---

const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-8 rounded border border-cyber-primary/20 bg-cyber-black/50 group relative font-mono text-sm not-prose shadow-lg shadow-black/40">
            {/* Header with technical look */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyber-primary" />
                    <span className="text-[10px] font-bold text-cyber-primary uppercase tracking-wider">
                        {language || 'TEXT'}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200 border border-transparent
                        ${copied
                            ? 'text-green-400'
                            : 'text-cyber-text hover:text-white'
                        }`}
                >
                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Code Content */}
            <div className="p-5 overflow-x-auto custom-scrollbar">
                <pre className="text-slate-300 font-mono leading-relaxed text-[13px]">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

const formatInline = (text: string) => {
    // Simple parser for **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-white/10 text-cyber-accent font-mono text-[0.9em] px-1.5 py-0.5 rounded border border-white/10 mx-0.5">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
    // Regex splits content by code blocks: ```lang ... ```
    const parts = content.split(/(```(?:[\w-]*)\s*[\s\S]*?```)/g);

    return (
        <div className="text-slate-300 leading-relaxed space-y-4">
            {parts.map((part, i) => {
                // Check if this part is a code block
                const codeMatch = part.match(/^```([\w-]*)\s*([\s\S]*?)```$/);
                if (codeMatch) {
                    return <CodeBlock key={i} language={codeMatch[1]} code={codeMatch[2]} />;
                }

                if (!part.trim()) return null;

                // Render text parts
                return (
                    <div key={i} className="space-y-4">
                        {part.split('\n\n').map((block, bIdx) => {
                            const trimmed = block.trim();
                            if (!trimmed) return null;

                            // Headings
                            if (trimmed.startsWith('# ')) {
                                return <h1 key={bIdx} className="text-3xl font-bold text-white mt-10 mb-6 pb-2 border-b border-white/10 tracking-tight">{formatInline(trimmed.replace('# ', ''))}</h1>;
                            }
                            if (trimmed.startsWith('## ')) {
                                return <h2 key={bIdx} className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2"><span className="text-cyber-primary text-sm">##</span> {formatInline(trimmed.replace('## ', ''))}</h2>;
                            }
                            if (trimmed.startsWith('### ')) {
                                return <h3 key={bIdx} className="text-xl font-bold text-slate-100 mt-6 mb-3">{formatInline(trimmed.replace('### ', ''))}</h3>;
                            }

                            // Blockquotes
                            if (trimmed.startsWith('> ')) {
                                return (
                                    <blockquote key={bIdx} className="border-l-4 border-cyber-primary pl-4 py-2 my-6 text-slate-400 italic bg-white/5 rounded-r shadow-sm">
                                        {formatInline(trimmed.replace(/^> /gm, ''))}
                                    </blockquote>
                                );
                            }

                            // Unordered List (- or *)
                            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                                return (
                                    <ul key={bIdx} className="list-disc pl-5 mb-4 space-y-2 marker:text-cyber-primary">
                                        {trimmed.split('\n').map((line, lIdx) => (
                                            <li key={lIdx} className="pl-1 text-slate-300">{formatInline(line.replace(/^[-*] /, ''))}</li>
                                        ))}
                                    </ul>
                                );
                            }

                            // Numbered List
                            if (/^\d+\./.test(trimmed)) {
                                return (
                                    <ol key={bIdx} className="list-decimal pl-5 mb-4 space-y-2 marker:text-cyber-primary text-slate-300">
                                        {trimmed.split('\n').map((line, lIdx) => (
                                            <li key={lIdx} className="pl-1">{formatInline(line.replace(/^\d+\.\s*/, ''))}</li>
                                        ))}
                                    </ol>
                                );
                            }

                            // Standard Paragraph
                            return <div key={bIdx} className="mb-4 whitespace-pre-wrap">{formatInline(trimmed)}</div>;
                        })}
                    </div>
                );
            })}
        </div>
    );
}

const ResultViewer: React.FC<ResultViewerProps> = ({ research, draft, edits, final, images }) => {
    const [activeTab, setActiveTab] = useState<'research' | 'draft' | 'edits' | 'final' | 'gallery'>('final');

    // Auto-switch tabs if data isn't available for current tab
    React.useEffect(() => {
        if (activeTab === 'gallery' && images.length === 0) setActiveTab('final');
        if (activeTab === 'final' && !final) setActiveTab('edits');
        if (activeTab === 'edits' && !edits) setActiveTab('draft');
        if (activeTab === 'draft' && !draft) setActiveTab('research');
    }, [research, draft, edits, final, images, activeTab]);

    // Force switch to Gallery when images arrive
    React.useEffect(() => {
        if (images.length > 0) setActiveTab('gallery');
    }, [images]);

    if (!research) {
        return (
            <div className="h-full flex items-center justify-center text-cyber-text/30 bg-cyber-panel/40 rounded-xl border border-white/5 min-h-[400px]">
                <div className="text-center">
                    <Cpu className="w-16 h-16 mx-auto mb-4 opacity-20 animate-pulse" />
                    <p className="font-mono text-sm tracking-widest uppercase">System Standby</p>
                    <p className="text-xs mt-2 opacity-50">Initiate pipeline to generate output</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'research', label: 'BRIEF', icon: Search, disabled: !research },
        { id: 'draft', label: 'DRAFT', icon: FileText, disabled: !draft },
        { id: 'edits', label: 'REVIEW', icon: CheckCircle, disabled: !edits },
        { id: 'final', label: 'ARTIFACT', icon: Sparkles, disabled: !final },
        { id: 'gallery', label: 'GALLERY', icon: ImageIcon, disabled: images.length === 0 },
    ];

    return (
        <div className="bg-cyber-panel/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col h-full min-h-[600px] shadow-2xl relative">
            {/* Decorative Top Border */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent"></div>

            {/* Header / Tabs */}
            <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold font-mono transition-all whitespace-nowrap tracking-wider
                                ${activeTab === tab.id
                                    ? 'bg-cyber-primary/10 text-cyber-primary border-b-2 border-cyber-primary'
                                    : tab.disabled
                                        ? 'text-cyber-text/20 cursor-not-allowed'
                                        : 'text-cyber-text hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto flex-1 bg-transparent">
                {activeTab === 'research' && research && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-cyber-primary/10 p-6 rounded border border-cyber-primary/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <h3 className="text-xs font-bold text-cyber-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyber-primary animate-pulse"></span>
                                Target Audience Analysis
                            </h3>
                            <p className="text-cyan-100 leading-relaxed font-mono text-sm">{research.target_audience_analysis}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-cyber-black/50 p-6 rounded border border-white/5">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2 font-mono text-sm tracking-wide">
                                    KEY_POINTS
                                </h3>
                                <ul className="space-y-3">
                                    {research.key_points.map((pt, i) => (
                                        <li key={i} className="text-slate-300 flex gap-3 text-sm leading-relaxed">
                                            <span className="text-cyber-accent font-bold">›</span>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-cyber-success/5 p-6 rounded border border-cyber-success/20">
                                    <h3 className="font-bold text-cyber-success mb-4 flex items-center gap-2 font-mono text-sm tracking-wide">
                                        SEO_STRATEGY
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {research.seo_keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-cyber-success/10 text-cyber-success rounded text-[10px] font-mono border border-cyber-success/20">
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded border border-white/10">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">Recommended Angle</h3>
                                    <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-cyber-accent pl-3">"{research.recommended_angle}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'draft' && draft && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                        <div className="text-center pb-8 border-b border-white/10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{draft.title}</h1>
                            {draft.subtitle && <p className="text-xl text-cyber-primary font-light">{draft.subtitle}</p>}
                            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-xs font-medium uppercase tracking-wide border border-white/10">
                                <span>{draft.estimated_reading_time} min read</span>
                            </div>
                        </div>

                        <div className="text-lg leading-loose text-slate-300 font-light border-l-4 border-cyber-primary pl-6 my-8 italic opacity-90">
                            {draft.introduction}
                        </div>

                        {draft.main_sections.map((section, idx) => (
                            <div key={idx} className="mt-10">
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="text-cyber-text/30 text-base font-mono">0{idx + 1}.</span>
                                    {section.heading}
                                </h2>
                                <MarkdownRenderer content={section.content} />
                            </div>
                        ))}

                        <div className="mt-16 p-8 bg-white/5 rounded border border-white/10">
                            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider opacity-80 font-mono">Conclusion</h3>
                            <p className="text-slate-300 leading-relaxed">{draft.conclusion}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'edits' && edits && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row items-center justify-between bg-cyber-black/50 p-8 rounded border border-white/10 shadow-lg gap-6">
                            <div>
                                <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider">Quality Score</h3>
                                <p className="text-slate-500 mt-1 text-sm">Automated heuristic analysis.</p>
                            </div>
                            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="transparent"
                                        stroke={edits.overall_score > 80 ? '#10b981' : edits.overall_score > 60 ? '#eab308' : '#ef4444'}
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - edits.overall_score / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor]"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold text-white font-mono">{edits.overall_score}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-white flex items-center gap-2 font-mono text-sm tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-orange-500"></span>
                                    DETECTED_ISSUES
                                </h3>
                                {edits.clarity_issues.length === 0 ? (
                                    <div className="p-6 bg-cyber-success/10 rounded border border-cyber-success/20 text-cyber-success flex items-center gap-3">
                                        <CheckCircle size={20} />
                                        <p className="font-medium font-mono text-sm">OPTIMAL CLARITY ACHIEVED</p>
                                    </div>
                                ) : (
                                    edits.clarity_issues.map((issue, i) => (
                                        <div key={i} className="bg-white/5 p-5 rounded border border-white/10 hover:border-orange-500/50 transition-colors">
                                            <div className="flex gap-2 items-start mb-2">
                                                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border border-orange-500/20">Warning</span>
                                                <p className="font-medium text-white text-sm">{issue.issue}</p>
                                            </div>
                                            <div className="pl-4 border-l-2 border-white/10 my-3">
                                                <p className="text-slate-400 text-xs italic font-mono bg-black/20 p-2 rounded">"{issue.relevant_text_snippet}"</p>
                                            </div>
                                            <div className="flex gap-2 items-start pt-2 border-t border-white/5">
                                                <Sparkles size={14} className="text-cyber-primary mt-0.5" />
                                                <p className="text-slate-300 text-sm"><span className="font-medium text-cyber-primary">Fix:</span> {issue.suggestion}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/5 p-6 rounded border border-white/10">
                                    <h4 className="font-bold text-white mb-3 font-mono text-sm tracking-wider">STRUCTURE_ANALYSIS</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{edits.structure_feedback}</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded border border-white/10">
                                    <h4 className="font-bold text-white mb-3 font-mono text-sm tracking-wider">TONE_VERIFICATION</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-cyber-primary/10 text-cyber-primary rounded border border-cyber-primary/20">
                                            <Search size={16} />
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed">{edits.tone_consistency_check}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'final' && final && (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                        <div className="bg-gradient-to-r from-cyber-dark to-cyber-panel border border-white/10 rounded-xl p-8 mb-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={100} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-cyber-primary uppercase tracking-widest mb-2 block font-mono">Published Title</span>
                                        <p className="text-2xl font-bold text-white tracking-tight">{final.title}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <span className="text-[10px] font-bold text-cyber-primary uppercase tracking-widest mb-2 block font-mono">Meta Description</span>
                                    <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-white/20 pl-3">{final.meta_description}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {final.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs rounded-sm font-mono border border-white/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <MarkdownRenderer content={final.full_markdown} />
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {images.map((img, idx) => (
                            <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/10 bg-cyber-black/50 hover:border-cyber-primary/50 transition-all duration-300 shadow-lg">
                                <div className="aspect-video w-full overflow-hidden bg-cyber-dark relative">
                                    <img
                                        src={img.url}
                                        alt={`Generated visual ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <a
                                            href={img.url}
                                            download={`visual-${idx + 1}.png`}
                                            className="bg-cyber-primary text-cyber-black font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-white transition-colors"
                                        >
                                            <Download size={16} />
                                            Download
                                        </a>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5">
                                    <div className="flex items-start gap-3">
                                        <span className="text-cyber-primary font-mono text-xs font-bold pt-1">0{idx + 1}</span>
                                        <p className="text-slate-400 text-xs leading-relaxed font-mono">{img.prompt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultViewer;