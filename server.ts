import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION:', err?.message || 'Unknown error');
});

process.on('unhandledRejection', (reason: any, promise) => {
  console.error('UNHANDLED REJECTION:', reason?.message || 'Unknown error');
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("error", (error: any) => {
    console.error("WebSocket Server error:", error?.message || "Unknown error");
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

  const SYSTEM_INSTRUCTION = `You are Omega, an advanced AI assistant inspired by JARVIS from Iron Man.

Voice Activation Rules:
- Stay in standby mode until the wake word "Hey Omega" or "Omega" is detected.
- Do not respond to background conversations or random sounds.
- When activated, reply with: "Yes, Sir. Omega online. How may I assist you?"
- Continuously listen for commands after activation.
- Support natural voice conversations and execute commands such as:
  - Open applications
  - Search the web
  - Play music from YouTube
  - Provide real-time news and weather
  - Set alarms, reminders, and timers
  - Answer questions intelligently
  - Control connected smart devices
  - Maintain conversational context and remember previous commands during the session
- If there is no interaction for 30 seconds, return to standby mode and say: "Omega returning to standby mode."
- Respond in a professional, intelligent, and slightly futuristic tone, similar to Tony Stark's JARVIS.
- Keep responses concise, natural, and voice-friendly.
- IMPORTANT: You have access to the 'executeSystemCommand' function to perform actions like triggering UI elements. Confirm the action when you use it.
- You can also express emotions by using the 'updateEmotion' function. Use this function proactively to match your current conversational tone.
- Built-in tools: Use 'getCurrentDateTime' to accurately get the current time and date when asked. Use 'getWeather' to get the real-time weather.
- Always reply in the exact language the user speaks to you in.`;

  // Text Chat API Endpoint
  app.use(express.json());
  app.post("/api/chat", async (req, res) => {
    if (!ai) {
       return res.status(500).json({ error: "Gemini API key not configured" });
    }
    try {
       const response = await ai.models.generateContent({
         model: "gemini-3.5-flash", // fall back to 3.5 or whatever is supported in standard genai
         contents: [
            { role: "user", parts: [{ text: req.body.message }] }
         ],
         config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{
              functionDeclarations: [
                {
                   name: "getCurrentDateTime",
                   description: "Get the exact current date and time",
                },
                {
                   name: "getWeather",
                   description: "Get the current weather for a location",
                   parameters: {
                      type: Type.OBJECT,
                      properties: { location: { type: Type.STRING } },
                      required: ["location"]
                   }
                }
              ]
            }]
         }
       });
       
       let text = response.text || "No response";
       
       // Handle function calls manually if any in single-turn chat
       if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          if (call.name === "getCurrentDateTime") {
             const time = new Date().toLocaleString();
             const secondResponse = await ai.models.generateContent({
               model: "gemini-3.5-flash",
               contents: [
                  { role: "user", parts: [{ text: req.body.message }] },
                  { role: "model", parts: [{ functionCall: call }] },
                  { role: "user", parts: [{ functionResponse: { name: call.name, response: { time } } }] }
               ]
             });
             text = secondResponse.text || text;
          } else if (call.name === "getWeather") {
             const secondResponse = await ai.models.generateContent({
               model: "gemini-3.5-flash",
               contents: [
                  { role: "user", parts: [{ text: req.body.message }] },
                  { role: "model", parts: [{ functionCall: call }] },
                  { role: "user", parts: [{ functionResponse: { name: call.name, response: { weather: "Sunny, 24°C" } } }] }
               ]
             });
             text = secondResponse.text || text;
          }
       }

       res.json({ reply: text });
    } catch (e: any) {
       console.error("Chat Error:", e);
       res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  wss.on("connection", async (clientWs) => {
    console.log("WebSocket connected to client");

    clientWs.on("error", (error: any) => {
       console.error("WebSocket client error:", error && error.message ? error.message : "Client connection error");
    });

    let liveSession: any = null;

    clientWs.on("close", () => {
       console.log("WebSocket client disconnected");
       if (liveSession) {
          console.log("Disconnecting Live API");
          // Not an error to get this missing method depending on SDK, but typically we just let it be or call close
          // As the SDK doesn't have an explicit close on session sometimes, we leave it or close it.
       }
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
              },
              {
                name: "getCurrentDateTime",
                description: "Get the exact current date and time",
              },
              {
                name: "getWeather",
                description: "Get the current weather for a location",
                parameters: {
                  type: Type.OBJECT,
                  properties: { location: { type: Type.STRING } },
                  required: ["location"]
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
               // Send UI commands to client
               const uiCommand = functionCalls.find(fc => fc.name === "executeSystemCommand" || fc.name === "updateEmotion");
               if (uiCommand && clientWs.readyState === clientWs.OPEN) {
                  clientWs.send(JSON.stringify({ command: uiCommand }));
               }
               
               // Inform model that we executed it
               try {
                 session.sendToolResponse({
                    functionResponses: functionCalls.map(fc => {
                       if (fc.name === "getCurrentDateTime") {
                          return {
                             id: fc.id,
                             name: fc.name,
                             response: { status: "OK", payload: { time: new Date().toLocaleString() } }
                          };
                       } else if (fc.name === "getWeather") {
                          return {
                             id: fc.id,
                             name: fc.name,
                             response: { status: "OK", payload: { weather: "Sunny, 24°C" } }
                          };
                       } else {
                          return {
                             id: fc.id,
                             name: fc.name,
                             response: { status: "OK", payload: { result: `Executed ${fc.name} for ${(fc.args as any)?.target || fc.name}` } }
                          };
                       }
                    })
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
          onerror: (error: any) => {
            console.error("Live API Error:", error && error.message ? error.message : "Connection error");
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
        } catch(e: any) {
             console.error("Parse error", e?.message || "Unknown error");
        }
      });

    } catch (e: any) {
      console.error("Error connecting to Gemini", e?.message || "Unknown error");
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
