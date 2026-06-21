import React, { useState } from 'react';
import { useLiveAudio } from './hooks/useLiveAudio';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LeftColumn } from './components/LeftColumn';
import { RightColumn } from './components/RightColumn';
import { AICore } from './components/AICore';
import { BottomBar } from './components/BottomBar';
import { JinwooWorkout } from './components/JinwooWorkout';
import { ChatModule } from './components/ChatModule';
import { VoiceCommandsModule } from './components/VoiceCommandsModule';
import { CalendarModule } from './components/CalendarModule';
import { SystemControlModule } from './components/SystemControlModule';

interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'SYSTEM INITIALIZED' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), message: 'AWAITING VOCAL INPUT...' }
  ]);

  const { connect, disconnect, isConnected, isSpeaking, volume, error, emotion } = useLiveAudio((command) => {
    const args = command.args;
    if (command.name === 'executeSystemCommand' && args && args.commandType && args.target) {
       setLogs(prev => [...prev.slice(-4), { 
         id: Math.random().toString(), 
         timestamp: new Date().toLocaleTimeString(), 
         message: `>> EXECUTING [${args.commandType.toUpperCase()}] ON [${args.target.toUpperCase()}]` 
       }]);
    } else if (command.name === 'updateEmotion' && args && args.emotion) {
       setLogs(prev => [...prev.slice(-4), { 
         id: Math.random().toString(), 
         timestamp: new Date().toLocaleTimeString(), 
         message: `>> EMOTION STATE SHIFT: [${args.emotion.toUpperCase()}]` 
       }]);
    }
  });

  const statusText = !isConnected ? "System Standby" : isSpeaking ? "Synthesizing..." : "Listening...";

  return (
    <div className="h-screen w-full bg-[#050A15] text-cyan-50 font-sans overflow-hidden flex selection:bg-cyan-500/30 selection:text-cyan-50 relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full sm:blur-[150px] blur-[100px] bg-cyan-900/10 mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full sm:blur-[150px] blur-[100px] bg-blue-900/10 mix-blend-screen" />
      </div>

      {/* Main Layout Grid */}
      <div className="relative z-10 flex w-full h-full">
        
        {/* Left Nav */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            
            {/* Dashboard Content */}
            <div className="flex-1 p-6 flex flex-col h-[calc(100vh-80px)]">
               
               {activeTab === 'Dashboard' ? (
                 <>
                   <div className="flex flex-1 gap-6 min-h-0">
                      <LeftColumn />
                      <AICore isConnected={isConnected} isSpeaking={isSpeaking} volume={volume} statusText={statusText} emotion={emotion} onToggleConnect={isConnected ? disconnect : connect} />
                      <RightColumn />
                   </div>

                   <BottomBar isConnected={isConnected} connect={connect} disconnect={disconnect} error={error} />
                 </>
               ) : activeTab === 'JINWOO EXERCISE' ? (
                 <JinwooWorkout />
               ) : activeTab === 'Chat' ? (
                 <ChatModule />
               ) : activeTab === 'Voice Commands' ? (
                 <VoiceCommandsModule isConnected={isConnected} isSpeaking={isSpeaking} volume={volume} connect={connect} disconnect={disconnect} />
               ) : activeTab === 'Calendar' ? (
                 <CalendarModule />
               ) : activeTab === 'System Control' ? (
                 <SystemControlModule />
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl" />
                    <h2 className="text-3xl font-light text-white tracking-widest uppercase mb-4 z-10">{activeTab} <span className="font-bold text-cyan-400">MODULE</span></h2>
                    <p className="text-cyan-500/50 font-mono text-sm tracking-wider uppercase z-10 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                       SYSTEM INITIALIZING... STANDBY.
                    </p>
                 </div>
               )}

            </div>
        </div>
      </div>

      {/* Temporary log overlay for commands */}
      {logs.length > 2 && (
         <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-500/30 px-6 py-3 rounded-xl pointer-events-none z-50 backdrop-blur-md flex flex-col gap-1 max-w-lg w-full">
           {logs.slice(-2).map(log => (
             <div key={log.id} className="text-[10px] font-mono tracking-wider flex gap-3 text-cyan-400">
               <span className="opacity-50">[{log.timestamp}]</span>
               <span className="text-cyan-300">{log.message}</span>
             </div>
           ))}
         </div>
      )}

    </div>
  );
}
