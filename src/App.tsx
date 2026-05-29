import React, { useState, useEffect, useRef, useCallback } from "react";
import Home from "./components/Home.jsx";
import Lobby from "./components/Lobby.jsx";
import Round from "./components/Round.jsx";
import Voting from "./components/Voting.jsx";
import Scores from "./components/Scores.jsx";
import { RoomState } from "./types.js";
import { AlertCircle, Wifi, WifiOff, Globe } from "lucide-react";

// Generate or fetch a persistent User ID
function getOrGenerateUserId(): string {
  let uId = localStorage.getItem("basta_user_id");
  if (!uId) {
    uId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("basta_user_id", uId);
  }
  return uId;
}

export default function App() {
  const [userId] = useState(() => getOrGenerateUserId());
  
  // Game states
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Typing tracking to synchronize word counts across peers
  const [typingPlayersState, setTypingPlayersState] = useState<Record<string, number>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const typingSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto clean typing indicators on screen shifts
  useEffect(() => {
    if (roomState?.status !== "playing") {
      setTypingPlayersState({});
    }
  }, [roomState?.status]);

  // Establish Web Socket Connection
  const connectSocket = useCallback((
    roomCode: string,
    username: string,
    avatar: string,
    isNew: boolean
  ) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnecting(true);
    setErrorMsg(null);

    // Derive WebSocket protocol based on browser window
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setConnecting(false);

      // Tell socket to create or join immediately
      socket.send(JSON.stringify({
        type: "join_room",
        roomCode: isNew ? "CREATE" : roomCode,
        username,
        avatar,
        userId,
      }));
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type } = payload;

        switch (type) {
          case "room_state": {
            const serverRoom = payload.room as RoomState;
            setRoomState(serverRoom);
            
            // If we are transitioned to "playing", let's clear local inputs
            if (serverRoom.status === "playing" && Object.keys(currentInputs).length === 0) {
              const freshInputs: Record<string, string> = {};
              serverRoom.categories.forEach((cat) => {
                freshInputs[cat] = "";
              });
              setCurrentInputs(freshInputs);
            }
            break;
          }

          case "timer_update": {
            setRoomState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                timer: payload.timer,
                panicTimer: payload.panicTimer,
                panicActive: payload.panicActive,
              };
            });
            break;
          }

          case "panic_triggered": {
            // Force message insertion and trigger panic state
            setRoomState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                panicActive: true,
                panicTimer: payload.panicTimer,
                chatMessages: payload.chatMessages,
              };
            });
            break;
          }

          case "chat_received": {
            setRoomState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                chatMessages: [...prev.chatMessages, payload.message],
              };
            });
            break;
          }

          case "player_typing_broadcast": {
            const { playerId, filledCount } = payload;
            if (playerId !== userId) {
              setTypingPlayersState((prev) => ({
                ...prev,
                [playerId]: filledCount,
              }));
            }
            break;
          }

          case "vote_sync": {
            // Live broadcast of thumbs up/down updates
            const { targetPlayerId, votingPlayerId, category, vote } = payload;
            setRoomState((prev) => {
              if (!prev) return null;
              const updatedPlayers = prev.players.map((item) => {
                if (item.id === targetPlayerId) {
                  const playerVotes = { ...item.votes };
                  if (!playerVotes[votingPlayerId]) {
                    playerVotes[votingPlayerId] = {};
                  }
                  playerVotes[votingPlayerId][category] = vote;
                  return { ...item, votes: playerVotes };
                }
                return item;
              });
              return { ...prev, players: updatedPlayers };
            });
            break;
          }

          case "round_ended_voting": {
            const serverRoom = payload.room as RoomState;
            setRoomState(serverRoom);
            break;
          }

          case "error": {
            setErrorMsg(payload.message);
            // close connection
            socket.close();
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setConnecting(false);
    };

    socket.onerror = (e) => {
      console.error("WebSocket socket error", e);
      setConnected(false);
      setConnecting(false);
    };

  }, [userId, currentInputs]);

  // Clean socket connections on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleJoinRoom = (roomCode: string, username: string, avatar: string) => {
    connectSocket(roomCode, username, avatar, false);
  };

  const handleCreateRoom = (username: string, avatar: string) => {
    connectSocket("", username, avatar, true);
  };

  const handleLeaveRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "leave_room" }));
    }
    // Deep reset states
    wsRef.current?.close();
    setRoomState(null);
    setCurrentInputs({});
    setTypingPlayersState({});
    setErrorMsg(null);
  };

  const handleSendMessage = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", text }));
    }
  };

  const handleUpdateCategories = (categories: string[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update_categories", categories }));
    }
  };

  const handleStartGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "start_game" }));
    }
  };

  // High responsiveness + debounced typing notifications
  const handleInputChange = (category: string, value: string) => {
    // Keep local letters safe
    const updatedInputs = { ...currentInputs, [category]: value };
    setCurrentInputs(updatedInputs);

    // Synchronize to socket to update colleagues in real-time
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (typingSyncTimeoutRef.current) {
        clearTimeout(typingSyncTimeoutRef.current);
      }
      typingSyncTimeoutRef.current = setTimeout(() => {
        wsRef.current?.send(JSON.stringify({
          type: "update_typing_sync",
          inputs: updatedInputs,
        }));
      }, 150);
    }
  };

  const handlePressBasta = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "press_basta" }));
    }
  };

  const handleVote = (targetPlayerId: string, category: string, vote: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "submit_vote",
        targetPlayerId,
        category,
        vote,
      }));
    }
  };

  const handleCalculateScores = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Force inputs sync first to ensure server has exact state
      wsRef.current.send(JSON.stringify({
        type: "submit_inputs",
        inputs: currentInputs,
      }));

      // Trigger scores compiler
      wsRef.current.send(JSON.stringify({ type: "calculate_scores" }));
    }
  };

  const handleResetRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "reset_room" }));
    }
    // Clean typing local cache for next round
    setCurrentInputs({});
    setTypingPlayersState({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans antialiased text-slate-100 p-0 sm:p-4">
      
      {/* GLOBAL HEADBOARD ON LAPTOP VIEWPORTS */}
      <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest absolute top-4 select-none">
        <Globe size={12} className="text-slate-700 animate-spin" />
        <span>Basta Online • Canal de Sincronización</span>
      </div>

      {/* MOBILE DEVICE FRAME WRAPPER */}
      <div 
        className="w-full h-screen sm:h-[840px] sm:max-w-[410px] bg-slate-900 sm:rounded-[40px] border-0 sm:border-[12px] sm:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col"
        style={{ contentVisibility: "auto" }}
      >
        
        {/* TOP STATUS BAR MOCK */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-50 shrink-0">
          <div className="w-16 h-2 bg-slate-900 mx-auto mt-1.5 rounded-full" />
        </div>

        {/* CONNECTIVITY TOAST ALERTS */}
        {!connected && roomState !== null && (
          <div className="absolute top-2 left-4 right-4 bg-red-600/90 text-white p-2.5 rounded-xl text-xs flex items-center gap-2 justify-center z-50 animate-bounce">
            <WifiOff size={14} className="animate-pulse" />
            <span className="font-semibold">Sin conexión. Intentando reconectar...</span>
          </div>
        )}

        {errorMsg && (
          <div className="absolute top-2 left-4 right-4 bg-amber-600 border border-amber-500 text-white p-3 rounded-xl text-xs flex items-center gap-2 justify-between z-50">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span className="font-semibold">{errorMsg}</span>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-white hover:text-slate-200 font-bold p-1 text-[10px]"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* MAIN GAME ROUTER */}
        <div className="flex-1 overflow-hidden relative">
          
          {connecting && (
            <div className="absolute inset-0 bg-slate-950/90 z-40 flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-full animate-spin">
                <Wifi size={24} className="text-indigo-400" />
              </div>
              <p className="text-xs text-slate-300 font-bold">Conectando al servidor del juego...</p>
              <p className="text-[10px] text-slate-500">Uniendo a tu equipo en tiempo real</p>
            </div>
          )}

          {roomState === null ? (
            <Home 
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
            />
          ) : (
            <>
              {roomState.status === "lobby" && (
                <Lobby
                  room={roomState}
                  userId={userId}
                  onSendMessage={handleSendMessage}
                  onUpdateCategories={handleUpdateCategories}
                  onStartGame={handleStartGame}
                  onLeaveRoom={handleLeaveRoom}
                />
              )}

              {roomState.status === "playing" && (
                <div className="h-full flex flex-col">
                  {/* Visual tracker of typed words count of friends, raising tension! */}
                  <div className="bg-slate-900/80 px-4 py-1.5 border-b border-slate-950 flex gap-2 items-center overflow-x-auto shrink-0 select-none text-[10px]">
                    <span className="font-black text-indigo-400 shrink-0 uppercase">Amigos:</span>
                    {roomState.players.map((p) => {
                      if (p.id === userId) return null;
                      const completedCount = typingPlayersState[p.id] || 0;
                      return (
                        <div key={p.id} className="bg-slate-950 border border-slate-800/60 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 text-slate-300">
                          <span className="text-xs leading-none">{p.avatar}</span>
                          <span className="font-bold truncate max-w-[50px]">{p.username}:</span>
                          <span className="font-extrabold text-emerald-400">{completedCount}/{roomState.categories.length}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <Round
                      room={roomState}
                      userId={userId}
                      inputs={currentInputs}
                      onInputChange={handleInputChange}
                      onPressBasta={handlePressBasta}
                    />
                  </div>
                </div>
              )}

              {roomState.status === "voting" && (
                <Voting
                  room={roomState}
                  userId={userId}
                  onVote={handleVote}
                  onCalculateScores={handleCalculateScores}
                />
              )}

              {roomState.status === "scores" && (
                <Scores
                  room={roomState}
                  userId={userId}
                  onResetRoom={handleResetRoom}
                />
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
