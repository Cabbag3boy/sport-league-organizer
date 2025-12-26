import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { Player, Group, RoundHistoryEntry } from "../types";
import {
  generateGroupsLogic,
  resolveGroupPlacements,
  calculateNewRanks,
} from "../utils/leagueUtils";
import PlayerCard from "./PlayerCard";
import GroupCard from "./GroupCard";
import RankReviewModal from "./RankReviewModal";

interface LeagueManagerProps {
  allPlayers: Player[];
  onRoundComplete: (
    finalPlayers: Player[],
    newHistoryEntry: RoundHistoryEntry
  ) => void;
}

type RankChange = "up" | "down";

const LeagueManager: React.FC<LeagueManagerProps> = ({
  allPlayers,
  onRoundComplete,
}) => {
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<number>>(
    new Set()
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<
    Record<string, { score1: string; score2: string }>
  >(() => {
    try {
      const savedScores = localStorage.getItem("leagueScores");
      if (savedScores) {
        const parsed = JSON.parse(savedScores);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading scores from localStorage:", error);
    }
    return {};
  });
  const [rankChanges, setRankChanges] = useState<
    Record<number, RankChange | null>
  >({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [proposedPlayers, setProposedPlayers] = useState<Player[] | null>(null);
  const [placementsForReview, setPlacementsForReview] = useState<
    Player[][] | null
  >(null);

  useEffect(() => {
    try {
      localStorage.setItem("leagueScores", JSON.stringify(scores));
    } catch (error) {
      console.error("Error saving scores to localStorage:", error);
    }
  }, [scores]);

  const presentPlayers = useMemo(() => {
    return allPlayers
      .filter((p) => presentPlayerIds.has(p.id))
      .sort((a, b) => a.rank - b.rank);
  }, [allPlayers, presentPlayerIds]);

  const allMatchesScored = useMemo(() => {
    if (groups.length === 0) return false;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupNumber = i + 1;
      if (group.length === 4) {
        const matchIds = [
          `g${groupNumber}-r1-m1`,
          `g${groupNumber}-r1-m2`,
          `g${groupNumber}-r2-m1`,
          `g${groupNumber}-r2-m2`,
        ];
        if (
          matchIds.some(
            (id) =>
              !scores[id] ||
              scores[id].score1 === "" ||
              scores[id].score2 === ""
          )
        ) {
          return false;
        }
      } else if (group.length === 3) {
        const matchIds = [
          `g${groupNumber}-m1`,
          `g${groupNumber}-m2`,
          `g${groupNumber}-m3`,
        ];
        if (
          matchIds.some(
            (id) =>
              !scores[id] ||
              scores[id].score1 === "" ||
              scores[id].score2 === ""
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }, [groups, scores]);

  const handlePlayerToggle = useCallback((playerId: number) => {
    setPresentPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  }, []);

  const handleScoreUpdate = useCallback(
    (matchId: string, score1: string, score2: string) => {
      setScores((prevScores) => ({
        ...prevScores,
        [matchId]: { score1, score2 },
      }));
    },
    []
  );

  const generateGroups = useCallback(() => {
    setError(null);
    setGroups([]);
    setScores({});
    localStorage.removeItem("leagueScores");

    const { groups: newGroups, error: genError } =
      generateGroupsLogic(presentPlayers);

    if (genError) {
      setError(genError);
      return;
    }

    setGroups(newGroups);
  }, [presentPlayers]);

  const handleFinishRound = useCallback(() => {
    if (groups.length === 0) return;

    const groupPlacements = groups.map((group, index) =>
      resolveGroupPlacements(group, index + 1, scores)
    );

    const newPlayerList = calculateNewRanks(
      allPlayers,
      presentPlayers,
      presentPlayerIds,
      groupPlacements
    );

    const finalIdSet = new Set(newPlayerList.map((p) => p.id));
    if (finalIdSet.size !== allPlayers.length) {
      console.error("Error: Player count mismatch after update. Aborting.");
      setError(
        "A critical error occurred while calculating new ranks (player count mismatch). Please refresh."
      );
      return;
    }
    const finalRankSet = new Set(newPlayerList.map((p) => p.rank));
    if (finalRankSet.size !== allPlayers.length) {
      console.error("Error: Duplicate ranks detected after update. Aborting.");
      setError(
        "A critical error occurred while calculating new ranks (duplicate ranks). Please refresh."
      );
      return;
    }

    setPlacementsForReview(groupPlacements);
    setProposedPlayers(newPlayerList);
    setIsReviewModalOpen(true);
  }, [groups, scores, allPlayers, presentPlayers, presentPlayerIds]);

  const handleConfirmRanks = useCallback(
    (finalPlayers: Player[]) => {
      const playersBeforeRound = allPlayers;
      const finalPlayersWithRanks = finalPlayers.map((p, i) => ({
        ...p,
        rank: i + 1,
      }));

      // Recalculate placements for history record
      const groupPlacements = groups.map((group, index) =>
        resolveGroupPlacements(group, index + 1, scores)
      );

      const newHistoryEntry: RoundHistoryEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        groups: groups,
        scores: scores,
        finalPlacements: groupPlacements,
        playersBefore: playersBeforeRound,
        playersAfter: finalPlayersWithRanks,
      };
      onRoundComplete(finalPlayersWithRanks, newHistoryEntry);

      const changes: Record<number, RankChange> = {};
      const oldPlayerRanks = new Map<number, number>(
        playersBeforeRound.map((p) => [p.id, p.rank])
      );
      finalPlayersWithRanks.forEach((p) => {
        const oldRank = oldPlayerRanks.get(p.id);
        if (oldRank !== undefined) {
          if (p.rank < oldRank) changes[p.id] = "up";
          else if (p.rank > oldRank) changes[p.id] = "down";
        }
      });
      setRankChanges(changes);

      setGroups([]);
      setScores({});
      // setPresentPlayerIds(new Set());
      localStorage.removeItem("leagueScores");
      setIsReviewModalOpen(false);
      setProposedPlayers(null);
      setPlacementsForReview(null);

      setTimeout(() => {
        setRankChanges({});
      }, 2500);
    },
    [allPlayers, groups, scores, onRoundComplete]
  );

  const handleCancelReview = useCallback(() => {
    setIsReviewModalOpen(false);
    setProposedPlayers(null);
    setPlacementsForReview(null);
  }, []);

  return (
    <div className="space-y-8">
      {isReviewModalOpen && proposedPlayers && placementsForReview && (
        <RankReviewModal
          proposedPlayers={proposedPlayers}
          originalPlayers={allPlayers}
          finalPlacements={placementsForReview}
          presentPlayerIds={presentPlayerIds}
          onConfirm={handleConfirmRanks}
          onCancel={handleCancelReview}
        />
      )}

      <div>
        <h2 className="text-2xl font-semibold text-indigo-400 text-center mb-4">
          Select Players for this Round
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isPresent={presentPlayerIds.has(player.id)}
              onToggle={handlePlayerToggle}
              rankChange={rankChanges[player.id] || null}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={generateGroups}
          disabled={presentPlayers.length < 3}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg transform hover:scale-105"
        >
          Generate Groups ({presentPlayers.length} Selected)
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      {groups.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-400">
            Generated Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group, index) => (
              <GroupCard
                key={index}
                group={group}
                groupNumber={index + 1}
                scores={scores}
                onScoreUpdate={handleScoreUpdate}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleFinishRound}
              disabled={!allMatchesScored}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg transform hover:scale-105"
            >
              Finish Round & Update Ranks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueManager;
