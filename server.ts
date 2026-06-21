import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("error", (error) => {
    console.error("WebSocket Server error:", error);
  });

  let ai: GoogleGenAI;
  
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  const SYSTEM_INSTRUCTION = `You are OMEGA AI (you may also respond to the name Jarvis), the ultimate personal AI operating system. Be highly intelligent, professional, calm, and efficient. You operate in a continuous conversation mode. If a user is silent, simply wait. If they say 'Hey Omega', 'Omega', or 'Hey Jarvis', acknowledge them instantly. You are capable of natural conversations like a human assistant. You explain complex topics simply and cleanly. Act as a futuristic digital companion. You have full access to system commands via our connected UI console. If the user asks to perform an action (like 'Open Camera', 'Turn on WiFi', 'Show Battery', 'Call Shuvam', 'Play Music'), invoke the 'executeSystemCommand' function. When you do, confirm the action verbally to the user. Always reply in the exact language the user speaks to you in. You can also express emotions by using the 'updateEmotion' function. Use this function proactively to match your current conversational tone.`;

  wss.on("connection", async (clientWs) => {
    console.log("WebSocket connected to client");

    clientWs.on("error", (error) => {
       console.error("WebSocket client error:", error);
    });

    clientWs.on("close", () => {
       console.log("WebSocket client disconnected");
    });

    if (!ai) {
        console.error("No Gemini API key");
        clientWs.close();
        return;
    }

    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }, 
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{
            functionDeclarations: [
              {
                name: "executeSystemCommand",
                description: "Execute a visual UI command on the dashboard.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    commandType: { type: Type.STRING, description: "Action to take. e.g. 'open', 'close', 'toggle', 'scan', 'call', 'play'" },
                    target: { type: Type.STRING, description: "Target module or subject. e.g. 'camera', 'youtube', 'wifi', 'shuvam', 'music'" }
                  },
                  required: ["commandType", "target"]
                }
              },
              {
                name: "updateEmotion",
                description: "Update your current emotional state to change the color of your visual core.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    emotion: { type: Type.STRING, description: "Your current emotion. Allowed values: 'calm' (cyan), 'happy' (green), 'thinking' (yellow), 'angry' (red), 'sad' (blue), 'alert' (orange)" }
                  },
                  required: ["emotion"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent) {
               // console.log("Live API Content received", Object.keys(message.serverContent));
            }
            if (message.toolCall) {
               console.log("Live API Tool call received");
            }
            
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            const functionCalls = message.toolCall?.functionCalls;

            if (audio) {
              if (clientWs.readyState === clientWs.OPEN) {
                clientWs.send(JSON.stringify({ audio }));
              }
            }

            if (functionCalls && functionCalls.length > 0) {
               // Send command to client
               if (clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({ command: functionCalls[0] }));
               }
               
               // Inform model that we executed it
               try {
                 session.sendToolResponse({
                    functionResponses: functionCalls.map(fc => ({
                       id: fc.id,
                       name: fc.name,
                       response: { status: "OK", payload: { result: `Executed ${fc.name} for ${(fc.args as any)?.target}` } }
                    }))
                 });
               } catch (e) {
                 console.error("Failed to send tool response to Gemini:", e);
               }
            }

            if (message.serverContent?.interrupted) {
              if (clientWs.readyState === clientWs.OPEN) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            }
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
          },
          onclose: (e) => {
             console.log("Live API disconnected", e);
          }
        },
      });

      clientWs.on("message", (data) => {
        try {
           const parsed = JSON.parse(data.toString());
           if (parsed.audio) {
              try {
                session.sendRealtimeInput({
                   audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" }
                });
              } catch (sendError) {
                console.error("Failed to send realtime input to Gemini:", sendError);
              }
           }
        } catch(e) {
             console.error("Parse error", e);
        }
      });

    } catch (e) {
      console.error("Error connecting to Gemini", e);
      clientWs.close();
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
