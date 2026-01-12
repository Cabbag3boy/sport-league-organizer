export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  rank: number;
}

export type Group = Player[];

export interface RoundDetails {
  groups: Group[];
  scores: Record<string, { score1: string; score2: string }>;
  finalPlacements: Player[][];
  playersBefore: Player[];
  playersAfter: Player[];
}

export interface RoundHistoryEntry extends RoundDetails {
  id: string;
  date: string;
  present_players?: string[];
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

/**
 * Database Table Definitions
 */

export interface DBLeague {
  id: string;
  name: string;
  created_at?: string;
}

export interface DBSeason {
  id: string;
  league_id: string;
  name: string;
  created_at: string;
}

export interface DBPlayer {
  id: string;
  first_name: string;
  last_name: string;
  created_at?: string;
}

export interface DBPlayerInLeague {
  id: string;
  league_id: string;
  player_id: string;
  rank: number;
  players?: DBPlayer; // Joined data
}

export interface DBRound {
  id: string;
  season_id: string;
  created_at: string;
  present_players: string[];
  details: RoundDetails;
}

export interface DBMatch {
  id?: string;
  round_id: string;
  player_one_id: string;
  player_two_id: string;
  player_one_score: number;
  player_two_score: number;
  created_at?: string;
}

export interface DBEvent {
  id: string;
  created_at: string;
  title: string | null;
  content: string | null;
  pinned: boolean | null;
  league_id: string;
}
