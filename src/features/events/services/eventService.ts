import type {
  DBEvent,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventInput,
  ToggleEventPinInput,
} from "@/types";
import { apiFetch, apiMutate } from "@/utils/apiClient";

/**
 * Event Service - Manages event operations (create, delete, toggle pin)
 */

export async function createEvent(input: CreateEventInput): Promise<DBEvent> {
  return apiMutate<DBEvent>("/api/events", "POST", input);
}

export async function deleteEvent(input: DeleteEventInput): Promise<void> {
  await apiMutate<{ success: boolean }>(
    `/api/events/${input.eventId}`,
    "DELETE",
  );
}

export async function updateEvent(input: UpdateEventInput): Promise<DBEvent> {
  const { eventId, ...updates } = input;
  return apiMutate<DBEvent>(`/api/events/${eventId}`, "PATCH", updates);
}

export async function toggleEventPin(
  input: ToggleEventPinInput,
): Promise<DBEvent> {
  const { eventId, currentPinned } = input;
  return updateEvent({ eventId, pinned: !currentPinned });
}

export async function fetchEvents(leagueId: string): Promise<DBEvent[]> {
  return apiFetch<DBEvent[]>(`/api/league/${leagueId}/events`);
}
