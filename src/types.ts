export interface Player {
  id: number;
  name: string;
  rank: number;
}

export type Group = Player[];

export interface RoundHistoryEntry {
  id: number;
  date: string;
  groups: Group[];
  scores: Record<string, { score1: string; score2: string }>;
  finalPlacements: Player[][];
  playersBefore: Player[];
  playersAfter: Player[];
}

export interface PlayerStats {
  wins: number;
  losses: number;
  matches: number;
}

export interface Streaks {
  winStreak: number;
  lossStreak: number;
}
