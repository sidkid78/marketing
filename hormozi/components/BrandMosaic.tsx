
import React, { useState } from 'react';

const BrandMosaic: React.FC = () => {
  const [tiles, setTiles] = useState({
    philosophies: '',
    interests: '',
    experiences: '',
    relationships: ''
  });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-extrabold mb-2">The Brand Mosaic</h2>
        <p className="text-neutral-400">Features are commoditized. Your uniqueness is your only defensible edge.</p>
      </header>

      <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl">
        <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4 uppercase text-xs tracking-widest">
          The Non-Commoditized Identity
        </h3>
        <p className="text-neutral-300 italic mb-6">
          "Each piece of content is a tile in a larger mosaic. With enough tiles, the audience can see the complete, nuanced picture of who you are and what you stand for."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h4 className="font-bold">Personal Philosophies</h4>
          </div>
          <p className="text-xs text-neutral-500">What values guide your decisions? What is your 'game'?</p>
          <textarea 
            value={tiles.philosophies}
            onChange={(e) => setTiles({...tiles, philosophies: e.target.value})}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-purple-500/50 outline-none"
            placeholder="e.g. Missionary over Mercenary, High-leverage focus..."
          />
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="font-bold">Adjacent Interests</h4>
          </div>
          <p className="text-xs text-neutral-500">Hobbies that make you human. Fitness? Coding? Art?</p>
          <textarea 
            value={tiles.interests}
            onChange={(e) => setTiles({...tiles, interests: e.target.value})}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-emerald-500/50 outline-none"
            placeholder="e.g. Competitive powerlifting, sci-fi movies..."
          />
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h4 className="font-bold">Unique Life Experiences</h4>
          </div>
          <p className="text-xs text-neutral-500">Triumphs, struggles, and background that nobody can replicate.</p>
          <textarea 
            value={tiles.experiences}
            onChange={(e) => setTiles({...tiles, experiences: e.target.value})}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500/50 outline-none"
            placeholder="e.g. Quitting a high-paying job, decades of breathing issues..."
          />
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h4 className="font-bold">Personal Relationships</h4>
          </div>
          <p className="text-xs text-neutral-500">How you interact with key partners or spouse.</p>
          <textarea 
            value={tiles.relationships}
            onChange={(e) => setTiles({...tiles, relationships: e.target.value})}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-red-500/50 outline-none"
            placeholder="e.g. Business partnership with spouse, mentor relationships..."
          />
        </div>
      </div>

      <div className="p-10 rounded-[3rem] glass border border-white/10 text-center">
        <h3 className="text-2xl font-bold mb-4">"Never Dilute Yourself"</h3>
        <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          The primary obstacle to this strategy is fear. Being unique means there is no proven blueprint. It requires the courage to resist conformity and lean into being different.
        </p>
      </div>
    </div>
  );
};

export default BrandMosaic;
