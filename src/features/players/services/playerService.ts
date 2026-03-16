import type {
  Player,
  AddPlayerInput,
  AddExistingPlayerInput,
  RemovePlayerInput,
  UpdatePlayerInput,
} from "@/types";
import { apiFetch, apiMutate } from "@/utils/apiClient";

/**
 * Player Service - Manages player operations within leagues
 * Mutations delegated to API routes, reads use direct Supabase client
 */

export async function addPlayer(input: AddPlayerInput): Promise<Player> {
  return apiMutate<Player>("/api/players", "POST", input);
}

export async function addExistingPlayer(
  input: AddExistingPlayerInput,
): Promise<Player> {
  return apiMutate<Player>("/api/players", "POST", input);
}

export async function removePlayer(input: RemovePlayerInput): Promise<void> {
  await apiMutate<{ success: boolean }>(
    `/api/players/${input.playerId}`,
    "DELETE",
    { leagueId: input.leagueId },
  );
}

export async function updatePlayer(input: UpdatePlayerInput): Promise<Player> {
  return apiMutate<Player>(`/api/players/${input.id}/edit`, "PATCH", {
    first_name: input.first_name,
    last_name: input.last_name,
    rank: input.rank,
    leagueId: input.leagueId,
  });
}

export async function fetchPlayersInLeague(
  leagueId: string,
): Promise<Player[]> {
  return apiFetch<Player[]>(`/api/league/${leagueId}/players`);
}

export async function fetchAllPlayers(leagueId: string): Promise<Player[]> {
  return fetchPlayersInLeague(leagueId);
}
