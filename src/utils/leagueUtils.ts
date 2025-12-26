import type { Player, Group } from "../types";
import { moveItems, moveToTopPreserveOrder } from "./moveItems";

export const generateGroupsLogic = (presentPlayers: Player[]): { groups: Group[], error: string | null } => {
    const numPlayers = presentPlayers.length;

    if (numPlayers < 3) {
      return { groups: [], error: "Need at least 3 players to form a group." };
    }
    if (numPlayers === 5) {
      return { groups: [], error: "Cannot form groups with 5 players (groups must be 3 or 4)." };
    }

    let numFours = 0;
    let numThrees = 0;
    let foundCombination = false;

    for (let i = Math.floor(numPlayers / 4); i >= 0; i--) {
      const remainder = numPlayers - i * 4;
      if (remainder % 3 === 0) {
        numFours = i;
        numThrees = remainder / 3;
        foundCombination = true;
        break;
      }
    }

    if (!foundCombination) {
      return { groups: [], error: `Cannot find a valid combination of groups for ${numPlayers} players.` };
    }

    let remainingPlayers = [...presentPlayers];
    const newGroups: Group[] = [];

    for (let i = 0; i < numFours; i++) {
      newGroups.push(remainingPlayers.splice(0, 4));
    }
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
    const [p1, p2, p3, p4] = group;
    const r1m1Scores = scores[`g${groupNumber}-r1-m1`] || { score1: '0', score2: '0' };
    const r1m2Scores = scores[`g${groupNumber}-r1-m2`] || { score1: '0', score2: '0' };
    const r2m1Scores = scores[`g${groupNumber}-r2-m1`] || { score1: '0', score2: '0' };
    const r2m2Scores = scores[`g${groupNumber}-r2-m2`] || { score1: '0', score2: '0' };

    const getWinner = (pA: Player, pB: Player, s: { score1: string, score2: string }) => {
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
    const [p1, p2, p3] = group;
    const wins: Record<number, number> = {
      [p1.id]: 0,
      [p2.id]: 0,
      [p3.id]: 0,
    };
    const points: Record<number, { scored: number; lost: number }> = {
        [p1.id]: { scored: 0, lost: 0 },
        [p2.id]: { scored: 0, lost: 0 },
        [p3.id]: { scored: 0, lost: 0 },
    };

    const processMatch = (matchId: string, player1: Player, player2: Player) => {
      const matchScores = scores[matchId];
      if (matchScores && matchScores.score1 !== "" && matchScores.score2 !== "") {
        const s1 = parseInt(matchScores.score1, 10);
        const s2 = parseInt(matchScores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
            if (s1 > s2) wins[player1.id]++; else wins[player2.id]++;
            points[player1.id].scored += s1;
            points[player1.id].lost += s2;
            points[player2.id].scored += s2;
            points[player2.id].lost += s1;
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
      const winDiff = wins[b.id] - wins[a.id];
      if (winDiff !== 0) return winDiff;

      if (isThreeWayTie) {
          const diffA = points[a.id].scored - points[a.id].lost;
          const diffB = points[b.id].scored - points[b.id].lost;
          return diffB - diffA;
      }

      return a.rank - b.rank;
    });
  }
  return [];
};

export const calculateNewRanks = (
    allPlayers: Player[],
    presentPlayers: Player[],
    presentPlayerIds: Set<number>,
    groupPlacements: Player[][]
): Player[] => {
    const allPlayersById = new Map(allPlayers.map((p) => [p.id, p]));
    const placementsCopy: Player[][] = groupPlacements.map((group) =>
      group.map((player) => ({ ...player }))
    );

    const demotedPlayerIds = new Set<number>();
    const promotedPlayerIds = new Set<number>();

    for (let i = 0; i < placementsCopy.length - 1; i++) {
      const highGroup = placementsCopy[i];
      const lowGroup = placementsCopy[i + 1];

      if (highGroup.length > 0 && lowGroup.length > 0) {
        const loser = highGroup.pop()!;
        const winner = lowGroup.shift()!;
        demotedPlayerIds.add(loser.id);
        promotedPlayerIds.add(winner.id);
        highGroup.push(allPlayersById.get(winner.id)!);
        lowGroup.unshift(allPlayersById.get(loser.id)!);
      }
    }
    const finalPresentOrder = placementsCopy.flat();
    const allPlayersStack = allPlayers.slice();
    let newPlayerList: Player[] = [];

    // Unshift non present players on the bottom
    for (let i = allPlayers.length - 1; i >= 0; i--) {
      if (presentPlayerIds.has(allPlayers[i].id)) break;
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
      const idsToMove = new Set<number>();

      // If starting rank is lower (better rank) than final rank (worse rank)
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