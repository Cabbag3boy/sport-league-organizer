import type { SupabaseClient } from "@supabase/supabase-js";
import type { DBEvent, CreateEventInput } from "@/types";

/**
 * Core event mutation logic for server-side API routes.
 */

export async function createEventCore(
  supabase: SupabaseClient,
  input: CreateEventInput,
): Promise<DBEvent> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      league_id: input.leagueId,
      title: input.title,
      content: input.content,
      pinned: input.pinned,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBEvent;
}

export async function deleteEventCore(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}

export async function updateEventCore(
  supabase: SupabaseClient,
  eventId: string,
  updates: { title?: string; content?: string; pinned?: boolean },
): Promise<DBEvent> {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBEvent;
}
