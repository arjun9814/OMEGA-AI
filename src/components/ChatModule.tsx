import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { SoulmateProfile } from './SoulmateProfile';

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  type?: string;
  url?: string;
  isInterim?: boolean;
}

interface ChatModuleProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  sendText: (text: string) => void;
  isConnected: boolean;
  connect: () => void;
}

export function ChatModule({ messages, setMessages, sendText, isConnected, connect }: ChatModuleProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setInput('');
    
    // Connect to live AI if not connected
    if (!isConnected) {
       try {
         await connect();
         sendText(userMsg);
       } catch (e) {
         console.error("Failed to connect for sending text", e);
         // Optional: fallback logic here
       }
    } else {
       sendText(userMsg);
    }
  };

  return (
    <div className="flex-1 flex gap-6 min-h-0">
      <SoulmateProfile />
      <div className="flex-1 flex flex-col border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden relative min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-cyan-900/20 flex justify-between items-center">
          <div>
             <h2 className="text-sm font-mono tracking-widest text-cyan-400 uppercase">Omega Terminal Connect</h2>
             <p className="text-xs text-cyan-500/50">End-to-end encrypted manual input & live transcript</p>
          </div>
          <div className="flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400' : 'bg-red-500 animate-pulse'}`} />
             <span className="text-[10px] font-mono text-cyan-500/80 uppercase">{isConnected ? 'UPLINK ACTIVE' : 'NO UPLINK'}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar" ref={scrollRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'self-end bg-cyan-900/30 border-cyan-500/30 flex-row-reverse' : 'self-start bg-black/60 border-white/10'} border rounded-2xl p-4 backdrop-blur-sm`}>
              <div className={`w-8 h-8 rounded-full border border-cyan-500/50 flex flex-shrink-0 items-center justify-center ${msg.sender === 'user' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {msg.sender === 'user' ? <UserIcon size={16} /> : <span className="font-bold text-[10px]">AI</span>}
              </div>
              <div className={`text-sm tracking-wide ${msg.sender === 'user' ? 'text-cyan-50 text-right' : 'text-blue-50'} ${msg.isInterim ? 'opacity-50 italic' : ''} flex flex-col gap-2`}>
                <span>{msg.text}</span>
                {msg.type === 'image' && msg.url && (
                   <img src={msg.url} alt="Generated" className="rounded-lg max-h-48 object-cover border border-cyan-500/30" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/60 border-t border-cyan-500/20">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isConnected && messages.length > 5 && false}
              placeholder="Type your command..." 
              className="w-full bg-cyan-900/10 border border-cyan-500/30 text-cyan-50 rounded-xl py-4 pl-6 pr-16 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm disabled:opacity-50"
            />
            <button type="submit" className="absolute right-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg transition-all border border-cyan-500/30">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
