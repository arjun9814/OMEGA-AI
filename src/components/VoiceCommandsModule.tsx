import React from 'react';
import { Mic, Activity, Layers, Repeat, Globe, Radio } from 'lucide-react';
import { motion } from 'motion/react';

export function VoiceCommandsModule({ isConnected, isSpeaking, volume, connect, disconnect }: { isConnected: boolean, isSpeaking: boolean, volume: number, connect: () => void, disconnect: () => void }) {
  const scale = 1 + (volume * 5);

  return (
    <div className="flex-1 flex flex-col items-center justify-center border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col items-center z-10 w-full max-w-4xl">
        <h2 className="text-3xl font-light text-white tracking-widest uppercase mb-2">Voice <span className="font-bold text-cyan-400">Command Control</span></h2>
        <p className="text-sm text-cyan-500/50 mb-12">Universal hands-free AI interaction</p>

        <div className="flex w-full gap-8 h-96">
          {/* Left panel - Status & Controls */}
          <div className="flex-1 border border-cyan-500/20 bg-black/60 rounded-xl p-8 flex flex-col items-center justify-center relative backdrop-blur-md">
            
            {/* Visualizer */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <motion.div 
                animate={{ scale: isConnected ? scale : 1 }}
                className={`absolute inset-0 rounded-full blur-xl opacity-50 ${isConnected ? 'bg-cyan-500' : 'bg-transparent'}`}
              />
              <button 
                onClick={isConnected ? disconnect : connect}
                className={`w-32 h-32 rounded-full relative z-10 flex items-center justify-center border-2 transition-all duration-300 ${isConnected ? 'bg-cyan-900/50 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)] text-cyan-300' : 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-cyan-500/50'}`}
              >
                <div className={`absolute inset-[-10px] rounded-full border pointer-events-none ${isConnected ? 'border-cyan-500/50 animate-ping' : 'border-transparent'}`} />
                <Mic size={48} />
              </button>
            </div>

            <div className="text-lg font-mono text-cyan-400 tracking-widest mb-2">
              {isConnected ? (isSpeaking ? "SYNTHESIZING" : "LISTENING") : "STANDBY"}
            </div>
            <div className="text-xs text-white/40 mb-8 max-w-[200px] text-center">
              {isConnected ? "Omega is actively listening to your commands." : "Click microphone or say 'Hey Omega' to activate."}
            </div>

            <div className="flex gap-2 w-full justify-center">
               <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-500 shadow-[0_0_10px_#0ff]' : 'bg-white/20'}`} />
               <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-500 shadow-[0_0_10px_#0ff]' : 'bg-white/20'}`} />
               <span className={`w-2 h-2 rounded-full ${volume > 0.1 ? 'bg-cyan-500 shadow-[0_0_10px_#0ff]' : 'bg-white/20'}`} />
            </div>

          </div>

          {/* Right panel - Command Suggestions */}
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-widest border-b border-cyan-500/20 pb-2">Capabilities</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <CommandItem icon={<Globe size={18} />} title="System Control" cmd="Open YouTube / Spotify / Chrome" />
              <CommandItem icon={<Activity size={18} />} title="Monitoring" cmd="Check CPU / RAM / Battery status" />
              <CommandItem icon={<Layers size={18} />} title="Automation" cmd="Turn on focus mode / Lock system" />
              <CommandItem icon={<Repeat size={18} />} title="Communication" cmd="Message Shuvam on WhatsApp" />
              <CommandItem icon={<Radio size={18} />} title="Real-time Info" cmd="What is the weather in Kathmandu?" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CommandItem({ icon, title, cmd }: { icon: React.ReactNode, title: string, cmd: string }) {
  return (
    <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-lg p-4 flex items-center gap-4 hover:bg-cyan-900/20 transition-all cursor-crosshair">
      <div className="w-10 h-10 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white/90">{title}</h4>
        <p className="text-xs text-white/50 mt-1 font-mono">{cmd}</p>
      </div>
    </div>
  );
}
