import React, { useState, useEffect } from "react";
import { Trophy, History, Play, Plus, LogIn, Sparkles, User, RefreshCw } from "lucide-react";

interface HomeProps {
  onJoinRoom: (roomCode: string, username: string, avatar: string) => void;
  onCreateRoom: (username: string, avatar: string) => void;
}

const EMOJI_AVATARS = [
  "🦊", "🦁", "🦖", "🦄", "🦧", "🐧", "🦉", "🐸", "🐙", "👻", 
  "🤖", "👽", "🤠", "🧙", "👸", "🦸", "🧑‍🚀", "🍕", "🥑", "🎨"
];

const RANDOM_NAMES = [
  "GamerBasta", "StopMaster", "LetraLoca", "RayoBasta", "VelozBasta",
  "Diccionario", "Palabrero", "DanzaLetras", "AlfaBasta", "OmegaStop",
  "DonVocabulario", "DoñaSílaba", "Cerebrito", "LápizRápido", "TintaVeloz"
];

export default function Home({ onJoinRoom, onCreateRoom }: HomeProps) {
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem("basta_username");
    if (saved) return saved;
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(Math.random() * 90);
  });

  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem("basta_avatar");
    return saved || EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)];
  });

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"play" | "leaderboard" | "history">("play");
  
  // Real stats state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("basta_username", username);
    localStorage.setItem("basta_avatar", avatar);
  }, [username, avatar]);

  // Fetch metrics when selecting stats tabs
  const fetchScoresAndHistory = async () => {
    setLoading(true);
    try {
      const [lbRes, histRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/history")
      ]);
      if (lbRes.ok) setLeaderboard(await lbRes.json());
      if (histRes.ok) setHistory(await histRes.json());
    } catch (e) {
      console.error("Failed to fetch relational database high scores", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "play") {
      fetchScoresAndHistory();
    }
  }, [activeTab]);

  const randomizeName = () => {
    const base = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setUsername(base + Math.floor(Math.random() * 99));
  };

  const randomizeAvatar = () => {
    setAvatar(EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)]);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (roomCodeInput.trim().length < 4) return;
    onJoinRoom(roomCodeInput.trim(), username.trim(), avatar);
  };

  const handleCreateSubmit = () => {
    if (!username.trim()) return;
    onCreateRoom(username.trim(), avatar);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 font-sans text-slate-100 pb-4">
      
      {/* Hero Banner / Logo HEADER */}
      <div className="text-center py-6 px-4 bg-gradient-to-b from-indigo-900/40 to-slate-950">
        <div className="inline-flex items-center justify-center p-3 bg-red-600 rounded-full shadow-lg shadow-red-500/20 animate-pulse mb-3">
          <span className="text-3xl font-black tracking-widest text-white px-2">¡BASTA!</span>
        </div>
        <p className="text-xs text-indigo-300 font-medium tracking-widest uppercase">El clásico lápiz y papel, ahora multijugador</p>
      </div>

      {/* Tabs list (Play, Leaderboard, History) */}
      <div className="flex border-b border-indigo-950/50 px-4 bg-slate-950/80 sticky top-0 z-10 w-full mb-4">
        <button
          onClick={() => setActiveTab("play")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${
            activeTab === "play"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Play size={16} /> Play
          </div>
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${
            activeTab === "leaderboard"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Trophy size={16} /> Puntajes
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition ${
            activeTab === "history"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <History size={16} /> Historial
          </div>
        </button>
      </div>

      {/* Main Container Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 space-y-5">
        
        {activeTab === "play" && (
          <div id="play-tab" className="space-y-5">
            
            {/* PROFILE CUSTOMIZER CARD */}
            <div id="profile-card" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-4">
                <User size={16} className="text-indigo-400" />
                <span>Perfil de Jugador</span>
              </h2>

              <div className="flex items-center gap-4">
                {/* Avatar Display with quick randomizer */}
                <div className="relative group select-none">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-md border-2 border-indigo-400/30">
                    {avatar}
                  </div>
                  <button
                    onClick={randomizeAvatar}
                    className="absolute -bottom-1 -right-1 bg-indigo-500 text-white rounded-full p-1.5 shadow-md hover:bg-indigo-600 transition"
                    title="Avatar aleatorio"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>

                {/* Username inputs */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.slice(0, 18))}
                      maxLength={18}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-100 text-sm font-semibold focus:outline-none transition pr-10"
                      placeholder="Escribe tu apodo del juego"
                    />
                    <button
                      onClick={randomizeName}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition"
                      title="Apodo aleatorio"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Elige un emoji avatar y apodo para que tus amigos te reconozcan.
                  </p>
                </div>
              </div>

              {/* Emoji quick bar Selector */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Elegir Avatar:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 max-w-full">
                  {EMOJI_AVATARS.map((emo) => (
                    <button
                      key={emo}
                      onClick={() => setAvatar(emo)}
                      className={`text-2xl p-1.5 rounded-lg border transition ${
                        avatar === emo 
                          ? "bg-indigo-500/20 border-indigo-400 scale-110" 
                          : "border-transparent hover:bg-slate-800/40"
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* JOIN ROOM CARD */}
            <div id="join-room-card" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3.5">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <LogIn size={18} className="text-emerald-400" />
                <span>Unirse con un Código</span>
              </h3>
              
              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.slice(0, 6))}
                  className="w-full text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 text-lg font-black tracking-[0.3em] uppercase text-emerald-400 focus:outline-none transition placeholder:text-xs placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-600"
                  placeholder="CÓDIGO DE 4 DÍGITOS"
                />
                <button
                  type="submit"
                  disabled={roomCodeInput.trim().length < 4}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-950/40 hover:shadow-lg disabled:opacity-40 text-slate-950 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={16} />
                  Ingresar a Sala
                </button>
              </form>
            </div>

            {/* CREATE ROOM CARD */}
            <div id="create-room-card" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Plus size={18} className="text-indigo-400" />
                <span>Crear Nueva Partida</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empieza una nueva sala privada. Recibirás un código de invitación único para compartir con tus amigos por WhatsApp o Redes.
              </p>
              <button
                onClick={handleCreateSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-950/40 hover:shadow-lg text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Plus size={16} />
                Crear Sala de Juego
              </button>
            </div>

          </div>
        )}

        {/* LEADERBOARD VIEW */}
        {activeTab === "leaderboard" && (
          <div id="leaderboard-pane" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300">Puntajes Históricos</h3>
                <p className="text-[10px] text-slate-500">Estadísticas acumuladas de todos los jugadores</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10 text-indigo-400">
                <RefreshCw size={24} className="animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 border border-slate-900 rounded-2xl">
                No hay puntajes registrados en la base relacional aún.<br />¡Juega tu primera partida para inaugurar la tabla!
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                      <th className="py-3 px-3 w-10 text-center">Pos</th>
                      <th className="py-3 px-3">Usuario</th>
                      <th className="py-3 px-2 text-center">Partidas</th>
                      <th className="py-3 px-2 text-center">Victorias</th>
                      <th className="py-3 px-3 text-right">Ptos Totales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/55">
                    {leaderboard.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition">
                        <td className="py-3 px-3 text-center font-bold">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {item.username}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-400">{item.totalGames}</td>
                        <td className="py-3 px-2 text-center text-emerald-400 font-bold">{item.totalWins}</td>
                        <td className="py-3 px-3 text-right text-indigo-400 font-black">{item.totalScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MATCH HISTORY VIEW */}
        {activeTab === "history" && (
          <div id="history-pane" className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-300">Historial de Partidas</h3>
              <p className="text-[10px] text-slate-500">Rondas culminadas en esta base de datos</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10 text-indigo-400">
                <RefreshCw size={24} className="animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 border border-slate-900 rounded-2xl">
                Sin partidas previas en el historial.<br />¡Crea una sala y asombra a tus amigos!
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 15).map((match) => (
                  <div key={match.id} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-black">
                          SALA {match.roomCode}
                        </span>
                        <span className="font-bold text-slate-200 text-sm">
                          Letra: <span className="text-indigo-400 font-black">{match.letter}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(match.createdAt).toLocaleDateString()} {new Date(match.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-400">Categorías:</span> {match.categories.join(", ")}
                    </div>

                    <div className="bg-slate-950/60 rounded-lg p-2 space-y-1 text-xs">
                      <p className="text-[9px] text-indigo-300 font-black tracking-wider uppercase mb-1">Resultados de Jugadores:</p>
                      {match.players?.map((mp: any, pIdx: number) => (
                        <div key={pIdx} className="flex justify-between items-center py-0.5 border-b border-slate-900/40 last:border-0">
                          <span className="text-slate-200 font-medium">
                            {mp.username} {mp.username === match.winnerId && "👑"}
                          </span>
                          <span className="font-black text-indigo-400">{mp.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Rules Footer */}
      <div className="px-4 pt-2 text-center">
        <p className="text-[10px] text-slate-600">
          Usa códigos de sala de 4 dígitos para unirte con tus equipos. <br />
          Sincronización en tiempo real de baja latencia con votación democrática en ronda.
        </p>
      </div>

    </div>
  );
}
