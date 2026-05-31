import React, { useState, useEffect, useRef } from "react";
import { Users, Send, Settings, Check, Plus, MessageSquare, Shield, Play, Globe } from "lucide-react";
import { RoomState, ChatMessage } from "../types.js";

interface LobbyProps {
  room: RoomState;
  userId: string;
  onSendMessage: (text: string) => void;
  onUpdateCategories: (categories: string[]) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  language: "es" | "en";
  onLanguageToggle?: (lang: "es" | "en") => void;
}

const CATEGORY_BANK_ES = [
  "Nombre", "Apellido", "Animal", "Fruta/Verdura", "País o Ciudad", "Cosa", "Color", 
  "Profesión", "Marca", "Comida", "Famoso/Actor", "Deporte", "Pelicula/Serie"
];

const CATEGORY_BANK_EN = [
  "Name", "Last Name","Animal", "Fruit/Vegetable", "Country/City", "Object", "Color", 
  "Profession", "Brand", "Food", "Celebrity", "Sport", "Movie/TV"
];

export default function Lobby({
  room,
  userId,
  onSendMessage,
  onUpdateCategories,
  onStartGame,
  onLeaveRoom,
  language,
  onLanguageToggle,
}: LobbyProps) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const me = room.players.find((p) => p.id === userId);
  const isHost = me?.isHost || false;

  const currentBank = language === "en" ? CATEGORY_BANK_EN : CATEGORY_BANK_ES;

  // Auto scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const toggleCategory = (cat: string) => {
    if (!isHost) return;
    let updated = [...room.categories];
    if (updated.includes(cat)) {
      if (updated.length > 2) {
        updated = updated.filter((item) => item !== cat);
      }
    } else {
      if (updated.length < 10) {
        updated.push(cat);
      }
    }
    onUpdateCategories(updated);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    alert(language === "en" 
      ? `Room invitation code ${room.code} copied to clipboard!`
      : `¡Código de sala ${room.code} copiado al portapapeles!`
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Header with Room code */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
            {language === "en" ? "INVITATION CODE" : "CÓDIGO DE INVITACIÓN"}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span 
              onClick={handleCopyCode}
              className="text-2xl font-black text-emerald-400 cursor-pointer tracking-widest hover:text-emerald-300 transition"
              title="Copiar código"
            >
              {room.code}
            </span>
            <span className="text-slate-500 text-xs">
              {language === "en" ? "(Click to copy)" : "(Haz clic para copiar)"}
            </span>
          </div>
        </div>

        {/* Room configuration options badge / switch */}
        <div className="flex items-center gap-2">
          {isHost && onLanguageToggle && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-full p-0.5 text-[9px] font-bold shadow pr-1">
              <button
                onClick={() => onLanguageToggle("es")}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer ${room.language === "es" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                ES
              </button>
              <button
                onClick={() => onLanguageToggle("en")}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer ${room.language === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                EN
              </button>
              <Globe size={10} className="text-slate-400 ml-1" />
            </div>
          )}

          <button
            onClick={onLeaveRoom}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            {language === "en" ? "Leave Room" : "Salir de la Sala"}
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* PLAYERS LIST CARD */}
          <div id="lobby-players-card" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Users size={16} className="text-indigo-400" />
              <span>
                {language === "en" ? "Connected Players" : "Jugadores Conectados"} ({room.players.length})
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl transition border ${
                    p.id === userId 
                      ? "bg-indigo-950/30 border-indigo-500/40" 
                      : "bg-slate-900/60 border-slate-800/40"
                  } ${!p.connected ? "opacity-40" : ""}`}
                >
                  <span className="text-2xl select-none">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                      {p.username}
                      {p.isHost && <Shield size={10} className="text-yellow-400 shrink-0" />}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      {p.id === userId 
                        ? (language === "en" ? "You" : "Tú") 
                        : p.isHost 
                          ? (language === "en" ? "Host" : "Anfitrión") 
                          : (language === "en" ? "Ready to play" : "Listo para jugar")
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY SELECTORS */}
          <div id="lobby-categories-card" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Settings size={16} className="text-indigo-400" />
              <span>
                {language === "en" ? "Active Categories" : "Categorías Activas"} ({room.categories.length}/10)
              </span>
            </h3>
            
            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
              {isHost 
                ? (language === "en" ? "Tap to toggle round categories. Minimum 2, maximum 10." : "Elige las categorías de la ronda (presiona para alternar). Mínimo 2, máximo 10.") 
                : (language === "en" ? "Only the room host can customize round categories." : "Solo el anfitrión de la sala puede cambiar las categorías activas.")}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {currentBank.map((cat) => {
                const isActive = room.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    disabled={!isHost}
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs py-1.5 px-3 rounded-lg border transition flex items-center gap-1 ${
                      isActive
                        ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold"
                        : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                    } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {isActive && <Check size={12} className="text-indigo-400" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* CHAT INTEGRATED VIEW */}
        <div id="lobby-chat-section" className="bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col h-64 overflow-hidden shadow-xl mt-4">
          <div className="bg-slate-950 px-3 py-2 border-b border-slate-900 flex items-center gap-1.5 justify-between">
            <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase flex items-center gap-1">
              <MessageSquare size={12} className="text-indigo-400" />
              {language === "en" ? "REAL-TIME SOCIAL CHAT" : "CHAT EN TIEMPO REAL"}
            </span>
          </div>

          {/* Chat scrolling feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {room.chatMessages.length === 0 ? (
              <div className="text-center text-[11px] text-slate-600 italic py-12">
                {language === "en" ? "Say hello to coordinate categories!" : "¡Saluda a tus amigos aquí para organizarse!"}
              </div>
            ) : (
              room.chatMessages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-[10px] p-1 text-center bg-indigo-950/20 text-indigo-300 font-semibold rounded border border-indigo-900/10">
                      {msg.text}
                    </div>
                  );
                }

                const flagMe = msg.username === me?.username;

                return (
                  <div key={msg.id} className={`flex flex-col ${flagMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-extrabold text-[10px] text-slate-400">{msg.username}</span>
                      <span className="text-[8px] text-slate-600 font-medium">{msg.timestamp}</span>
                    </div>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] text-slate-100 ${
                      flagMe 
                        ? "bg-indigo-600 rounded-tr-none text-right" 
                        : "bg-slate-800 rounded-tl-none"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat inputs send form */}
          <form onSubmit={handleSendChat} className="p-2 border-t border-slate-900 flex gap-1.5 bg-slate-950">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value.slice(0, 150))}
              maxLength={150}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-200"
              placeholder={language === "en" ? "Type social chat messages..." : "Envía un mensaje social..."}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl p-2.5 transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>

      {/* Host Action Bottom button block */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-900 shrink-0">
        {isHost ? (
          <button
            onClick={onStartGame}
            className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950 text-white py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Play size={16} />
            {language === "en" ? "Start Game Match" : "Iniciar Partida"}
          </button>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400 animate-pulse font-medium">
            {language === "en" ? "Waiting for host to start... ⏳" : "Esperando a que el anfitrión inicie el juego... ⏳"}
          </div>
        )}
      </div>

    </div>
  );
}
