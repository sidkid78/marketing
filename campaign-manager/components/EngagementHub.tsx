import React, { useState } from 'react';
import { analyzeAndReply } from '../services/geminiService';
import { postReply } from '../services/twitterService';
import { Account } from '../types';
import { MessageSquare, ThumbsUp, Share2, Loader2, Send, CheckCircle } from 'lucide-react';

interface MockTweet {
  id: number;
  user: string;
  handle: string;
  avatar: string;
  content: string;
  time: string;
}

interface EngagementHubProps {
  activeAccount: Account;
}

const FEED: MockTweet[] = [
  {
    id: 1,
    user: "Austin Healthy Living",
    handle: "@AustinHealthy",
    avatar: "https://picsum.photos/50/50?random=1",
    content: "Alarming stat: Falls are the leading cause of injury for seniors in Texas. Prevention is key! #AustinHealth #SeniorSafety",
    time: "2h"
  },
  {
    id: 2,
    user: "TechCrunch",
    handle: "@TechCrunch",
    avatar: "https://picsum.photos/50/50?random=2",
    content: "New report shows the AgeTech market is expected to double by 2030. Who is leading the charge in home mods?",
    time: "4h"
  },
  {
    id: 3,
    user: "Maria Gonzalez",
    handle: "@MariaG_ATX",
    avatar: "https://picsum.photos/50/50?random=3",
    content: "Trying to figure out how to make my mom's bathroom safer without a full remodel. Any local suggestions? #AustinTX",
    time: "5h"
  }
];

export const EngagementHub: React.FC<EngagementHubProps> = ({ activeAccount }) => {
  const [selectedTweet, setSelectedTweet] = useState<MockTweet | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const handleDraftReply = async (tweet: MockTweet) => {
    setSelectedTweet(tweet);
    setReplyDraft('');
    setPostedSuccess(false);
    setGenerating(true);
    const reply = await analyzeAndReply(tweet.content);
    setReplyDraft(reply);
    setGenerating(false);
  };

  const handlePostReply = async () => {
    if (!selectedTweet || !replyDraft) return;
    setPosting(true);
    const response = await postReply(replyDraft, selectedTweet.id.toString(), activeAccount.handle);
    if (response.success) {
      setPostedSuccess(true);
      setTimeout(() => {
        setSelectedTweet(null);
        setReplyDraft('');
        setPostedSuccess(false);
      }, 2000);
    }
    setPosting(false);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Feed Column */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Community Feed (Austin, TX)</h2>
        {FEED.map((tweet) => (
          <div 
            key={tweet.id} 
            className={`
              bg-white p-6 rounded-xl border cursor-pointer transition-all
              ${selectedTweet?.id === tweet.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-300'}
            `}
            onClick={() => handleDraftReply(tweet)}
          >
            <div className="flex items-start space-x-3">
              <img src={tweet.avatar} alt={tweet.user} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{tweet.user}</span>
                    <span className="text-slate-500 text-sm">{tweet.handle}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{tweet.time}</span>
                </div>
                <p className="text-slate-800 mt-2">{tweet.content}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 mt-4 ml-13 pl-12 text-slate-400 text-sm">
               <button className="hover:text-blue-500 flex items-center space-x-1"><MessageSquare size={16}/> <span>Reply</span></button>
               <button className="hover:text-green-500 flex items-center space-x-1"><Share2 size={16}/> <span>Retweet</span></button>
               <button className="hover:text-red-500 flex items-center space-x-1"><ThumbsUp size={16}/> <span>Like</span></button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Column */}
      <div className="lg:sticky lg:top-8 h-fit">
        {selectedTweet ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Drafting Reply
              </h3>
              <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <img src={activeAccount.avatar} className="w-4 h-4 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{activeAccount.handle}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-800"
                placeholder="Drafting response..."
                disabled={generating || posting || postedSuccess}
              />
              <div className="flex justify-between items-center mt-2">
                 <span className={`text-xs ${replyDraft.length > 280 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {replyDraft.length}/280
                 </span>
                 <div className="flex space-x-2">
                    <button 
                        onClick={() => handleDraftReply(selectedTweet)}
                        disabled={generating || posting || postedSuccess}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 disabled:opacity-50"
                    >
                        Regenerate AI
                    </button>
                 </div>
              </div>
            </div>

            <button 
                onClick={handlePostReply}
                disabled={generating || posting || postedSuccess || !replyDraft}
                className={`
                    w-full font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all
                    ${postedSuccess ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-slate-800'}
                    disabled:opacity-50
                `}
            >
                {generating ? <Loader2 className="animate-spin"/> : posting ? <Loader2 className="animate-spin" /> : postedSuccess ? <CheckCircle size={18} /> : <Send size={18} />}
                <span>{generating ? 'AI Thinking...' : posting ? 'Sending...' : postedSuccess ? 'Reply Sent!' : `Post Reply as ${activeAccount.handle}`}</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
            <MessageSquare size={40} className="text-slate-300 mb-4" />
            <h3 className="text-slate-500 font-medium">Select a tweet to engage</h3>
            <p className="text-slate-400 text-sm mt-2">AI will suggest a professional response based on your brand voice.</p>
          </div>
        )}
      </div>
    </div>
  );
};
