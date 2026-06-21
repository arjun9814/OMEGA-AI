import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export function JinwooWorkout() {
  const [level, setLevel] = useState(1);
  const [pushups, setPushups] = useState(0);
  const [situps, setSitups] = useState(0);
  const [squats, setSquats] = useState(0);
  const [run, setRun] = useState(0);
  
  const targetMultiplier = level;
  const targetPushups = 5 * targetMultiplier; 
  const targetSitups = 5 * targetMultiplier;
  const targetSquats = 5 * targetMultiplier;
  const targetRun = 0.5 * targetMultiplier; 

  const isComplete = pushups >= targetPushups && situps >= targetSitups && squats >= targetSquats && run >= targetRun;

  const handleLevelUp = () => {
    if (isComplete) {
      setLevel(l => l + 1);
      setPushups(0);
      setSitups(0);
      setSquats(0);
      setRun(0);
    }
  };

  const addProgress = (setter: React.Dispatch<React.SetStateAction<number>>, current: number, target: number, increment: number) => {
    if (current < target) {
      setter(Math.min(current + increment, target));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center border border-indigo-500/30 bg-black/80 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Player Stats */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-10 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 backdrop-blur-md">
        <div className="w-16 h-16 rounded-full border-2 border-indigo-500 flex items-center justify-center bg-black shadow-[0_0_15px_rgba(99,102,241,0.5)]">
           <span className="text-2xl font-black text-indigo-400">Lv.{level}</span>
        </div>
        <div className="flex flex-col gap-1 w-48">
           <div className="flex justify-between items-center text-xs font-bold font-mono text-indigo-300">
             <span>SUNG JINWOO (PLAYER)</span>
             <span>HP: {level * 100}/{level * 100}</span>
           </div>
           <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-red-500 w-full" />
           </div>
           <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 mt-1">
              <div className="h-full bg-blue-500 w-full" />
           </div>
        </div>
      </div>

      {/* System Window */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 w-full max-w-2xl bg-[#001428]/90 border-2 border-blue-400/60 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-md overflow-hidden relative"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
        
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-black text-blue-100 tracking-wider mb-2 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            <span className="text-blue-500">!</span> SYSTEM MESSAGE
          </h2>
          <div className="h-px w-full bg-blue-500/30 mb-6" />
          
          <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            DAILY QUEST: PREPARING TO BECOME STRONG
          </h3>
          <p className="text-sm text-blue-200/70 mb-8 font-mono">
            Goal: Complete the required workout routines to level up. 
            (Starting from zero to build up strength!)
          </p>

          <div className="flex flex-col gap-6">
            <QuestItem 
              label="PUSH-UPS" 
              current={pushups} 
              target={targetPushups} 
              onAdd={() => addProgress(setPushups, pushups, targetPushups, 1)} 
              unit="reps"
            />
            <QuestItem 
              label="SIT-UPS" 
              current={situps} 
              target={targetSitups} 
              onAdd={() => addProgress(setSitups, situps, targetSitups, 1)} 
              unit="reps"
            />
            <QuestItem 
              label="SQUATS" 
              current={squats} 
              target={targetSquats} 
              onAdd={() => addProgress(setSquats, squats, targetSquats, 1)} 
              unit="reps"
            />
            <QuestItem 
              label="RUNNING" 
              current={run} 
              target={targetRun} 
              onAdd={() => addProgress(setRun, run, targetRun, 0.1)} 
              unit="km"
            />
          </div>
        </div>

        <div className="p-6 bg-blue-900/20 border-t border-blue-500/20 mt-4 flex justify-between items-center">
            <div className="text-xs font-mono text-blue-300">
              WARNING: Failure to complete daily quest will result in PENALTY ZONE.
            </div>
            
            <button 
              onClick={handleLevelUp}
              disabled={!isComplete}
              className={`px-8 py-3 rounded text-sm font-bold tracking-widest transition-all ${isComplete ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] cursor-pointer hover:bg-blue-400' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-600'}`}
            >
              {isComplete ? 'COMPLETE QUEST (LEVEL UP)' : 'IN PROGRESS'}
            </button>
        </div>

      </motion.div>
    </div>
  );
}

function QuestItem({ label, current, target, onAdd, unit }: { label: string, current: number, target: number, onAdd: () => void, unit: string }) {
  const progress = Math.min((current / target) * 100, 100);
  const isDone = current >= target;

  return (
    <div className="flex justify-between items-center group">
       <div className="flex-1">
          <div className="flex justify-between items-end mb-1 pr-8">
             <span className={`text-lg font-bold tracking-widest ${isDone ? 'text-blue-400' : 'text-white'}`}>{label}</span>
             <span className={`text-sm font-mono ${isDone ? 'text-blue-400' : 'text-white/60'}`}>
               [{current.toFixed(unit === 'km' ? 1 : 0)}/{target} {unit}]
             </span>
          </div>
          <div className="h-2 w-full max-w-[80%] bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
             <motion.div 
               className={`h-full ${isDone ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-white/40'}`}
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.3 }}
             />
          </div>
       </div>
       
       <button 
         onClick={onAdd}
         disabled={isDone}
         className={`w-12 h-12 rounded border flex items-center justify-center transition-all ${isDone ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40'}`}
       >
         {isDone ? <Check size={20} /> : <span className="font-bold">+{unit === 'km' ? '0.1' : '1'}</span>}
       </button>
    </div>
  );
}
