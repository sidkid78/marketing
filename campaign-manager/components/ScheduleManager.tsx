import React from 'react';
import { ScheduledTweet } from '../types';
import { Calendar, Clock, Trash2, ExternalLink, CalendarDays } from 'lucide-react';

interface ScheduleManagerProps {
  scheduledTweets: ScheduledTweet[];
  onRemoveScheduled: (id: string) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ scheduledTweets, onRemoveScheduled }) => {
  // Sort by date
  const sortedTweets = [...scheduledTweets].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-ink">Content Queue</h2>
          <p className="text-ink0">Upcoming posts across all brand personas.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-rule flex items-center space-x-2">
           <CalendarDays size={18} className="text-ink" />
           <span className="font-bold text-ink">{scheduledTweets.length} Pending</span>
        </div>
      </div>

      {sortedTweets.length === 0 ? (
        <div className="bg-white py-20 text-center border-2 border-dashed border-rule rounded-xl">
           <Calendar size={48} className="mx-auto text-ink mb-4" />
           <h3 className="text-ink0 font-medium text-lg">Your queue is empty</h3>
           <p className="text-ink-soft mt-1 max-w-sm mx-auto">Use the Content Studio to generate drafts and schedule them for optimal engagement times.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTweets.map((tweet) => {
            const { date, time } = formatDateTime(tweet.scheduledAt);
            return (
              <div key={tweet.id} className="bg-white rounded-xl border border-rule overflow-hidden group">
                <div className="flex">
                  {/* Sidebar date marker */}
                  <div className="w-32 bg-muted border-r border-rule p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-ink uppercase tracking-tighter">{date.split(' ')[0]}</span>
                    <span className="text-xl font-bold text-ink">{date.split(' ')[2]}</span>
                    <span className="text-xs text-ink0 font-medium">{date.split(' ')[1]}</span>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <img src={tweet.avatar} className="w-5 h-5 rounded-full" alt="Profile" />
                        <span className="text-xs font-bold text-ink0 uppercase">{tweet.handle}</span>
                        <span className="px-2 py-0.5 bg-muted text-ink text-[10px] font-bold rounded-full border border-rule">Pending</span>
                      </div>
                      <div className="flex items-center text-ink-soft text-xs font-medium bg-muted px-2 py-1 rounded">
                        <Clock size={12} className="mr-1" /> {time}
                      </div>
                    </div>
                    
                    <p className="text-ink text-sm leading-relaxed mb-4">
                      {tweet.content}
                    </p>

                    <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onRemoveScheduled(tweet.id)}
                        className="text-ink-soft hover:text-destructive text-xs font-bold flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" /> Cancel
                      </button>
                      <button className="text-ink-soft hover:text-ink text-xs font-bold flex items-center">
                        <ExternalLink size={14} className="mr-1" /> Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {scheduledTweets.length > 0 && (
        <div className="bg-muted border border-rule rounded-lg p-4 flex items-center space-x-3">
           <div className="p-2 bg-white rounded">
              <Clock className="text-ink" size={18} />
           </div>
           <p className="text-ink text-sm">
             <strong>Pro Tip:</strong> Most AgeTech engagement in Austin happens on Tuesdays and Thursdays between 9:00 AM and 11:00 AM.
           </p>
        </div>
      )}
    </div>
  );
};
