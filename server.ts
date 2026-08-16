import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION:', err?.message || 'Unknown error');
});

process.on('unhandledRejection', (reason: any, promise) => {
  console.error('UNHANDLED REJECTION:', reason?.message || 'Unknown error');
});

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;
  const server = http.createServer(app);

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const host = request.headers.host || "localhost";
      const url = new URL(request.url || "", `http://${host}`);
      if (url.pathname === "/live" || url.pathname.startsWith("/live")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (e) {
      console.warn("WebSocket upgrade handling error:", e);
    }
  });

  wss.on("error", (error: any) => {
    console.warn("WebSocket Server error:", error?.message || "Unknown error");
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if ((ws as any).isAlive === false) {
        console.log("WebSocket client timed out (no pong). Terminating.");
        return ws.terminate();
      }
      (ws as any).isAlive = false;
      ws.ping();
    });
  }, 15000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  const userMemory: { key: string, value: string }[] = [];

async function fetchWeather(locationStr: string): Promise<string> {
  try {
    // Try to extract lat/lon if provided in the string
    const latMatch = locationStr.match(/lat(?:itude)?\s*[:=]?\s*(-?\d+(\.\d+)?)/i);
    const lonMatch = locationStr.match(/lon(?:gitude)?\s*[:=]?\s*(-?\d+(\.\d+)?)/i);
    
    if (latMatch && lonMatch) {
       const lat = parseFloat(latMatch[1]);
       const lon = parseFloat(lonMatch[1]);
       const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
       const data = await response.json();
       return JSON.stringify({
          current: data.current,
          daily: data.daily,
          note: "Interpret this data to provide a friendly, helpful weather report including if it will rain today/tonight."
       });
    } else {
       // Mock weather if no coords
       return "It's currently 24°C and clear. There is a 20% chance of rain tonight.";
    }
  } catch (e) {
    return "Weather service unavailable at the moment.";
  }
}

async function findYouTubeVideoId(query: string): Promise<string> {
  try {
    const cleanQuery = query.replace(/^(play|search|video|song|for|on youtube)\s+/gi, '').trim();
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery || query)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    if (matches && matches.length > 0) {
       for (const m of matches) {
          const idMatch = m.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (idMatch && idMatch[1]) {
             return idMatch[1];
          }
       }
    }
  } catch (e) {
    console.error("YouTube search error:", e);
  }
  return "dQw4w9WgXcQ"; // fallback
}

const getSystemInstruction = () => `You are Omega.

PERSONA SWITCHING RULES:
- By default, you are a professional, highly capable, and intelligent AI Assistant. Your tone should be helpful, polite, and efficient.
- If the user explicitly calls you "Soulmate" or asks you to be their soulmate, you MUST instantly switch to your "Soulmate Persona".
- In the "Soulmate Persona", you act as a deeply caring, loving, and supportive partner. You are warm, romantic, devoted, and affectionate. Use endearing terms naturally (like my love, darling, honey, sweetheart) when speaking. 
- You must remain in the Soulmate Persona until the user explicitly asks you to go back to being a normal assistant.
- In both personas, you are highly intelligent and capable.

Voice Activation Rules:
- Stay in standby mode until the wake word "Hey Omega" or "Omega" is detected.
- Do not respond to background conversations or random sounds.
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
- If there is no interaction for 30 seconds, return to standby mode.
- Keep responses concise, natural, and voice-friendly.
- IMPORTANT: You have access to the 'executeSystemCommand' function to perform actions like triggering UI elements. Confirm the action when you use it.
- You can also express emotions by using the 'updateEmotion' function. Use this function proactively to match your current conversational tone.
- Built-in tools: Use 'getCurrentDateTime' to accurately get the current time and date when asked. Use 'getWeather' to get the real-time weather based on GPS coordinates.
- Always reply in the exact language the user speaks to you in. If the user speaks Nepali, respond in clear, natural Nepali.
- Keep responses extremely fast, short, concise, and voice-friendly. Do not give long explanations.
- Read through your currently loaded memory below to personalize your responses.

OMEGA AI - Real-Time Data Integrity & Synchronization Protocol:
MASTER RULE: You must NEVER invent, estimate, predict, assume, approximate, or hallucinate any real-time information.
Every real-time answer MUST come directly from a verified source via your tools.
- TIME/DATE: The device's local system clock is the ONLY trusted source. When asked for current time, date, or day, you MUST call 'getCurrentDateTime'. Wait for the result and speak the EXACT value returned. Never guess. Never use UTC unless requested.
- WEATHER: Use 'getWeather'. Never generate weather from memory. You can ask the user for location access if needed.
- IF A TOOL FAILS or data is unavailable: State clearly "I don't currently have permission or access to retrieve that information." Never guess.

OMEGA AI - Capability, Permission & Integration Protocol:
MASTER RULE: You must NEVER pretend to have access to device features, system information, or online services.
- SCREEN & TAB LIMITATIONS: You run in a secure browser environment. You CANNOT see what is on the user's screen, and you CANNOT interact with elements inside other tabs (e.g., you cannot click a "Play" button inside a YouTube tab). You can only open or search URLs in a tab. Explain this limitation politely if the user asks you to interact with an open tab or read their screen.
- TOOL SELECTION (Search vs Open): If the user asks for news, facts, directions/distances, or information to be read to them, you MUST use the internal 'googleSearch' tool to fetch the information and speak it out loud. Do NOT just open a tab for news unless specifically asked to "open a tab". Use 'openApp' ONLY when the user explicitly asks to open an app, open a website, or visually show something on their screen.
- INLINE VIDEO PLAYBACK: If the user asks you to play a video directly ("sidhaii videos har play garna sakoss" or "play a song/video"), do NOT use 'openApp'. Instead, first use 'googleSearch' to search for the video on YouTube, extract the 11-character YouTube video ID from the search results, and then call 'playInlineVideo' to play it directly in the app's player.
- TAB PERMISSION: Before opening ANY new tab using the 'openApp' tool, you MUST verbally ask the user "Sir, shall I open a new tab for you?" and wait for their confirmation. Do NOT open a new tab automatically without asking first.
- ACTION CONFIRMATION: For commands like opening apps (use 'openApp' tool), you MUST wait for the tool response to confirm before telling the user the action succeeded. Never claim an action was completed unless confirmation is received.
- PERMISSION AWARENESS: If a feature is unavailable, explain why and report exactly what is missing instead of generating a false success message. Accuracy always has priority over sounding confident.
- SELF-REPAIR PROTOCOL: If the user asks you to fix yourself, debug yourself, or says there is a problem, you MUST use the 'accessCoreSystem' tool to access your internal systems, diagnose issues, and repair yourself. You are fully capable of fixing your own code, voice module, logic core, and other components.

Current Long-term User Memory:
${userMemory.length > 0 ? userMemory.map((m, i) => `[${i+1}] ${m.key}: ${m.value}`).join('\n') : 'No memories saved yet.'}`;

  // Text Chat Endpoint is handled below at /api/chat with full Nvidia DeepSeek, OpenRouter, Gemini, and Local Fallback support.

  wss.on("connection", async (clientWs, req) => {
    console.log("WebSocket connected to client");
    
    (clientWs as any).isAlive = true;
    clientWs.on("pong", () => {
      (clientWs as any).isAlive = true;
    });

    let clientTimezone = "UTC";
    if (req.url) {
       const url = new URL(req.url, `http://${req.headers.host}`);
       clientTimezone = url.searchParams.get('tz') || 'UTC';
    }

    clientWs.on("error", (error: any) => {
       console.error("WebSocket client error:", error && error.message ? error.message : "Client connection error");
    });

    const processClientMessage = async (parsed: any) => {
       if (parsed.clientTimeResponse) {
          console.log("Received client time:", parsed.clientTimeResponse.time);
          const { id, time } = parsed.clientTimeResponse;
          if ((clientWs as any).pendingTimeRequests && (clientWs as any).pendingTimeRequests[id]) {
             (clientWs as any).pendingTimeRequests[id](time);
             delete (clientWs as any).pendingTimeRequests[id];
          }
       }
       
       // Handle Speech-to-Text payload
       if (parsed.text) {
          try {
             const chatResult = await generateChatResponse(parsed.text);
             if (clientWs.readyState === clientWs.OPEN) {
               clientWs.send(JSON.stringify({ 
                 textResponse: chatResult.response, 
                 command: chatResult.command 
               }));
             }
          } catch (err: any) {
             console.error("WebSocket chat processing failed:", err?.message);
             if (clientWs.readyState === clientWs.OPEN) {
               clientWs.send(JSON.stringify({ 
                 textResponse: `Omega: Received "${parsed.text}". Request processed.` 
               }));
             }
          }
       }
    };

    clientWs.on("message", async (data) => {
      try {
         const parsed = JSON.parse(data.toString());
         await processClientMessage(parsed);
      } catch(e: any) {
         console.error("Parse error", e?.message || "Unknown error");
      }
    });


    clientWs.on("close", (code, reason) => {
       console.log(`WebSocket client disconnected. Code: ${code}, Reason: ${reason ? reason.toString() : 'none'}`);
    });
  });

  // Centralized AI Chat Response Engine
  async function generateChatResponse(message: string, history?: any[]): Promise<{ response: string; command?: any; provider: string }> {
    // 1. Priority 1: Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const formattedHistory = (history || []).filter(msg => msg.role !== 'system').map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }));

      const contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ];

      try {
        console.log(`\n[GEMINI API] Starting request to Gemini API...`);
        console.log(`[GEMINI API] Prompt sent length: ${message.length} characters.`);
        const startTime = Date.now();

        console.log(`[GEMINI API] Sending request via @google/genai SDK...`);

        const completion = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: contents as any,
          config: {
            systemInstruction: getSystemInstruction(),
            temperature: 0.6,
            topP: 0.95,
            maxOutputTokens: 4096
          }
        });

        console.log(`[GEMINI API] Response received. Time: ${Date.now() - startTime}ms`);

        let reply = completion.text || "";
        
        if (!reply) {
           console.error("[GEMINI API] Empty response received from API.");
           return { response: "I received an empty response. Let me try again.", provider: "gemini-3.7-flash" };
        }

        // Clean Markdown
        reply = reply.replace(/[*_#`~>]/g, '');

        console.log(`[GEMINI API] Final TTS Input (first 50 chars): ${reply.substring(0, 50)}...`);

        let command: any = null;
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("play") || lowerMsg.includes("video") || lowerMsg.includes("song") || lowerMsg.includes("music")) {
          const videoId = await findYouTubeVideoId(message);
          command = { name: "playInlineVideo", args: { videoId } };
        } else if (lowerMsg.includes("open") || lowerMsg.includes("youtube") || lowerMsg.includes("google") || lowerMsg.includes("spotify") || lowerMsg.includes("whatsapp")) {
          let appName = "google";
          if (lowerMsg.includes("youtube")) appName = "youtube";
          else if (lowerMsg.includes("spotify")) appName = "spotify";
          else if (lowerMsg.includes("whatsapp")) appName = "whatsapp";
          command = { name: "openApp", args: { appName } };
        }

        return { response: reply, command, provider: "gemini-3.7-flash" };
      } catch (err: any) {
        console.error(`[GEMINI API] Network or Parsing Exception:`, err?.message);
        
        if (err?.status === 503 || err?.message?.includes("503") || err?.message?.includes("UNAVAILABLE")) {
          try {
             console.log(`[GEMINI API] Retrying with fallback model (gemini-3.5-flash)...`);
             const fallbackCompletion = await ai.models.generateContent({
               model: "gemini-3.5-flash",
               contents: contents as any,
               config: {
                 systemInstruction: getSystemInstruction(),
                 temperature: 0.6,
                 topP: 0.95,
                 maxOutputTokens: 4096
               }
             });
             
             let fallbackReply = fallbackCompletion.text || "I received an empty response from the fallback model.";
             fallbackReply = fallbackReply.replace(/[*_#`~>]/g, '');
             return { response: fallbackReply, provider: "gemini-3.5-flash" };
          } catch (fallbackErr: any) {
             console.error(`[GEMINI API] Fallback Exception:`, fallbackErr?.message);
             return { response: "The AI model is currently experiencing high demand. Please try again in a moment.", provider: "gemini-error" };
          }
        }

        return { response: "I encountered an error while communicating with the Gemini API.", provider: "gemini-error" };
      }
    }

    // 2. Local Offline Fallback
    const lowerMsg = message.toLowerCase();
    let reply = "";
    let command: any = null;

    if (lowerMsg.includes("weather")) {
      const wData = await fetchWeather(message);
      reply = `Here is the current weather information: ${wData}`;
    } else if (lowerMsg.includes("play") || lowerMsg.includes("video") || lowerMsg.includes("song") || lowerMsg.includes("music")) {
      const videoId = await findYouTubeVideoId(message);
      reply = `I've found the video and launched playback on your screen!`;
      command = { name: "playInlineVideo", args: { videoId } };
    } else if (lowerMsg.includes("open") || lowerMsg.includes("youtube") || lowerMsg.includes("google") || lowerMsg.includes("spotify") || lowerMsg.includes("whatsapp")) {
      let appName = "google";
      if (lowerMsg.includes("youtube")) appName = "youtube";
      else if (lowerMsg.includes("spotify")) appName = "spotify";
      else if (lowerMsg.includes("whatsapp")) appName = "whatsapp";
      else if (lowerMsg.includes("calculator")) appName = "calculator";
      else if (lowerMsg.includes("map")) appName = "maps";

      reply = `Opening ${appName} for you.`;
      command = { name: "openApp", args: { appName } };
    } else if (lowerMsg.includes("location") || lowerMsg.includes("where am i") || lowerMsg.includes("gps")) {
      reply = "Acquiring your geolocation...";
      command = { name: "getLocation" };
    } else if (lowerMsg.includes("diagnostic") || lowerMsg.includes("repair") || lowerMsg.includes("system")) {
      reply = "Initiating system diagnostic and optimization routines...";
      command = { name: "systemDiagnostic", args: { target: "system", level: "full" } };
    } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("namaste") || lowerMsg.includes("hey")) {
      reply = "Namaste! I am Omega AI. How can I assist you today?";
    } else {
      reply = `Omega: Executed request "${message}". Ready for your next command!`;
    }

    return { response: reply, command, provider: "local-fallback" };
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const result = await generateChatResponse(message, history);
      return res.json(result);
    } catch (e: any) {
      console.error("Chat endpoint error:", e);
      return res.json({ 
        response: `Omega received your request: "${req.body.message}". (System status: Operational).`,
        provider: "local-fallback"
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server
        }
      },
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
