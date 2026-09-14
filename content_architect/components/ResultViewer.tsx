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
        <div className="my-8 rounded border border-rule bg-sheet group relative text-sm not-prose">
            {/* Header with technical look */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-rule">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-ink" />
                    <span className="text-[10px] font-bold text-ink uppercase">
                        {language || 'TEXT'}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200 border border-transparent
                        ${copied
                            ? 'text-positive'
                            : 'text-ink-soft hover:text-ink'
                        }`}
                >
                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Code Content */}
            <div className="p-5 overflow-x-auto custom-scrollbar">
                <pre className="text-ink leading-relaxed text-[13px]">
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
            return <strong key={index} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-muted text-ink-soft text-[0.9em] px-1.5 py-0.5 rounded border border-rule mx-0.5">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
    // Regex splits content by code blocks: ```lang ... ```
    const parts = content.split(/(```(?:[\w-]*)\s*[\s\S]*?```)/g);

    return (
        <div className="text-ink leading-relaxed space-y-4">
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
                                return <h1 key={bIdx} className="text-3xl font-bold text-ink mt-10 mb-6 pb-2 border-b border-rule tracking-tight">{formatInline(trimmed.replace('# ', ''))}</h1>;
                            }
                            if (trimmed.startsWith('## ')) {
                                return <h2 key={bIdx} className="text-2xl font-bold text-ink mt-8 mb-4 flex items-center gap-2"><span className="text-ink text-sm">##</span> {formatInline(trimmed.replace('## ', ''))}</h2>;
                            }
                            if (trimmed.startsWith('### ')) {
                                return <h3 key={bIdx} className="text-xl font-bold text-ink mt-6 mb-3">{formatInline(trimmed.replace('### ', ''))}</h3>;
                            }

                            // Blockquotes
                            if (trimmed.startsWith('> ')) {
                                return (
                                    <blockquote key={bIdx} className="border-l-4 border-rule pl-4 py-2 my-6 text-ink-soft italic bg-muted rounded-r">
                                        {formatInline(trimmed.replace(/^> /gm, ''))}
                                    </blockquote>
                                );
                            }

                            // Unordered List (- or *)
                            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                                return (
                                    <ul key={bIdx} className="list-disc pl-5 mb-4 space-y-2 marker:text-ink">
                                        {trimmed.split('\n').map((line, lIdx) => (
                                            <li key={lIdx} className="pl-1 text-ink">{formatInline(line.replace(/^[-*] /, ''))}</li>
                                        ))}
                                    </ul>
                                );
                            }

                            // Numbered List
                            if (/^\d+\./.test(trimmed)) {
                                return (
                                    <ol key={bIdx} className="list-decimal pl-5 mb-4 space-y-2 marker:text-ink text-ink">
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
            <div className="h-full flex items-center justify-center text-ink-soft bg-sheet rounded-xl border border-rule min-h-[400px]">
                <div className="text-center">
                    <Cpu className="w-16 h-16 mx-auto mb-4 opacity-20 animate-pulse text-ink" />
                    <p className="text-sm uppercase text-ink">System Standby</p>
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
        <div className="bg-sheet backdrop- rounded-xl border border-rule overflow-hidden flex flex-col h-full min-h-[600px] relative">
            {/* Decorative Top Border */}
            <div className="h-px w-full bg-rule"></div>

            {/* Header / Tabs */}
            <div className="flex border-b border-rule bg-sheet overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-signal/10 text-ink border-b-2 border-rule'
                                    : tab.disabled
                                        ? 'text-ink cursor-not-allowed'
                                        : 'text-ink-soft hover:text-ink hover:bg-muted'
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
                        <div className="bg-signal/10 p-6 rounded border border-rule">
                            <h3 className="text-xs font-bold text-ink uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-signal animate-pulse"></span>
                                Target Audience Analysis
                            </h3>
                            <p className="text-ink leading-relaxed text-sm">{research.target_audience_analysis}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-sheet p-6 rounded border border-rule">
                                <h3 className="font-bold text-ink mb-4 flex items-center gap-2 text-sm tracking-wide">
                                    KEY_POINTS
                                </h3>
                                <ul className="space-y-3">
                                    {research.key_points.map((pt, i) => (
                                        <li key={i} className="text-ink flex gap-3 text-sm leading-relaxed">
                                            <span className="text-ink font-bold">›</span>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-positive/5 p-6 rounded border border-positive/30">
                                    <h3 className="font-bold text-positive mb-4 flex items-center gap-2 text-sm tracking-wide">
                                        SEO_STRATEGY
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {research.seo_keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-positive/10 text-positive rounded text-[10px] border border-positive/30">
                                                #{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-muted p-6 rounded border border-rule">
                                    <h3 className="text-xs font-bold text-ink uppercase mb-2">Recommended Angle</h3>
                                    <p className="text-sm text-ink italic leading-relaxed border-l-2 border-rule pl-3">"{research.recommended_angle}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'draft' && draft && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
                        <div className="text-center pb-8 border-b border-rule">
                            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3 tracking-tight">{draft.title}</h1>
                            {draft.subtitle && <p className="text-xl text-ink font-light">{draft.subtitle}</p>}
                            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-ink text-xs font-medium uppercase tracking-wide border border-rule">
                                <span>{draft.estimated_reading_time} min read</span>
                            </div>
                        </div>

                        <div className="text-lg leading-loose text-ink font-light border-l-4 border-rule pl-6 my-8 italic opacity-90">
                            {draft.introduction}
                        </div>

                        {draft.main_sections.map((section, idx) => (
                            <div key={idx} className="mt-10">
                                <h2 className="text-2xl font-bold text-ink mb-4 flex items-center gap-3">
                                    <span className="text-ink text-base">0{idx + 1}.</span>
                                    {section.heading}
                                </h2>
                                <MarkdownRenderer content={section.content} />
                            </div>
                        ))}

                        <div className="mt-16 p-8 bg-muted rounded border border-rule">
                            <h3 className="text-sm font-bold text-ink mb-3 uppercase opacity-80">Conclusion</h3>
                            <p className="text-ink leading-relaxed">{draft.conclusion}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'edits' && edits && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row items-center justify-between bg-sheet p-8 rounded border border-rule gap-6">
                            <div>
                                <h3 className="text-xl font-bold text-ink uppercase">Quality Score</h3>
                                <p className="text-ink0 mt-1 text-sm">Automated heuristic analysis.</p>
                            </div>
                            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="transparent"
                                        stroke={edits.overall_score > 80 ? 'var(--positive)' : edits.overall_score > 60 ? 'var(--working)' : 'var(--destructive)'}
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - edits.overall_score / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold text-ink">{edits.overall_score}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-ink flex items-center gap-2 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-sm bg-working"></span>
                                    DETECTED_ISSUES
                                </h3>
                                {edits.clarity_issues.length === 0 ? (
                                    <div className="p-6 bg-positive/10 rounded border border-positive/30 text-positive flex items-center gap-3">
                                        <CheckCircle size={20} />
                                        <p className="font-medium text-sm">OPTIMAL CLARITY ACHIEVED</p>
                                    </div>
                                ) : (
                                    edits.clarity_issues.map((issue, i) => (
                                        <div key={i} className="bg-muted p-5 rounded border border-rule hover:border-working/30 transition-colors">
                                            <div className="flex gap-2 items-start mb-2">
                                                <span className="bg-working/10 text-working text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-working/30">Warning</span>
                                                <p className="font-medium text-ink text-sm">{issue.issue}</p>
                                            </div>
                                            <div className="pl-4 border-l-2 border-rule my-3">
                                                <p className="text-ink text-xs italic bg-sheet p-2 rounded">"{issue.relevant_text_snippet}"</p>
                                            </div>
                                            <div className="flex gap-2 items-start pt-2 border-t border-rule">
                                                <Sparkles size={14} className="text-ink mt-0.5" />
                                                <p className="text-ink text-sm"><span className="font-medium text-ink">Fix:</span> {issue.suggestion}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-muted p-6 rounded border border-rule">
                                    <h4 className="font-bold text-ink mb-3 text-sm">STRUCTURE_ANALYSIS</h4>
                                    <p className="text-ink text-sm leading-relaxed">{edits.structure_feedback}</p>
                                </div>
                                <div className="bg-muted p-6 rounded border border-rule">
                                    <h4 className="font-bold text-ink mb-3 text-sm">TONE_VERIFICATION</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-signal/10 text-ink rounded border border-rule">
                                            <Search size={16} />
                                        </div>
                                        <p className="text-ink text-sm leading-relaxed">{edits.tone_consistency_check}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'final' && final && (
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                        <div className="bg-muted border border-rule rounded-xl p-8 mb-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={100} className="text-ink" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-ink uppercase mb-2 block">Published Title</span>
                                        <p className="text-2xl font-bold text-ink tracking-tight">{final.title}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <span className="text-[10px] font-bold text-ink uppercase mb-2 block">Meta Description</span>
                                    <p className="text-ink text-sm leading-relaxed border-l-2 border-rule pl-3">{final.meta_description}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {final.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-muted text-ink hover:text-ink hover:bg-muted transition-colors text-xs rounded-sm border border-rule">
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
                            <div key={idx} className="group relative rounded-xl overflow-hidden border border-rule bg-sheet hover:border-rule transition-all duration-300">
                                <div className="aspect-video w-full overflow-hidden bg-sheet relative">
                                    <img
                                        src={img.url}
                                        alt={`Generated visual ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <a
                                            href={img.url}
                                            download={`visual-${idx + 1}.png`}
                                            className="bg-signal text-black font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-white transition-colors"
                                        >
                                            <Download size={16} />
                                            Download
                                        </a>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-rule">
                                    <div className="flex items-start gap-3">
                                        <span className="text-ink text-xs font-bold pt-1">0{idx + 1}</span>
                                        <p className="text-ink-soft text-xs leading-relaxed">{img.prompt}</p>
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