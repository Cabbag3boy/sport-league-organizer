import type {
  RoundHistoryEntry,
  Player,
  CompleteRoundInput,
  CompleteRoundOutput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
import { getCsrfToken } from "@/features/auth/utils/csrfToken";

interface ApiErrorPayload {
  error?: string;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const supabase = getSupabase();
  if (!supabase) return headers;

  const sessionResponse = await supabase.auth?.getSession?.();
  const session = sessionResponse?.data?.session;

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

  const sessionResponse = await supabase.auth?.getSession?.();
  const session = sessionResponse?.data?.session;

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
 * Round Service - Manages round and match operations
 * Handles complex logic for group-based scoring and player ranking updates
 */

export async function completeRound(
  input: CompleteRoundInput,
): Promise<CompleteRoundOutput> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/rounds/complete", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  return parseApiResponse<CompleteRoundOutput>(res);
}

export async function fetchRoundHistory(
  seasonId: string,
): Promise<RoundHistoryEntry[]> {
  const headers = await getReadHeaders();
  const res = await fetch(`/api/seasons/${seasonId}/rounds`, {
    method: "GET",
    headers,
  });

  return parseApiResponse<RoundHistoryEntry[]>(res);
}

interface DeleteRoundOutput {
  success: boolean;
  revertedCount: number;
  isLastRound: boolean;
}

/**
 * Delete the last round and revert player rankings to their pre-round state
 * @param leagueId - The league ID
 * @param roundId - The round ID to delete
 * @param playersBefore - The player state before the round (snapshot to revert to)
 */
export async function deleteLastRound(
  leagueId: string,
  roundId: string,
  playersBefore: Player[],
): Promise<DeleteRoundOutput> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/rounds/${roundId}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ leagueId, playersBefore }),
  });

  return parseApiResponse<DeleteRoundOutput>(res);
}

/**
 * Update last round match scores and recompute placements and rankings
 * Stores previous details snapshot for one-level undo
 */
export async function updateLastRoundResults(
  leagueId: string,
  roundId: string,
  newScores: Record<string, { score1: string; score2: string; note?: string }>,
): Promise<{ playersUpdated: number; matchesUpdated: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/rounds/${roundId}/results`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ leagueId, newScores }),
  });

  return parseApiResponse<{ playersUpdated: number; matchesUpdated: number }>(
    res,
  );
}

/**
 * Undo last edit of the last round (one level)
 */
export async function undoLastRoundEdit(
  leagueId: string,
  roundId: string,
): Promise<{ playersUpdated: number; matchesUpdated: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/rounds/${roundId}/undo`, {
    method: "POST",
    headers,
    body: JSON.stringify({ leagueId }),
  });

  return parseApiResponse<{ playersUpdated: number; matchesUpdated: number }>(
    res,
  );
}
