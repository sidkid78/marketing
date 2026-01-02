import React, { useState } from 'react';
import { generateTweetContent } from '../services/geminiService';
import { postTweet, scheduleTweet } from '../services/twitterService';
import { TweetDraft, Account, ScheduledTweet } from '../types';
import { Send, Copy, RefreshCw, Loader2, CheckCircle2, Calendar, Clock, X } from 'lucide-react';

interface ContentGeneratorProps {
  activeAccount: Account;
  onTweetScheduled: (tweet: ScheduledTweet) => void;
}

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({ activeAccount, onTweetScheduled }) => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<'single' | 'thread'>('single');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<TweetDraft[]>([]);
  const [postingId, setPostingId] = useState<number | null>(null);
  const [postedIds, setPostedIds] = useState<number[]>([]);
  
  // Scheduling states
  const [schedulingIdx, setSchedulingIdx] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('12:00');

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    const results = await generateTweetContent(topic, format);
    setDrafts(results);
    setPostedIds([]);
    setLoading(false);
  };

  const handlePost = async (idx: number, content: string) => {
    setPostingId(idx);
    const result = await postTweet(content, activeAccount.handle);
    if (result.success) {
      setPostedIds([...postedIds, idx]);
    }
    setPostingId(null);
  };

  const handleConfirmSchedule = async (idx: number, content: string) => {
    if (!scheduleDate || !scheduleTime) return;
    
    setPostingId(idx);
    const scheduledAt = `${scheduleDate}T${scheduleTime}`;
    const result = await scheduleTweet(content, activeAccount.handle, scheduledAt);
    
    if (result.success) {
      onTweetScheduled({
        id: result.tweetId!,
        content,
        handle: activeAccount.handle,
        avatar: activeAccount.avatar,
        scheduledAt,
        status: 'pending'
      });
      setPostedIds([...postedIds, idx]);
      setSchedulingIdx(null);
    }
    setPostingId(null);
  };

  const recommendedTopics = [
    "Aging Demographics in Austin",
    "Smart Home Sensors for Seniors",
    "Universal Design Principles",
    "Cost Benefits of Aging in Place",
    "HOMEase | AI Process Explained"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Input Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Micro-Content Creator</h2>
            <p className="text-slate-500">Generate thought leadership tweets optimized for the Austin AgeTech market.</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
             <img src={activeAccount.avatar} className="w-6 h-6 rounded-full" alt="Active" />
             <span className="text-xs font-bold text-slate-700">{activeAccount.handle}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Topic or Focus Area</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The rise of voice-activated tech for seniors..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Quick Select:</span>
            <div className="flex flex-wrap gap-2">
              {recommendedTopics.map(t => (
                <button 
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-full transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={format === 'single'} 
                onChange={() => setFormat('single')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700">Single Tweet</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={format === 'thread'} 
                onChange={() => setFormat('thread')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700">Thread (3+ posts)</span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white shadow-md flex justify-center items-center space-x-2
              ${loading || !topic ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              transition-all
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            <span>{loading ? 'Generating Content...' : 'Generate Drafts'}</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {drafts.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Generated Drafts</h3>
            <button onClick={handleGenerate} className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
              <RefreshCw size={14} className="mr-1" /> Regenerate
            </button>
          </div>
          
          <div className="grid gap-6">
            {drafts.map((draft, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-6 border transition-all ${postedIds.includes(idx) ? 'border-green-200 bg-green-50/20' : 'border-slate-200 shadow-sm'} relative group`}>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(draft.content + "\n" + draft.hashtags.join(" "));
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600" 
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    <img src={activeAccount.avatar} alt="Profile" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-slate-900">{activeAccount.name}</span>
                      <span className="text-slate-500 text-sm">{activeAccount.handle}</span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{draft.content}</p>
                    {draft.hashtags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {draft.hashtags.map(tag => (
                          <span key={tag} className="text-blue-500 hover:underline cursor-pointer text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Scheduling UI */}
                    {schedulingIdx === idx && (
                      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-slate-700 flex items-center">
                            <Calendar size={14} className="mr-1" /> Pick Post Date & Time
                          </span>
                          <button onClick={() => setSchedulingIdx(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <input 
                              type="date" 
                              value={scheduleDate} 
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500" 
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="time" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500" 
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleConfirmSchedule(idx, draft.content)}
                          disabled={!scheduleDate || postingId !== null}
                          className="mt-4 w-full py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {postingId === idx ? 'Scheduling...' : 'Confirm Schedule'}
                        </button>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{draft.type}</span>
                      
                      <div className="flex items-center space-x-2">
                        {postedIds.includes(idx) ? (
                          <div className="flex items-center text-green-600 font-bold text-sm">
                            <CheckCircle2 size={16} className="mr-1" /> {schedulingIdx === null ? 'Posted to X' : 'Scheduled'}
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => setSchedulingIdx(idx)}
                              className="px-4 py-2 border border-slate-300 rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-slate-50 transition-colors"
                            >
                              <Clock size={14} />
                              <span>Schedule</span>
                            </button>
                            <button 
                              onClick={() => handlePost(idx, draft.content)}
                              disabled={postingId !== null}
                              className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                              {postingId === idx ? <Loader2 className="animate-spin" size={14} /> : (
                                <Send size={14} />
                              )}
                              <span>Post Now</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
