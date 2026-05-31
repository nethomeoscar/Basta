// Types for Juego Basta

export interface UserProfile {
  id: string;
  username: string;
  avatar: string; // Emoji or URL
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export type GameStatus = "lobby" | "playing" | "voting" | "scores";

export interface Player {
  id: string;
  username: string;
  avatar: string;
  isHost: boolean;
  score: number;
  lastRoundScore: number;
  ready: boolean;
  inputs: Record<string, string>; // category -> word input
  votes: Record<string, Record<string, boolean>>; // votingPlayerId -> categoryId -> true (upvote) / false (downvote)
  connected: boolean;
}

export interface RoomState {
  code: string;
  status: GameStatus;
  players: Player[];
  letter: string;
  categories: string[];
  maxTime: number;
  timer: number;
  panicActive: boolean;
  panicTimer: number;
  chatMessages: ChatMessage[];
  usedLetters: string[];
  isBotRoom?: boolean;
  isPublic?: boolean;
  language?: "es" | "en";
}

// Relational Database Schema types

export interface DbUser {
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export interface DbMatch {
  id: string;
  roomCode: string;
  letter: string;
  categories: string[]; // JSON string string[]
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  createdAt: string;
}

export interface DbMatchPlayer {
  id: string;
  matchId: string;
  username: string;
  score: number;
  inputs: string; // JSON Record<string, string>
}

export interface DbHistoricalScore {
  username: string;
  totalGames: number;
  totalWins: number;
  highestScore: number;
  totalScore: number;
  lastPlayed: string;
}
