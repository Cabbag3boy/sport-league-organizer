import type {
  RoundHistoryEntry,
  Player,
  CompleteRoundInput,
  CompleteRoundOutput,
} from "@/types";
import { apiFetch, apiMutate } from "@/utils/apiClient";

/**
 * Round Service - Manages round and match operations
 * Handles complex logic for group-based scoring and player ranking updates
 */

export async function completeRound(
  input: CompleteRoundInput,
): Promise<CompleteRoundOutput> {
  return apiMutate<CompleteRoundOutput>("/api/rounds/complete", "POST", input);
}

export async function fetchRoundHistory(
  seasonId: string,
): Promise<RoundHistoryEntry[]> {
  return apiFetch<RoundHistoryEntry[]>(`/api/seasons/${seasonId}/rounds`);
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
  return apiMutate<DeleteRoundOutput>(`/api/rounds/${roundId}`, "DELETE", {
    leagueId,
    playersBefore,
  });
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
  return apiMutate<{ playersUpdated: number; matchesUpdated: number }>(
    `/api/rounds/${roundId}/results`,
    "PATCH",
    { leagueId, newScores },
  );
}

/**
 * Undo last edit of the last round (one level)
 */
export async function undoLastRoundEdit(
  leagueId: string,
  roundId: string,
): Promise<{ playersUpdated: number; matchesUpdated: number }> {
  return apiMutate<{ playersUpdated: number; matchesUpdated: number }>(
    `/api/rounds/${roundId}/undo`,
    "POST",
    { leagueId },
  );
}
