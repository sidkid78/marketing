import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import Button from './Button';
import { MessageSquare, Send, User, Bot, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What is the Option Period?",
  "What documents do I need for closing?",
  "Explain 'Earnest Money' to me.",
  "How do I fill out the SDN?"
];

interface AIGuideProps {
  apiKey?: string;
}

const AIGuide: React.FC<AIGuideProps> = ({ apiKey = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your Dwellingly Guide. I can explain real estate terms and help you navigate the process. I cannot give legal advice. How can I help?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateAIResponse(text, apiKey);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error. Please check your connection or API key.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h2 className="font-semibold">Dwellingly AI Guide</h2>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
          Educational Only
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }
              ${msg.isError ? 'bg-red-50 border-red-200 text-red-800' : ''}
            `}>
              <ReactMarkdown
                components={{
                  ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1 pl-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1 pl-1" {...props} />,
                  li: ({ node, ...props }) => <li className="" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                  a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-2 text-slate-600" {...props} />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
            placeholder="Ask about terms, deadlines, or docs..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          AI can make mistakes. Verify important info with a pro.
        </p>
      </div>
    </div>
  );
};

export default AIGuide;