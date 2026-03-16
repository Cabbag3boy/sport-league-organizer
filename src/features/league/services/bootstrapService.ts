import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DBEvent,
  DBLeague,
  DBPlayer,
  DBPlayerInLeague,
  DBRound,
  DBSeason,
  Player,
  RoundHistoryEntry,
} from "@/types";
import {
  mapPlayerInLeagueRowToPlayer,
  mapRoundToHistoryEntry,
} from "./bootstrapMappers";

export interface BootstrapLeagueData {
  leagues: DBLeague[];
  seasons: DBSeason[];
  globalPlayers: DBPlayer[];
  players: Player[];
  events: DBEvent[];
  roundHistory: RoundHistoryEntry[];
  selectedLeagueId: string;
  selectedSeasonId: string;
}

export async function fetchBootstrapLeagueData(
  supabase: SupabaseClient,
  requestedLeagueId?: string,
  requestedSeasonId?: string,
): Promise<BootstrapLeagueData> {
  const [
    { data: leaguesData, error: leaguesError },
    { data: globalPlayersData, error: playersError },
  ] = await Promise.all([
    supabase.from("leagues").select("*").order("name"),
    supabase
      .from("players")
      .select("*")
      .order("last_name", { ascending: true }),
  ]);

  if (leaguesError) throw leaguesError;
  if (playersError) throw playersError;

  const leagues = (leaguesData as DBLeague[]) || [];
  const globalPlayers = (globalPlayersData as DBPlayer[]) || [];
  const selectedLeagueId = requestedLeagueId || leagues[0]?.id || "";

  let seasons: DBSeason[] = [];
  let selectedSeasonId = "";
  let events: DBEvent[] = [];
  let players: Player[] = [];
  let roundHistory: RoundHistoryEntry[] = [];

  if (!selectedLeagueId) {
    return {
      leagues,
      seasons,
      globalPlayers,
      players,
      events,
      roundHistory,
      selectedLeagueId,
      selectedSeasonId,
    };
  }

  const [
    { data: seasonsData, error: seasonsError },
    { data: eventsData, error: eventsError },
  ] = await Promise.all([
    supabase
      .from("seasons")
      .select("*")
      .eq("league_id", selectedLeagueId)
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("league_id", selectedLeagueId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (seasonsError) throw seasonsError;
  if (eventsError) throw eventsError;

  seasons = (seasonsData as DBSeason[]) || [];
  events = (eventsData as DBEvent[]) || [];
  selectedSeasonId = requestedSeasonId || seasons[0]?.id || "";

  if (!selectedSeasonId) {
    return {
      leagues,
      seasons,
      globalPlayers,
      players,
      events,
      roundHistory,
      selectedLeagueId,
      selectedSeasonId,
    };
  }

  const [
    { data: playersInLeagueData, error: playersInLeagueError },
    { data: roundsData, error: roundsError },
  ] = await Promise.all([
    supabase
      .from("players_in_leagues")
      .select("rank, players(id, first_name, last_name)")
      .eq("league_id", selectedLeagueId)
      .order("rank"),
    supabase
      .from("rounds")
      .select("*")
      .eq("season_id", selectedSeasonId)
      .order("created_at", { ascending: false }),
  ]);

  if (playersInLeagueError) throw playersInLeagueError;
  if (roundsError) throw roundsError;

  players = (
    ((playersInLeagueData as unknown as DBPlayerInLeague[]) ||
      []) as DBPlayerInLeague[]
  )
    .map((row) => mapPlayerInLeagueRowToPlayer(row))
    .filter((row): row is Player => !!row);

  roundHistory = (((roundsData as DBRound[]) || []) as DBRound[]).map(
    mapRoundToHistoryEntry,
  );

  return {
    leagues,
    seasons,
    globalPlayers,
    players,
    events,
    roundHistory,
    selectedLeagueId,
    selectedSeasonId,
  };
}
