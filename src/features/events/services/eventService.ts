import type {
  DBEvent,
  CreateEventInput,
  UpdateEventInput,
  DeleteEventInput,
  ToggleEventPinInput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
import { getCsrfToken } from "@/features/auth/utils/csrfToken";

type ApiErrorPayload = {
  error?: string;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const supabase = getSupabase();
  if (!supabase) return headers;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  return headers;
};

const getReadHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  const supabase = getSupabase();
  if (!supabase) return headers;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
};

const parseApiResponse = async <T>(res: Response): Promise<T> => {
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorPayload;
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
};

/**
 * Event Service - Manages event operations (create, delete, toggle pin)
 */

export async function createEvent(input: CreateEventInput): Promise<DBEvent> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/events", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  return parseApiResponse<DBEvent>(res);
}

export async function deleteEvent(input: DeleteEventInput): Promise<void> {
  const { eventId } = input;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
    headers,
  });

  await parseApiResponse<{ success: boolean }>(res);
}

export async function updateEvent(input: UpdateEventInput): Promise<DBEvent> {
  const { eventId, ...updates } = input;
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/events/${eventId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  });

  return parseApiResponse<DBEvent>(res);
}

export async function toggleEventPin(
  input: ToggleEventPinInput,
): Promise<DBEvent> {
  const { eventId, currentPinned } = input;
  return updateEvent({ eventId, pinned: !currentPinned });
}

export async function fetchEvents(leagueId: string): Promise<DBEvent[]> {
  const headers = await getReadHeaders();
  const res = await fetch(`/api/league/${leagueId}/events`, {
    method: "GET",
    headers,
  });

  return parseApiResponse<DBEvent[]>(res);
}
