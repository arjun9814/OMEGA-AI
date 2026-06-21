import React, { useState } from 'react';
import { Shield, Smartphone, Lock, AlertTriangle, Eye, Fingerprint, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function SystemControlModule() {
  const [securityEnabled, setSecurityEnabled] = useState(true);
  const [autoLockActive, setAutoLockActive] = useState(true);
  const [contentFilterActive, setContentFilterActive] = useState(true);
  const [isSimulatingLock, setIsSimulatingLock] = useState(false);

  const triggerLockdown = () => {
    setIsSimulatingLock(true);
    setTimeout(() => setIsSimulatingLock(false), 3000);
  };

  if (isSimulatingLock) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-950/90 rounded-2xl p-6 relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <ShieldAlert size={120} className="text-red-500 animate-bounce" />
          <h1 className="text-5xl font-black text-red-500 tracking-[0.2em]">SYSTEM LOCKED</h1>
          <p className="text-red-300 font-mono text-xl uppercase tracking-widest max-w-md">
            Unauthorized physical access or malicious intent detected. Device is secured. Only the primary owner can unlock.
          </p>
          <div className="mt-8 flex items-center gap-3 bg-black/50 px-6 py-4 rounded-full border border-red-500/50">
            <Fingerprint className="text-red-400" size={32} />
            <span className="text-red-400 font-mono text-sm tracking-widest px-4">AWAITING OWNER AUTHENTICATION...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full w-full max-w-5xl mx-auto">
        
        <div className="mb-8 border-b border-cyan-500/30 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-light text-white tracking-widest"><span className="font-bold text-cyan-400">SYSTEM</span> CONTROL</h2>
            <p className="text-sm text-cyan-500/50 mt-1">Advanced Device Security & OS Override</p>
          </div>
          <div className="flex bg-cyan-900/30 border border-cyan-500/30 rounded-lg px-4 py-2 items-center gap-3">
             <Smartphone className="text-cyan-400" size={20} />
             <div className="flex flex-col">
               <span className="text-xs text-cyan-50 font-bold">CONNECTED DEVICE</span>
               <span className="text-[10px] text-cyan-500/70 font-mono tracking-widest">OS CONTROL GRANTED</span>
             </div>
             <Check className="text-green-400 ml-2" size={16} />
          </div>
        </div>

        <div className="flex gap-8 flex-1">
          {/* Main Security Center */}
          <div className="flex-[2] flex flex-col gap-6">
             <div className="bg-black/60 border border-cyan-500/30 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl" />
                <h3 className="text-lg font-bold text-cyan-50 flex items-center gap-2 mb-6 tracking-wide">
                  <Shield size={20} className="text-cyan-400" /> OMEGA DEFENSE PROTOCOL
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <SettingToggle 
                    icon={<Lock size={18} />}
                    title="Intrusion Auto-Lock" 
                    description="Automatically lock the device if an unknown user tries to access it or bypass security." 
                    active={autoLockActive}
                    onToggle={() => setAutoLockActive(!autoLockActive)}
                  />
                  <SettingToggle 
                    icon={<Eye size={18} />}
                    title="Malicious Activity Filter" 
                    description="Monitor incoming/outgoing messages and app behavior for harmful content. Blocks immediately." 
                    active={contentFilterActive}
                    onToggle={() => setContentFilterActive(!contentFilterActive)}
                  />
                  <SettingToggle 
                    icon={<Fingerprint size={18} />}
                    title="Constant Biometric Verification" 
                    description="Omega will periodically verify your identity using facial recognition or fingerprint pattern tracking." 
                    active={securityEnabled}
                    onToggle={() => setSecurityEnabled(!securityEnabled)}
                  />
                </div>
             </div>

             <div className="flex-1 bg-red-950/20 border border-red-500/20 p-6 rounded-xl flex flex-col justify-center items-center gap-4">
                <AlertTriangle size={32} className="text-red-500/50" />
                <div className="text-center">
                  <h4 className="text-red-400 font-bold tracking-widest uppercase mb-1">Manual Override</h4>
                  <p className="text-red-400/50 text-xs max-w-sm mb-6">Force lock the system instantly. You will need your master password or biometric authentication to unlock.</p>
                  <button 
                    onClick={triggerLockdown}
                    className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500 text-red-500 font-bold tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                  >
                    LOCK SYSTEM NOW
                  </button>
                </div>
             </div>
          </div>

          {/* Right Sidebar Status */}
          <div className="flex-1 flex flex-col gap-6">
             <div className="bg-black/60 border border-cyan-500/20 rounded-xl p-6">
                <h4 className="text-xs font-mono text-cyan-500/70 tracking-widest uppercase mb-4">Device Status</h4>
                
                <div className="space-y-6">
                   <StatusItem label="Owner Status" value="AUTHENTICATED" color="text-green-400" />
                   <StatusItem label="Threat Level" value="ZERO (SECURE)" color="text-cyan-400" />
                   <StatusItem label="Active Monitoring" value="ONLINE" color="text-cyan-400" />
                   
                   <div className="pt-4 border-t border-cyan-500/20">
                      <p className="text-[10px] text-cyan-500/50 font-mono leading-relaxed">
                        If anyone besides you attempts to send inappropriate messages or perform unwanted actions, Omega AI will detect the anomaly and initiate a complete lockdown of the device.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SettingToggle({ icon, title, description, active, onToggle }: { icon: React.ReactNode, title: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
       <div className={`mt-0.5 ${active ? 'text-cyan-400' : 'text-white/40'}`}>
         {icon}
       </div>
       <div className="flex-1 pr-6">
         <h4 className="text-white/90 text-sm font-bold tracking-wide">{title}</h4>
         <p className="text-white/40 text-[11px] mt-1 leading-relaxed">{description}</p>
       </div>
       <button 
         onClick={onToggle}
         className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-cyan-500/20 border-cyan-500 border' : 'bg-white/10 border-white/20 border'}`}
       >
          <div className={`w-4 h-4 rounded-full absolute top-1/2 -translate-y-1/2 transition-all ${active ? 'bg-cyan-400 left-[26px] shadow-[0_0_10px_#0ff]' : 'bg-white/40 left-[2px]'}`} />
       </button>
    </div>
  );
}

function StatusItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-mono font-bold tracking-widest ${color}`}>{value}</span>
    </div>
  );
}
