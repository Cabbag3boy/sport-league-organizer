import type {
  FetchBaseDataOutput,
  DBLeague,
  DBSeason,
  DBEvent,
  DBPlayer,
} from "@/types";
import { getSupabase } from "@/utils/supabase";

/**
 * League Service - Manages league and season data operations
 */

export async function fetchLeagues(): Promise<DBLeague[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data as DBLeague[]) || [];
}

export async function fetchSeasons(leagueId: string): Promise<DBSeason[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DBSeason[]) || [];
}

export async function fetchBaseData(
  leagueId?: string,
  forceRefreshLeagues = false,
  existingLeagues?: DBLeague[],
  currentLeagueId?: string | null
): Promise<FetchBaseDataOutput> {
  let activeLeagues = existingLeagues || [];

  if (activeLeagues.length === 0 || forceRefreshLeagues) {
    activeLeagues = await fetchLeagues();
  }

  const lid =
    leagueId ||
    currentLeagueId ||
    (activeLeagues.length > 0 ? activeLeagues[0]?.id : null);

  if (!lid) {
    return { leagueId: null, seasons: [] };
  }

  const seasons = await fetchSeasons(lid);
  return { leagueId: lid, seasons };
}

export async function fetchGlobalPlayers(): Promise<DBPlayer[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) throw error;
  return (data as DBPlayer[]) || [];
}

export async function fetchEvents(leagueId: string): Promise<DBEvent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("league_id", leagueId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DBEvent[]) || [];
}
