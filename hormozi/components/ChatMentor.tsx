
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GeminiService } from '../services/gemini';
import { ChatMessage } from '../types';

interface ChatMentorProps {
  apiKey: string;
}

const ChatMentor: React.FC<ChatMentorProps> = ({ apiKey }) => {
  const gemini = useMemo(() => apiKey ? new GeminiService(apiKey) : null, [apiKey]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'I am your Mindset OS Mentor. Ask me anything about scaling, fear, or people management. Keep it high-leverage.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!gemini) throw new Error('API Key not configured');
      const response = await gemini.getMentorship(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: response || 'No advice found. Try asking about "A-players" or "The Doom Loop".' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection lost. Ensure your environment is configured correctly.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      <header className="mb-6">
        <h2 className="text-4xl font-extrabold mb-2">Hormozi Mentor</h2>
        <p className="text-ink-soft">Direct, unfiltered strategy for the 1%.</p>
      </header>

      <div className="flex-1 glass rounded-3xl border border-rule overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user'
                  ? 'bg-signal text-primary-foreground rounded-tr-none'
                  : 'bg-sheet text-ink rounded-tl-none border border-rule'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-sheet text-ink p-4 rounded-2xl rounded-tl-none border border-rule animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-sheet border-t border-rule">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-bench border border-rule rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-rule"
              placeholder="Ask about hiring barrels vs ammunition..."
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="absolute right-3 p-2 bg-signal hover:bg-signal text-primary-foreground rounded-xl transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;
