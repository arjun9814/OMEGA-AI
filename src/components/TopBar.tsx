import React, { useState, useEffect } from 'react';
import { Search, XCircle, Shield, Bell, Power, Settings as SettingsIcon, Focus } from 'lucide-react';

export function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-cyan-500/20 bg-black/40 backdrop-blur-md">
      <div className="flex flex-col">
        <span className="text-xl font-bold text-cyan-50 tracking-wider">
          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </span>
        <span className="text-xs text-cyan-400/70 font-medium">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={16} className="text-cyan-500/50" />
        </div>
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full bg-cyan-900/10 border border-cyan-500/20 text-cyan-50 rounded-full py-2.5 pl-10 pr-12 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm backdrop-blur-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono tracking-widest flex gap-1">
             <span>⌘</span><span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <TopIconButton icon={<XCircle size={18} />} />
           <TopIconButton icon={<Shield size={18} />} />
           <TopIconButton icon={<SettingsIcon size={18} />} />
           <TopIconButton icon={<Focus size={18} />} />
        </div>
        <div className="w-px h-6 bg-cyan-500/20 mx-2" />
        <div className="relative">
          <TopIconButton icon={<Bell size={18} />} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
        </div>
        <button className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] ml-2">
          <Power size={18} />
        </button>
      </div>
    </header>
  );
}

function TopIconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-cyan-400 hover:bg-white/5 transition-all">
      {icon}
    </button>
  );
}
