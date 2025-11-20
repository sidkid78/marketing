/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './Icons';

interface ImageGalleryProps {
  images: GeneratedImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (images.length === 0) return null;

  const handleDownload = async (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `agentic-creation-${index + 1}.jpg`;
    document.body.appendChild(link);
    await link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {images.map((img: GeneratedImage, index: number) => (
          <div 
            key={img.id} 
            className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 shadow-2xl"
          >
            <img 
              src={img.url} 
              alt={`Generated variation ${index + 1}`} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="w-full flex justify-between items-center">
                <span className="text-white font-medium text-sm">Variation {index + 1}</span>
                <button 
                  onClick={() => handleDownload(img.url, index)}
                  className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                  title="Download High Res"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;