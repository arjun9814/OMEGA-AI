import React from 'react';
import { CloudRain, Wind, Plus } from 'lucide-react';

export function RightColumn() {
  return (
    <div className="w-80 flex flex-col gap-6">
      
      {/* Weather */}
      <div className="relative border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-zinc-600/20 rounded-full blur-xl pointer-events-none" />
        <h2 className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase mb-4">Weather</h2>
        <div className="flex flex-col relative z-10">
          <span className="text-sm text-white/80">Kathmandu, Nepal</span>
          <div className="flex justify-between items-end mt-2">
            <div className="flex flex-col">
               <span className="text-5xl font-light text-white tracking-tighter">24°C</span>
               <span className="text-sm text-white/60 mt-1">Clear Sky</span>
            </div>
            {/* Visual placeholder for Moon/Sun */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-2" />
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
            <WeatherDetail label="Humidity" value="45%" icon={<CloudRain size={14} />} />
            <WeatherDetail label="Wind" value="12 km/h" icon={<Wind size={14} />} />
            <WeatherDetail label="Feels Like" value="24°C" icon={<span className="text-cyan-400 text-xs">☀</span>} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Notifications</h2>
            <button className="text-[10px] text-cyan-500 hover:text-cyan-400 transition-colors">View All</button>
        </div>
        <div className="flex flex-col gap-3">
           <NotificationItem source="New message from Shuvam" time="2m ago" />
           <NotificationItem source="WhatsApp Web" time="3m ago" color="text-emerald-400" />
           <NotificationItem source="System Update Available" time="10m ago" />
           <NotificationItem source="Backup Completed" time="30m ago" />
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="flex flex-col gap-4 mt-4 flex-1">
        <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Upcoming Tasks</h2>
            <button className="flex items-center gap-1 text-[10px] py-1 px-3 rounded-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
              <Plus size={10} /> Add Task
            </button>
        </div>
        <div className="flex flex-col gap-3">
           <TaskItem desc="Finish AI Project" priority="High Priority" time="Today" pColor="text-cyan-400" />
           <TaskItem desc="Buy Groceries" priority="Medium Priority" time="Tomorrow" pColor="text-yellow-400" />
           <TaskItem desc="Read Research Paper" priority="Low Priority" time="May 19" pColor="text-emerald-400" />
        </div>
        <div className="text-sm text-white/40 mt-auto pt-4 border-t border-white/5">
           Total Tasks: 3
        </div>
      </div>

    </div>
  );
}

function WeatherDetail({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-white/50 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-white/90">{value}</span>
    </div>
  );
}

function NotificationItem({ source, time, color = "text-cyan-400" }: { source: string, time: string, color?: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-2">
      <div className="flex items-center gap-3">
         <div className={`w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 ${color}`}>
           <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_5px_currentColor]"></div>
         </div>
         <span className="text-white/80">{source}</span>
      </div>
      <span className="text-xs text-white/40">{time}</span>
    </div>
  );
}

function TaskItem({ desc, priority, time, pColor }: { desc: string, priority: string, time: string, pColor: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 group">
      <div className="flex items-center gap-4">
         <div className="w-4 h-4 rounded border border-white/20 group-hover:border-cyan-500 transition-colors cursor-pointer" />
         <span className="text-white/80">{desc}</span>
      </div>
      <div className="flex items-center gap-6">
         <span className={`text-[10px] tracking-wider uppercase ${pColor}`}>{priority}</span>
         <span className="text-xs text-white/40 w-16 text-right">{time}</span>
      </div>
    </div>
  );
}
