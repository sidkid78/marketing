import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, RefreshCw, Feather, Image as ImageIcon, X, Upload } from 'lucide-react';
import { ArtResult } from '../types';

interface InputPanelProps {
  onGenerate: (text: string, images: string[]) => void;
  status: 'idle' | 'generating' | 'success' | 'error';
  currentResult: ArtResult | null;
}

const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, status, currentResult }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [activeTab, setActiveTab] = useState<'input' | 'rationale'>('input');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const validImages = images.filter((img): img is string => img !== null);
      onGenerate(text, validImages);
      if (window.innerWidth < 768) {
         // Auto switch tab logic or scroll could go here for mobile
      }
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

  // Switch to rationale tab automatically when success
  useEffect(() => {
    if (status === 'success') {
      setActiveTab('rationale');
    }
  }, [status]);

  const examples = [
    "The silence was not empty; it was heavy with things unsaid, floating like dust in a shaft of afternoon light.",
    "Chaos! Digital noise eating the signal. CRASH. REBOOT. SYSTEM FAILURE.",
    "Soft rain on a tin roof. A warm cup of tea. Time stopping for just a moment."
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-stone-100 bg-[#fdfbf7]">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                <Feather className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 font-serif tracking-tight">
            Kinetic Poet
            </h1>
        </div>
        <p className="text-stone-500 text-sm font-light italic">
          Compose your sentiment and let us craft the art.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${
            activeTab === 'input'
              ? 'text-rose-600 border-b-2 border-rose-500 bg-stone-50'
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
          }`}
        >
          COMPOSE
        </button>
        <button
          onClick={() => setActiveTab('rationale')}
          disabled={!currentResult}
          className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${
            activeTab === 'rationale'
              ? 'text-rose-600 border-b-2 border-rose-500 bg-stone-50'
              : !currentResult
              ? 'text-stone-300 cursor-not-allowed'
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
          }`}
        >
          DESIGN NOTE
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        {activeTab === 'input' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="inputText" className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                Your Message
              </label>
              <div className="relative">
                <textarea
                    id="inputText"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a poem, a greeting, or a feeling..."
                    className="w-full h-40 bg-stone-50 border border-stone-200 rounded-xl p-6 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all resize-none font-serif text-xl leading-relaxed shadow-inner"
                    disabled={status === 'generating'}
                />
              </div>
            </div>

            {/* Storyboard Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                        Visual Storyboard
                    </label>
                    <span className="text-[10px] text-stone-400 italic">Optional • Up to 4 images</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {images.map((img, idx) => (
                        <div 
                            key={idx} 
                            className={`relative aspect-[4/3] rounded-lg border-2 border-dashed transition-all overflow-hidden group ${
                                img 
                                ? 'border-stone-200 bg-white shadow-sm' 
                                : 'border-stone-200 bg-stone-50 hover:border-rose-300 hover:bg-rose-50/30'
                            }`}
                        >
                            {img ? (
                                <>
                                    <img src={img} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-stone-500 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="p-2 rounded-full bg-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-4 h-4 text-stone-400 group-hover:text-rose-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Scene {idx + 1}</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(idx, e)}
                                        disabled={status === 'generating'}
                                    />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!text.trim() || status === 'generating'}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-serif font-medium text-white transition-all transform hover:-translate-y-0.5 ${
                  !text.trim() || status === 'generating'
                    ? 'bg-stone-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-200'
                }`}
              >
                {status === 'generating' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Weaving...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Create Art</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-8 border-t border-dashed border-stone-200">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                Inspiration
              </p>
              <div className="flex flex-col gap-3">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setText(ex)}
                    className="text-left text-sm text-stone-500 hover:text-rose-500 p-3 rounded-lg border border-transparent hover:border-stone-200 hover:bg-white transition-all font-serif italic"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {currentResult ? (
              <>
                 <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-stone-900">
                        <Feather className="w-24 h-24" />
                    </div>
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                        Original Text
                    </h3>
                    <p className="text-stone-700 italic font-serif text-lg leading-relaxed relative z-10">
                        "{text}"
                    </p>
                 </div>

                <div>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">
                    The Artist's Vision
                  </h3>
                  <div className="prose prose-stone prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-stone-600 leading-7 font-light">
                      {currentResult.rationale}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={() => {
                            const validImages = images.filter((img): img is string => img !== null);
                            onGenerate(text, validImages);
                        }}
                        className="flex items-center gap-2 text-xs text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-widest font-bold"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Reimagine
                    </button>
                </div>
              </>
            ) : (
              <div className="text-center text-stone-400 py-12 font-serif italic">
                Create a masterpiece to see the artist's notes.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;