import { useEffect, useRef, useState, useCallback } from 'react';
import { pcmToBase64, playAudioChunk } from '../lib/audioUtils';

export function useLiveAudio(onCommand?: (command: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string>('calm');

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputCtxRef.current = inputCtx;
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputCtxRef.current = outputCtx;
      
      nextStartTimeRef.current = 0;

      const source = inputCtx.createMediaStreamSource(stream);
      // Deprecated but works easiest for direct PCM float32 access in browser
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputCtx.destination);

      ws.onopen = () => {
        setIsConnected(true);
        setIsRecording(true);
      };

      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for(let i=0; i<inputData.length; i++) {
            sum += Math.abs(inputData[i]);
        }
        setVolume(sum / inputData.length);

        const base64 = pcmToBase64(inputData);
        ws.send(JSON.stringify({ audio: base64 }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio && outputCtxRef.current) {
          setIsSpeaking(true);
          const newSource = playAudioChunk(outputCtxRef.current, msg.audio, nextStartTimeRef);
          sourcesRef.current.push(newSource);
          newSource.onended = () => {
              sourcesRef.current = sourcesRef.current.filter(s => s !== newSource);
              if (sourcesRef.current.length === 0) setIsSpeaking(false);
          };
        }
        if (msg.command) {
          if (msg.command.name === 'updateEmotion' && msg.command.args?.emotion) {
             setEmotion(msg.command.args.emotion);
          }
          if (onCommand) {
             onCommand(msg.command);
          }
        }
        if (msg.interrupted) {
          sourcesRef.current.forEach(s => {
              try { s.stop(); } catch(e) {}
          });
          sourcesRef.current = [];
          setIsSpeaking(false);
          if (outputCtxRef.current) {
             nextStartTimeRef.current = outputCtxRef.current.currentTime;
          }
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsRecording(false);
        disconnect();
      };
      
    } catch (e: any) {
      console.error("Audio init error", e);
      if (e.name === 'NotAllowedError' || (e.message && e.message.includes('Permission'))) {
        setError("Microphone permission denied. Please allow microphone access to use Omega AI.");
      } else {
        setError(e.message || "Failed to initialize audio.");
      }
      setIsConnected(false);
      setIsRecording(false);
    }
  }, [onCommand]);

  const disconnect = useCallback(() => {
    setError(null);
    wsRef.current?.close();
    processorRef.current?.disconnect();
    inputCtxRef.current?.close();
    outputCtxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setEmotion('calm');
  }, []);

  return { connect, disconnect, isConnected, isRecording, isSpeaking, volume, error, emotion };
}
