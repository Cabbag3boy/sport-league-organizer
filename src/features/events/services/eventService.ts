import type {
  DBEvent,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventInput,
  ToggleEventPinInput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";

/**
 * Event Service - Manages event operations (create, delete, toggle pin)
 */

export async function createEvent(input: CreateEventInput): Promise<DBEvent> {
  const { leagueId, title, content, pinned } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      content,
      pinned,
      league_id: leagueId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DBEvent;
}

export async function deleteEvent(input: DeleteEventInput): Promise<void> {
  const { eventId } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) throw error;
}

export async function updateEvent(input: UpdateEventInput): Promise<DBEvent> {
  const { eventId, title, content, pinned } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (pinned !== undefined) updates.pinned = pinned;

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data as DBEvent;
}

export async function toggleEventPin(
  input: ToggleEventPinInput,
): Promise<DBEvent> {
  const { eventId, currentPinned } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("events")
    .update({ pinned: !currentPinned })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw error;
  return data as DBEvent;
}

export async function fetchEvents(leagueId: string): Promise<DBEvent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DBEvent[]) || [];
}
