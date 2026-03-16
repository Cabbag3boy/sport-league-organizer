import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DBEvent,
  DBLeague,
  DBPlayer,
  DBSeason,
  Player,
  RoundHistoryEntry,
} from "@/types";
import { fetchLeagueEventsServer } from "@/features/events/services/eventReadService";
import { fetchPlayersInLeagueServer } from "@/features/players/services/playerReadService";
import { fetchRoundHistoryServer } from "@/features/rounds/services/roundReadService";

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

  const [{ data: seasonsData, error: seasonsError }, eventsData] =
    await Promise.all([
      supabase
        .from("seasons")
        .select("*")
        .eq("league_id", selectedLeagueId)
        .order("created_at", { ascending: false }),
      fetchLeagueEventsServer(supabase, selectedLeagueId),
    ]);

  if (seasonsError) throw seasonsError;

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

  const [playersInLeagueData, roundsData] = await Promise.all([
    fetchPlayersInLeagueServer(supabase, selectedLeagueId),
    fetchRoundHistoryServer(supabase, selectedSeasonId),
  ]);

  players = (playersInLeagueData as Player[]) || [];
  roundHistory = (roundsData as RoundHistoryEntry[]) || [];

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
