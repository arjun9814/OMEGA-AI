import React from 'react';
import { motion } from 'motion/react';

const emotionStyles: Record<string, any> = {
  calm: {
    text: 'text-cyan-400',
    textDim: 'text-cyan-500/70',
    textMuted: 'text-cyan-300/50',
    border: 'border-cyan-400/50',
    borderMuted: 'border-cyan-500/40',
    borderDashed: 'border-cyan-500/30',
    borderDotted: 'border-cyan-500/40',
    borderOuter: 'border-cyan-900/40',
    bg: 'bg-cyan-400',
    bgBar: 'bg-cyan-500/80',
    shadow: 'shadow-cyan-500/40',
    shadowPulse: 'shadow-[0_0_10px_#22d3ee]',
    hoverBorder: 'hover:border-cyan-500/50'
  },
  happy: {
    text: 'text-green-400',
    textDim: 'text-green-500/70',
    textMuted: 'text-green-300/50',
    border: 'border-green-400/50',
    borderMuted: 'border-green-500/40',
    borderDashed: 'border-green-500/30',
    borderDotted: 'border-green-500/40',
    borderOuter: 'border-green-900/40',
    bg: 'bg-green-400',
    bgBar: 'bg-green-500/80',
    shadow: 'shadow-green-500/40',
    shadowPulse: 'shadow-[0_0_10px_#4ade80]',
    hoverBorder: 'hover:border-green-500/50'
  },
  thinking: {
    text: 'text-yellow-400',
    textDim: 'text-yellow-500/70',
    textMuted: 'text-yellow-300/50',
    border: 'border-yellow-400/50',
    borderMuted: 'border-yellow-500/40',
    borderDashed: 'border-yellow-500/30',
    borderDotted: 'border-yellow-500/40',
    borderOuter: 'border-yellow-900/40',
    bg: 'bg-yellow-400',
    bgBar: 'bg-yellow-500/80',
    shadow: 'shadow-yellow-500/40',
    shadowPulse: 'shadow-[0_0_10px_#facc15]',
    hoverBorder: 'hover:border-yellow-500/50'
  },
  angry: {
    text: 'text-red-400',
    textDim: 'text-red-500/70',
    textMuted: 'text-red-300/50',
    border: 'border-red-400/50',
    borderMuted: 'border-red-500/40',
    borderDashed: 'border-red-500/30',
    borderDotted: 'border-red-500/40',
    borderOuter: 'border-red-900/40',
    bg: 'bg-red-400',
    bgBar: 'bg-red-500/80',
    shadow: 'shadow-red-500/40',
    shadowPulse: 'shadow-[0_0_10px_#f87171]',
    hoverBorder: 'hover:border-red-500/50'
  },
  sad: {
    text: 'text-blue-400',
    textDim: 'text-blue-500/70',
    textMuted: 'text-blue-300/50',
    border: 'border-blue-400/50',
    borderMuted: 'border-blue-500/40',
    borderDashed: 'border-blue-500/30',
    borderDotted: 'border-blue-500/40',
    borderOuter: 'border-blue-900/40',
    bg: 'bg-blue-400',
    bgBar: 'bg-blue-500/80',
    shadow: 'shadow-blue-500/40',
    shadowPulse: 'shadow-[0_0_10px_#60a5fa]',
    hoverBorder: 'hover:border-blue-500/50'
  },
  alert: {
    text: 'text-orange-400',
    textDim: 'text-orange-500/70',
    textMuted: 'text-orange-300/50',
    border: 'border-orange-400/50',
    borderMuted: 'border-orange-500/40',
    borderDashed: 'border-orange-500/30',
    borderDotted: 'border-orange-500/40',
    borderOuter: 'border-orange-900/40',
    bg: 'bg-orange-400',
    bgBar: 'bg-orange-500/80',
    shadow: 'shadow-orange-500/40',
    shadowPulse: 'shadow-[0_0_10px_#fb923c]',
    hoverBorder: 'hover:border-orange-500/50'
  }
};

export function AICore({ isConnected, isSpeaking, volume, statusText, emotion, onToggleConnect }: { isConnected: boolean, isSpeaking: boolean, volume: number, statusText: string, emotion: string, onToggleConnect: () => void }) {
  const scale = 1 + (volume * 8);

  const style = emotionStyles[emotion] || emotionStyles.calm;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
      
      {/* Title */}
      <div className="absolute top-0 flex flex-col items-center">
        <h1 className="text-3xl font-light text-white tracking-widest">OMEGA <span className={`font-bold ${style.text}`}>AI</span></h1>
        <p className={`text-sm ${style.textDim} mt-1`}>Your Intelligent Assistant</p>
      </div>

      {/* Core Center */}
      <div className="relative flex items-center justify-center">
         
         {/* Inner glowing core */}
         <motion.div 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={onToggleConnect}
           className={`w-48 h-48 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 cursor-pointer ${isConnected ? `bg-[#0f172a] shadow-[0_0_80px_rgba(255,255,255,0.1)] ${style.shadow} border ${style.border}` : `bg-black/50 border border-white/10 ${style.hoverBorder} shadow-[0_0_30px_rgba(0,0,0,0.5)]`}`}>
           <div className="text-center">
             <div className={`text-3xl font-bold ${style.text} tracking-wider`}>OMEGA</div>
             <div className={`text-xl ${style.textDim} tracking-[0.2em] mt-1`}>AI</div>
             <div className={`text-[10px] mt-2 font-mono uppercase tracking-widest ${style.textMuted}`}>{emotion}</div>
           </div>
         </motion.div>

         {/* Animating Rings */}
         <div className="absolute inset-[-40px]">
           <motion.div 
             animate={{ rotate: isConnected ? 360 : 0, scale: isConnected ? scale : 1 }}
             transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { type: "spring", stiffness: 100, damping: 10 } }}
             className={`w-full h-full rounded-full border-2 ${style.borderDashed} border-dashed`}
           />
         </div>

         <div className="absolute inset-[-80px]">
           <motion.div 
             animate={{ rotate: isConnected ? -360 : 0, scale: isConnected ? scale * 1.05 : 1 }}
             transition={{ rotate: { duration: 35, repeat: Infinity, ease: "linear" }, scale: { type: "spring", stiffness: 100, damping: 10 } }}
             className={`w-full h-full rounded-full border ${style.borderDotted} border-dotted`}
           />
           {/* Crosshairs */}
           <div className={`absolute top-0 inset-x-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent mx-auto pointer-events-none`} />
           <div className={`absolute left-0 inset-y-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-auto pointer-events-none`} />
         </div>

         <div className="absolute inset-[-140px]">
           <motion.div 
             animate={{ rotate: isConnected ? 360 : 0 }}
             transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
             className={`w-full h-full rounded-full border ${style.borderOuter} relative`}
           >
              {/* Markers along the outer ring */}
              <div className={`absolute top-[-4px] left-1/2 -ml-1 w-2 h-2 ${style.bg} rounded-full ${style.shadowPulse}`} />
              <div className={`absolute bottom-[-4px] left-1/2 -ml-1 w-2 h-2 ${style.bg} rounded-full ${style.shadowPulse}`} />
              <div className={`absolute left-[-4px] top-1/2 -mt-1 w-2 h-2 ${style.bg} rounded-full ${style.shadowPulse}`} />
              <div className={`absolute right-[-4px] top-1/2 -mt-1 w-2 h-2 ${style.bg} rounded-full ${style.shadowPulse}`} />
           </motion.div>
         </div>

      </div>

      {/* Underneath Core Audio status */}
      <div className="absolute bottom-0 flex flex-col items-center w-full">
         <h3 className="text-xl font-light text-white mb-6 uppercase tracking-widest">{statusText}</h3>
         
         <div className="flex items-center gap-1 h-12 w-full max-w-sm justify-center mb-8">
            {[...Array(40)].map((_, i) => (
               <motion.div 
                 key={i}
                 animate={isConnected ? {
                   height: [10, 10 + Math.random() * 40 * scale, 10],
                 } : { height: 4 }}
                 transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity }}
                 className={`w-1 ${style.bgBar} rounded-full`}
               />
            ))}
         </div>

         {/* Status Indicators Pill array */}
         <div className="flex gap-4">
            <StatusBadge label="ONLINE" active={isConnected} color="bg-cyan-500" />
            <StatusBadge label="LISTENING" active={isConnected && !isSpeaking} color="bg-blue-500" />
            <StatusBadge label="THINKING" active={false} color="bg-yellow-500" />
            <StatusBadge label="EXECUTING" active={false} color="bg-emerald-500" />
            <StatusBadge label="SPEAKING" active={isSpeaking} color="bg-purple-500" />
         </div>
      </div>

    </div>
  );
}

function StatusBadge({ label, active, color }: { label: string, active: boolean, color: string }) {
  return (
    <div className={`px-5 py-2 rounded-full border text-[10px] font-mono tracking-widest transition-all ${active ? `border-${color.replace('bg-', '')}/50 ${color.replace('bg-', 'text-')}/90 ${color.replace('bg-', 'bg-')}/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]` : 'border-white/10 text-white/40 bg-white/5'}`}>
      {label}
    </div>
  );
}
