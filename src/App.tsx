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
import { AudioVisualizerOverlay } from './components/AudioVisualizerOverlay';

interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'SYSTEM INITIALIZED' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), message: 'AWAITING VOCAL INPUT...' }
  ]);
  const [chatMessages, setChatMessages] = useState<{id: number, sender: string, text: string, type?: string, url?: string, isInterim?: boolean}[]>([
    { id: 1, sender: 'ai', text: 'Hello. I am Omega, your AI Assistant. How can I assist you today?' }
  ]);
  const [debugMode, setDebugMode] = useState(true);
  const [debugEvents, setDebugEvents] = useState<{id: string, step: number, title: string, message: string, isError: boolean, timestamp: string}[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const { connect, disconnect, isConnected, isSpeaking, volume, error, emotion, sendText, voiceState } = useLiveAudio((msg) => {
    const command = msg.command;
    if (command) {
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
       } else if (command.name === 'openApp' && args && args.appName) {
          const name = args.appName.toLowerCase();
          const query = args.searchQuery ? encodeURIComponent(args.searchQuery) : '';
          let link = '';
          
          if (name.includes('youtube')) {
             link = query ? `https://www.youtube.com/results?search_query=${query}` : 'https://youtube.com';
          } else if (name.includes('map')) {
             link = query ? `https://www.google.com/maps/search/?api=1&query=${query}` : 'https://maps.google.com';
          } else if (name.includes('spotify')) {
             link = query ? `https://open.spotify.com/search/${query}` : 'https://open.spotify.com';
          } else if (name.includes('whatsapp')) {
             link = 'https://web.whatsapp.com';
          } else if (name.includes('calculator')) {
             link = 'https://www.google.com/search?q=calculator';
          } else {
             link = query ? `https://www.google.com/search?q=${query}` : 'https://google.com';
          }
          
          const targetName = `omega_tab_${name.replace(/[^a-z0-9]/gi, '_')}`;
          window.open(link, targetName);
          setLogs(prev => [...prev.slice(-4), { 
             id: Math.random().toString(), 
             timestamp: new Date().toLocaleTimeString(), 
             message: `>> OPENING APP/TAB: [${name.toUpperCase()}]${query ? ` SEARCHING: [${args.searchQuery}]` : ''}` 
          }]);
       } else if (command.name === 'playInlineVideo' && args && args.videoId) {
          setPlayingVideoId(args.videoId);
          setLogs(prev => [...prev.slice(-4), { 
             id: Math.random().toString(), 
             timestamp: new Date().toLocaleTimeString(), 
             message: `>> PLAYING INLINE VIDEO: [${args.videoId}]` 
          }]);
       } else if (command.name === 'systemDiagnostic' && args) {
          setLogs(prev => [...prev.slice(-4), { 
             id: Math.random().toString(), 
             timestamp: new Date().toLocaleTimeString(), 
             message: `>> SYSTEM DIAGNOSTIC & REPAIR INITIATED: TARGET [${args.target?.toUpperCase()}] LEVEL [${args.level?.toUpperCase()}]` 
          }]);
       } else if (command.name === 'getLocation') {
          setLogs(prev => [...prev.slice(-4), { 
             id: Math.random().toString(), 
             timestamp: new Date().toLocaleTimeString(), 
             message: `>> REQUESTING GEOLOCATION` 
          }]);
          if ('geolocation' in navigator) {
             navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                sendText(`[SYSTEM: Geolocation fetched] User's current location is Latitude: ${latitude}, Longitude: ${longitude}. Use this to find places, distances, or directions.`);
                setLogs(prev => [...prev.slice(-4), { 
                   id: Math.random().toString(), 
                   timestamp: new Date().toLocaleTimeString(), 
                   message: `>> LOCATION ACQUIRED: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
                }]);
             }, (err) => {
                sendText(`[SYSTEM: Geolocation failed] Error: ${err.message}. Please inform the user that you couldn't get their location (they may need to grant permission).`);
             });
          } else {
             sendText("[SYSTEM: Geolocation not supported] The browser does not support geolocation.");
          }
       }
    }
    if (msg.userTranscriptInterim) {
        setChatMessages(prev => {
           const newMsgs = [...prev];
           const last = newMsgs[newMsgs.length - 1];
           if (last && last.sender === 'user' && last.isInterim) {
               last.text = msg.userTranscriptInterim;
               return newMsgs;
           } else {
               return [...newMsgs, { id: Date.now(), sender: 'user', text: msg.userTranscriptInterim, isInterim: true }];
           }
        });
    }
    if (msg.userTranscript) {
       setChatMessages(prev => {
           const newMsgs = [...prev];
           const last = newMsgs[newMsgs.length - 1];
           if (last && last.sender === 'user' && last.isInterim) {
               last.text = msg.userTranscript;
               last.isInterim = false;
               return newMsgs;
           } else {
               return [...newMsgs, { id: Date.now(), sender: 'user', text: msg.userTranscript, isInterim: false }];
           }
       });
    }
    if (msg.textResponse) {
       setChatMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'ai' && (Date.now() - last.id < 5000) && last.type !== 'image') {
             return [...prev.slice(0, -1), { ...last, text: last.text + msg.textResponse, id: Date.now() }];
          }
          return [...prev, { id: Date.now(), sender: 'ai', text: msg.textResponse }];
       });
    }
    if (msg.imageStatus) {
       setChatMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `System: ${msg.imageStatus}` }]);
    }
    if (msg.imageGenerated) {
       setGeneratedImage(msg.imageGenerated);
       setChatMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `Here is the requested image:`, type: 'image', url: msg.imageGenerated }]);
       setLogs(prev => [...prev.slice(-4), { 
          id: Math.random().toString(), 
          timestamp: new Date().toLocaleTimeString(), 
          message: `>> IMAGE RENDER COMPLETE` 
       }]);
    }
  }, (step, title, message, isError) => {
    setDebugEvents(prev => [...prev, { id: Math.random().toString(), step, title, message, isError: isError || false, timestamp: new Date().toLocaleTimeString() }]);
  });

  const handleConnect = () => {
    connect().catch(e => {
       console.log("Connect rejected:", e);
    });
  };

  const statusText = !isConnected ? "System Standby" : 
    voiceState === 'LISTENING' ? "Listening..." :
    voiceState === 'PROCESSING' ? "Processing..." :
    voiceState === 'SPEAKING' ? "Synthesizing..." : "Idle";

  return (
    <div className="h-screen w-full bg-[#050A15] text-cyan-50 font-sans overflow-hidden flex selection:bg-cyan-500/30 selection:text-cyan-50 relative">
      
      {/* Real-time Audio Visualizer Overlay (activates only when user speaks) */}
      <AudioVisualizerOverlay volume={volume} voiceState={voiceState} isConnected={isConnected} />

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
            {activeTab !== 'Home' && <TopBar />}
            
            {/* Dashboard Content */}
            <div className={`flex-1 p-6 flex flex-col ${activeTab === 'Home' ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
               
               {activeTab === 'Home' ? (
                 <div className="flex-1 flex items-center justify-center min-h-0 bg-black border-black">
                    <AICore isConnected={isConnected} isSpeaking={isSpeaking} volume={volume} statusText={statusText} emotion={emotion} onToggleConnect={isConnected ? disconnect : handleConnect} />
                 </div>
               ) : activeTab === 'Dashboard' ? (
                 <>
                   <div className="flex flex-1 gap-6 min-h-0">
                      <LeftColumn debugEvents={debugEvents} onClearDebug={() => setDebugEvents([])} />
                      <AICore isConnected={isConnected} isSpeaking={isSpeaking} volume={volume} statusText={statusText} emotion={emotion} onToggleConnect={isConnected ? disconnect : handleConnect} />
                      <RightColumn />
                   </div>

                   <BottomBar isConnected={isConnected} connect={handleConnect} disconnect={disconnect} error={error} />
                 </>
               ) : activeTab === 'JINWOO EXERCISE' ? (
                 <JinwooWorkout />
               ) : activeTab === 'Soulmate' ? (
                 <ChatModule messages={chatMessages} setMessages={setChatMessages} sendText={sendText} isConnected={isConnected} connect={handleConnect} />
               ) : activeTab === 'Voice Commands' ? (
                 <VoiceCommandsModule isConnected={isConnected} isSpeaking={isSpeaking} volume={volume} connect={handleConnect} disconnect={disconnect} />
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

      {/* Image Popup */}
      {generatedImage && (
         <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setGeneratedImage(null)}>
            <div className="relative border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-[#050A15]" onClick={(e) => e.stopPropagation()}>
               <div className="p-4 border-b border-cyan-500/30 flex justify-between items-center bg-cyan-900/20">
                  <span className="font-mono text-cyan-400 tracking-wider text-sm">RENDERED_VISUALIZATION.IMG</span>
                  <button onClick={() => setGeneratedImage(null)} className="text-cyan-500 hover:text-cyan-300">X</button>
               </div>
               <img src={generatedImage} alt="Generated visual" className="max-w-full max-h-[70vh] object-contain" />
            </div>
         </div>
      )}

      {/* Video Popup */}
      {playingVideoId && (
         <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-12" onClick={() => setPlayingVideoId(null)}>
            <div className="relative w-full max-w-5xl aspect-video border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] bg-black" onClick={(e) => e.stopPropagation()}>
               <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center px-4 z-10 pointer-events-none">
                  <span className="font-mono text-cyan-400 tracking-wider text-sm pointer-events-auto">MEDIA_STREAM: YOUTUBE</span>
                  <button onClick={() => setPlayingVideoId(null)} className="text-cyan-500 hover:text-cyan-300 pointer-events-auto bg-black/50 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
               </div>
               <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
               ></iframe>
            </div>
         </div>
      )}

    </div>
  );
}
