import fs from "fs";
import path from "path";
import { DbUser, DbMatch, DbMatchPlayer, DbHistoricalScore } from "../src/types.js";

const DB_FILE = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  users: DbUser[];
  matches: DbMatch[];
  matchPlayers: DbMatchPlayer[];
  historicalScores: DbHistoricalScore[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [],
  matches: [],
  matchPlayers: [],
  historicalScores: [],
};

// Lazy loader and persistence helper
class RelationalDatabase {
  private data: DatabaseSchema | null = null;

  private init() {
    if (this.data) return;

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { ...DEFAULT_DB };
        this.save();
      }
    } catch (e) {
      console.error("Failed to read database, resetting to default...", e);
      this.data = { ...DEFAULT_DB };
      this.save();
    }
  }

  private save() {
    if (!this.data) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to database:", e);
    }
  }

  public getUsers(): DbUser[] {
    this.init();
    return this.data?.users || [];
  }

  public saveUser(user: DbUser) {
    this.init();
    if (!this.data) return;

    const existingIndex = this.data.users.findIndex((u) => u.id === user.id);
    if (existingIndex > -1) {
      this.data.users[existingIndex] = user;
    } else {
      this.data.users.push(user);
    }
    this.save();
  }

  public getMatches(): DbMatch[] {
    this.init();
    return this.data?.matches || [];
  }

  public getMatchPlayers(matchId: string): DbMatchPlayer[] {
    this.init();
    return (this.data?.matchPlayers || []).filter((mp) => mp.matchId === matchId);
  }

  public recordMatch(
    roomCode: string,
    letter: string,
    categories: string[],
    players: { username: string; score: number; inputs: Record<string, string> }[]
  ): DbMatch {
    this.init();
    if (!this.data) throw new Error("Database not initialized");

    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Calculate winner
    let winnerName = "Nadie";
    let winnerScore = -1;
    let winnerId = "";

    players.forEach((p) => {
      if (p.score > winnerScore) {
        winnerScore = p.score;
        winnerName = p.username;
      }
    });

    const newMatch: DbMatch = {
      id: matchId,
      roomCode,
      letter,
      categories,
      winnerId: winnerName,
      winnerName,
      winnerScore,
      createdAt: new Date().toISOString(),
    };

    this.data.matches.push(newMatch);

    // Save players for this match
    players.forEach((p) => {
      const matchPlayer: DbMatchPlayer = {
        id: `mp_${Math.random().toString(36).substr(2, 9)}`,
        matchId,
        username: p.username,
        score: p.score,
        inputs: JSON.stringify(p.inputs),
      };
      this.data!.matchPlayers.push(matchPlayer);

      // Update Historical Scores
      const histIndex = this.data!.historicalScores.findIndex(
        (hs) => hs.username.toLowerCase() === p.username.toLowerCase()
      );

      const isWinner = p.username === winnerName && p.score > 0;

      if (histIndex > -1) {
        const hist = this.data!.historicalScores[histIndex];
        hist.totalGames += 1;
        if (isWinner) hist.totalWins += 1;
        hist.highestScore = Math.max(hist.highestScore, p.score);
        hist.totalScore += p.score;
        hist.lastPlayed = new Date().toISOString();
        this.data!.historicalScores[histIndex] = hist;
      } else {
        this.data!.historicalScores.push({
          username: p.username,
          totalGames: 1,
          totalWins: isWinner ? 1 : 0,
          highestScore: p.score,
          totalScore: p.score,
          lastPlayed: new Date().toISOString(),
        });
      }
    });

    this.save();
    return newMatch;
  }

  public getLeaderboard(): DbHistoricalScore[] {
    this.init();
    return [...(this.data?.historicalScores || [])].sort(
      (a, b) => b.totalScore - a.totalScore || b.totalWins - a.totalWins
    );
  }

  public clearDatabase() {
    this.data = { ...DEFAULT_DB };
    this.save();
  }
}

export const db = new RelationalDatabase();
