import type { Player, Group } from "@/types";
import { moveItems, moveToTopPreserveOrder } from "@/utils/shared/moveItems";

export const generateGroupsLogic = (
  presentPlayers: Player[]
): { groups: Group[]; error: string | null } => {
  const numPlayers = presentPlayers.length;

  if (numPlayers < 2) {
    return {
      groups: [],
      error: "Pro vytvoření zápasů jsou potřeba alespoň 2 hráči.",
    };
  }

  // Speciální případ: Samostatný zápas pro právě 2 hráče
  if (numPlayers === 2) {
    return { groups: [[...presentPlayers]], error: null };
  }

  // Pro více než 2 hráče jsou povoleny pouze skupiny po 3 nebo 4
  let numFours = 0;
  let numThrees = 0;
  let foundCombination = false;

  // Hledáme kombinaci 4x + 3y = numPlayers s prioritou pro skupiny po 4
  for (let i = Math.floor(numPlayers / 4); i >= 0; i--) {
    const remainder = numPlayers - i * 4;
    if (remainder >= 0 && remainder % 3 === 0) {
      numFours = i;
      numThrees = remainder / 3;
      foundCombination = true;
      break;
    }
  }

  if (!foundCombination) {
    return {
      groups: [],
      error: `Pro ${numPlayers} hráčů nelze vytvořit skupiny po 3 nebo 4. Povolené počty jsou 3, 4, 6, 7, 8, 9 a více.`,
    };
  }

  let remainingPlayers = [...presentPlayers];
  const newGroups: Group[] = [];

  // Nejdříve naplníme skupiny po 4 (mají vyšší prioritu v žebříčku)
  for (let i = 0; i < numFours; i++) {
    newGroups.push(remainingPlayers.splice(0, 4));
  }
  // Poté skupiny po 3
  for (let i = 0; i < numThrees; i++) {
    newGroups.push(remainingPlayers.splice(0, 3));
  }

  return { groups: newGroups, error: null };
};

export const resolveGroupPlacements = (
  group: Group,
  groupNumber: number,
  scores: Record<string, { score1: string; score2: string }>
): Player[] => {
  if (group.length === 4) {
    const p1 = group[0];
    const p2 = group[1];
    const p3 = group[2];
    const p4 = group[3];

    if (!p1 || !p2 || !p3 || !p4) return group; // Fallback if any player is undefined

    const r1m1Scores = scores[`g${groupNumber}-r1-m1`] || {
      score1: "0",
      score2: "0",
    };
    const r1m2Scores = scores[`g${groupNumber}-r1-m2`] || {
      score1: "0",
      score2: "0",
    };
    const r2m1Scores = scores[`g${groupNumber}-r2-m1`] || {
      score1: "0",
      score2: "0",
    };
    const r2m2Scores = scores[`g${groupNumber}-r2-m2`] || {
      score1: "0",
      score2: "0",
    };

    const getWinner = (
      pA: Player,
      pB: Player,
      s: { score1: string; score2: string }
    ) => {
      const s1 = parseInt(s.score1) || 0;
      const s2 = parseInt(s.score2) || 0;
      return s1 > s2 ? pA : pB;
    };

    const winner1 = getWinner(p1, p4, r1m1Scores);
    const loser1 = winner1.id === p1.id ? p4 : p1;
    const winner2 = getWinner(p2, p3, r1m2Scores);
    const loser2 = winner2.id === p2.id ? p3 : p2;

    const finalWinner = getWinner(winner1, winner2, r2m1Scores);
    const finalRunnerUp = finalWinner.id === winner1.id ? winner2 : winner1;
    const thirdPlace = getWinner(loser1, loser2, r2m2Scores);
    const fourthPlace = thirdPlace.id === loser1.id ? loser2 : loser1;

    return [finalWinner, finalRunnerUp, thirdPlace, fourthPlace];
  } else if (group.length === 3) {
    const p1 = group[0];
    const p2 = group[1];
    const p3 = group[2];

    if (!p1 || !p2 || !p3) return group; // Fallback if any player is undefined

    const wins: Record<string, number> = {
      [p1.id]: 0,
      [p2.id]: 0,
      [p3.id]: 0,
    };
    const points: Record<string, { scored: number; lost: number }> = {
      [p1.id]: { scored: 0, lost: 0 },
      [p2.id]: { scored: 0, lost: 0 },
      [p3.id]: { scored: 0, lost: 0 },
    };

    const processMatch = (
      matchId: string,
      player1: Player,
      player2: Player
    ) => {
      const matchScores = scores[matchId];
      if (
        matchScores &&
        matchScores.score1 !== "" &&
        matchScores.score2 !== ""
      ) {
        const s1 = parseInt(matchScores.score1, 10);
        const s2 = parseInt(matchScores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          if (s1 > s2) {
            wins[player1.id] = (wins[player1.id] || 0) + 1;
          } else {
            wins[player2.id] = (wins[player2.id] || 0) + 1;
          }
          const p1Points = points[player1.id];
          const p2Points = points[player2.id];
          if (p1Points) {
            p1Points.scored += s1;
            p1Points.lost += s2;
          }
          if (p2Points) {
            p2Points.scored += s2;
            p2Points.lost += s1;
          }
        }
      }
    };
    processMatch(`g${groupNumber}-m1`, p1, p2);
    processMatch(`g${groupNumber}-m2`, p1, p3);
    processMatch(`g${groupNumber}-m3`, p2, p3);

    const isThreeWayTie =
      Object.values(wins).length === 3 &&
      Object.values(wins).every((w) => w === 1);

    return [...group].sort((a, b) => {
      const winA = wins[a.id] ?? 0;
      const winB = wins[b.id] ?? 0;
      const winDiff = winB - winA;
      if (winDiff !== 0) return winDiff;

      if (isThreeWayTie) {
        const pointsA = points[a.id];
        const pointsB = points[b.id];
        const diffA = pointsA ? pointsA.scored - pointsA.lost : 0;
        const diffB = pointsB ? pointsB.scored - pointsB.lost : 0;
        return diffB - diffA;
      }

      return a.rank - b.rank;
    });
  } else if (group.length === 2) {
    const p1 = group[0];
    const p2 = group[1];
    if (!p1 || !p2) return group;

    const matchId = `g${groupNumber}-m1`;
    const matchScores = scores[matchId] || { score1: "", score2: "" };

    const s1 = parseInt(matchScores.score1, 10);
    const s2 = parseInt(matchScores.score2, 10);

    if (!isNaN(s1) && !isNaN(s2)) {
      return s1 > s2 ? [p1, p2] : [p2, p1];
    }
    return [p1, p2];
  }
  return [];
};

export const calculateNewRanks = (
  allPlayers: Player[],
  presentPlayers: Player[],
  presentPlayerIds: Set<string>,
  groupPlacements: Player[][]
): Player[] => {
  const allPlayersById = new Map(allPlayers.map((p) => [p.id, p]));
  const placementsCopy: Player[][] = groupPlacements.map((group) =>
    group.map((player) => ({ ...player }))
  );

  const demotedPlayerIds = new Set<string>();
  const promotedPlayerIds = new Set<string>();

  for (let i = 0; i < placementsCopy.length - 1; i++) {
    const highGroup = placementsCopy[i];
    const lowGroup = placementsCopy[i + 1];

    if (highGroup && lowGroup && highGroup.length > 0 && lowGroup.length > 0) {
      const loser = highGroup.pop();
      const winner = lowGroup.shift();
      if (loser && winner) {
        demotedPlayerIds.add(loser.id);
        promotedPlayerIds.add(winner.id);
        const winnerPlayer = allPlayersById.get(winner.id);
        const loserPlayer = allPlayersById.get(loser.id);
        if (winnerPlayer) highGroup.push(winnerPlayer);
        if (loserPlayer) lowGroup.unshift(loserPlayer);
      }
    }
  }
  const finalPresentOrder = placementsCopy.flat();
  const allPlayersStack = allPlayers.slice();
  let newPlayerList: Player[] = [];

  for (let i = allPlayers.length - 1; i >= 0; i--) {
    const player = allPlayers[i];
    if (player && presentPlayerIds.has(player.id)) break;
    moveItems(allPlayersStack, newPlayerList);
  }

  for (const presentPlayer of finalPresentOrder.slice().reverse()) {
    const originalPresentIndex = presentPlayers.findIndex(
      (item) => item.id === presentPlayer.id
    );
    const finalPresentIndex = finalPresentOrder.indexOf(presentPlayer);
    const allPlayersIndex = allPlayers.findIndex(
      (item) => item.id === presentPlayer.id
    );
    const idsToMove = new Set<string>();

    if (originalPresentIndex <= finalPresentIndex) {
      const ids = allPlayersStack
        .filter(
          (item) =>
            allPlayers.findIndex((p) => p.id === item.id) > allPlayersIndex &&
            !presentPlayerIds.has(item.id)
        )
        .map((item) => item.id);

      ids.forEach((id) => idsToMove.add(id));
    }

    idsToMove.add(presentPlayer.id);

    moveToTopPreserveOrder(allPlayersStack, newPlayerList, (item) =>
      idsToMove.has(item.id)
    );
  }

  if (allPlayersStack.length > 0) newPlayerList.unshift(...allPlayersStack);

  return newPlayerList.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
};

/**
 * Reorders players in a league to prevent duplicate ranks.
 * When a player's rank is updated, this function shifts other players accordingly
 * and ensures all ranks are sequential from 1 to N.
 *
 * @param players - Current list of players with their ranks
 * @param updatedPlayerId - ID of the player whose rank was changed
 * @param newRank - The new rank requested for the player
 * @returns Object with { reorderedPlayers, error }
 */
export const reorderPlayerRanks = (
  players: Player[],
  updatedPlayerId: string,
  newRank: number
): { reorderedPlayers: Player[]; error: string | null } => {
  // Validate rank bounds
  if (newRank < 1 || newRank > players.length) {
    return {
      reorderedPlayers: [],
      error: `Pořadí musí být mezi 1 a ${players.length}.`,
    };
  }

  // Find the player being updated
  const playerToMove = players.find((p) => p.id === updatedPlayerId);
  if (!playerToMove) {
    return {
      reorderedPlayers: [],
      error: "Hráč nenalezen.",
    };
  }

  const oldRank = playerToMove.rank;

  // If rank hasn't changed, return as-is
  if (oldRank === newRank) {
    return { reorderedPlayers: players, error: null };
  }

  // Create a working copy without the moved player
  const otherPlayers = players.filter((p) => p.id !== updatedPlayerId);

  // Rebuild the list with the moved player in the new position
  const reordered: Player[] = [];

  for (let i = 0; i < otherPlayers.length; i++) {
    if (i === newRank - 1) {
      // Insert the moved player at the new rank position
      reordered.push({ ...playerToMove, rank: newRank });
    }

    // Add other players, adjusting their ranks
    const otherPlayer = otherPlayers[i];
    if (otherPlayer) {
      const targetRank = reordered.length + 1;
      reordered.push({ ...otherPlayer, rank: targetRank });
    }
  }

  // If newRank is beyond current players, append at the end
  if (newRank > reordered.length) {
    reordered.push({ ...playerToMove, rank: newRank });
  }

  // Final pass: ensure all ranks are sequential 1 to N
  const finalReordered = reordered.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  return { reorderedPlayers: finalReordered, error: null };
};
