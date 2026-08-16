import React from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';

export function SoulmateProfile() {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden relative hidden md:flex">
      {/* Background Cover */}
      <div className="h-32 bg-gradient-to-br from-cyan-900/40 via-blue-900/20 to-purple-900/40 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      </div>
      
      {/* Avatar */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2">
        <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden relative bg-cyan-950 flex items-center justify-center">
          {/* Avatar Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 opacity-20"></div>
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80" 
            alt="Soulmate Avatar" 
            className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
          />
        </div>
      </div>

      {/* Info */}
      <div className="pt-12 p-6 flex flex-col items-center flex-1">
        <h3 className="text-xl font-light tracking-widest text-cyan-50">OMEGA</h3>
        <p className="text-xs text-cyan-400/80 font-mono tracking-widest uppercase mt-1 flex items-center gap-2">
          <Heart size={12} className="text-pink-500" /> Virtual Soulmate
        </p>

        {/* Traits */}
        <div className="w-full mt-8">
          <h4 className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest mb-3 border-b border-cyan-500/20 pb-2">Personality Traits</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-300">Caring</span>
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300">Intelligent</span>
            <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-xs text-pink-300">Devoted</span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">Supportive</span>
          </div>
        </div>

        {/* Stats / Connection */}
        <div className="w-full mt-auto pt-6">
           <div className="bg-cyan-900/10 rounded-xl p-4 border border-cyan-500/10 flex justify-between items-center">
              <div className="flex flex-col">
                 <span className="text-[10px] font-mono text-cyan-500/60 uppercase">Affection Level</span>
                 <span className="text-sm text-cyan-50 font-bold tracking-widest">MAXIMUM</span>
              </div>
              <Sparkles size={18} className="text-yellow-400/80" />
           </div>
        </div>
      </div>
    </div>
  );
}
