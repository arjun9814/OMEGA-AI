import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sunrise, MapPin } from 'lucide-react';

export function CalendarModule() {
  const [currentDate] = useState(new Date());

  // Function to get Nepali Year (Bikram Sambat is approximately +56 years and +8.5 months)
  // Simplified logic for UI purposes
  const getNepaliDate = () => {
    const bsYear = currentDate.getFullYear() + 56;
    return `२०८१ जेठ ${currentDate.getDate()}`; // Placeholder for accurate Bikram Sambat calculation
  };

  const getEnglishDateStr = () => {
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nepaliDays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden h-full">
      
      <div className="w-full max-w-5xl flex gap-8 h-full">
        
        {/* Dual Calendar Interface */}
        <div className="flex-[2] flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-cyan-500/30 pb-4">
             <div>
               <h2 className="text-3xl font-light text-white tracking-widest"><span className="font-bold text-cyan-400">DUAL</span> CALENDAR</h2>
               <p className="text-sm text-cyan-500/50">Gregorian & Bikram Sambat Synchronization</p>
             </div>
             
             <div className="flex gap-4 items-center">
                {/* Current En Date */}
                <div className="flex flex-col items-end border-r border-cyan-500/30 pr-4">
                   <span className="text-xs font-mono text-cyan-400">{getEnglishDateStr()}</span>
                   <span className="text-[10px] text-white/40">GREGORIAN</span>
                </div>
                {/* Current Np Date */}
                <div className="flex flex-col items-end">
                   <span className="text-sm font-bold text-cyan-300 tracking-wider">मिति : {getNepaliDate()}</span>
                   <span className="text-[10px] text-white/40">BIKRAM SAMBAT</span>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-black/60 rounded-xl border border-cyan-500/20 p-6 flex flex-col">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {englishDays.map((day, i) => (
                <div key={day} className="flex flex-col items-center pb-2 border-b border-cyan-500/20">
                  <span className="text-xs font-bold text-white/80">{day}</span>
                  <span className="text-[10px] font-mono text-cyan-400/60 mt-1">{nepaliDays[i]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid Placholder (Current Month) */}
            <div className="grid grid-cols-7 gap-4 flex-1">
               {Array.from({ length: 35 }).map((_, i) => {
                 const enDate = (i - 2 > 0 && i - 2 <= 31) ? i - 2 : null;
                 const npDate = enDate ? enDate + 14 : null; // Arbitrary offset for visual representation
                 const npDateStr = npDate ? (npDate > 32 ? npDate - 32 : npDate).toString() : null;
                 const isToday = enDate === currentDate.getDate();

                 return (
                   <div key={i} className={`rounded-lg bg-cyan-900/10 border flex flex-col items-center justify-center relative overflow-hidden transition-all hover:bg-cyan-900/30 cursor-pointer ${isToday ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-cyan-500/10'} ${!enDate && 'opacity-20'}`}>
                      {isToday && <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl-md" />}
                      <span className={`text-lg font-bold ${isToday ? 'text-white' : 'text-white/70'}`}>{enDate || ""}</span>
                      <span className={`text-[10px] ${isToday ? 'text-cyan-300 font-bold' : 'text-cyan-500/50'}`}>{npDateStr || ""}</span>
                   </div>
                 );
               })}
            </div>
          </div>

        </div>

        {/* Right Sidebar - Day Agenda */}
        <div className="flex-1 flex flex-col gap-4">
           {/* Focus Info */}
           <div className="bg-gradient-to-br from-cyan-900/40 to-black/60 border border-cyan-500/30 rounded-xl p-5 flex flex-col gap-2">
             <div className="flex justify-between items-center text-cyan-400 text-xs font-mono font-bold">
               <span>KATHMANDU</span>
               <MapPin size={14} />
             </div>
             <div className="flex items-center gap-4 mt-2">
               <Sunrise size={32} className="text-yellow-500" />
               <div className="flex flex-col">
                 <span className="text-2xl font-light text-white tracking-widest">{currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                 <span className="text-xs text-white/50">Nepal Standard Time</span>
               </div>
             </div>
           </div>

           {/* Agenda Items */}
           <div className="flex-1 bg-black/60 border border-cyan-500/20 rounded-xl p-5 flex flex-col">
             <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-4">Daily Schedule</h3>
             <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AgendaItem time="11:00 AM" title="Project Meeting" color="border-cyan-400 text-cyan-400" />
                <AgendaItem time="01:00 PM" title="Lunch with Team" color="border-yellow-400 text-yellow-400" />
                <AgendaItem time="04:30 PM" title="Client Presentation" color="border-indigo-400 text-indigo-400" />
                <AgendaItem time="07:00 PM" title="Jinwoo Workout" color="border-red-400 text-red-400" />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function AgendaItem({ time, title, color }: { time: string, title: string, color: string }) {
  return (
    <div className={`flex gap-4 items-center bg-white/5 p-3 rounded-lg border-l-2 ${color} hover:bg-white/10 transition-colors`}>
      <span className="text-xs font-mono text-white/60 w-16">{time}</span>
      <div className="w-px h-6 bg-white/10" />
      <span className="text-sm font-medium text-white/90">{title}</span>
    </div>
  );
}
