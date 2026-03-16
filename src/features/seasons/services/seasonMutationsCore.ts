import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateSeasonInput, DBSeason, UpdateSeasonInput } from "@/types";

export async function createSeasonCore(
  supabase: SupabaseClient,
  input: CreateSeasonInput,
): Promise<DBSeason> {
  const { data, error } = await supabase
    .from("seasons")
    .insert({
      league_id: input.leagueId,
      name: input.name.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBSeason;
}

export async function updateSeasonCore(
  supabase: SupabaseClient,
  seasonId: string,
  input: UpdateSeasonInput,
): Promise<DBSeason> {
  const { data, error } = await supabase
    .from("seasons")
    .update({ name: input.name.trim() })
    .eq("id", seasonId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBSeason;
}

export async function deleteSeasonCore(
  supabase: SupabaseClient,
  seasonId: string,
): Promise<void> {
  const { error } = await supabase.from("seasons").delete().eq("id", seasonId);
  if (error) throw new Error(error.message);
}
