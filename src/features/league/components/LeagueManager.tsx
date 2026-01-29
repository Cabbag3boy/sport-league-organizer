import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { Player, Group, RoundHistoryEntry } from "../../../types";
import {
  generateGroupsLogic,
  resolveGroupPlacements,
  calculateNewRanks,
} from "../utils";
import { PlayerSelectionPanel } from "../../players/components";
import {
  GroupGenerationPanel,
  GroupRenderingPanel,
} from "../../groups/components";
import RankReviewModal from "../../../components/shared/RankReviewModal";

interface LeagueManagerProps {
  allPlayers: Player[];
  presentPlayerIds: Set<string>;
  setPresentPlayerIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onRoundComplete: (
    finalPlayers: Player[],
    newHistoryEntry: RoundHistoryEntry,
  ) => void;
}

type RankChange = "up" | "down";

const LeagueManager: React.FC<LeagueManagerProps> = ({
  allPlayers,
  presentPlayerIds,
  setPresentPlayerIds,
  onRoundComplete,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<
    Record<string, { score1: string; score2: string; note?: string }>
  >(() => {
    try {
      const savedScores = localStorage.getItem("leagueScores");
      if (savedScores) {
        const parsed = JSON.parse(savedScores) as unknown;
        if (typeof parsed === "object" && parsed !== null) {
          return parsed as Record<
            string,
            { score1: string; score2: string; note?: string }
          >;
        }
      }
    } catch (error) {
      console.error("Error loading scores from localStorage:", error);
    }
    return {};
  });
  const [rankChanges, setRankChanges] = useState<
    Record<string, RankChange | null>
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
      if (!group) continue;
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
              scores[id].score2 === "",
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
              scores[id].score2 === "",
          )
        ) {
          return false;
        }
      } else if (group.length === 2) {
        const matchId = `g${groupNumber}-m1`;
        if (
          !scores[matchId] ||
          scores[matchId].score1 === "" ||
          scores[matchId].score2 === ""
        ) {
          return false;
        }
      }
    }
    return true;
  }, [groups, scores]);

  const handlePlayerToggle = useCallback(
    (playerId: string) => {
      setPresentPlayerIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) {
          newSet.delete(playerId);
        } else {
          newSet.add(playerId);
        }
        return newSet;
      });
    },
    [setPresentPlayerIds],
  );

  const handleScoreUpdate = useCallback(
    (matchId: string, score1: string, score2: string) => {
      setScores((prevScores) => ({
        ...prevScores,
        [matchId]: { ...prevScores[matchId], score1, score2 },
      }));
    },
    [],
  );

  const handleNoteUpdate = useCallback((matchId: string, note: string) => {
    setScores((prevScores) => ({
      ...prevScores,
      [matchId]: { ...prevScores[matchId], note },
    }));
  }, []);

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
      resolveGroupPlacements(group, index + 1, scores),
    );

    const newPlayerList = calculateNewRanks(
      allPlayers,
      presentPlayers,
      presentPlayerIds,
      groupPlacements,
    );

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

      const groupPlacements = groups.map((group, index) =>
        resolveGroupPlacements(group, index + 1, scores),
      );

      const newHistoryEntry: RoundHistoryEntry = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        groups: groups,
        scores: scores,
        finalPlacements: groupPlacements,
        playersBefore: playersBeforeRound,
        playersAfter: finalPlayersWithRanks,
        present_players: Array.from(presentPlayerIds),
      };

      onRoundComplete(finalPlayersWithRanks, newHistoryEntry);

      const changes: Record<string, RankChange> = {};
      const oldPlayerRanks = new Map<string, number>(
        playersBeforeRound.map((p) => [p.id, p.rank]),
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
      localStorage.removeItem("leagueScores");
      setIsReviewModalOpen(false);
      setProposedPlayers(null);
      setPlacementsForReview(null);

      setTimeout(() => {
        setRankChanges({});
      }, 2500);
    },
    [allPlayers, groups, scores, onRoundComplete, presentPlayerIds],
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

      <PlayerSelectionPanel
        allPlayers={allPlayers}
        presentPlayerIds={presentPlayerIds}
        onPlayerToggle={handlePlayerToggle}
        rankChanges={rankChanges}
      />

      <GroupGenerationPanel
        presentPlayersCount={presentPlayers.length}
        error={error}
        onGenerateGroups={generateGroups}
      />

      <GroupRenderingPanel
        groups={groups}
        scores={scores}
        allMatchesScored={allMatchesScored}
        onScoreUpdate={handleScoreUpdate}
        onNoteUpdate={handleNoteUpdate}
        onFinishRound={handleFinishRound}
      />
    </div>
  );
};

export default LeagueManager;
