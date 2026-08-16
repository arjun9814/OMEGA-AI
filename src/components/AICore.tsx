import React, { useRef, useEffect } from 'react';
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
      </div>

       {/* Core Center */}
      <div className="relative flex items-center justify-center">
         
         {/* Inner glowing core background */}
         <div className={`absolute w-72 h-72 rounded-full ${style.bg} blur-[80px] opacity-30`} />

         <motion.div 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={onToggleConnect}
           animate={{ 
             boxShadow: isConnected ? [
               `0 0 20px var(--color-shadow)`,
               `0 0 80px var(--color-shadow)`,
               `0 0 20px var(--color-shadow)`
             ] : '0 0 0px transparent'
           }}
           transition={{ duration: 2, repeat: Infinity }}
           className={`w-64 h-64 rounded-full flex items-center justify-center relative z-20 transition-all duration-700 cursor-pointer ${isConnected ? `bg-black/80 ${style.shadow} border-2 border-${style.border.split('-')[1]}-400/80` : `bg-black/50 border border-white/10 ${style.hoverBorder} shadow-[0_0_30px_rgba(0,0,0,0.5)]`} overflow-hidden`}
           style={{ '--color-shadow': style.shadowPulse.match(/#([0-9a-fA-F]+)/)?.[0] || '#22d3ee' } as any}
         >
           
                      <div className={`absolute inset-0 bg-gradient-to-tr from-transparent to-${style.bg.split('-')[1]}-500/30 mix-blend-overlay z-10 transition-colors duration-700 pointer-events-none`} />

                      <ParticleSphere 
                        color={style.shadowPulse.match(/#([0-9a-fA-F]+)/)?.[0] || '#22d3ee'} 
                        isConnected={isConnected} 
                        volume={volume} 
                      />

         </motion.div>

         {/* Animating Rings */}
         {/* Thick solid glowing inner ring */}
         <div className="absolute inset-[-20px] pointer-events-none">
           <motion.div 
             animate={{ rotate: isConnected ? -360 : 0, scale: isConnected ? scale * 1.02 : 1 }}
             transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { type: "spring", stiffness: 100, damping: 10 } }}
             className={`w-full h-full rounded-full border-[6px] ${style.borderDashed.replace('500/30', '400/60')} border-solid opacity-80`}
             style={{ boxShadow: `0 0 30px currentColor`, fill: 'none' }}
           />
         </div>

         <div className="absolute inset-[-50px] pointer-events-none z-10">
           <motion.div 
             animate={{ rotate: isConnected ? 360 : 0, scale: isConnected ? scale : 1 }}
             transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { type: "spring", stiffness: 100, damping: 10 } }}
             className={`w-full h-full rounded-full border-4 ${style.borderDashed.replace('500/30', '400/80')} border-dashed shadow-[inset_0_0_20px_currentColor]`}
           />
         </div>

         <div className="absolute inset-[-80px] pointer-events-none">
           <motion.div 
             animate={{ rotate: isConnected ? -360 : 0, scale: isConnected ? scale * 1.05 : 1 }}
             transition={{ rotate: { duration: 35, repeat: Infinity, ease: "linear" }, scale: { type: "spring", stiffness: 100, damping: 10 } }}
             className={`w-full h-full rounded-full border-[2px] ${style.borderDotted.replace('500/40', '400/60')} border-dotted opacity-70`}
           />
           {/* Crosshairs */}
           <div className={`absolute top-0 inset-x-0 h-full w-[2px] bg-gradient-to-b from-transparent via-${style.bg.split('-')[1]}-500/30 to-transparent mx-auto pointer-events-none`} />
           <div className={`absolute left-0 inset-y-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${style.bg.split('-')[1]}-500/30 to-transparent my-auto pointer-events-none`} />
         </div>

         {/* Additional outer thin solid ring */}
         <div className="absolute inset-[-110px] pointer-events-none">
           <motion.div 
             animate={{ rotate: isConnected ? 180 : 0 }}
             transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
             className={`w-full h-full rounded-full border border-${style.bg.split('-')[1]}-800/60 relative`}
           >
              <div className={`absolute top-0 left-1/2 -ml-16 w-32 h-[3px] ${style.bg} blur-[2px] rounded-full`} />
           </motion.div>
         </div>

         <div className="absolute inset-[-140px] pointer-events-none">
           <motion.div 
             animate={{ rotate: isConnected ? 360 : 0 }}
             transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
             className={`w-full h-full rounded-full border border-${style.bg.split('-')[1]}-900/40 relative shadow-[0_0_100px_inset_rgba(8,145,178,0.05)]`}
           >
              {/* Markers along the outer ring */}
              <div className={`absolute top-[-5px] left-1/2 -ml-1.5 w-3 h-3 ${style.bg} rounded-full ${style.shadowPulse} shadow-[0_0_15px_currentColor]`} />
              <div className={`absolute bottom-[-5px] left-1/2 -ml-1.5 w-3 h-3 ${style.bg} rounded-full ${style.shadowPulse} shadow-[0_0_15px_currentColor]`} />
              <div className={`absolute left-[-5px] top-1/2 -mt-1.5 w-3 h-3 ${style.bg} rounded-full ${style.shadowPulse} shadow-[0_0_15px_currentColor]`} />
              <div className={`absolute right-[-5px] top-1/2 -mt-1.5 w-3 h-3 ${style.bg} rounded-full ${style.shadowPulse} shadow-[0_0_15px_currentColor]`} />
              
              {/* Decorative triangles on outer ring */}
              <svg className={`absolute -top-10 left-1/2 -ml-3 w-6 h-6 text-${style.bg.split('-')[1]}-500`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2z" opacity="0.5"/>
              </svg>
              <svg className={`absolute -bottom-10 left-1/2 -ml-3 w-6 h-6 text-${style.bg.split('-')[1]}-500 rotate-180`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2z" opacity="0.5"/>
              </svg>
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

function ParticleSphere({ color, isConnected, volume }: { color: string, isConnected: boolean, volume: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const particles: { x: number, y: number, z: number, origX: number, origY: number, origZ: number, speed: number, offset: number, isAura: boolean }[] = [];
    const numParticles = 8000; 
    const radius = 115;

    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < numParticles; i++) {
      const isAura = i > numParticles * 0.75; // last 25% are aura
      const y = 1 - (i / (numParticles - 1)) * 2; 
      const r = Math.sqrt(1 - y * y); 
      const theta = phi * i; 

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Aura particles spread out further and more irregularly
      const rMultiplier = isAura ? 1 + Math.random() * 0.4 : 1 - Math.random() * 0.1;

      particles.push({
        origX: x * radius * rMultiplier,
        origY: y * radius * rMultiplier,
        origZ: z * radius * rMultiplier,
        x: 0, y: 0, z: 0,
        speed: 0.2 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        isAura
      });
    }

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const rotX = time * 0.3;
      const rotY = time * 0.5;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const currentVolume = isConnected ? volume : 0;
      const expand = 1 + currentVolume * 0.3;

      // Glow effect mapped to emotion color
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        let wave = 0;
        if (p.isAura) {
           // More chaotic noise-like movement for outer rim
           wave = Math.sin(time * p.speed * 3 + p.offset) * 20 * (1 + currentVolume * 2);
           wave += Math.cos(time * p.speed * 1.5 + p.offset * 2) * 10;
        } else {
           // Subtle breathing for inner core
           wave = Math.sin(time * p.speed + p.offset) * 5 * (1 + currentVolume * 3);
        }
        
        // normal vector
        const len = Math.sqrt(p.origX*p.origX + p.origY*p.origY + p.origZ*p.origZ);
        const nx = p.origX / len;
        const ny = p.origY / len;
        const nz = p.origZ / len;

        let x = p.origX * expand + nx * wave;
        let y = p.origY * expand + ny * wave;
        let z = p.origZ * expand + nz * wave;

        // Rotate X
        const xy = cosX * y - sinX * z;
        const xz = sinX * y + cosX * z;
        y = xy;
        z = xz;

        // Rotate Y
        const yx = cosY * x + sinY * z;
        const yz = -sinY * x + cosY * z;
        x = yx;
        z = yz;

        // Perspective
        const scale = 300 / (300 + z);
        const px = cx + x * scale;
        const py = cy + y * scale;

        // Opacity
        const depthAlpha = Math.max(0, Math.min(1, 1 - (z + radius) / (radius * 2.5)));
        const alpha = p.isAura ? depthAlpha * 0.4 : depthAlpha * 0.8;
        
        // Use pure white/silver for the particles themselves to match the image, glow handles color
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowBlur = p.isAura ? 15 : 0; // Only outer/edge particles cast strong glow for performance & aesthetics
        
        const size = Math.max(0.1, (p.isAura ? 0.8 : 1.2) * scale);
        
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [color, isConnected, volume]);

  return <canvas ref={canvasRef} width={500} height={500} className="w-[120%] h-[120%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen opacity-90 transition-opacity duration-700" />;
}
