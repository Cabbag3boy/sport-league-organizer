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

/**
 * Service DTOs (Input/Output Types)
 */

// Player Service DTOs
export interface AddPlayerInput {
  leagueId: string;
  playerName: string;
  selectedRole?: string;
  globalPlayerId?: string;
}

export interface AddExistingPlayerInput {
  leagueId: string;
  playerId: string;
}

export interface RemovePlayerInput {
  leagueId: string;
  playerId: string;
}

export interface UpdatePlayerInput {
  id: string;
  first_name: string;
  last_name: string;
  rank: number;
  leagueId: string;
}

export interface FetchPlayersInLeagueInput {
  leagueId: string;
}

export interface FetchPlayersInLeagueOutput {
  players: Player[];
  error?: string;
}

// League Service DTOs
export interface FetchLeaguesInput {}

export interface FetchLeaguesOutput {
  leagues: DBLeague[];
}

export interface FetchSeasonsInput {
  leagueId: string;
}

export interface FetchSeasonsOutput {
  seasons: DBSeason[];
}

export interface FetchBaseDataInput {
  leagueId?: string;
  forceRefreshLeagues?: boolean;
}

export interface FetchBaseDataOutput {
  leagueId: string | null;
  seasons: DBSeason[];
}

// Event Service DTOs
export interface CreateEventInput {
  leagueId: string;
  title: string;
  content: string;
  pinned: boolean;
}

export interface DeleteEventInput {
  eventId: string;
}

export interface ToggleEventPinInput {
  eventId: string;
  currentPinned: boolean;
}

export interface FetchEventsInput {
  leagueId: string;
}

export interface FetchEventsOutput {
  events: DBEvent[];
}

// Round Service DTOs
export interface CompleteRoundInput {
  leagueId: string;
  seasonId: string;
  finalPlayers: Player[];
  entry: RoundHistoryEntry;
}

export interface CompleteRoundOutput {
  roundId: string;
  matchesInserted: number;
  playersUpdated: number;
}

// Global Players Service DTO
export interface FetchGlobalPlayersOutput {
  players: DBPlayer[];
}

