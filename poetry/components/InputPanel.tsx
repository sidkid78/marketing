"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, RefreshCw, Feather, X, Upload, Layout, Layers, Film, Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { ArtResult, ArtType, BrandConfiguration } from '../types';

interface InputPanelProps {
  onGenerate: (text: string, images: string[], enableAiImage: boolean, artType: ArtType, brandConfig: BrandConfiguration) => void;
  status: 'idle' | 'generating' | 'success' | 'error';
  currentResult: ArtResult | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, status, currentResult, isDarkMode, toggleDarkMode }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [enableAiImage, setEnableAiImage] = useState(false);
  const [artType, setArtType] = useState<ArtType>('card');
  const [activeTab, setActiveTab] = useState<'input' | 'rationale'>('input');

  // Branding State
  const [enableBranding, setEnableBranding] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const validImages = images.filter((img): img is string => img !== null);
      onGenerate(text, validImages, enableAiImage, artType, {
        enabled: enableBranding,
        primaryColor,
        secondaryColor,
      });
    }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  useEffect(() => {
    if (status === 'success') {
      setActiveTab('rationale');
    }
  }, [status]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden transition-colors duration-300">
      <div className="p-8 border-b border-stone-100 dark:border-stone-800 bg-[#fdfbf7] dark:bg-stone-900 transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
              <Feather className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 font-serif tracking-tight">Kinetic Poet</h1>
          </div>
          <div className="flex items-center gap-3">  
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Toggle Dark Mode"
              type="button"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-sm font-light italic">Motion, rhythm, and typography.</p>
      </div>

      <div className="flex border-b border-stone-200">
        <button onClick={() => setActiveTab('input')} className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'input' ? 'text-rose-600 border-b-2 border-rose-500 bg-stone-50' : 'text-stone-400'}`}>COMPOSE</button>
        <button onClick={() => setActiveTab('rationale')} disabled={!currentResult} className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'rationale' ? 'text-rose-600 border-b-2 border-rose-500 bg-stone-50' : 'text-stone-300'}`}>DESIGN NOTE</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {activeTab === 'input' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Art Type Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Format</label>
                {artType === null && (
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded-full">
                    AI Decides
                  </span>
                )}
              </div>
              <div className="flex p-1 bg-stone-100 rounded-xl">
                {[
                  { id: 'card', icon: Layout, label: 'Card' },
                  { id: 'carousel', icon: Layers, label: 'Carousel' },
                  { id: 'reel', icon: Film, label: 'Reel' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArtType(item.id as ArtType)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${artType === item.id
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-stone-400 hover:text-stone-600'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Message</label>
              <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="The rain whispered secrets to the pavement..."
                  className="w-full h-32 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-stone-700 dark:text-stone-200 font-serif text-lg resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-colors"
              />
            </div>

            {/* Features Row: Branding & AI Image */}
            <div className="space-y-4">
                 {/* Branding Controls */}
                <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-4 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <Palette className={`w-4 h-4 ${enableBranding ? 'text-rose-500' : 'text-stone-400'}`} />
                             <h3 className="text-sm font-bold text-stone-700 dark:text-stone-200">Company Branding</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={enableBranding} 
                                onChange={(e) => setEnableBranding(e.target.checked)} 
                                className="sr-only peer" 
                                aria-label="Enable Company Branding"
                            />
                            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-stone-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"></div>
                        </label>
                    </div>
                    
                    {enableBranding && (
                        <div className="flex gap-4 animate-entrance">
                            <div className="flex-1">
                                <label htmlFor="primary-color-picker" className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Primary</label>
                                <div className="flex items-center gap-2 bg-white dark:bg-stone-700 p-2 rounded-md border border-stone-200 dark:border-stone-600">
                                    <input 
                                        type="color" 
                                        id="primary-color-picker"
                                        value={primaryColor} 
                                        onChange={(e) => setPrimaryColor(e.target.value)} 
                                        className="w-6 h-6 rounded cursor-pointer border-0 p-0" 
                                        aria-label="Primary Brand Color"
                                        placeholder="#000000"
                                        title="Primary Brand Color"
                                    />
                                    <span className="text-xs font-mono text-stone-500 dark:text-stone-300">{primaryColor}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="secondary-color-picker" className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Secondary</label>
                                <div className="flex items-center gap-2 bg-white dark:bg-stone-700 p-2 rounded-md border border-stone-200 dark:border-stone-600">
                                    <input 
                                        type="color" 
                                        id="secondary-color-picker"
                                        value={secondaryColor} 
                                        onChange={(e) => setSecondaryColor(e.target.value)} 
                                        className="w-6 h-6 rounded cursor-pointer border-0 p-0" 
                                        aria-label="Secondary Brand Color"
                                        placeholder="#FFFFFF"
                                        title="Secondary Brand Color"
                                    />
                                    <span className="text-xs font-mono text-stone-500 dark:text-stone-300">{secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">AI Atmospheric Image</h3>
                            <p className="text-[10px] text-indigo-700/70 dark:text-indigo-300/70">Generate background based on tone</p>
                        </div>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={enableAiImage} 
                        onChange={(e) => setEnableAiImage(e.target.checked)} 
                        className="accent-indigo-500" 
                        aria-label="Enable AI Atmospheric Image"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Visual Storyboard</label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 italic">Up to 5 images</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className={`relative aspect-video rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 overflow-hidden transition-colors ${idx === 4 ? 'col-span-2 aspect-[3/1]' : ''}`}>
                            {img ? (
                                <><img src={img} alt={`Storyboard scene ${idx + 1}`} className="w-full h-full object-cover" /><button onClick={(e) => { e.preventDefault(); removeImage(idx); }} className="absolute top-1 right-1 p-1 bg-white dark:bg-stone-700 rounded-full shadow-sm" title="Remove image"><X className="w-3 h-3 text-stone-500 dark:text-stone-300 hover:text-rose-500"/></button></>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                                    <Upload className="w-4 h-4 text-stone-400 dark:text-stone-500"/>
                                    <span className="text-[9px] mt-1 text-stone-400 dark:text-stone-500 font-bold uppercase">Scene {idx + 1}</span>
                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(idx, e)} disabled={status === 'generating'}/>
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={!text.trim() || status === 'generating'} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-full font-bold shadow-lg hover:bg-rose-600 transition-all disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-500">
                {status === 'generating' ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                {status === 'generating' ? 'Weaving...' : 'Create Art'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-entrance">
            {currentResult && (
              <>
                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-xl border border-stone-100 dark:border-stone-700 italic font-serif text-stone-800 dark:text-stone-200 transition-colors">"{text}"</div>
                <div>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Artist Note</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{currentResult.rationale}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;