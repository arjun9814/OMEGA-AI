import { useState, MutableRefObject } from 'react';

export function pcmToBase64(buffer: Float32Array) {
  const int16Buffer = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    let val = buffer[i] * 32768;
    if (val > 32767) val = 32767;
    if (val < -32768) val = -32768;
    int16Buffer[i] = val;
  }
  const bytes = new Uint8Array(int16Buffer.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function playAudioChunk(audioCtx: AudioContext, base64: string, nextStartTimeRef: MutableRefObject<number>) {
  try {
    const binary = atob(base64);
    const len = binary.length;
    const evenLen = len % 2 === 0 ? len : len - 1;
    const bytes = new Uint8Array(evenLen);
    for(let i = 0; i < evenLen; i++) bytes[i] = binary.charCodeAt(i);
    
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for(let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
    }
    
    const buffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    
    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
       nextStartTimeRef.current = currentTime + 0.02; 
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    
    return source;
  } catch (e) {
    console.error("Audio playback error:", e);
    return null;
  }
}
