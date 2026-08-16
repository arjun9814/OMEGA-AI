import React, { useState } from 'react';
import { 
  Home, LayoutDashboard, MessageSquare, Mic, SlidersHorizontal, 
  Cpu, FolderOpen, Calendar, Users, MonitorPlay, Settings,
  ChevronRight, ChevronLeft, Dumbbell
} from 'lucide-react';

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={`relative h-full bg-black/40 backdrop-blur-md flex-shrink-0 border-cyan-500/20 transition-all duration-500 z-50 ${isExpanded ? 'w-64 border-r' : 'w-0 border-r-0'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-16 bg-[#050A15]/80 border backdrop-blur-xl rounded-r-xl flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-[4px_0_15px_rgba(34,211,238,0.15)] z-50 ${isExpanded ? 'border-y-cyan-500/30 border-r-cyan-500/30 border-l-transparent' : 'border-cyan-500/30'}`}
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Internal Content (Hidden when collapsed) */}
      <div className="w-full h-full overflow-hidden relative">
        <div className="absolute inset-0 w-64 p-4 flex flex-col gap-6">
          
          <div className="flex items-center gap-3 px-2">
            <div className="relative w-10 h-10 flex flex-shrink-0 items-center justify-center">
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
              <div className="w-6 h-6 bg-cyan-500 rounded-full opacity-50" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-widest text-sm whitespace-nowrap">OMEGA AI</h1>
              <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest">v2.0.0</p>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-2 mt-4 custom-scrollbar">
            <SidebarItem icon={<Home size={18} />} label="Home" active={activeTab === 'Home'} onClick={() => onTabChange('Home')} />
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => onTabChange('Dashboard')} />
            <SidebarItem icon={<MessageSquare size={18} />} label="Soulmate" active={activeTab === 'Soulmate'} onClick={() => onTabChange('Soulmate')} />
            <SidebarItem icon={<Mic size={18} />} label="Voice Commands" active={activeTab === 'Voice Commands'} onClick={() => onTabChange('Voice Commands')} />
            <SidebarItem icon={<SlidersHorizontal size={18} />} label="System Control" active={activeTab === 'System Control'} onClick={() => onTabChange('System Control')} />
            <SidebarItem icon={<Cpu size={18} />} label="Automation" active={activeTab === 'Automation'} onClick={() => onTabChange('Automation')} />
            <SidebarItem icon={<FolderOpen size={18} />} label="Files & Documents" active={activeTab === 'Files & Documents'} onClick={() => onTabChange('Files & Documents')} />
            <SidebarItem icon={<Calendar size={18} />} label="Calendar" active={activeTab === 'Calendar'} onClick={() => onTabChange('Calendar')} />
            <SidebarItem icon={<Dumbbell size={18} />} label="JINWOO EXERCISE" active={activeTab === 'JINWOO EXERCISE'} onClick={() => onTabChange('JINWOO EXERCISE')} />
            <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'Settings'} onClick={() => onTabChange('Settings')} />
          </nav>

          <div className="border border-cyan-500/20 rounded-xl p-4 bg-cyan-900/10 backdrop-blur-md flex flex-col gap-3">
            <h3 className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">AI Status</h3>
            <div className="flex items-end gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 bg-cyan-500/50 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
              ))}
            </div>
            <div>
              <p className="text-xs text-white flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0"></span>
                Always Listening
              </p>
              <p className="text-[10px] text-white/50 pl-3.5 mt-0.5 whitespace-nowrap">Ready to Assist You</p>
            </div>
          </div>

        </div>
      </div>

    </aside>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm tracking-wide whitespace-nowrap ${active ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-2 border-cyan-400 text-cyan-50' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
      <span className={`${active ? 'text-cyan-400' : 'text-white/40'} flex-shrink-0`}>{icon}</span>
      {label}
    </button>
  );
}
