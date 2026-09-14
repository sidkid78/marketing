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
      <div className="bg-white p-8 rounded-xl border border-rule">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-ink mb-2">Micro-Content Creator</h2>
            <p className="text-ink0">Generate thought leadership tweets optimized for the Austin AgeTech market.</p>
          </div>
          <div className="flex items-center space-x-2 bg-muted px-3 py-1.5 rounded-lg border border-rule">
            <img src={activeAccount.avatar} className="w-6 h-6 rounded-full" alt="Active" />
            <span className="text-xs font-bold text-ink">{activeAccount.handle}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Topic or Focus Area</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The rise of voice-activated tech for seniors..."
              className="w-full p-3 border border-rule rounded-lg focus:ring-2 focus:ring-rule focus:border-rule outline-none transition"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-ink mb-2">Quick Select:</span>
            <div className="flex flex-wrap gap-2">
              {recommendedTopics.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-3 py-1 bg-muted hover:bg-muted text-ink-soft text-sm rounded-full transition"
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
                className="w-4 h-4 text-ink"
              />
              <span className="text-ink">Single Tweet</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={format === 'thread'}
                onChange={() => setFormat('thread')}
                className="w-4 h-4 text-ink"
              />
              <span className="text-ink">Thread (3+ posts)</span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-ink flex justify-center items-center space-x-2
              ${loading || !topic ? 'bg-muted cursor-not-allowed' : 'bg-signal hover:bg-signal'}
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
            <h3 className="text-lg font-bold text-ink">Generated Drafts</h3>
            <button onClick={handleGenerate} className="text-ink hover:text-ink flex items-center text-sm font-medium">
              <RefreshCw size={14} className="mr-1" /> Regenerate
            </button>
          </div>

          <div className="grid gap-6">
            {drafts.map((draft, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-6 border transition-all ${postedIds.includes(idx) ? 'border-positive/30 bg-positive/10' : 'border-rule'} relative group`}>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(draft.content + "\n" + draft.hashtags.join(" "));
                    }}
                    className="p-2 text-ink-soft hover:text-ink"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-ink font-bold overflow-hidden">
                    <img src={activeAccount.avatar} alt="Profile" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-ink">{activeAccount.name}</span>
                      <span className="text-ink0 text-sm">{activeAccount.handle}</span>
                    </div>
                    <p className="text-ink whitespace-pre-wrap leading-relaxed">{draft.content}</p>
                    {draft.hashtags && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {draft.hashtags.map(tag => (
                          <span key={tag} className="text-ink hover:underline cursor-pointer text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Scheduling UI */}
                    {schedulingIdx === idx && (
                      <div className="mt-4 p-4 bg-muted border border-rule rounded-lg animate-fade-in">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-ink flex items-center">
                            <Calendar size={14} className="mr-1" /> Pick Post Date & Time
                          </span>
                          <button title="Cancel" onClick={() => setSchedulingIdx(null)} className="text-ink-soft hover:text-ink-soft">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <input
                              title="Pick Post Date"
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full p-2 border border-rule rounded text-sm focus:ring-1 focus:ring-rule"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              title="Pick Post Time"
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full p-2 border border-rule rounded text-sm focus:ring-1 focus:ring-rule"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleConfirmSchedule(idx, draft.content)}
                          disabled={!scheduleDate || postingId !== null}
                          className="mt-4 w-full py-2 bg-signal text-primary-foreground rounded font-bold text-sm hover:bg-signal disabled:opacity-50"
                        >
                          {postingId === idx ? 'Scheduling...' : 'Confirm Schedule'}
                        </button>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-rule flex justify-between items-center">
                      <span className="text-ink-soft text-xs font-medium uppercase">{draft.type}</span>

                      <div className="flex items-center space-x-2">
                        {postedIds.includes(idx) ? (
                          <div className="flex items-center text-positive font-bold text-sm">
                            <CheckCircle2 size={16} className="mr-1" /> {schedulingIdx === null ? 'Posted to X' : 'Scheduled'}
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setSchedulingIdx(idx)}
                              className="px-4 py-2 border border-rule rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-muted transition-colors"
                            >
                              <Clock size={14} />
                              <span>Schedule</span>
                            </button>
                            <button
                              onClick={() => handlePost(idx, draft.content)}
                              disabled={postingId !== null}
                              className="bg-sheet text-ink px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 hover:bg-sheet transition-colors disabled:opacity-50"
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
