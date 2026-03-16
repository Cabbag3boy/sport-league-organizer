import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateLeagueInput, DBLeague, UpdateLeagueInput } from "@/types";

export async function createLeagueCore(
  supabase: SupabaseClient,
  input: CreateLeagueInput,
): Promise<DBLeague> {
  const { data, error } = await supabase
    .from("leagues")
    .insert({ name: input.name.trim() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBLeague;
}

export async function updateLeagueCore(
  supabase: SupabaseClient,
  leagueId: string,
  input: UpdateLeagueInput,
): Promise<DBLeague> {
  const { data, error } = await supabase
    .from("leagues")
    .update({ name: input.name.trim() })
    .eq("id", leagueId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBLeague;
}

export async function deleteLeagueCore(
  supabase: SupabaseClient,
  leagueId: string,
): Promise<void> {
  const { error } = await supabase.from("leagues").delete().eq("id", leagueId);
  if (error) throw new Error(error.message);
}
