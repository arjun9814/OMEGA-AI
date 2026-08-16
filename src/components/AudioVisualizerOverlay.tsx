import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Radio, Activity } from 'lucide-react';

interface AudioVisualizerOverlayProps {
  volume: number; // 0 to 100
  voiceState: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';
  isConnected: boolean;
}

export const AudioVisualizerOverlay: React.FC<AudioVisualizerOverlayProps> = ({
  volume,
  voiceState,
  isConnected,
}) => {
  // Activate only when user is connected and actively speaking (volume > 2 and state is LISTENING or PROCESSING)
  const isUserSpeaking = isConnected && (voiceState === 'LISTENING' || voiceState === 'PROCESSING') && volume > 2;

  // Generate bar heights based on volume and random spectrum offsets for realistic audio feel
  const numBars = 20;

  return (
    <AnimatePresence>
      {isUserSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] pointer-events-none flex flex-col items-center"
        >
          {/* Main Visualizer Banner */}
          <div className="relative px-6 py-3 rounded-2xl bg-black/85 border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.35)] backdrop-blur-xl flex items-center gap-5 min-w-[320px] sm:min-w-[420px] justify-between">
            
            {/* Left Mic & Status indicator */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Mic className="w-4 h-4 animate-pulse text-cyan-300" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                  USER VOICE CAPTURED
                </span>
                <span className="text-[10px] font-mono text-cyan-400/70 tracking-wider">
                  OMEGA PROCESSING INPUT • {Math.round(volume)}% GAIN
                </span>
              </div>
            </div>

            {/* Right: Audio Frequency Equalizer Bars */}
            <div className="flex items-center gap-1 h-8 px-2 py-1 bg-cyan-950/40 rounded-lg border border-cyan-500/20">
              {Array.from({ length: numBars }).map((_, i) => {
                // Vary bar multiplier to create a bell curve / organic frequency visualizer
                const centerDist = Math.abs(i - numBars / 2) / (numBars / 2);
                const barMultiplier = 1 - centerDist * 0.5;
                const dynamicHeight = Math.max(15, Math.min(100, volume * 1.2 * barMultiplier + Math.sin(i + Date.now() / 100) * 15));

                return (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-blue-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                    animate={{
                      height: `${dynamicHeight}%`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    }}
                  />
                );
              })}
            </div>

          </div>

          {/* Glowing Aura below the overlay */}
          <div className="w-64 h-2 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-md mt-1" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
