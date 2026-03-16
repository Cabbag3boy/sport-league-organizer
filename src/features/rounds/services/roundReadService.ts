import type { SupabaseClient } from "@supabase/supabase-js";
import type { DBRound, RoundHistoryEntry } from "@/types";
import { mapRoundToHistoryEntry } from "@/features/league/services";

export async function fetchRoundHistoryServer(
  supabase: SupabaseClient,
  seasonId: string,
): Promise<RoundHistoryEntry[]> {
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("season_id", seasonId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as DBRound[]) || []).map(mapRoundToHistoryEntry);
}
