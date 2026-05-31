import React, { useState } from "react";
import { Check, X, ShieldAlert, ChevronRight, HelpCircle, Flame } from "lucide-react";
import { RoomState, Player } from "../types.js";

interface VotingProps {
  room: RoomState;
  userId: string;
  onVote: (targetPlayerId: string, category: string, vote: boolean) => void;
  onCalculateScores: () => void;
  language: "es" | "en";
}

export default function Voting({
  room,
  userId,
  onVote,
  onCalculateScores,
  language,
}: VotingProps) {
  // Navigation for categories during democracy voting
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const activeCategory = room.categories[selectedCatIdx];
  const letter = room.letter.toUpperCase();

  const me = room.players.find((p) => p.id === userId);
  const isHost = me?.isHost || false;

  // Helper to count votes for a given player's word in a category
  const getVotesCount = (player: Player, category: string) => {
    let up = 0;
    let down = 0;

    room.players.forEach((voter) => {
      // Find what other players voted for this player's word
      if (voter.id === player.id) return; // ignore self
      
      const voteVal = player.votes[voter.id]?.[category];
      if (voteVal === true) up++;
      if (voteVal === false) down++;
    });

    return { up, down };
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* HEADER DIAL */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 shrink-0">
        <span className="text-[10px] text-yellow-400 font-black tracking-widest uppercase block animate-pulse">
          {language === "en" ? "🗳️ ACTIVE DEMOCRATIC MODE" : "🗳️ MODO DEMOCRÁTICO ACTIVO"}
        </span>
        <h2 className="text-lg font-extrabold text-slate-100 mt-0.5 flex items-center justify-between">
          <span>{language === "en" ? "Democratic Validation" : "Validación por Votación"}</span>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded">
            {language === "en" ? "Letter" : "Letra"}: {letter}
          </span>
        </h2>
        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
          {language === "en" 
            ? "Thumbs up if the word is real and starts with the letter. Thumbs down if fake, incorrect, or duplicate."
            : "Vota con un pulgar arriba si la palabra es real y empieza con la letra correcta. Vota pulgar abajo si es falsa o incorrecta."
          }
        </p>
      </div>

      {/* CATEGORY SELECTOR SLIDERS */}
      <div className="bg-slate-950 p-2 border-b border-slate-900/60 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
        {room.categories.map((cat, idx) => {
          const isActive = idx === selectedCatIdx;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCatIdx(idx)}
              className={`text-xs py-2 px-3 rounded-xl border font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                isActive
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{cat}</span>
              {isActive && <Flame size={10} className="text-yellow-300 animate-bounce" />}
            </button>
          );
        })}
      </div>

      {/* VOTING TILES SCROLLER FOR THE TARGET CATEGORY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        
        <div className="bg-slate-900/20 border border-slate-900/80 rounded-xl p-3 text-center text-[10px] text-indigo-300">
          {language === "en" ? "Reviewing answers of category:" : "Revisando respuestas de la categoría:"}{" "}
          <span className="font-extrabold text-white">"{activeCategory}"</span>
        </div>

        {room.players.map((p) => {
          const rawInput = (p.inputs[activeCategory] || "").trim();
          const word = rawInput || (language === "en" ? "— EMPTY —" : "— VACÍO —");
          const isPlayerSelf = p.id === userId;
          
          // Check if word starts with active letter
          const firstChar = rawInput.charAt(0).toUpperCase();
          const matchesLetter = firstChar === letter;
          const { up, down } = getVotesCount(p, activeCategory);

          // Find current user's vote for this card
          const myVote = p.votes[userId]?.[activeCategory];

          return (
            <div 
              key={p.id}
              className={`border rounded-2xl p-4 transition duration-150 relative overflow-hidden ${
                isPlayerSelf 
                  ? "bg-indigo-950/10 border-indigo-900/40 shadow-md" 
                  : "bg-slate-900/40 border-slate-800/80"
              }`}
            >
              {/* Badge profile item */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl select-none">{p.avatar}</span>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block leading-tight">
                      {p.username} {isPlayerSelf && <span className="text-indigo-400 font-medium">{language === "en" ? "(You)" : "(Tú)"}</span>}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {isPlayerSelf 
                        ? (language === "en" ? "Your answer" : "Tu respuesta") 
                        : (language === "en" ? "Player" : "Jugador")
                      }
                    </span>
                  </div>
                </div>

                {/* Accuracy Warnings helper */}
                {rawInput && !matchesLetter && (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/15 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                    <ShieldAlert size={10} />
                    {language === "en" ? "Incorrect letter" : "Letra incorrecta"}
                  </span>
                )}
              </div>

              {/* WORD DISPLAY CARD */}
              <div className="bg-slate-950 rounded-xl p-3 mb-4 border border-slate-900 text-center relative shadow-inner">
                <span className={`text-base font-black tracking-wide ${
                  !rawInput 
                    ? "text-slate-700 italic font-medium" 
                    : matchesLetter 
                      ? "text-emerald-400 capitalize" 
                      : "text-amber-500 line-through decoration-amber-500/50"
                }`}>
                  {word}
                </span>
                
                {/* Empty check stamp */}
                {!rawInput && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-extrabold">
                    0 pts
                  </span>
                )}
              </div>

              {/* VOTING TRIGGERS ACTIONS */}
              {!rawInput ? (
                <div className="text-center py-2 text-[10px] text-slate-600 italic">
                  {language === "en" ? "No word submitted. No voting required." : "No ingresó ninguna palabra. No requiere votación."}
                </div>
              ) : isPlayerSelf ? (
                <div className="flex justify-between items-center bg-indigo-950/10 rounded-lg p-2 border border-indigo-900/15 text-xs text-indigo-400/80">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={12} />
                    {language === "en" ? "Your friends' votes:" : "Votaciones de tus amigos:"}
                  </span>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-400">👍 {up}</span>
                    <span className="font-bold text-red-400">👎 {down}</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                   
                  {/* UPVOTE GREEN BUTTON */}
                  <button
                    onClick={() => onVote(p.id, activeCategory, true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold border transition ${
                      myVote === true
                        ? "bg-emerald-600 border-emerald-500 text-slate-950 hover:bg-emerald-500"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-emerald-400"
                    } cursor-pointer`}
                  >
                    <Check size={14} />
                    <span>{language === "en" ? "Accept" : "Aceptar"} ({up})</span>
                  </button>

                  {/* DOWNVOTE RED BUTTON */}
                  <button
                    onClick={() => onVote(p.id, activeCategory, false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold border transition ${
                      myVote === false
                        ? "bg-red-600 border-red-500 text-slate-100 hover:bg-red-500"
                        : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-red-400"
                    } cursor-pointer`}
                  >
                    <X size={14} />
                    <span>{language === "en" ? "Reject" : "Rechazar"} ({down})</span>
                  </button>

                </div>
              )}

            </div>
          );
        })}

        {/* Dynamic Category Pagination */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">
            {language === "en" ? "Category" : "Categoría"} {selectedCatIdx + 1} {language === "en" ? "of" : "de"} {room.categories.length}
          </span>
          
          {selectedCatIdx < room.categories.length - 1 && (
            <button
              onClick={() => setSelectedCatIdx((prev) => prev + 1)}
              className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs py-1.5 px-3 rounded-xl hover:bg-indigo-600/20 transition flex items-center gap-1 cursor-pointer font-bold"
            >
              {language === "en" ? "Next category" : "Próxima categoría"}
              <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>

      {/* COMPRESS CONSOLE ACTION: SHOW CALCULATE SCORES ONLY TO THE ACTING HOST */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-950 shrink-0">
        {isHost ? (
          <button
            onClick={onCalculateScores}
            className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{language === "en" ? "🗳️ Save Votes & Calculate Scores" : "🗳️ Guardar Votos & Calcular Puntajes"}</span>
          </button>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400 animate-pulse font-medium">
            {language === "en" ? "Waiting for host to compute votes... ⏱️" : "Esperando que el anfitrión compute y finalice los votos... ⏱️"}
          </div>
        )}
      </div>

    </div>
  );
}
