import React, { useState } from 'react';
import { Send, User as UserIcon } from 'lucide-react';

export function ChatModule() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello. I am Omega AI. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setInput('');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply || 'No response.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Error: Could not process request.' }]);
    }
  };

  return (
    <div className="flex-1 flex flex-col border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-cyan-900/20">
        <h2 className="text-sm font-mono tracking-widest text-cyan-400 uppercase">Omega Terminal Connect</h2>
        <p className="text-xs text-cyan-500/50">End-to-end encrypted manual input override</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'self-end bg-cyan-900/30 border-cyan-500/30 flex-row-reverse' : 'self-start bg-black/60 border-white/10'} border rounded-2xl p-4 backdrop-blur-sm`}>
            <div className={`w-8 h-8 rounded-full border border-cyan-500/50 flex flex-shrink-0 items-center justify-center ${msg.sender === 'user' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {msg.sender === 'user' ? <UserIcon size={16} /> : <span className="font-bold text-[10px]">AI</span>}
            </div>
            <div className={`text-sm tracking-wide ${msg.sender === 'user' ? 'text-cyan-50 text-right' : 'text-blue-50'}`}>
              {msg.text}
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
            placeholder="Type your command..." 
            className="w-full bg-cyan-900/10 border border-cyan-500/30 text-cyan-50 rounded-xl py-4 pl-6 pr-16 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
          />
          <button type="submit" className="absolute right-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg transition-all border border-cyan-500/30">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
