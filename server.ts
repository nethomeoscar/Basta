import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js";
import { RoomState, Player, ChatMessage, GameStatus } from "./src/types.js";
import { getBotAnswer } from "./server/dictionary.js";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Fetch active public rooms
app.get("/api/public-rooms", (req, res) => {
  try {
    const list = Array.from(rooms.values())
      .filter((r) => r.isPublic && r.status === "lobby")
      .map((r) => ({
        code: r.code,
        playersCount: r.players.filter(p => !p.id.startsWith("bot_")).length,
        language: r.language || "es",
        categoriesCount: r.categories.length,
      }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public rooms" });
  }
});

// -------------------------------------------------------------
// Relational database API endpoints
// -------------------------------------------------------------
app.get("/api/leaderboard", (req, res) => {
  try {
    const leaderboard = db.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.get("/api/history", (req, res) => {
  try {
    const rawMatches = db.getMatches();
    // Join matches with players to send detailed structured data
    const matchesWithPlayers = rawMatches.map((match) => {
      const players = db.getMatchPlayers(match.id);
      return {
        ...match,
        players: players.map((p) => ({
          username: p.username,
          score: p.score,
          inputs: JSON.parse(p.inputs),
        })),
      };
    });
    res.json(matchesWithPlayers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// A standard set of fun categories
const DEFAULT_CATEGORIES_ES = ["Nombre", "Animal", "Fruta/Verdura", "País o Ciudad", "Cosa", "Color"];
const DEFAULT_CATEGORIES_EN = ["Name", "Animal", "Fruit/Vegetable", "Country/City", "Object", "Color"];
const DEFAULT_CATEGORIES = DEFAULT_CATEGORIES_ES;

// Letters pool for Basta
const FLAVORED_LETTERS = "ABCDEFGHILMNOPQRSTUV".split("");

// Active rooms in memory
const rooms = new Map<string, RoomState & { clientSockets: Map<string, WebSocket> }>();

// Helper to generate room code
function generateRoomCode(): string {
  let attempts = 0;
  while (attempts < 100) {
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 dígitos
    if (!rooms.has(code)) {
      return code;
    }
    attempts++;
  }
  return Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Create an HTTP server
const server = http.createServer(app);

// Create the WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Broadcast helper for specific room
function broadcastToRoom(roomCode: string, payload: any) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const data = JSON.stringify(payload);
  room.clientSockets.forEach((ws, playerId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

// Setup WebSocket connection logic
wss.on("connection", (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  ws.on("message", (message: string) => {
    try {
      const data = JSON.parse(message);
      const { type } = data;

      switch (type) {
        case "join_room": {
          const { roomCode, username, avatar, userId, isBotRoom, isPublic, language } = data;
          if (!roomCode || !username || !userId) return;

          let targetRoomCode = roomCode.toUpperCase().trim();
          let isNewRoom = false;

          if (targetRoomCode === "QUICK_MATCH") {
            // Matchmaking: Find any open public room currently in lobby status
            const openPublicRoom = Array.from(rooms.values()).find(
              (r) => r.isPublic && r.status === "lobby" && r.players.filter(p => !p.id.startsWith("bot_")).length < 6
            );
            if (openPublicRoom) {
              targetRoomCode = openPublicRoom.code;
            } else {
              targetRoomCode = generateRoomCode();
              isNewRoom = true;
            }
          } else if (targetRoomCode === "CREATE") {
            targetRoomCode = generateRoomCode();
            isNewRoom = true;
          }

          let room = rooms.get(targetRoomCode);

          if (!room) {
            if (!isNewRoom) {
              // Return error if join search fails
              ws.send(JSON.stringify({ type: "error", message: "La sala solicitada no existe." }));
              return;
            }

            const initialLang = language === "en" ? "en" : "es";

            // Create new room structure
            room = {
              code: targetRoomCode,
              status: "lobby",
              players: [],
              letter: "",
              categories: initialLang === "en" ? [...DEFAULT_CATEGORIES_EN] : [...DEFAULT_CATEGORIES_ES],
              maxTime: 60,
              timer: 60,
              panicActive: false,
              panicTimer: 10,
              chatMessages: [],
              usedLetters: [],
              isBotRoom: !!isBotRoom,
              isPublic: !isBotRoom && (!!isPublic || roomCode.toUpperCase().trim() === "QUICK_MATCH"),
              language: initialLang,
              validationMode: "democracy",
              clientSockets: new Map<string, WebSocket>(),
            };

            // Seed Bots automatically if it is a bot room
            if (room.isBotRoom) {
              const bot1Id = "bot_einstein";
              const bot2Id = "bot_shakespeare";

              const bot1: Player = {
                id: bot1Id,
                username: initialLang === "en" ? "Bot Einstein 🤖" : "Bot Cerebrito 🤖",
                avatar: "🤖",
                isHost: false,
                score: 0,
                lastRoundScore: 0,
                ready: true,
                inputs: {},
                votes: {},
                connected: true,
              };
              const bot2: Player = {
                id: bot2Id,
                username: initialLang === "en" ? "Bot Shakespeare ✍️" : "Bot LápizVeloz ✏️",
                avatar: "🛸",
                isHost: false,
                score: 0,
                lastRoundScore: 0,
                ready: true,
                inputs: {},
                votes: {},
                connected: true,
              };
              room.players.push(bot1, bot2);
            }

            rooms.set(targetRoomCode, room);
          }

          currentRoomCode = targetRoomCode;
          currentPlayerId = userId;

          // Check if player already exists in the room (reconnection)
          let player = room.players.find((p) => p.id === userId);

          if (player) {
            player.connected = true;
            player.username = username;
            player.avatar = avatar || player.avatar;
          } else {
            // Check if game already in progress
            if (room.status !== "lobby") {
              // Spectator mode or reject? Let's join as spectator or active if reconnect, otherwise reject
              ws.send(JSON.stringify({ type: "error", message: "La ronda ya está en curso y la sala no acepta nuevos jugadores." }));
              return;
            }

            const humanPlayers = room.players.filter(p => !p.id.startsWith("bot_"));
            const isHost = humanPlayers.length === 0;
            player = {
              id: userId,
              username,
              avatar: avatar || "🧙",
              isHost,
              score: 0,
              lastRoundScore: 0,
              ready: false,
              inputs: {},
              votes: {},
              connected: true,
            };
            room.players.push(player);
          }

          // Force update the ws mapping
          room.clientSockets.set(userId, ws);

          // Add System Joined message
          const welcomeMsg: ChatMessage = {
            id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            username: "Sistema",
            text: `${player.avatar} ${username} se ha unido a la sala.`,
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          };
          room.chatMessages.push(welcomeMsg);

          // Broadcast Room State to all players in room
          broadcastToRoom(targetRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "leave_room": {
          handleUserDeparture();
          break;
        }

        case "chat": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player) return;

          const chatMsg: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            username: player.username,
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          room.chatMessages.push(chatMsg);
          // Limit chats to last 50
          if (room.chatMessages.length > 50) {
            room.chatMessages.shift();
          }

          broadcastToRoom(currentRoomCode, {
            type: "chat_received",
            message: chatMsg,
          });
          break;
        }

        case "update_categories": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player || !player.isHost) return;

          room.categories = data.categories;

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "update_language": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player || !player.isHost) return;

          const newLang = data.language === "en" ? "en" : "es";
          room.language = newLang;
          
          // Re-populate system categories based on language
          room.categories = newLang === "en" ? [...DEFAULT_CATEGORIES_EN] : [...DEFAULT_CATEGORIES_ES];

          // Add System language notice
          room.chatMessages.push({
            id: `sys_lang_${Date.now()}`,
            username: "Sistema",
            text: newLang === "en" ? "🌐 Room language changed to English!" : "🌐 ¡Idioma de la sala cambiado a Español!",
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          });

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "update_validation_mode": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player || !player.isHost) return;

          const newMode = data.validationMode === "ai" ? "ai" : "democracy";
          room.validationMode = newMode;

          room.chatMessages.push({
            id: `sys_val_${Date.now()}`,
            username: "Sistema",
            text: newMode === "ai" 
              ? "🤖 Modo de validación cambiado a: Inteligencia Artificial (Gemini) ⚡" 
              : "🙋 Modo de validación cambiado a: Votación Democrática 🗳️",
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          });

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "start_game": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player || !player.isHost) return;

          // Select Letter
          let availableLetters = FLAVORED_LETTERS.filter((l) => !room.usedLetters.includes(l));
          if (availableLetters.length === 0) {
            room.usedLetters = [];
            availableLetters = [...FLAVORED_LETTERS];
          }

          const randomIndex = Math.floor(Math.random() * availableLetters.length);
          const chosenLetter = availableLetters[randomIndex];
          room.usedLetters.push(chosenLetter);

          room.letter = chosenLetter;
          room.status = "playing";
          room.timer = room.maxTime;
          room.panicActive = false;
          room.panicTimer = 10;

          // Reset player inputs & votes for this new round
          room.players.forEach((p) => {
            p.inputs = {};
            p.votes = {};
          });

          // Add status alert into chats
          room.chatMessages.push({
            id: `sys_${Date.now()}`,
            username: "Sistema",
            text: `¡Ronda iniciada! Letra seleccionada: **${chosenLetter}**`,
            timestamp: new Date().toLocaleTimeString(),
            isSystem: true,
          });

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });

          // Spin up server ticker interval for room
          startRoomTicker(currentRoomCode);
          break;
        }

        case "update_typing_sync": {
          // Low latency feedback of who has inputted what count of words
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player) return;

          player.inputs = data.inputs || {};

          // Sync typing state (brief count of words, or characters, but minimizing payload)
          broadcastToRoom(currentRoomCode, {
            type: "player_typing_broadcast",
            playerId: player.id,
            filledCount: Object.values(player.inputs).filter((val) => val.trim().length > 0).length,
          });
          break;
        }

        case "press_basta": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player) return;

          // Can only trigger if game status is active playing and panic not yet active
          if (room.status === "playing" && !room.panicActive) {
            room.panicActive = true;
            room.panicTimer = 10; // 10 seconds grace period

            room.chatMessages.push({
              id: `sys_basta_${Date.now()}`,
              username: "Sistema",
              text: `🚨 ¡${player.username} ha gritado BASTA! Comienza la cuenta regresiva de 10 segundos.`,
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true,
            });

            broadcastToRoom(currentRoomCode, {
              type: "panic_triggered",
              panicTimer: 10,
              bastaShouter: player.username,
              chatMessages: room.chatMessages,
            });
          }
          break;
        }

        case "submit_inputs": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentPlayerId);
          if (!player) return;

          player.inputs = data.inputs;

          // Broadcast player submissions in real time
          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "submit_vote": {
          // A voter evaluates down/up on someone's category input
          // submit_vote format: { targetPlayerId, category, vote: true/false }
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const { targetPlayerId, category, vote } = data;

          const targetPlayer = room.players.find((p) => p.id === targetPlayerId);
          if (!targetPlayer) return;

          if (!targetPlayer.votes[currentPlayerId]) {
            targetPlayer.votes[currentPlayerId] = {};
          }

          targetPlayer.votes[currentPlayerId][category] = vote;

          // Real-time democracy updates
          broadcastToRoom(currentRoomCode, {
            type: "vote_sync",
            targetPlayerId: targetPlayer.id,
            votingPlayerId: currentPlayerId,
            category,
            vote,
          });
          break;
        }

        case "calculate_scores": {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const requestPlayer = room.players.find((p) => p.id === currentPlayerId);
          if (!requestPlayer || !requestPlayer.isHost) return;

          // Make sure we carry out democracy checks
          calculateBastaScores(room);

          room.status = "scores";

          // Save completed match in Relational Database db.recordMatch
          try {
            const playersScores = room.players.map((p) => ({
              username: p.username,
              score: p.lastRoundScore,
              inputs: p.inputs,
            }));
            db.recordMatch(room.code, room.letter, room.categories, playersScores);
          } catch (err) {
            console.error("Failed to write game scores to relational database schemas", err);
          }

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }

        case "reset_room": {
          // Go back to lobby for another game
          if (!currentRoomCode || !currentPlayerId) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const reqPlayer = room.players.find((p) => p.id === currentPlayerId);
          if (!reqPlayer || !reqPlayer.isHost) return;

          room.status = "lobby";
          room.panicActive = false;
          room.panicTimer = 10;
          room.timer = room.maxTime;

          // Clear inputs and transient statistics
          room.players.forEach((p) => {
            p.inputs = {};
            p.votes = {};
            p.lastRoundScore = 0;
          });

          broadcastToRoom(currentRoomCode, {
            type: "room_state",
            room: getSanitizedRoomState(room),
          });
          break;
        }
      }
    } catch (err) {
      console.error("Error processing websocket payload", err);
    }
  });

  ws.on("close", () => {
    handleUserDeparture();
  });

  // Client departed sequence
  function handleUserDeparture() {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === currentPlayerId);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    player.connected = false;
    room.clientSockets.delete(currentPlayerId);

    // If lobby is active or they left explicitly, remove them
    // Otherwise, let them reconnect for 15s before wiping
    if (room.status === "lobby") {
      room.players.splice(playerIndex, 1);

      // Reassign host if the host left
      if (player.isHost && room.players.length > 0) {
        const humanIndex = room.players.findIndex((x: any) => !x.id.startsWith("bot_"));
        if (humanIndex > -1) {
          room.players[humanIndex].isHost = true;
        } else {
          room.players[0].isHost = true;
        }
      }
    } else {
      setTimeout(() => {
        const recheckedRoom = rooms.get(currentRoomCode!);
        if (!recheckedRoom) return;

        const p = recheckedRoom.players.find((x) => x.id === currentPlayerId);
        if (p && !p.connected) {
          const finishedIndex = recheckedRoom.players.findIndex((x) => x.id === currentPlayerId);
          if (finishedIndex > -1) {
            recheckedRoom.players.splice(finishedIndex, 1);
            if (p.isHost && recheckedRoom.players.length > 0) {
              const humanIndex = recheckedRoom.players.findIndex((x: any) => !x.id.startsWith("bot_"));
              if (humanIndex > -1) {
                recheckedRoom.players[humanIndex].isHost = true;
              } else {
                recheckedRoom.players[0].isHost = true;
              }
            }
          }
          // Notify remaining
          broadcastToRoom(currentRoomCode!, {
            type: "room_state",
            room: getSanitizedRoomState(recheckedRoom),
          });
        }
      }, 15000);
    }

    // Add exit notification
    const leaveMsg: ChatMessage = {
      id: `sys_${Date.now()}`,
      username: "Sistema",
      text: `❌ ${player.username} se ha retirado de la sala.`,
      timestamp: new Date().toLocaleTimeString(),
      isSystem: true,
    };
    room.chatMessages.push(leaveMsg);

    // Clean up empty rooms
    const connectedPlayersCount = room.players.filter((p) => p.connected).length;
    if (room.players.length === 0 || connectedPlayersCount === 0) {
      rooms.delete(currentRoomCode);
    } else {
      broadcastToRoom(currentRoomCode, {
        type: "room_state",
        room: getSanitizedRoomState(room),
      });
    }

    currentRoomCode = null;
    currentPlayerId = null;
  }
});

// Server-side rooms clock ticking
const roomTickers = new Map<string, NodeJS.Timeout>();

function startRoomTicker(roomCode: string) {
  if (roomTickers.has(roomCode)) {
    clearInterval(roomTickers.get(roomCode)!);
  }

  const ticker = setInterval(() => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== "playing") {
      clearInterval(ticker);
      roomTickers.delete(roomCode);
      return;
    }

    if (room.panicActive) {
      // Panic countdown decrement
      room.panicTimer -= 1;
      if (room.panicTimer <= 0) {
        clearInterval(ticker);
        roomTickers.delete(roomCode);
        forceEndRound(room);
        return;
      }
    } else {
      // Standard timer countdown decrement
      room.timer -= 1;
      if (room.timer <= 0) {
        clearInterval(ticker);
        roomTickers.delete(roomCode);
        forceEndRound(room);
        return;
      }
    }

    // Broadcast ticking update
    broadcastToRoom(roomCode, {
      type: "timer_update",
      timer: room.timer,
      panicTimer: room.panicTimer,
      panicActive: room.panicActive,
    });

    // Simulate bot progress in bot rooms
    if (room.isBotRoom && room.status === "playing" && !room.panicActive) {
      room.players.forEach((p) => {
        if (p.id.startsWith("bot_")) {
          const filledCount = Object.keys(p.inputs).length;
          const totalCategories = room.categories.length;
          if (filledCount < totalCategories && Math.random() < 0.15) {
            const unfilledCat = room.categories.find((cat) => !p.inputs[cat]);
            if (unfilledCat) {
              p.inputs[unfilledCat] = "..."; // temp filler
              broadcastToRoom(roomCode, {
                type: "player_typing_broadcast",
                playerId: p.id,
                filledCount: Object.values(p.inputs).length,
              });
            }
          }
        }
      });
    }
  }, 1000);

  roomTickers.set(roomCode, ticker);
}

// Timeout / Basta triggers force submissions
function forceEndRound(room: any) {
  room.status = "voting";
  room.panicActive = false;

  // Generate concrete answers for bots
  if (room.isBotRoom) {
    room.players.forEach((p: Player) => {
      if (p.id.startsWith("bot_")) {
        const lang = room.language || "es";
        const finalInputs: Record<string, string> = {};
        room.categories.forEach((cat: string) => {
          const accuracy = p.id === "bot_einstein" ? 0.90 : 0.75;
          if (Math.random() < accuracy) {
            finalInputs[cat] = getBotAnswer(lang, cat, room.letter);
          } else {
            finalInputs[cat] = "";
          }
        });
        p.inputs = finalInputs;
      }
    });

    // Populate bot votes on player inputs
    room.players.forEach((botPlayer: Player) => {
      if (botPlayer.id.startsWith("bot_")) {
        botPlayer.votes = {};
        room.players.forEach((targetPlayer) => {
          if (targetPlayer.id === botPlayer.id) return;
          
          room.categories.forEach((cat) => {
            const rawVal = (targetPlayer.inputs[cat] || "").trim();
            if (!rawVal) return;

            const firstChar = rawVal.charAt(0).toUpperCase();
            const correctLetter = firstChar === room.letter.toUpperCase();

            if (!botPlayer.votes[targetPlayer.id]) {
              botPlayer.votes[targetPlayer.id] = {};
            }

            if (!correctLetter) {
              botPlayer.votes[targetPlayer.id][cat] = false;
            } else {
              botPlayer.votes[targetPlayer.id][cat] = Math.random() < 0.94;
            }
          });
        });
      }
    });
  }

  const notificationText = room.language === "en"
    ? "⏳ TIME'S UP! The round has concluded. Reviewing everyone's answers."
    : "⏳ ¡TIEMPO FUERA! La ronda ha concluido. Revisando las respuestas de todos.";

  room.chatMessages.push({
    id: `sys_time_up_${Date.now()}`,
    username: "Sistema",
    text: notificationText,
    timestamp: new Date().toLocaleTimeString(),
    isSystem: true,
  });

  broadcastToRoom(room.code, {
    type: "round_ended_voting",
    room: getSanitizedRoomState(room),
  });

  if (room.validationMode === "ai") {
    runAiValidation(room);
  }
}

// Background Gemini-validation task
async function runAiValidation(room: any) {
  room.aiEvaluating = true;
  broadcastToRoom(room.code, {
    type: "room_state",
    room: getSanitizedRoomState(room),
  });

  const ai = getGeminiClient();
  if (!ai) {
    // If no API key, let's auto-validate in 1.5 seconds with local heuristics as fallback
    setTimeout(() => {
      room.players.forEach((p: Player) => {
        if (!p.votes["ai_gemini"]) p.votes["ai_gemini"] = {};
        if (!p.votes["ai_gemini_desc"]) p.votes["ai_gemini_desc"] = {};
        room.categories.forEach((cat: string) => {
          const rawVal = (p.inputs[cat] || "").trim();
          const firstChar = rawVal.charAt(0).toUpperCase();
          const correctLetter = firstChar === room.letter.toUpperCase();
          p.votes["ai_gemini"][cat] = !!rawVal && correctLetter;
          p.votes["ai_gemini_desc"][cat] = correctLetter 
            ? (room.language === "en" ? `Approved! (Starts with ${room.letter})` : `¡Aprobada! (Empieza por la letra ${room.letter})`)
            : (room.language === "en" ? `Rejected! (Must start with ${room.letter})` : `¡Rechazada! (Debe empezar por la letra ${room.letter})`);
        });
      });
      room.aiEvaluating = false;
      
      room.chatMessages.push({
        id: `sys_ai_done_${Date.now()}`,
        username: "Sistema",
        text: room.language === "en" 
          ? "🤖 Gemini API key is missing. Reverted to local rule-checker check." 
          : "🤖 Se aplicó un validador local alternativo (falta clave API de Gemini).",
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true,
      });

      broadcastToRoom(room.code, {
        type: "room_state",
        room: getSanitizedRoomState(room),
      });
    }, 1500);
    return;
  }

  try {
    const letter = room.letter.toUpperCase();
    const isEn = room.language === "en";
    
    // Prepare structures for prompt
    const submissionsList: any[] = [];
    room.players.forEach((p: Player) => {
      room.categories.forEach((cat: string) => {
        const rawVal = (p.inputs[cat] || "").trim();
        if (rawVal) {
          submissionsList.push({
            playerId: p.id,
            category: cat,
            word: rawVal
          });
        }
      });
    });

    if (submissionsList.length === 0) {
      room.aiEvaluating = false;
      broadcastToRoom(room.code, {
        type: "room_state",
        room: getSanitizedRoomState(room),
      });
      return;
    }

    const { Type } = await import("@google/genai");

    const promptText = `
You are the official referee/validator for the "¡BASTA!" word game (also known as scattergories or stop).
Language used for words: ${isEn ? "English" : "Spanish"}.
Letter selected for this round: "${letter}".

For each entry, check if the word:
1. Is a real, valid word in the chosen language (${isEn ? "English" : "Spanish"}). Common slang, nouns, and proper names are generally accepted if real. Do NOT allow letters or meaningless characters.
2. Fits the given category reasonably.
3. Starts with the letter "${letter}" (case insensitive).

Here are the player submissions to validate:
${JSON.stringify(submissionsList, null, 2)}

Provide a validation result for each item. Write the explanation in ${isEn ? "English" : "Spanish"}.
Keep explanations extremely short and concise (max 15 words) (e.g. "'Águila' es un animal válido que empieza con 'A'." or "'Apple' is a fruit starting with 'A'.").
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  playerId: { type: Type.STRING },
                  category: { type: Type.STRING },
                  word: { type: Type.STRING },
                  approved: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                },
                required: ["playerId", "category", "word", "approved", "explanation"],
              }
            }
          },
          required: ["evaluations"],
        }
      }
    });

    const bodyText = response.text;
    if (bodyText) {
      const resultObj = JSON.parse(bodyText);
      if (resultObj && Array.isArray(resultObj.evaluations)) {
        room.players.forEach((p: Player) => {
          if (!p.votes["ai_gemini"]) p.votes["ai_gemini"] = {};
          if (!p.votes["ai_gemini_desc"]) p.votes["ai_gemini_desc"] = {};
          
          room.categories.forEach((cat: string) => {
            const rawVal = (p.inputs[cat] || "").trim();
            if (!rawVal) {
              p.votes["ai_gemini"][cat] = false;
              p.votes["ai_gemini_desc"][cat] = isEn ? "Empty" : "Vacío";
              return;
            }

            const evalItem = resultObj.evaluations.find(
              (item: any) => item.playerId === p.id && item.category === cat
            );

            if (evalItem) {
              p.votes["ai_gemini"][cat] = evalItem.approved;
              p.votes["ai_gemini_desc"][cat] = evalItem.explanation;
            } else {
              const firstChar = rawVal.charAt(0).toUpperCase();
              const okLetter = firstChar === letter;
              p.votes["ai_gemini"][cat] = okLetter;
              p.votes["ai_gemini_desc"][cat] = okLetter 
                ? (isEn ? "Approved by fallback" : "Aprobado por regla básica")
                : (isEn ? `Rejected: Must start with ${letter}` : `Rechazado: Debe empezar por ${letter}`);
            }
          });
        });
      }
    }

    room.aiEvaluating = false;

    room.chatMessages.push({
      id: `sys_ai_finish_${Date.now()}`,
      username: "Sistema",
      text: isEn 
        ? "🤖 Gemini AI has successfully validated all round submissions!" 
        : "🤖 ¡La IA de Gemini ha validado con éxito las respuestas de la ronda!",
      timestamp: new Date().toLocaleTimeString(),
      isSystem: true,
    });

    broadcastToRoom(room.code, {
      type: "room_state",
      room: getSanitizedRoomState(room),
    });

  } catch (err) {
    console.error("Gemini validation error:", err);
    // In case of error, fallback to basic validation
    room.players.forEach((p: Player) => {
      if (!p.votes["ai_gemini"]) p.votes["ai_gemini"] = {};
      if (!p.votes["ai_gemini_desc"]) p.votes["ai_gemini_desc"] = {};
      room.categories.forEach((cat: string) => {
        const rawVal = (p.inputs[cat] || "").trim();
        const firstChar = rawVal.charAt(0).toUpperCase();
        const correctLetter = firstChar === room.letter.toUpperCase();
        p.votes["ai_gemini"][cat] = !!rawVal && correctLetter;
        p.votes["ai_gemini_desc"][cat] = correctLetter ? "Sintácticamente válido" : "Letra inicial incorrecta";
      });
    });
    room.aiEvaluating = false;
    broadcastToRoom(room.code, {
      type: "room_state",
      room: getSanitizedRoomState(room),
    });
  }
}

// Calculate actual scores based on democratic voting rules
function calculateBastaScores(room: RoomState) {
  const categories = room.categories;
  const players = room.players;
  const letter = room.letter.toUpperCase();

  // Reset round calculation trackers
  const roundScores: Record<string, number> = {};
  players.forEach((p) => {
    roundScores[p.id] = 0;
  });

  // Calculate category by category to handle repeating checks
  categories.forEach((cat) => {
    // Collect all valid inputs for this category
    const validInputsMap: Record<string, { norm: string; playerIds: string[] }> = {};

    players.forEach((p) => {
      const rawInput = (p.inputs[cat] || "").trim();
      const normInput = rawInput.toLowerCase();

      let isDemocraticOk = true;

      if (room.validationMode === "ai") {
        if (p.votes["ai_gemini"]) {
          isDemocraticOk = p.votes["ai_gemini"]?.[cat] !== false;
        } else {
          isDemocraticOk = true; // fallback or during evaluation
        }
      } else {
        // Democratic vote
        let upvotes = 0;
        let downvotes = 0;

        // Count votes
        players.forEach((voter) => {
          if (voter.id === p.id) return; // Skip self vote
          const playerVoteForCat = p.votes[voter.id]?.[cat];
          if (playerVoteForCat === true) upvotes++;
          if (playerVoteForCat === false) downvotes++;
        });

        // Simple democracy definition: Not rejected (default or equal is fine, more downvotes than upvotes is invalid)
        isDemocraticOk = upvotes >= downvotes;
      }

      const startsWithLetter = normInput.startsWith(letter.toLowerCase());

      // If word is empty, it's 0 automatically
      if (rawInput && isDemocraticOk && startsWithLetter) {
        if (!validInputsMap[normInput]) {
          validInputsMap[normInput] = { norm: normInput, playerIds: [] };
        }
        validInputsMap[normInput].playerIds.push(p.id);
      }
    });

    // Score allocations
    Object.values(validInputsMap).forEach((entry) => {
      const { playerIds } = entry;
      const count = playerIds.length;

      if (count === 1) {
        // Word is unique: 100 points
        roundScores[playerIds[0]] += 100;
      } else if (count > 1) {
        // Word is repeated: 50 points
        playerIds.forEach((pid) => {
          roundScores[pid] += 50;
        });
      }
    });
  });

  // Update real accumulative game values
  players.forEach((p) => {
    const calculatedSum = roundScores[p.id] || 0;
    p.lastRoundScore = calculatedSum;
    p.score += calculatedSum;
  });
}

// Helper to scrub sockets before sending RoomState objects down clients JSON channels
function getSanitizedRoomState(room: any): RoomState {
  const { clientSockets, ...scrubbed } = room;
  return scrubbed as RoomState;
}

// Upstream WebSocket handshake mapping onto Server HTTP instances
server.on("upgrade", (request, socket, head) => {
  const urlObj = new URL(request.url || "", `http://${request.headers.host}`);
  const pathname = urlObj.pathname;

  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    // Allow Vite's upgrade requests to proceed or fail gracefully
    // Do not block other sockets if they are dev-tool components
    if (process.env.NODE_ENV !== "production") {
      // Pass-through
    } else {
      socket.destroy();
    }
  }
});

// -------------------------------------------------------------
// Vite + App routing configuration
// -------------------------------------------------------------
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Basta multiplayer server active on: http://localhost:${PORT}`);
  });
}

initServer().catch((e) => {
  console.error("Critical failure during Express + Vite bootstrapping:", e);
});
