import type { SupabaseClient } from "@supabase/supabase-js";
import type { DBEvent } from "@/types";

export async function fetchLeagueEventsServer(
  supabase: SupabaseClient,
  leagueId: string,
): Promise<DBEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("league_id", leagueId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DBEvent[]) || [];
}
