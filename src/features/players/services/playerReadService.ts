import type { SupabaseClient } from "@supabase/supabase-js";
import type { DBPlayerInLeague, Player } from "@/types";
import { mapPlayerInLeagueRowToPlayer } from "@/features/league/services";

export async function fetchPlayersInLeagueServer(
  supabase: SupabaseClient,
  leagueId: string,
): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players_in_leagues")
    .select("id, rank, player_id, players(id, first_name, last_name)")
    .eq("league_id", leagueId)
    .order("rank", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data as unknown as DBPlayerInLeague[]) || [])
    .map((row) => mapPlayerInLeagueRowToPlayer(row))
    .filter((row): row is Player => !!row);
}
