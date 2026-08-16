/* global webkitSpeechRecognition, SpeechRecognition */
import { useEffect, useRef, useState, useCallback } from 'react';
import { pcmToBase64, playAudioChunk } from '../lib/audioUtils';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

function playStartupSound(ctx: AudioContext) {
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

export function useLiveAudio(onMessage?: (message: any) => void, onDebugEvent?: (step: number, title: string, message: string, isError?: boolean) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string>('calm');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');

  const sendDebug = useCallback((step: number, title: string, message: string, isError: boolean = false) => {
      if (onDebugEvent) onDebugEvent(step, title, message, isError);
  }, [onDebugEvent]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const recognizerRef = useRef<any>(null);
  const stateRef = useRef<VoiceState>('IDLE');
  const isRecordingRef = useRef<boolean>(false);
  const timeoutRef = useRef<any>(null);
  const listenTimeoutRef = useRef<any>(null);
  const longTimeoutRef = useRef<any>(null);
  const receivedAudioInTurnRef = useRef<boolean>(false);
  const currentTurnTextRef = useRef<string>("");
  const retryCountRef = useRef<number>(0);

  const setState = useCallback((s: VoiceState) => {
      stateRef.current = s;
      setVoiceState(s);
      if (s === 'IDLE') sendDebug(1, "Microphone Status", "Ready");
      if (s === 'LISTENING') sendDebug(1, "Microphone Status", "Listening");
      if (s === 'PROCESSING') sendDebug(4, "AI Processing", "Sending request to AI model...");
  }, [sendDebug]);

  const speakLocally = useCallback((text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) {
          sendDebug(6, "Text-to-Speech", "TTS failed (API not supported).", true);
          if (onEnd) onEnd();
          return;
      }
      // Stop speech recognition while speaking to prevent microphone loop
      if (recognizerRef.current) {
          try { recognizerRef.current.stop(); } catch(e) {}
      }
      window.speechSynthesis.cancel();
      sendDebug(5, "Text Output", text);
      sendDebug(6, "Text-to-Speech", "Speaking...");
      console.log(`[TTS] Speaking text: "${text}"`);
      const cleanText = text.replace(/[*_#`~>]/g, '').trim();

      if (!cleanText) {
          console.warn("[TTS] Text was empty after cleaning. Skipping speech.");
          if (onEnd) onEnd();
          return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Fallback timeout in case TTS gets permanently stuck
      const timeoutMs = Math.max(10000, cleanText.length * 100);
      let ttsTimeout = setTimeout(() => {
          console.warn(`[TTS] Speech synthesis timed out after ${timeoutMs}ms. Force recovering...`);
          window.speechSynthesis.cancel();
          if (onEnd) onEnd();
      }, timeoutMs);

      utterance.onend = () => {
          clearTimeout(ttsTimeout);
          console.log("[TTS] Speech ended normally.");
          setState('LISTENING');
          if (recognizerRef.current && isRecordingRef.current) {
              try { recognizerRef.current.start(); } catch(e) {}
          }
          if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
          clearTimeout(ttsTimeout);
          console.error("Speech synthesis error", e);
          sendDebug(6, "Text-to-Speech", "TTS failed.", true);
          setState('LISTENING');
          if (recognizerRef.current && isRecordingRef.current) {
              try { recognizerRef.current.start(); } catch(e) {}
          }
          if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
  }, [sendDebug, setState]);

  const stopSpeaking = useCallback(() => {
      sourcesRef.current.forEach(s => {
          try { s.stop(); } catch(e) {}
      });
      sourcesRef.current = [];
      if (outputCtxRef.current) {
         nextStartTimeRef.current = outputCtxRef.current.currentTime;
      }
      if ('speechSynthesis' in window) {
         window.speechSynthesis.cancel();
      }
      setState('LISTENING');
      if (recognizerRef.current && isRecordingRef.current) {
         try { recognizerRef.current.start(); } catch(e) {}
      }
  }, [setState]);

  const sendText = useCallback((text: string, isRetry: boolean = false) => {
    if (outputCtxRef.current && outputCtxRef.current.state === 'suspended') {
      outputCtxRef.current.resume().catch(console.error);
    }
    if (!navigator.onLine) {
        const msg = "I'm unable to reach the required online service. I'll continue using available local features.";
        if (onMessage) onMessage({ textResponse: msg });
        setState('SPEAKING');
        speakLocally(msg, () => setState('LISTENING'));
        return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (!isRetry) retryCountRef.current = 0;
      receivedAudioInTurnRef.current = false;
      currentTurnTextRef.current = "";
      wsRef.current.send(JSON.stringify({ text }));
      setState('PROCESSING');
      clearTimeout(timeoutRef.current);
      clearTimeout(longTimeoutRef.current);
      longTimeoutRef.current = setTimeout(() => {
          if (stateRef.current === 'PROCESSING') {
              if (retryCountRef.current === 0) {
                  sendDebug(4, "AI Processing", "AI model timeout. Retrying...");
                  retryCountRef.current = 1;
                  sendText(text, true);
              } else {
                  sendDebug(4, "AI Processing", "AI model did not return a response after retry.");
                  const msg = "I'm having trouble generating a response. Please try again.";
                  if (onMessage) onMessage({ textResponse: msg });
                  setState('SPEAKING');
                  speakLocally(msg, () => setState('LISTENING'));
              }
          }
      }, 30000);
    } else {
        setState('PROCESSING');
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        })
        .then(res => res.json())
        .then(data => {
            const msg = data.response || "Request processed.";
            if (onMessage) {
                onMessage({ textResponse: msg, command: data.command });
            }
            setState('SPEAKING');
            speakLocally(msg, () => setState('IDLE'));
        })
        .catch(err => {
            const msg = `Offline response for: "${text}"`;
            if (onMessage) onMessage({ textResponse: msg });
            setState('SPEAKING');
            speakLocally(msg, () => setState('IDLE'));
        });
    }
  }, [onMessage, setState]);

  const handleWakeWord = useCallback(() => {
      stopSpeaking();
      setState('LISTENING');
      if (outputCtxRef.current) playStartupSound(outputCtxRef.current);
      if (onMessage) onMessage({ textResponse: "Listening..." });
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = setTimeout(() => {
         if (stateRef.current === 'LISTENING') {
             sendDebug(2, "Speech Recognition", "No speech detected.");
             setState('IDLE');
         }
      }, 10000);
  }, [stopSpeaking, setState, onMessage]);

  const connect = useCallback(() => {
    // Create contexts synchronously to retain user gesture token
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    inputCtxRef.current = inputCtx;
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputCtxRef.current = outputCtx;
    nextStartTimeRef.current = 0;
    
    if (outputCtx.state === 'suspended') {
        outputCtx.resume().catch(console.error);
    }
    
    if ('speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
    }

    return new Promise<void>(async (resolve, reject) => {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              noiseSuppression: true,
              echoCancellation: true,
              autoGainControl: true
            } 
          });
          streamRef.current = stream;
        } catch (err) {
          console.warn("Microphone access denied or unavailable. Connecting without microphone.");
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const wsUrl = `${wsProtocol}//${window.location.host}/live?tz=${encodeURIComponent(tz)}`;
        console.log("Connecting to WebSocket at:", wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        if (stream) {
          const source = inputCtxRef.current!.createMediaStreamSource(stream);
          const processor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          source.connect(processor);
          const gainNode = inputCtxRef.current!.createGain();
          gainNode.gain.value = 0;
          processor.connect(gainNode);
          gainNode.connect(inputCtxRef.current!.destination);

          processor.onaudioprocess = (e) => {
            // IF Omega is speaking out loud, do NOT stream mic audio to backend and mute volume indicator
            if (stateRef.current === 'SPEAKING' || window.speechSynthesis?.speaking || sourcesRef.current.length > 0) {
                setVolume(0);
                return;
            }

            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for(let i=0; i<inputData.length; i++) {
                sum += Math.abs(inputData[i]);
            }
            setVolume(sum / inputData.length);
            
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                // Audio payload no longer sent to backend to preserve bandwidth
            }
          };
        }

        ws.onopen = () => {
          setIsConnected(true);
          if (stream) {
            setIsRecording(true);
            isRecordingRef.current = true;
          }
          
          setState('LISTENING');
          
          if ("geolocation" in navigator) {
             navigator.geolocation.getCurrentPosition(
               (pos) => {
                 const lat = pos.coords.latitude;
                 const lon = pos.coords.longitude;
                 ws.send(JSON.stringify({ text: `System Context: User's current location is Latitude ${lat}, Longitude ${lon}. User has just connected to the voice interface. Please greet the user briefly and ask how you can help.` }));
               },
               (err) => {
                 console.warn("Geolocation error:", err);
                 ws.send(JSON.stringify({ text: `System Context: User has just connected to the voice interface. Please greet the user briefly and ask how you can help.` }));
               }
             );
          } else {
             ws.send(JSON.stringify({ text: `System Context: User has just connected to the voice interface. Please greet the user briefly and ask how you can help.` }));
          }
          
          if (onMessage) {
             onMessage({ textResponse: "Omega uplink established. Initiating greeting..." });
          }

          // Setup browser Speech Recognition for seamless hands-free commands
          const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognitionClass && !recognizerRef.current) {
             try {
               const recognition = new SpeechRecognitionClass();
               recognition.continuous = true;
               recognition.interimResults = true;
               recognition.lang = navigator.language || 'en-US';

               recognition.onresult = (event: any) => {
                 if (stateRef.current === 'SPEAKING' || stateRef.current === 'PROCESSING' || window.speechSynthesis?.speaking || sourcesRef.current.length > 0) {
                   return;
                 }

                 let interimTranscript = '';
                 let finalTranscript = '';

                 for (let i = event.resultIndex; i < event.results.length; ++i) {
                   if (event.results[i].isFinal) {
                     finalTranscript += event.results[i][0].transcript;
                   } else {
                     interimTranscript += event.results[i][0].transcript;
                   }
                 }

                 if (interimTranscript && onMessage) {
                   onMessage({ userTranscriptInterim: interimTranscript });
                 }

                 if (finalTranscript.trim()) {
                   const transcriptText = finalTranscript.trim();
                   sendDebug(2, "Speech Recognition", `Recognized: ${transcriptText}`);
                   if (onMessage) {
                     onMessage({ userTranscript: transcriptText });
                   }
                   sendText(transcriptText);
                 }
               };

               recognition.onerror = (err: any) => {
                 console.warn("Speech Recognition error:", err.error);
               };

               recognition.onend = () => {
                 if (isRecordingRef.current && stateRef.current !== 'SPEAKING') {
                   try { recognition.start(); } catch(e) {}
                 }
               };

               recognizerRef.current = recognition;
               recognition.start();
             } catch (recErr) {
               console.warn("Could not start Web Speech Recognition:", recErr);
             }
          }
          
          resolve();
        };

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          
          console.log("[WebSocket] Received message:", msg);

          if (msg.userTranscript || msg.userTranscriptInterim) {
              if (onMessage) {
                  onMessage({ 
                      userTranscript: msg.userTranscript,
                      userTranscriptInterim: msg.userTranscriptInterim
                  });
              }
              if (msg.userTranscript) {
                  sendDebug(2, "Speech Recognition", `Recognized Text: ${msg.userTranscript}`);
                  setState('PROCESSING');
              }
          }
          
          if (stateRef.current === 'PROCESSING' && (msg.audio || msg.textResponse || msg.command)) {
              sendDebug(4, "AI Processing", "AI response received.");
              clearTimeout(longTimeoutRef.current);
          }

          if (msg.textResponse) {
            console.log("[WebSocket] Processing textResponse:", msg.textResponse);
            clearTimeout(timeoutRef.current);
            clearTimeout(longTimeoutRef.current);
            currentTurnTextRef.current += msg.textResponse;
            if (!msg.audio) {
              console.log("[TTS] No audio provided by server, initiating local TTS...");
              setState('SPEAKING');
              
              // Handle provider errors by logging them
              if (msg.provider === 'nvidia-error') {
                 console.error("[WebSocket] Received error from backend AI provider.");
              }
              
              speakLocally(msg.textResponse, () => {
                  console.log("[TTS] TTS completed. Returning to LISTENING state.");
                  setState('LISTENING');
              });
            }
          }
          let audioPlayed = false;
          if (msg.audio && outputCtxRef.current) {
            clearTimeout(timeoutRef.current);
            if (stateRef.current !== 'SPEAKING') setState('SPEAKING');

            if (outputCtxRef.current.state === 'suspended') {
               outputCtxRef.current.resume().catch(console.error);
            }
            
            const newSource = playAudioChunk(outputCtxRef.current, msg.audio, nextStartTimeRef);
            if (newSource) {
                audioPlayed = true;
                sourcesRef.current.push(newSource);
                newSource.onended = () => {
                    sourcesRef.current = sourcesRef.current.filter(s => s !== newSource);
                };
            }
          }
          if (audioPlayed) {
            receivedAudioInTurnRef.current = true;
          }
          if (msg.turnComplete) {
              if (!receivedAudioInTurnRef.current && currentTurnTextRef.current) {
                  setState('SPEAKING');
                  speakLocally(currentTurnTextRef.current, () => {
                      setState('LISTENING');
                  });
              } else {
                  if (stateRef.current === 'SPEAKING' || stateRef.current === 'PROCESSING') {
                      const delayMs = outputCtxRef.current ? Math.max(0, (nextStartTimeRef.current - outputCtxRef.current.currentTime) * 1000) : 0;
                      setTimeout(() => {
                          setState('LISTENING');
                      }, delayMs);
                  }
              }
          }
          if (msg.command) {
            if (msg.command.name === 'updateEmotion' && msg.command.args?.emotion) {
               setEmotion(msg.command.args.emotion);
            } else if (msg.command.name === 'requestClientTime' && msg.command.args?.id) {
               const now = new Date();
               const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
               const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
               ws.send(JSON.stringify({
                  clientTimeResponse: {
                     id: msg.command.args.id,
                     time: `${timeStr} on ${dateStr}`
                  }
               }));
            }
          }
          if (onMessage) {
             onMessage(msg);
          }
          if (msg.interrupted) {
            stopSpeaking();
          }
          if (msg.error) {
              const errorMsg = "I encountered an internal error. Please try again.";
              if (onMessage) onMessage({ textResponse: errorMsg });
              setState('SPEAKING');
              speakLocally(errorMsg, () => setState('LISTENING'));
          }
        };

        ws.onerror = (e: any) => {
          console.warn("WebSocket status:", e?.message || "Connection event");
          reject(new Error("WebSocket connection failed. If you are in the preview iframe, please open the app in a new tab to use voice features."));
        };

        ws.onclose = (event) => {
          console.log(`[WebSocket] Closed. Code: ${event.code}, Reason: ${event.reason || 'none'}, Clean: ${event.wasClean}`);
          if (event.code !== 1000 && event.code !== 1001) {
             if (event.code === 1011) {
                setError("Server error: " + event.reason);
             } else {
                setError(`Connection closed unexpectedly (Code: ${event.code}).`);
             }
          }
          setIsConnected(false);
          setIsRecording(false);
          disconnect();
        };
        
      } catch (e: any) {
        console.error("Audio init error", e?.message || "Unknown error");
        if (e.name === 'NotAllowedError' || (e.message && e.message.includes('Permission'))) {
          setError("Microphone permission denied. Please allow microphone access to use Omega AI.");
        } else {
          setError(e.message || "Failed to initialize audio.");
        }
        setIsConnected(false);
        setIsRecording(false);
        reject(e);
      }
    });
  }, [onMessage, setState, stopSpeaking]);

  const disconnect = useCallback(() => {
    setError(null);
    isRecordingRef.current = false;
    wsRef.current?.close();
    processorRef.current?.disconnect();
    if (recognizerRef.current) {
        recognizerRef.current.onend = null;
        try { recognizerRef.current.stop(); } catch(e) {}
    }
    if (inputCtxRef.current && inputCtxRef.current.state !== 'closed') {
      inputCtxRef.current.close().catch(() => {});
    }
    if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') {
      outputCtxRef.current.close().catch(() => {});
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsConnected(false);
    setIsRecording(false);
    setState('IDLE');
    setEmotion('calm');
    clearTimeout(timeoutRef.current);
    clearTimeout(listenTimeoutRef.current);
  }, [setState]);

  const isSpeaking = voiceState === 'SPEAKING';

  return { connect, disconnect, isConnected, isRecording, isSpeaking, volume, error, emotion, sendText, voiceState };
}
