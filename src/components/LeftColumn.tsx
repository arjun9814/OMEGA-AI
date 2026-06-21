import React from 'react';
import { BatteryMedium, Wifi, Upload, Clock } from 'lucide-react';

export function LeftColumn() {
  return (
    <div className="w-80 flex flex-col gap-6">
      
      <div className="flex flex-col gap-4">
        <h2 className="text-[10px] font-mono tracking-widest text-white/50 uppercase">System Overview</h2>
        <div className="flex justify-between">
           <CircularProgress value={32} label="CPU" color="border-cyan-400" text="text-cyan-400" />
           <CircularProgress value={68} label="RAM" color="border-blue-400" text="text-blue-400" />
           <CircularProgress value={56} label="STORAGE" color="border-indigo-400" text="text-indigo-400" />
        </div>
      </div>

      <div className="border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-5">
        <h2 className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Quick Stats</h2>
        <div className="flex flex-col gap-4">
          <StatRow icon={<BatteryMedium size={16} />} label="Battery" value="82%" />
          <StatRow icon={<Wifi size={16} />} label="Internet" value="120 Mbps" />
          <StatRow icon={<Upload size={16} />} label="Upload" value="25 Mbps" />
          <StatRow icon={<Clock size={16} />} label="Uptime" value="5h 32m" />
        </div>
      </div>

      <div className="border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-5 flex-1">
        <h2 className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">Today's Schedule</h2>
        <div className="flex flex-col gap-4">
           <ScheduleItem time="11:00 AM" desc="Project Meeting" />
           <ScheduleItem time="01:00 PM" desc="Lunch with Team" />
           <ScheduleItem time="04:30 PM" desc="Client Presentation" />
           <ScheduleItem time="07:00 PM" desc="Gym & Workout" />
        </div>
        <button className="mt-auto w-full py-3 rounded-xl border border-cyan-500/30 bg-cyan-900/20 text-cyan-400 text-xs font-semibold tracking-wider hover:bg-cyan-500/20 transition-all">
          View Calendar
        </button>
      </div>

    </div>
  );
}

function CircularProgress({ value, label, color, text }: { value: number, label: string, color: string, text: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-20 h-20 rounded-full border-[3px] border-white/5 relative flex items-center justify-center`}>
        {/* Placeholder for SVG circle stroke */}
        <div className={`absolute inset-[-3px] rounded-full border-[3px] ${color} border-l-transparent border-t-transparent`}></div>
        <span className="text-lg font-bold text-white tracking-widest">{value}%</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-white/80">{label}</span>
        <span className="text-[10px] text-white/40">Usage</span>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-white/60">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function ScheduleItem({ time, desc }: { time: string, desc: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-cyan-400/70 w-24">
         <Clock size={12} />
         <span className="text-xs font-mono">{time}</span>
      </div>
      <span className="text-sm text-white/90">{desc}</span>
    </div>
  );
}
