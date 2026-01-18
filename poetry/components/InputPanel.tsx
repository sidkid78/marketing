import React, { useState, useEffect } from 'react';
import { Loader2, Wand2, RefreshCw, Feather, X, Upload, Sparkles, Layout, Layers, Film } from 'lucide-react';
import { ArtResult, ArtType } from '../types';

interface InputPanelProps {
  onGenerate: (text: string, images: string[], enableAiImage: boolean, artType: ArtType) => void;
  status: 'idle' | 'generating' | 'success' | 'error';
  currentResult: ArtResult | null;
}

const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, status, currentResult }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [enableAiImage, setEnableAiImage] = useState(false);
  const [artType, setArtType] = useState<ArtType>('card');
  const [activeTab, setActiveTab] = useState<'input' | 'rationale'>('input');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const validImages = images.filter((img): img is string => img !== null);
      onGenerate(text, validImages, enableAiImage, artType);
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
    <div className="flex flex-col h-full bg-white border-r border-stone-200 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-stone-100 bg-[#fdfbf7]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-100 rounded-full text-rose-600">
            <Feather className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 font-serif tracking-tight">Kinetic Poet</h1>
        </div>
        <p className="text-stone-500 text-sm font-light italic">Motion, rhythm, and typography.</p>
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
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Format</label>
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
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${artType === item.id ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Message</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="The rain whispered secrets to the pavement..."
                className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-700 font-serif text-lg resize-none shadow-inner"
              />
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-indigo-900">AI Atmospheric Image</h3>
                  <p className="text-[10px] text-indigo-700/70">Generate background based on tone</p>
                </div>
              </div>
              <input type="checkbox" checked={enableAiImage} onChange={(e) => setEnableAiImage(e.target.checked)} className="accent-indigo-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Visual Storyboard</label>
                <span className="text-[10px] text-stone-400 italic">Up to 5 images</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className={`relative aspect-video rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden ${idx === 4 ? 'col-span-2 aspect-[3/1]' : ''}`}>
                    {img ? (
                      <><img src={img} className="w-full h-full object-cover" /><button onClick={(e) => { e.preventDefault(); removeImage(idx); }} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm"><X className="w-3 h-3 text-stone-500 hover:text-rose-500" /></button></>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-stone-100 transition-colors">
                        <Upload className="w-4 h-4 text-stone-400" />
                        <span className="text-[9px] mt-1 text-stone-400 font-bold uppercase">Scene {idx + 1}</span>
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(idx, e)} disabled={status === 'generating'} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={!text.trim() || status === 'generating'} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-full font-bold shadow-lg hover:bg-rose-600 transition-all disabled:opacity-50">
              {status === 'generating' ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              {status === 'generating' ? 'Weaving...' : 'Create Art'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-entrance">
            {currentResult && (
              <>
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 italic font-serif">"{text}"</div>
                <div>
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Artist Note</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{currentResult.rationale}</p>
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