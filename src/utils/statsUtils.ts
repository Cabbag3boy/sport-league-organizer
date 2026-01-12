import type { Player, RoundHistoryEntry, PlayerStats, Streaks } from "../types";

/**
 * Calculates detailed statistics and streaks for all players based on the complete round history.
 */
export const calculateStandings = (
  players: Player[],
  roundHistory: RoundHistoryEntry[]
) => {
  const stats: Record<string, PlayerStats> = {};
  const streaks: Record<string, Streaks> = {};
  const outcomes: Record<string, ("W" | "L" | "T")[]> = {};

  // Initialize data structures for each current player
  players.forEach((p) => {
    stats[p.id] = { wins: 0, losses: 0, matches: 0 };
    streaks[p.id] = { winStreak: 0, lossStreak: 0 };
    outcomes[p.id] = [];
  });

  // Sort history chronologically: Oldest first to ensure correct streak calculation
  const sortedHistory = [...roundHistory].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  sortedHistory.forEach((round) => {
    const scores = round.scores;
    round.groups.forEach((group, gIdx) => {
      const gNum = gIdx + 1;

      const recordMatch = (p1: Player, p2: Player, s1: string, s2: string) => {
        if (!s1 || !s2 || s1 === "" || s2 === "") return;
        const score1 = parseInt(s1, 10);
        const score2 = parseInt(s2, 10);
        if (isNaN(score1) || isNaN(score2)) return;

        // Only track for players currently in the system
        const p1Exists = !!stats[p1.id];
        const p2Exists = !!stats[p2.id];

        if (p1Exists) stats[p1.id].matches++;
        if (p2Exists) stats[p2.id].matches++;

        if (score1 > score2) {
          if (p1Exists) {
            stats[p1.id].wins++;
            outcomes[p1.id].push("W");
          }
          if (p2Exists) {
            stats[p2.id].losses++;
            outcomes[p2.id].push("L");
          }
        } else if (score2 > score1) {
          if (p2Exists) {
            stats[p2.id].wins++;
            outcomes[p2.id].push("W");
          }
          if (p1Exists) {
            stats[p1.id].losses++;
            outcomes[p1.id].push("L");
          }
        } else {
          // Tie scenario
          if (p1Exists) outcomes[p1.id].push("T");
          if (p2Exists) outcomes[p2.id].push("T");
        }
      };

      if (group.length === 4) {
        const [p1, p2, p3, p4] = group;
        const m1 = scores[`g${gNum}-r1-m1`];
        const m2 = scores[`g${gNum}-r1-m2`];
        if (m1) recordMatch(p1, p4, m1.score1, m1.score2);
        if (m2) recordMatch(p2, p3, m2.score1, m2.score2);

        if (
          m1 &&
          m2 &&
          m1.score1 !== "" &&
          m1.score2 !== "" &&
          m2.score1 !== "" &&
          m2.score2 !== ""
        ) {
          const w1 = parseInt(m1.score1) > parseInt(m1.score2) ? p1 : p4;
          const l1 = parseInt(m1.score1) > parseInt(m1.score2) ? p4 : p1;
          const w2 = parseInt(m2.score1) > parseInt(m2.score2) ? p2 : p3;
          const l2 = parseInt(m2.score1) > parseInt(m2.score2) ? p3 : p2;

          const m3 = scores[`g${gNum}-r2-m1`];
          const m4 = scores[`g${gNum}-r2-m2`];
          if (m3) recordMatch(w1, w2, m3.score1, m3.score2);
          if (m4) recordMatch(l1, l2, m4.score1, m4.score2);
        }
      } else if (group.length === 3) {
        const [p1, p2, p3] = group;
        const m1 = scores[`g${gNum}-m1`];
        const m2 = scores[`g${gNum}-m2`];
        const m3 = scores[`g${gNum}-m3`];
        if (m1) recordMatch(p1, p2, m1.score1, m1.score2);
        if (m2) recordMatch(p1, p3, m2.score1, m2.score2);
        if (m3) recordMatch(p2, p3, m3.score1, m3.score2);
      } else if (group.length === 2) {
        const [p1, p2] = group;
        const m1 = scores[`g${gNum}-m1`];
        if (m1) recordMatch(p1, p2, m1.score1, m1.score2);
      }
    });
  });

  // Streak Calculation: Accurately identify the current consecutive stretch of Ws or Ls
  players.forEach((p) => {
    const results = outcomes[p.id];
    if (!results || results.length === 0) return;

    let streakCount = 0;
    const lastResult = results[results.length - 1];

    // Count backwards from the most recent match
    // Only consecutive identical results from the end of the history count as a streak
    for (let i = results.length - 1; i >= 0; i--) {
      if (
        results[i] === lastResult &&
        (lastResult === "W" || lastResult === "L")
      ) {
        streakCount++;
      } else {
        // A different result (W vs L vs T) breaks the streak
        break;
      }
    }

    if (lastResult === "W") {
      streaks[p.id] = { winStreak: streakCount, lossStreak: 0 };
    } else if (lastResult === "L") {
      streaks[p.id] = { winStreak: 0, lossStreak: streakCount };
    } else {
      // Tied last match results in 0 current streak for both categories
      streaks[p.id] = { winStreak: 0, lossStreak: 0 };
    }
  });

  return { stats, streaks };
};
