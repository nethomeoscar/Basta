import React, { useEffect, useRef } from "react";
import { AlertTriangle, Clock, Activity, CornerDownRight } from "lucide-react";
import { RoomState } from "../types.js";

interface RoundProps {
  room: RoomState;
  userId: string;
  inputs: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  onPressBasta: () => void;
}

export default function Round({
  room,
  userId,
  inputs,
  onInputChange,
  onPressBasta,
}: RoundProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto focus the first input inside the category list on mount
  useEffect(() => {
    const firstInput = scrollContainerRef.current?.querySelector("input");
    if (firstInput) {
      (firstInput as HTMLInputElement).focus();
    }
  }, []);

  const me = room.players.find((p) => p.id === userId);
  const letter = room.letter;

  // Calculate overall typing progress to enable visual feedback
  const totalCategories = room.categories.length;
  const typedCount = Object.values(inputs).filter((v) => v.trim().length > 0).length;
  const completionPercentage = (typedCount / totalCategories) * 100;

  // Determine timer percentage and dynamic color classes
  const activeTimer = room.panicActive ? room.panicTimer : room.timer;
  const maxTimerValue = room.panicActive ? 10 : room.maxTime;
  const timePercent = (activeTimer / maxTimerValue) * 100;

  let timerColorClass = "bg-emerald-500 shadow-emerald-500/30";
  let timerTextColor = "text-emerald-400";
  let timerBgBar = "bg-emerald-950/40";

  if (room.panicActive) {
    timerColorClass = "bg-red-600 animate-pulse shadow-red-500/40";
    timerTextColor = "text-red-500 font-extrabold animate-pulse";
    timerBgBar = "bg-red-950/40";
  } else if (room.timer <= 15) {
    timerColorClass = "bg-red-500 animate-pulse shadow-red-500/30";
    timerTextColor = "text-red-400 font-bold";
    timerBgBar = "bg-red-950/40";
  } else if (room.timer <= 30) {
    timerColorClass = "bg-amber-500 shadow-amber-500/30";
    timerTextColor = "text-amber-400";
    timerBgBar = "bg-amber-950/40";
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      
      {/* VIBRANT TIMER HEADER PORTION */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        
        {/* BIG CHOSEN LETTER INDICATOR */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 border-2 border-indigo-400/40 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg transform rotate-2">
            <span className="text-[10px] text-indigo-400 font-black tracking-widest leading-none">LETRA</span>
            <span className="text-3xl font-serif font-black text-indigo-300 -mt-1">{letter}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold">Ronda activa</span>
            <span className="text-[10px] text-indigo-400 font-black">PALABRAS COINCIDENTES</span>
            {/* Progression indicators */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-semibold text-indigo-300">Progreso:</span>
              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-slate-400">{typedCount}/{totalCategories}</span>
            </div>
          </div>
        </div>

        {/* TIMER DIAL CONTAINER - ELEGANT CLOCK */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <Clock size={14} className={timerTextColor} />
            <span className={`text-xl font-black tabular-nums tracking-wider ${timerTextColor}`}>
              {activeTimer}s
            </span>
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
            {room.panicActive ? "⚠️ ¡BASTA!" : "TIEMPO"}
          </span>
        </div>

      </div>

      {/* DYNAMIC PROGRESS BAR TIMER (EMERALD -> RED) */}
      <div className={`w-full h-1.5 ${timerBgBar} shrink-0`}>
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timerColorClass}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* ALERT BOX UNDER PANIC ACTION */}
      {room.panicActive && (
        <div className="bg-red-950/50 border-b border-red-900/40 py-2.5 px-4 text-center text-xs flex items-center justify-center gap-2 animate-bounce shrink-0">
          <AlertTriangle size={14} className="text-red-500 animate-pulse" />
          <span className="text-red-300 font-semibold uppercase tracking-wider">
            ¡CORRE! Alguien gritó ¡BASTA! Acaba en {room.panicTimer} segundos
          </span>
        </div>
      )}

      {/* CATEGORIES CONTAINER - CUSTOM MOBILE-FRIENDLY SCROLL LIST (SCROLL CONTENT NEVER HIDDEN BY KEYBOARD) */}
      <div 
        ref={scrollContainerRef}
        id="scroll-categories-list"
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 scroll-smooth"
      >
        <div className="text-center pb-2">
          <p className="text-[10px] text-slate-500 italic">
            Las palabras deben empezar con la letra <span className="text-indigo-400 font-extrabold font-serif">"{letter}"</span> para ser válidas.
          </p>
        </div>

        {room.categories.map((cat, idx) => {
          const typedVal = inputs[cat] || "";
          const hasContent = typedVal.trim().length > 0;
          
          // Basic warning if first character typed doesn't match letter
          const firstChar = typedVal.trim().charAt(0).toUpperCase();
          const isLetterCorrect = firstChar ? firstChar === letter.toUpperCase() : true;

          return (
            <div 
              key={cat}
              className={`bg-slate-900/40 border rounded-2xl p-3.5 transition-all duration-150 ${
                hasContent 
                  ? isLetterCorrect 
                    ? "border-indigo-500/35 bg-indigo-950/10 shadow-lg shadow-indigo-950/10" 
                    : "border-amber-600/45 bg-amber-950/5"
                  : "border-slate-800/80 focus-within:border-indigo-500/50"
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-indigo-300 tracking-wide">{idx + 1}. {cat}</span>
                  {hasContent && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
                      Lleno
                    </span>
                  )}
                </div>
                
                {/* Visual Alert if doesn't start with the correct letter */}
                {!isLetterCorrect && (
                  <span className="text-[9px] text-amber-500 font-bold flex items-center gap-0.5 animate-pulse bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                    <AlertTriangle size={10} />
                    No empieza con {letter}
                  </span>
                )}
              </div>

              {/* Input for the category */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={25}
                  value={typedVal}
                  onChange={(e) => onInputChange(cat, e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl py-2.5 pl-3 pr-10 text-sm font-semibold focus:outline-none transition ${
                    isLetterCorrect 
                      ? "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-200" 
                      : "border-amber-700 focus:border-amber-500 text-amber-200"
                  }`}
                  placeholder={`Palabra con la ${letter}...`}
                />
                <span className="absolute right-3.5 text-slate-600">
                  <CornerDownRight size={14} />
                </span>
              </div>
            </div>
          );
        })}

        {/* Informative Spacer */}
        <div className="py-2 text-center text-[10px] text-slate-600 select-none">
          Fin de la lista de categorías. ¡Mantén tus dedos en movimiento! ⌨️
        </div>
      </div>

      {/* PANIC BOTTOM PANEL - FIXED IN PLACE AND GUARANTEED TO BE ALWAYS VISIBLE REGARDLESS OF ACTIVE KEYBOARDS */}
      <div 
        id="panic-bottom-bar"
        className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/85 backdrop-blur-md border-t border-slate-900 z-35 flex gap-3"
      >
        <button
          disabled={room.panicActive}
          onClick={onPressBasta}
          className={`w-full text-slate-200 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl uppercase tracking-wider transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            room.panicActive
              ? "bg-slate-900 border border-slate-800 text-slate-600 shadow-none cursor-not-allowed"
              : typedCount === 0 
                ? "bg-red-800/40 text-red-100/40 border border-red-900/20 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-950/50 hover:shadow-2xl animate-pulse"
          }`}
          title={typedCount === 0 ? "Escribe al menos una palabra para cantar basta" : "Grita Basta para detener a todos"}
        >
          <Activity size={18} className={room.panicActive ? "text-slate-600" : "text-slate-100 animate-spin"} />
          {room.panicActive ? "¡BASTA CANTADO!" : "¡BASTA PARA TODOS! 🛑"}
        </button>
      </div>

    </div>
  );
}
