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
    <div className="flex flex-col h-full bg-white dark:bg-bench border-r border-rule dark:border-rule overflow-hidden transition-colors duration-300">
      <div className="p-8 border-b border-rule dark:border-rule bg-[#fdfbf7] dark:bg-bench transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 dark:bg-destructive/10 rounded-full text-destructive dark:text-destructive">
              <Feather className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-ink dark:text-ink font-serif tracking-tight">Kinetic Poet</h1>
          </div>
          <div className="flex items-center gap-3">  
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-muted dark:bg-sheet text-ink-soft dark:text-ink-soft hover:bg-muted dark:hover:bg-muted transition-colors"
              title="Toggle Dark Mode"
              type="button"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <p className="text-ink0 dark:text-ink-soft text-sm font-light italic">Motion, rhythm, and typography.</p>
      </div>

      <div className="flex border-b border-rule">
        <button onClick={() => setActiveTab('input')} className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'input' ? 'text-destructive border-b-2 border-destructive/30 bg-muted' : 'text-ink-soft'}`}>COMPOSE</button>
        <button onClick={() => setActiveTab('rationale')} disabled={!currentResult} className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'rationale' ? 'text-destructive border-b-2 border-destructive/30 bg-muted' : 'text-ink'}`}>DESIGN NOTE</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
        {activeTab === 'input' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Art Type Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink-soft uppercase">Format</label>
                {artType === null && (
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wide bg-muted px-2 py-0.5 rounded-full">
                    AI Decides
                  </span>
                )}
              </div>
              <div className="flex p-1 bg-muted rounded-xl">
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
                        ? 'bg-white text-destructive'
                        : 'text-ink-soft hover:text-ink-soft'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-ink-soft dark:text-ink0 uppercase">Message</label>
              <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="The rain whispered secrets to the pavement..."
                  className="w-full h-32 bg-muted dark:bg-sheet border border-rule dark:border-rule rounded-xl p-4 text-ink dark:text-ink font-serif text-lg resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-destructive/30 dark:focus:ring-destructive/30 transition-colors"
              />
            </div>

            {/* Features Row: Branding & AI Image */}
            <div className="space-y-4">
                 {/* Branding Controls */}
                <div className="bg-muted dark:bg-sheet border border-rule dark:border-rule rounded-lg p-4 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <Palette className={`w-4 h-4 ${enableBranding ? 'text-destructive' : 'text-ink-soft'}`} />
                             <h3 className="text-sm font-bold text-ink dark:text-ink">Company Branding</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={enableBranding} 
                                onChange={(e) => setEnableBranding(e.target.checked)} 
                                className="sr-only peer" 
                                aria-label="Enable Company Branding"
                            />
                            <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-destructive/30 dark:peer-focus:ring-destructive/30 rounded-full peer dark:bg-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rule after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-rule peer-checked:bg-destructive"></div>
                        </label>
                    </div>
                    
                    {enableBranding && (
                        <div className="flex gap-4 animate-entrance">
                            <div className="flex-1">
                                <label htmlFor="primary-color-picker" className="block text-[10px] uppercase font-bold text-ink mb-1">Primary</label>
                                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 rounded-md border border-rule dark:border-rule">
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
                                    <span className="text-xs text-ink0 dark:text-ink">{primaryColor}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="secondary-color-picker" className="block text-[10px] uppercase font-bold text-ink mb-1">Secondary</label>
                                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 rounded-md border border-rule dark:border-rule">
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
                                    <span className="text-xs text-ink0 dark:text-ink">{secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-signal dark:from-signal dark:to-signal border border-rule dark:border-rule rounded-lg p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-ink dark:text-ink" />
                        <div>
                            <h3 className="text-sm font-bold text-ink dark:text-ink">AI Atmospheric Image</h3>
                            <p className="text-[10px] text-ink dark:text-ink">Generate background based on tone</p>
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
                    <label className="block text-xs font-bold text-ink dark:text-ink0 uppercase">Visual Storyboard</label>
                    <span className="text-[10px] text-ink dark:text-ink0 italic">Up to 5 images</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className={`relative aspect-video rounded-lg border-2 border-dashed border-rule dark:border-rule bg-muted dark:bg-sheet overflow-hidden transition-colors ${idx === 4 ? 'col-span-2 aspect-[3/1]' : ''}`}>
                            {img ? (
                                <><img src={img} alt={`Storyboard scene ${idx + 1}`} className="w-full h-full object-cover" /><button onClick={(e) => { e.preventDefault(); removeImage(idx); }} className="absolute top-1 right-1 p-1 bg-white dark:bg-muted rounded-full" title="Remove image"><X className="w-3 h-3 text-ink0 dark:text-ink hover:text-destructive"/></button></>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted dark:hover:bg-muted transition-colors">
                                    <Upload className="w-4 h-4 text-ink-soft dark:text-ink0"/>
                                    <span className="text-[9px] mt-1 text-ink-soft dark:text-ink0 font-bold uppercase">Scene {idx + 1}</span>
                                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(idx, e)} disabled={status === 'generating'}/>
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={!text.trim() || status === 'generating'} className="w-full flex items-center justify-center gap-2 py-4 bg-destructive text-primary-foreground rounded-full font-bold hover:bg-destructive transition-all disabled:opacity-50 dark:bg-destructive dark:hover:bg-destructive">
                {status === 'generating' ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                {status === 'generating' ? 'Weaving...' : 'Create Art'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-entrance">
            {currentResult && (
              <>
                <div className="bg-muted dark:bg-sheet p-6 rounded-xl border border-rule dark:border-rule italic font-serif text-ink dark:text-ink transition-colors">"{text}"</div>
                <div>
                  <h3 className="text-xs font-bold text-destructive uppercase mb-2">Artist Note</h3>
                  <p className="text-ink-soft dark:text-ink-soft text-sm leading-relaxed">{currentResult.rationale}</p>
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