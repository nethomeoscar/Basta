import React, { useState } from "react";
import { Trophy, RefreshCw, Star, Info, Crown, ChevronDown, ChevronUp } from "lucide-react";
import { RoomState, Player } from "../types.js";

interface ScoresProps {
  room: RoomState;
  userId: string;
  onResetRoom: () => void;
  language: "es" | "en";
}

export default function Scores({ room, userId, onResetRoom, language }: ScoresProps) {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(userId);
  const me = room.players.find((p) => p.id === userId);
  const isHost = me?.isHost || false;

  // Sorting players by overall game score first, then last round score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score || b.lastRoundScore - a.lastRoundScore);
  const roundWinner = [...room.players].sort((a, b) => b.lastRoundScore - a.lastRoundScore)[0];

  const toggleExpand = (pId: string) => {
    setExpandedPlayerId(expandedPlayerId === pId ? null : pId);
  };

  // Helper to deduce the reason for score allocated of a particular word
  const auditWordScore = (
    player: Player,
    category: string,
    allPlayers: Player[],
    letter: string
  ): { score: number; verdict: string; desc: string } => {
    const rawVal = (player.inputs[category] || "").trim();
    if (!rawVal) {
      return { 
        score: 0, 
        verdict: language === "en" ? "Empty" : "Vacío", 
        desc: language === "en" ? "No word was submitted." : "No se ingresó palabra." 
      };
    }

    // Check letter match
    if (rawVal.charAt(0).toUpperCase() !== letter.toUpperCase()) {
      return { 
        score: 0, 
        verdict: language === "en" ? "Wrong Letter" : "Letra Incorrecta", 
        desc: language === "en" ? `Does not start with letter "${letter}".` : `No empieza con la letra "${letter}".` 
      };
    }

    // Check democracy consensus
    let up = 0;
    let down = 0;
    allPlayers.forEach((p) => {
      if (p.id === player.id) return;
      const voteVal = player.votes[p.id]?.[category];
      if (voteVal === true) up++;
      if (voteVal === false) down++;
    });

    if (up < down) {
      return { 
        score: 0, 
        verdict: language === "en" ? "Rejected" : "Rechazado", 
        desc: language === "en" ? "Majority voted thumbs down by democracy." : "La mayoría votó pulgar abajo por democracia." 
      };
    }

    // Now count occurrences of this word among other democratic OK players
    const normWord = rawVal.toLowerCase();
    const otherMatches = allPlayers.filter((other) => {
      const otherRaw = (other.inputs[category] || "").trim();
      if (!otherRaw || other.id === player.id) return false;

      // Ensure other player didn't get downvoted
      let oUp = 0;
      let oDown = 0;
      allPlayers.forEach((v) => {
        if (v.id === other.id) return;
        const oVote = other.votes[v.id]?.[category];
        if (oVote === true) oUp++;
        if (oVote === false) oDown++;
      });
      if (oUp < oDown) return false;

      return otherRaw.toLowerCase() === normWord;
    });

    if (otherMatches.length > 0) {
      return { 
        score: 50, 
        verdict: language === "en" ? "Duplicate" : "Repetido", 
        desc: language === "en" ? `Matches with ${otherMatches.map((p) => p.username).join(", ")}.` : `Coincide con ${otherMatches.map((p) => p.username).join(", ")}.` 
      };
    }

    return { 
      score: 100, 
      verdict: language === "en" ? "Unique" : "Único", 
      desc: language === "en" ? "Unique approved submission!" : "¡Palabra única aprobada!" 
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* CROWN CUP HERO PORTION */}
      <div className="bg-slate-900 px-4 py-5 text-center border-b border-slate-800 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-5 opacity-5 animate-pulse">
          <Trophy size={160} className="text-yellow-400 rotate-12" />
        </div>

        <div className="inline-flex items-center justify-center bg-yellow-400/10 border border-yellow-400/20 p-2.5 rounded-full mb-2">
          <Crown size={28} className="text-yellow-400 animate-bounce" />
        </div>

        <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">
          {language === "en" ? "Round Results" : "Resultados de la Ronda"}
        </h2>
        <p className="text-[11px] text-slate-400">
          {language === "en" ? (
            <>
              Recognizing <span className="text-yellow-400 font-extrabold">{roundWinner?.username}</span> with <span className="text-emerald-400 font-black">{roundWinner?.lastRoundScore} pts</span> this round.
            </>
          ) : (
            <>
              Reconociendo a <span className="text-yellow-400 font-extrabold">{roundWinner?.username}</span> con <span className="text-emerald-400 font-black">{roundWinner?.lastRoundScore} pts</span> esta ronda.
            </>
          )}
        </p>
      </div>

      {/* VIEW SCROLLER FRAME */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-20">
        
        {/* LEADERBOARD TABLE */}
        <div id="scores-leaderboard-card" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3.5">
            <Trophy size={15} className="text-yellow-400" />
            <span>{language === "en" ? "Leaderboard Rankings" : "Puntajes Acumulados"}</span>
          </h3>

          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.id === userId;
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isMe 
                      ? "bg-indigo-950/35 border-indigo-500/50 shadow-md shadow-indigo-950/20" 
                      : "bg-slate-900/60 border-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-500 w-4 pl-0.5">
                      {idx === 0 ? "👑" : idx + 1}
                    </span>
                    <span className="text-2xl select-none">{player.avatar}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        {player.username} {isMe && <span className="text-indigo-400 font-medium">{language === "en" ? "(You)" : "(Tú)"}</span>}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {language === "en" ? "Round:" : "Ronda:"} <span className="text-emerald-400 font-bold">+{player.lastRoundScore}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-yellow-500 block">
                      {player.score}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">
                      {language === "en" ? "total pts" : "pts totales"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS OF SUBMISSIONS WORDS */}
        <div id="scores-details-audit-card" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info size={15} className="text-indigo-400" />
            <span>{language === "en" ? "Submissions Audit Review" : "Auditoría de Respuestas"}</span>
          </h3>
          <p className="text-[9px] text-slate-500 leading-relaxed -mt-1">
            {language === "en" 
              ? "Tap on a player to check category score details."
              : "Presiona sobre un jugador para ver el desglose de su puntuación categoría por categoría."
            }
          </p>

          <div className="space-y-2.5">
            {room.players.map((p) => {
              const isExpanded = expandedPlayerId === p.id;
              return (
                <div 
                  key={p.id}
                  className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => toggleExpand(p.id)}
                    className="flex justify-between items-center p-3 cursor-pointer select-none hover:bg-slate-800/25 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs font-bold text-slate-200">{p.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-950 font-bold border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        +{p.lastRoundScore} pts
                      </span>
                      {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded list audit */}
                  {isExpanded && (
                    <div className="bg-slate-950/60 border-t border-slate-900 p-3 space-y-2 text-xs">
                      {room.categories.map((cat) => {
                        const scoreData = auditWordScore(p, cat, room.players, room.letter);
                        const rawWord = p.inputs[cat]?.trim();

                        return (
                          <div key={cat} className="flex justify-between items-start py-1.5 border-b border-slate-900/40 last:border-none">
                            <div className="max-w-[70%]">
                              <span className="text-[10px] text-indigo-400 font-extrabold block leading-tight">{cat}:</span>
                              <span className={`font-semibold ${rawWord ? "text-slate-200 capitalize" : "text-slate-600 italic"}`}>
                                {rawWord || (language === "en" ? "— Empty —" : "— Vacío —")}
                              </span>
                              <span className="text-[9px] text-slate-500 block leading-none mt-1">
                                {scoreData.desc}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                scoreData.score === 100 
                                  ? "bg-emerald-500/10 text-emerald-400" 
                                  : scoreData.score === 50 
                                    ? "bg-indigo-500/10 text-indigo-400" 
                                    : "bg-red-500/10 text-red-400"
                              }`}>
                                +{scoreData.score} pts
                              </span>
                              <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mt-1">
                                {scoreData.verdict}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* HOST ACTION PANELS */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-950 shrink-0">
        {isHost ? (
          <button
            onClick={onResetRoom}
            className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>
              {language === "en" ? "Back to Lobby / Next Round 🔄" : "Volver al Lobby / Nueva Ronda 🔄"}
            </span>
          </button>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400 animate-pulse font-medium">
            {language === "en" ? "Waiting for host to launch next round... ⏳" : "Esperando que el anfitrión lance el próximo juego... ⏳"}
          </div>
        )}
      </div>

    </div>
  );
}
