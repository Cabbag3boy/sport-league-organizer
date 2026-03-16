import type {
  Player,
  AddPlayerInput,
  AddExistingPlayerInput,
  RemovePlayerInput,
  UpdatePlayerInput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
import { getCsrfToken } from "@/features/auth/utils/csrfToken";

/**
 * Player Service - Manages player operations within leagues
 * Mutations delegated to API routes, reads use direct Supabase client
 */

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No active session");

  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("CSRF token not available");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    "X-CSRF-Token": csrfToken,
  };
}

async function getReadHeaders(): Promise<HeadersInit> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return {};

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

export async function addPlayer(input: AddPlayerInput): Promise<Player> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/players", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  return await parseApiResponse<Player>(res);
}

export async function addExistingPlayer(
  input: AddExistingPlayerInput,
): Promise<Player> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/players", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  return await parseApiResponse<Player>(res);
}

export async function removePlayer(input: RemovePlayerInput): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/players/${input.playerId}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ leagueId: input.leagueId }),
  });
  await parseApiResponse<{ success: boolean }>(res);
}

export async function updatePlayer(input: UpdatePlayerInput): Promise<Player> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/players/${input.id}/edit`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      first_name: input.first_name,
      last_name: input.last_name,
      rank: input.rank,
      leagueId: input.leagueId,
    }),
  });
  return await parseApiResponse<Player>(res);
}

export async function fetchPlayersInLeague(
  leagueId: string,
): Promise<Player[]> {
  const headers = await getReadHeaders();
  const res = await fetch(`/api/league/${leagueId}/players`, {
    method: "GET",
    headers,
  });

  return await parseApiResponse<Player[]>(res);
}

export async function fetchAllPlayers(leagueId: string): Promise<Player[]> {
  return fetchPlayersInLeague(leagueId);
}
