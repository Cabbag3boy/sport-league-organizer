import type {
  RoundHistoryEntry,
  DBMatch,
  DBRound,
  DBPlayerInLeague,
  CompleteRoundInput,
  CompleteRoundOutput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";

/**
 * Round Service - Manages round and match operations
 * Handles complex logic for group-based scoring and player ranking updates
 */

export async function completeRound(
  input: CompleteRoundInput
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
    ])
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
 * Handles 4-player (2-round bracket) and 3-player (round-robin) groups
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
          });
        }

        if (m4 && l1 && l2) {
          matchesToInsert.push({
            round_id: roundId,
            player_one_id: l1.id,
            player_two_id: l2.id,
            player_one_score: parseInt(m4.score1, 10),
            player_two_score: parseInt(m4.score2, 10),
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
          });
        }
      });
    }
  });

  return matchesToInsert;
}

export async function fetchRoundHistory(
  seasonId: string
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
