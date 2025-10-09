"use client";

import React, { useMemo, useState } from 'react';
import { BookOpenIcon, SparklesIcon, ImageIcon, VideoIcon, QuestionIcon, LoaderIcon } from './icons';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  generateImagePreview?: (prompt: string) => Promise<string>;
  generateQuizPreview?: (topic: string) => Promise<{ question: string; options: string[]; answer: string; }>;
}

const processInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`|\*\*[^`]+\*\*|\*[^\*]+\*)/g);
    
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} className="bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-1 text-sm font-mono mx-1">{part.slice(1, -1)}</code>;
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i}>{part.slice(1, -1)}</em>;
                }
                return part;
            })}
        </>
    );
};

type PlaceholderType = 'image' | 'video' | 'quiz';

interface QuizContent {
    question: string;
    options: string[];
    answer: string;
}

const InteractiveMediaPlaceholder: React.FC<{ type: PlaceholderType; description: string; generateImagePreview?: (prompt: string) => Promise<string>; generateQuizPreview?: (topic: string) => Promise<{ question: string; options: string[]; answer: string; }>; }> = ({ type, description, generateImagePreview, generateQuizPreview }) => {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | QuizContent | null>(null);
    
    const handlePreview = async () => {
        setIsPreviewing(true);
        setError(null);
        try {
            if (type === 'image') {
                if (!generateImagePreview) throw new Error('Missing API key for image preview');
                const imageUrl = await generateImagePreview(description);
                setPreviewContent(imageUrl);
            } else if (type === 'video') {
                // For videos, we'll generate a representative image/thumbnail instead of a full video.
                const prompt = `A cinematic still frame representing a video about: ${description}`;
                if (!generateImagePreview) throw new Error('Missing API key for video preview');
                const imageUrl = await generateImagePreview(prompt);
                setPreviewContent(imageUrl);
            } else if (type === 'quiz') {
                if (!generateQuizPreview) throw new Error('Missing API key for quiz preview');
                const quizData = await generateQuizPreview(description);
                setPreviewContent(quizData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate preview.');
        } finally {
            setIsPreviewing(false);
        }
    };

    const ICONS: Record<PlaceholderType, { icon: React.ReactNode; color: string; title: string; }> = {
        image: { icon: <ImageIcon className="w-6 h-6 flex-shrink-0" />, color: 'text-sky-500', title: 'Image Suggestion' },
        video: { icon: <VideoIcon className="w-6 h-6 flex-shrink-0" />, color: 'text-rose-500', title: 'Video Suggestion' },
        quiz: { icon: <QuestionIcon className="w-6 h-6 flex-shrink-0" />, color: 'text-amber-500', title: 'Quiz Suggestion' },
    };

    const { icon, color, title } = ICONS[type];

    return (
        <div className="my-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100/50 dark:bg-slate-800/50">
            <div className="flex items-start space-x-4">
                <div className={color}>{icon}</div>
                <div className="flex-1">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{description}"</p>
                    {!previewContent && !isPreviewing && (
                        <button 
                            onClick={handlePreview} 
                            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                           <SparklesIcon className="w-4 h-4 mr-2"/>
                           Generate Preview
                        </button>
                    )}
                </div>
            </div>
            
            {isPreviewing && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <LoaderIcon className="w-4 h-4 animate-spin mr-2"/>
                        Generating preview...
                    </div>
                    <div className="animate-pulse mt-3">
                        {(type === 'image' || type === 'video') && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg aspect-[16/9]"></div>
                        )}
                        {type === 'quiz' && (
                             <div className="space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="space-y-2 pt-2">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">Error: {error}</p>}
            
            {!isPreviewing && previewContent && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                   {typeof previewContent === 'string' && <img src={previewContent} alt={description} className="rounded-lg max-w-full h-auto" />}
                   {typeof previewContent === 'object' && 'question' in previewContent && (
                       <div>
                           <p className="font-semibold">{previewContent.question}</p>
                           <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                               {previewContent.options.map((opt, i) => <li key={i}>{opt}</li>)}
                           </ul>
                           <p className="text-xs mt-2 text-slate-500">(Correct Answer: {previewContent.answer})</p>
                       </div>
                   )}
                </div>
            )}
        </div>
    );
};

type ListItemData = {
    line: string;
    key: number;
};

const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: ListItemData[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    const getIndent = (line: string) => line.search(/\S|$/);
    const isListItem = (line: string) => line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/);
    const getType = (line: string): 'ul' | 'ol' => line.trim().match(/^\d+\.\s/) ? 'ol' : 'ul';
    const getContent = (line: string): string => line.trim().replace(/^(\*|-\s|\d+\.\s)\s*/, '');

    const flushList = () => {
        if (listItems.length === 0) return;

        type ListNode = {
            key: number;
            content: React.ReactNode;
            type: 'ul' | 'ol';
            children: ListNode[];
        };

        const listTree: ListNode[] = [];
        const path: { indent: number; node: ListNode }[] = [];

        listItems.forEach(item => {
            const indent = getIndent(item.line);
            const node: ListNode = {
                key: item.key,
                content: processInlineFormatting(getContent(item.line)),
                type: getType(item.line),
                children: []
            };

            while (path.length > 0 && indent <= path[path.length - 1].indent) {
                path.pop();
            }

            if (path.length > 0) {
                path[path.length - 1].node.children.push(node);
            } else {
                listTree.push(node);
            }
            path.push({ indent, node });
        });

        const renderAndGroupLists = (nodes: ListNode[], level: number = 1): React.ReactNode[] => {
            const renderedLists: React.ReactNode[] = [];
            if (nodes.length === 0) return renderedLists;

            let i = 0;
            while (i < nodes.length) {
                const listType = nodes[i].type;
                const group: ListNode[] = [];
                while (i < nodes.length && nodes[i].type === listType) {
                    group.push(nodes[i]);
                    i++;
                }

                const ListTag = listType;
                const paddingClass = level > 1 ? "pl-5" : "pl-6";
                const classNames = `${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-outside space-y-2 my-2 ${paddingClass}`;

                renderedLists.push(
                    <ListTag key={`${listType}-${i}-${level}`} className={classNames}>
                        {group.map(node => (
                            <li key={node.key}>
                                {node.content}
                                {node.children.length > 0 && renderAndGroupLists(node.children, level + 1)}
                            </li>
                        ))}
                    </ListTag>
                );
            }
            return renderedLists;
        };

        elements.push(...renderAndGroupLists(listTree));
        listItems = [];
    };
    
    lines.forEach((line, index) => {
        if (line.startsWith('```')) {
            flushList();
            if (inCodeBlock) {
                elements.push(
                    <div key={`code-${elements.length}`} className="my-4 bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                        <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 dark:bg-slate-900/50">{codeBlockLang || 'code'}</div>
                        <pre className="p-4 text-sm overflow-x-auto text-white">
                            <code>{codeBlockContent.join('\n')}</code>
                        </pre>
                    </div>
                );
                inCodeBlock = false;
                codeBlockContent = [];
                codeBlockLang = '';
            } else {
                inCodeBlock = true;
                codeBlockLang = line.substring(3).trim();
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            return;
        }

        if (isListItem(line)) {
            listItems.push({ line, key: index });
            return;
        }

        // If we reach here, it's not a list item, so flush any pending list.
        flushList();
        
        let match;
        if (match = line.match(/\[Image:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="image" description={match[1]} />);
        } else if (match = line.match(/\[Video:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="video" description={match[1]} />);
        } else if (match = line.match(/\[Quiz:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="quiz" description={match[1]} />);
        } else if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={index} className="my-4 pl-4 border-l-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 italic">
                    {processInlineFormatting(line.substring(2))}
                </blockquote>
            );
        } else if (line.match(/^(---|___|\*\*\*)$/)) {
            elements.push(<hr key={index} className="my-8 border-slate-200 dark:border-slate-700" />);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={index} className="text-xl font-semibold mt-6 mb-2">{processInlineFormatting(line.substring(4))}</h3>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={index} className="text-2xl font-bold mt-8 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">{processInlineFormatting(line.substring(3))}</h2>);
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={index} className="text-3xl font-extrabold mt-4 mb-4">{processInlineFormatting(line.substring(2))}</h1>);
        } else if (line.trim() !== '') {
            elements.push(<p key={index} className="my-4 leading-relaxed">{processInlineFormatting(line)}</p>);
        }
    });

    flushList(); 
    
    if (inCodeBlock) {
         elements.push(
            <div key={`code-${elements.length}`} className="my-4 bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 dark:bg-slate-900/50">{codeBlockLang || 'code'}</div>
                <pre className="p-4 text-sm overflow-x-auto text-white">
                    <code>{codeBlockContent.join('\n')}</code>
                </pre>
            </div>
        );
    }
    
    return elements;
};

const MemoizedContent: React.FC<{ content: string }> = React.memo(({ content }) => {
    const parsedContent = useMemo(() => parseMarkdown(content), [content]);
    return <div className="prose prose-slate dark:prose-invert max-w-none">{parsedContent}</div>;
});

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <SparklesIcon className="w-12 h-12 text-indigo-500 animate-pulse" />
        <p className="mt-4 text-lg font-medium">Generating your content...</p>
        <p className="text-sm text-slate-500">The AI is working its magic. This might take a moment.</p>
    </div>
);


const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, error, generateImagePreview, generateQuizPreview }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-lg font-semibold text-red-700 dark:text-red-300">An Error Occurred</p>
        <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        <BookOpenIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-4 text-lg font-medium">Your Content Awaits</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Fill out the form to generate your educational material.
        </p>
      </div>
    );
  }

  return useMemo(() => (
    <div className="prose prose-slate dark:prose-invert max-w-none">{parseMarkdownWithGenerators(content, generateImagePreview, generateQuizPreview)}</div>
  ), [content, generateImagePreview, generateQuizPreview]);
};

export default ContentDisplay;

// Helper: clone of parseMarkdown that forwards preview generators to placeholders
function parseMarkdownWithGenerators(text: string, generateImagePreview?: (prompt: string) => Promise<string>, generateQuizPreview?: (topic: string) => Promise<{ question: string; options: string[]; answer: string; }>) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: ListItemData[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    const getIndent = (line: string) => line.search(/\S|$/);
    const isListItem = (line: string) => line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/);
    const getType = (line: string): 'ul' | 'ol' => line.trim().match(/^\d+\.\s/) ? 'ol' : 'ul';
    const getContent = (line: string): string => line.trim().replace(/^(\*|-\s|\d+\.\s)\s*/, '');

    const flushList = () => {
        if (listItems.length === 0) return;
        // Defer to original function for brevity
        elements.push(<ul key={`list-${elements.length}`} className="list-disc list-outside space-y-2 my-2 pl-6">{listItems.map(item => <li key={item.key}>{processInlineFormatting(getContent(item.line))}</li>)}</ul>);
        listItems = [];
    };

    lines.forEach((line, index) => {
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <div key={`code-${elements.length}`} className="my-4 bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                        <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 dark:bg-slate-900/50">{codeBlockLang || 'code'}</div>
                        <pre className="p-4 text-sm overflow-x-auto text-white">
                            <code>{codeBlockContent.join('\n')}</code>
                        </pre>
                    </div>
                );
                inCodeBlock = false;
                codeBlockContent = [];
                codeBlockLang = '';
            } else {
                inCodeBlock = true;
                codeBlockLang = line.substring(3).trim();
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            return;
        }

        if (isListItem(line)) {
            listItems.push({ line, key: index });
            return;
        }

        flushList();

        let match;
        if (match = line.match(/\[Image:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="image" description={match[1]} generateImagePreview={generateImagePreview} />);
        } else if (match = line.match(/\[Video:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="video" description={match[1]} generateImagePreview={generateImagePreview} />);
        } else if (match = line.match(/\[Quiz:\s*(.*?)\]/)) {
            elements.push(<InteractiveMediaPlaceholder key={index} type="quiz" description={match[1]} generateQuizPreview={generateQuizPreview} />);
        } else if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={index} className="my-4 pl-4 border-l-4 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 italic">
                    {processInlineFormatting(line.substring(2))}
                </blockquote>
            );
        } else if (line.match(/^(---|___|\*\*\*)$/)) {
            elements.push(<hr key={index} className="my-8 border-slate-200 dark:border-slate-700" />);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={index} className="text-xl font-semibold mt-6 mb-2">{processInlineFormatting(line.substring(4))}</h3>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={index} className="text-2xl font-bold mt-8 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">{processInlineFormatting(line.substring(3))}</h2>);
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={index} className="text-3xl font-extrabold mt-4 mb-4">{processInlineFormatting(line.substring(2))}</h1>);
        } else if (line.trim() !== '') {
            elements.push(<p key={index} className="my-4 leading-relaxed">{processInlineFormatting(line)}</p>);
        }
    });

    if (inCodeBlock) {
        elements.push(
            <div key={`code-${elements.length}`} className="my-4 bg-slate-900 dark:bg-black rounded-lg overflow-hidden border border-slate-700">
                <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 dark:bg-slate-900/50">{codeBlockLang || 'code'}</div>
                <pre className="p-4 text-sm overflow-x-auto text-white">
                    <code>{codeBlockContent.join('\n')}</code>
                </pre>
            </div>
        );
    }

    return elements;
}