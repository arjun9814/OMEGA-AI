import React from 'react';
import { 
  Play, Chrome, MessageCircle, Camera, Calculator, Folder, Settings, Plus, Mic, MicOff 
} from 'lucide-react';

export function BottomBar({ isConnected, connect, disconnect, error }: { isConnected: boolean, connect: () => void, disconnect: () => void, error: string | null }) {
  return (
    <div className="flex gap-6 mt-6">
      
      {/* Quick Access Apps */}
      <div className="flex-1 border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-6 relative">
         <h2 className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-[#050a15] px-4 text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Quick Access</h2>
         
         <div className="flex justify-between items-center h-full px-4">
            <AppIcon icon={<Play size={24} />} label="YouTube" color="text-red-500" gradient="from-red-500/20 to-transparent" />
            <AppIcon icon={<div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-[10px]">S</div>} label="Spotify" color="text-emerald-500" gradient="from-emerald-500/20 to-transparent" />
            <AppIcon icon={<Chrome size={24} />} label="Chrome" color="text-blue-400" gradient="from-blue-500/20 to-transparent" />
            <AppIcon icon={<MessageCircle size={24} />} label="WhatsApp" color="text-green-500" gradient="from-green-500/20 to-transparent" />
            <AppIcon icon={<Camera size={24} />} label="Camera" color="text-zinc-300" />
            <AppIcon icon={<Calculator size={24} />} label="Calculator" color="text-zinc-300" />
            <AppIcon icon={<Folder size={24} />} label="Files" color="text-blue-400" />
            {/* Added Shield icon for System Control - We can just use an icon here, but App.tsx currently controls view by side-tabs */}
            <AppIcon icon={<Settings size={24} />} label="Settings" color="text-zinc-300" />
            <AppIcon icon={<Plus size={24} />} label="Add" color="text-white/50" border="border-white/20 border-dashed" noBg />
         </div>
      </div>

      {/* Voice Command Button Area */}
      <div className="w-80 border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-6 relative flex flex-col justify-center">
         <h2 className="absolute top-[-10px] left-6 bg-[#050a15] px-2 text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Voice Command</h2>
         
         <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-1 h-6">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1 bg-cyan-400/80 rounded-full" style={{ height: `${10 + Math.random() * 90}%` }} />
                  ))}
               </div>
               <span className="text-xs text-white/50 font-mono tracking-wider mt-2">
                 Say: "Hey Omega"
               </span>
               {error && <span className="text-[10px] text-red-400">{error}</span>}
            </div>
            
            <button 
              onClick={isConnected ? disconnect : connect}
              className={`w-16 h-16 rounded-full flex items-center justify-center relative ${isConnected ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'}`}
            >
              <div className={`absolute inset-0 rounded-full border ${isConnected ? 'border-red-500/50' : 'border-cyan-500/50'}`} />
              <div className={`absolute inset-2 rounded-full border opacity-50 ${isConnected ? 'border-red-500/30' : 'border-cyan-500/30'}`} />
              {isConnected ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
         </div>
      </div>

    </div>
  );
}

function AppIcon({ icon, label, color, gradient, border = "border-white/10", noBg = false }: { icon: React.ReactNode, label: string, color: string, gradient?: string, border?: string, noBg?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-3 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${border} transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-500/50 relative overflow-hidden ${noBg ? '' : 'bg-white/5'}`}>
         {gradient && <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />}
         <div className={`relative z-10 ${color}`}>
           {icon}
         </div>
      </div>
      <span className="text-xs text-white/70 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}
