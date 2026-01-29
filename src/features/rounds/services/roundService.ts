import type {
  RoundHistoryEntry,
  DBMatch,
  DBRound,
  DBPlayerInLeague,
  Player,
  CompleteRoundInput,
  CompleteRoundOutput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
import {
  resolveGroupPlacements,
  calculateNewRanks,
} from "@/features/league/utils/leagueUtils";

/**
 * Round Service - Manages round and match operations
 * Handles complex logic for group-based scoring and player ranking updates
 */

export async function completeRound(
  input: CompleteRoundInput,
): Promise<CompleteRoundOutput> {
  const { leagueId, seasonId, finalPlayers, entry } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Determine present players
  const presentIds = finalPlayers
    .filter((p) => entry.present_players?.includes(p.id))
    .map((p) => p.id);

  // Insert round record
  const { data: roundDataRaw, error: roundErr } = await supabase
    .from("rounds")
    .insert({
      season_id: seasonId,
      present_players: presentIds,
      details: {
        groups: entry.groups,
        scores: entry.scores,
        finalPlacements: entry.finalPlacements,
        playersBefore: entry.playersBefore,
        playersAfter: entry.playersAfter,
      },
    })
    .select()
    .single();

  if (roundErr) throw roundErr;
  const roundData = roundDataRaw as DBRound;

  // Generate and insert matches
  const matchesToInsert = generateMatches(entry, roundData.id);

  let matchesInserted = 0;
  if (matchesToInsert.length > 0) {
    const { error: matchErr } = await supabase
      .from("matches")
      .insert(matchesToInsert);

    if (matchErr) throw matchErr;
    matchesInserted = matchesToInsert.length;
  }

  // Update player rankings
  const { data: existingLinks } = await supabase
    .from("players_in_leagues")
    .select("id, player_id")
    .eq("league_id", leagueId);

  const linkMap = new Map(
    ((existingLinks as DBPlayerInLeague[]) || []).map((l) => [
      l.player_id,
      l.id,
    ]),
  );

  const updates = finalPlayers
    .map((p) => {
      const rowId = linkMap.get(p.id);
      return {
        id: rowId,
        league_id: leagueId,
        player_id: p.id,
        rank: p.rank,
      };
    })
    .filter((u) => u.id);

  const { error: rankErr } = await supabase
    .from("players_in_leagues")
    .upsert(updates);

  if (rankErr) throw rankErr;

  return {
    roundId: roundData.id,
    matchesInserted,
    playersUpdated: updates.length,
  };
}

/**
 * Generate match records from round groups and scores
 * Handles 4-player (2-round bracket), 3-player (round-robin), and 2-player (single match) groups
 */
function generateMatches(entry: RoundHistoryEntry, roundId: string): DBMatch[] {
  const matchesToInsert: DBMatch[] = [];
  const scores = entry.scores;

  entry.groups.forEach((group, idx) => {
    const gNum = idx + 1;

    if (group.length === 4) {
      // 4-player group: bracket tournament (2 rounds, 4 matches)
      const [p1, p2, p3, p4] = group;

      // Round 1 matches
      const m1 = scores[`g${gNum}-r1-m1`];
      const m2 = scores[`g${gNum}-r1-m2`];

      if (m1) {
        if (p1 && p4) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: p1.id,
            player_two_id: p4.id,
            player_one_score: parseInt(m1.score1, 10),
            player_two_score: parseInt(m1.score2, 10),
            note: m1.note || null,
          });
        }
      }

      if (m2) {
        if (p2 && p3) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: p2.id,
            player_two_id: p3.id,
            player_one_score: parseInt(m2.score1, 10),
            player_two_score: parseInt(m2.score2, 10),
            note: m2.note || null,
          });
        }
      }

      // Round 2 matches (cross-bracket)
      if (m1 && m2 && p1 && p2 && p3 && p4) {
        const w1 = parseInt(m1.score1, 10) > parseInt(m1.score2, 10) ? p1 : p4;
        const l1 = parseInt(m1.score1, 10) > parseInt(m1.score2, 10) ? p4 : p1;
        const w2 = parseInt(m2.score1, 10) > parseInt(m2.score2, 10) ? p2 : p3;
        const l2 = parseInt(m2.score1, 10) > parseInt(m2.score2, 10) ? p3 : p2;

        const m3 = scores[`g${gNum}-r2-m1`];
        const m4 = scores[`g${gNum}-r2-m2`];

        if (m3 && w1 && w2) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: w1.id,
            player_two_id: w2.id,
            player_one_score: parseInt(m3.score1, 10),
            player_two_score: parseInt(m3.score2, 10),
            note: m3.note || null,
          });
        }

        if (m4 && l1 && l2) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: l1.id,
            player_two_id: l2.id,
            player_one_score: parseInt(m4.score1, 10),
            player_two_score: parseInt(m4.score2, 10),
            note: m4.note || null,
          });
        }
      }
    } else if (group.length === 3) {
      // 3-player group: round-robin (3 matches)
      const [p1, p2, p3] = group;

      [1, 2, 3].forEach((m) => {
        const ms = scores[`g${gNum}-m${m}`];
        if (!ms) return;

        const pair = m === 1 ? [p1, p2] : m === 2 ? [p1, p3] : [p2, p3];
        const player1 = pair[0];
        const player2 = pair[1];

        if (player1 && player2) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: player1.id,
            player_two_id: player2.id,
            player_one_score: parseInt(ms.score1, 10),
            player_two_score: parseInt(ms.score2, 10),
            note: ms.note || null,
          });
        }
      });
    } else if (group.length === 2) {
      // 2-player group: single match
      const [p1, p2] = group;
      const m1 = scores[`g${gNum}-m1`];

      if (m1 && p1 && p2) {
        matchesToInsert.push({
          round_id: roundId,
          player_one_id: p1.id,
          player_two_id: p2.id,
          player_one_score: parseInt(m1.score1, 10),
          player_two_score: parseInt(m1.score2, 10),
          note: m1.note || null,
        });
      }
    }
  });

  return matchesToInsert;
}

export async function fetchRoundHistory(
  seasonId: string,
): Promise<RoundHistoryEntry[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .eq("season_id", seasonId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data as unknown as DBRound[]) || []).map((round) => ({
    id: round.id,
    date: round.created_at,
    present_players: round.present_players,
    groups: (round.details as any)?.groups || [],
    scores: (round.details as any)?.scores || {},
    finalPlacements: (round.details as any)?.finalPlacements || [],
    playersBefore: (round.details as any)?.playersBefore || [],
    playersAfter: (round.details as any)?.playersAfter || [],
  }));
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
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Validate playersBefore is not empty
  if (!playersBefore || playersBefore.length === 0) {
    throw new Error("Nelze vrátit: nenalezen předchozí stav hráčů");
  }

  // Delete all matches for this round (hard delete)
  const { error: matchErr } = await supabase
    .from("matches")
    .delete()
    .eq("round_id", roundId);

  if (matchErr) throw matchErr;

  // Delete the round itself (hard delete)
  const { error: roundErr } = await supabase
    .from("rounds")
    .delete()
    .eq("id", roundId);

  if (roundErr) throw roundErr;

  // Revert player rankings to playersBefore state
  const { data: existingLinks } = await supabase
    .from("players_in_leagues")
    .select("id, player_id")
    .eq("league_id", leagueId);

  const linkMap = new Map(
    ((existingLinks as DBPlayerInLeague[]) || []).map((l) => [
      l.player_id,
      l.id,
    ]),
  );

  const revertUpdates = playersBefore
    .map((p) => {
      const rowId = linkMap.get(p.id);
      if (!rowId) return null;
      return {
        id: rowId,
        league_id: leagueId,
        player_id: p.id,
        rank: p.rank,
      };
    })
    .filter((u) => u !== null);

  if (revertUpdates.length > 0) {
    const { error: revertErr } = await supabase
      .from("players_in_leagues")
      .upsert(revertUpdates);

    if (revertErr) throw revertErr;
  }

  return {
    success: true,
    revertedCount: revertUpdates.length,
    isLastRound: true,
  };
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
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Fetch round row
  const { data: roundRow, error: roundFetchErr } = await supabase
    .from("rounds")
    .select("id, season_id, created_at, present_players, details")
    .eq("id", roundId)
    .single();
  if (roundFetchErr) throw roundFetchErr;
  const round = roundRow as DBRound;

  // Ensure this is the latest round in the season
  const { data: roundsInSeason, error: listErr } = await supabase
    .from("rounds")
    .select("id")
    .eq("season_id", round.season_id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (listErr) throw listErr;
  const latest = (roundsInSeason as DBRound[])?.[0]?.id;
  if (latest !== roundId) throw new Error("Lze upravovat pouze poslední kolo.");

  const details: any = round.details || {};
  const groups: Player[][] = (details.groups as Player[][]) || [];
  const playersBefore: Player[] = (details.playersBefore as Player[]) || [];
  const presentIds: string[] = (round.present_players as string[]) || [];

  // Recompute placements for each group
  const groupPlacements: Player[][] = groups.map((g, i) =>
    resolveGroupPlacements(g, i + 1, newScores),
  );

  // Derive present players list
  const presentPlayersMap = new Map<string, Player>();
  groups.flat().forEach((p) => {
    if (p) presentPlayersMap.set(p.id, p);
  });
  const presentPlayers: Player[] = presentIds
    .map((id) => presentPlayersMap.get(id))
    .filter((p): p is Player => !!p);
  const presentIdSet = new Set<string>(presentIds);

  // Compute new full ranking list
  const newPlayersWithRanks = calculateNewRanks(
    playersBefore,
    presentPlayers,
    presentIdSet,
    groupPlacements,
  );

  // Upsert players_in_leagues with new ranks
  const { data: existingLinks } = await supabase
    .from("players_in_leagues")
    .select("id, player_id")
    .eq("league_id", leagueId);
  const linkMap = new Map(
    ((existingLinks as DBPlayerInLeague[]) || []).map((l) => [
      l.player_id,
      l.id,
    ]),
  );
  const rankUpdates = newPlayersWithRanks
    .map((p) => {
      const rowId = linkMap.get(p.id);
      return {
        id: rowId,
        league_id: leagueId,
        player_id: p.id,
        rank: p.rank,
      };
    })
    .filter((u) => u.id);
  const { error: rankErr } = await supabase
    .from("players_in_leagues")
    .upsert(rankUpdates);
  if (rankErr) throw rankErr;

  // Snapshot previous details for undo (single level)
  const previousDetails = {
    groups: details.groups,
    scores: details.scores,
    finalPlacements: details.finalPlacements,
    playersBefore: details.playersBefore,
    playersAfter: details.playersAfter,
  };

  // Update round details
  const { error: updateRoundErr } = await supabase
    .from("rounds")
    .update({
      details: {
        groups,
        scores: newScores,
        finalPlacements: groupPlacements,
        playersBefore,
        playersAfter: newPlayersWithRanks,
        previousDetails,
      },
    })
    .eq("id", roundId);
  if (updateRoundErr) throw updateRoundErr;

  // Replace matches for this round
  const { error: delMatchesErr } = await supabase
    .from("matches")
    .delete()
    .eq("round_id", roundId);
  if (delMatchesErr) throw delMatchesErr;

  const newEntry: RoundHistoryEntry = {
    id: roundId,
    date: round.created_at,
    groups,
    scores: newScores,
    finalPlacements: groupPlacements,
    playersBefore,
    playersAfter: newPlayersWithRanks,
    present_players: presentIds,
  };
  const newMatches = generateMatches(newEntry, roundId);
  let matchesUpdated = 0;
  if (newMatches.length > 0) {
    const { error: insErr } = await supabase.from("matches").insert(newMatches);
    if (insErr) throw insErr;
    matchesUpdated = newMatches.length;
  }

  return { playersUpdated: rankUpdates.length, matchesUpdated };
}

/**
 * Undo last edit of the last round (one level)
 */
export async function undoLastRoundEdit(
  leagueId: string,
  roundId: string,
): Promise<{ playersUpdated: number; matchesUpdated: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data: roundRow, error: roundFetchErr } = await supabase
    .from("rounds")
    .select("id, season_id, created_at, present_players, details")
    .eq("id", roundId)
    .single();
  if (roundFetchErr) throw roundFetchErr;
  const round = roundRow as DBRound;

  // Ensure latest round
  const { data: roundsInSeason, error: listErr } = await supabase
    .from("rounds")
    .select("id")
    .eq("season_id", round.season_id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (listErr) throw listErr;
  const latest = (roundsInSeason as DBRound[])?.[0]?.id;
  if (latest !== roundId) throw new Error("Lze vrátit pouze poslední kolo.");

  const details: any = round.details || {};
  const prev = details.previousDetails;
  if (!prev) throw new Error("Žádná předchozí verze pro vrácení.");

  const groups: Player[][] = (prev.groups as Player[][]) || [];
  const scores: Record<
    string,
    { score1: string; score2: string; note?: string }
  > = prev.scores || {};
  const playersBefore: Player[] = (prev.playersBefore as Player[]) || [];
  const playersAfter: Player[] = (prev.playersAfter as Player[]) || [];
  const presentIds: string[] = (round.present_players as string[]) || [];

  // Upsert players_in_leagues from previous playersAfter
  const { data: existingLinks } = await supabase
    .from("players_in_leagues")
    .select("id, player_id")
    .eq("league_id", leagueId);
  const linkMap = new Map(
    ((existingLinks as DBPlayerInLeague[]) || []).map((l) => [
      l.player_id,
      l.id,
    ]),
  );
  const rankUpdates = playersAfter
    .map((p) => {
      const rowId = linkMap.get(p.id);
      return {
        id: rowId,
        league_id: leagueId,
        player_id: p.id,
        rank: p.rank,
      };
    })
    .filter((u) => u.id);
  const { error: rankErr } = await supabase
    .from("players_in_leagues")
    .upsert(rankUpdates);
  if (rankErr) throw rankErr;

  // Update round details back to previous and clear snapshot
  const { error: updateRoundErr } = await supabase
    .from("rounds")
    .update({
      details: {
        groups,
        scores,
        finalPlacements: (prev.finalPlacements as Player[][]) || [],
        playersBefore,
        playersAfter,
      },
    })
    .eq("id", roundId);
  if (updateRoundErr) throw updateRoundErr;

  // Replace matches for this round
  const { error: delMatchesErr } = await supabase
    .from("matches")
    .delete()
    .eq("round_id", roundId);
  if (delMatchesErr) throw delMatchesErr;

  const restoredEntry: RoundHistoryEntry = {
    id: roundId,
    date: round.created_at,
    groups,
    scores,
    finalPlacements: (prev.finalPlacements as Player[][]) || [],
    playersBefore,
    playersAfter,
    present_players: presentIds,
  };
  const restoredMatches = generateMatches(restoredEntry, roundId);
  let matchesUpdated = 0;
  if (restoredMatches.length > 0) {
    const { error: insErr } = await supabase
      .from("matches")
      .insert(restoredMatches);
    if (insErr) throw insErr;
    matchesUpdated = restoredMatches.length;
  }

  return { playersUpdated: rankUpdates.length, matchesUpdated };
}
