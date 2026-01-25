import React, { useState, useMemo } from "react";
import type { RoundHistoryEntry, Player } from "@/types";
import StaticMatch from "@/components/shared/StaticMatch";

interface RoundHistoryCardProps {
  entry: RoundHistoryEntry;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  roundNumber: number;
  isLastRound?: boolean;
  isAuthenticated?: boolean;
  onDelete?: (roundId: string) => Promise<void>;
  onEdit?: (entry: RoundHistoryEntry) => void;
  onUndoEdit?: (entry: RoundHistoryEntry) => Promise<void>;
}

const RankChangeDisplay: React.FC<{
  player: Player;
  oldRank: number | undefined;
  newRank: number;
}> = ({ player, oldRank, newRank }) => {
  if (oldRank === undefined || oldRank === newRank) return null;

  const change = newRank < oldRank ? "up" : "down";
  const colorClass = change === "up" ? "text-green-400" : "text-red-400";
  const symbol = change === "up" ? "▲" : "▼";

  return (
    <div className="flex justify-between items-center text-sm">
      <span>{player.name}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{oldRank}</span>
        <span>→</span>
        <span className={`${colorClass} font-bold`}>
          {newRank} {symbol}
        </span>
      </div>
    </div>
  );
};

const RoundHistoryCard: React.FC<RoundHistoryCardProps> = ({
  entry,
  isSelected,
  onToggleSelection,
  roundNumber,
  isLastRound = false,
  isAuthenticated = false,
  onDelete,
  onEdit,
  onUndoEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const rankChanges = useMemo(() => {
    if (!entry.playersBefore || !entry.playersAfter) return [];

    const oldRanks = new Map(entry.playersBefore.map((p) => [p.id, p.rank]));
    return entry.playersAfter
      .map((player) => ({
        player,
        oldRank: oldRanks.get(player.id),
        newRank: player.rank,
      }))
      .filter(
        (change) =>
          change.oldRank !== undefined && change.oldRank !== change.newRank,
      );
  }, [entry.playersBefore, entry.playersAfter]);

  const renderMatchesFromHistory = (group: Player[], groupIndex: number) => {
    const groupNumber = groupIndex + 1;
    if (group.length === 4) {
      const [p1, p2, p3, p4] = group;
      const r1m1Id = `g${groupNumber}-r1-m1`;
      const r1m2Id = `g${groupNumber}-r1-m2`;
      const r2m1Id = `g${groupNumber}-r2-m1`;
      const r2m2Id = `g${groupNumber}-r2-m2`;

      const r1m1Scores = entry.scores[r1m1Id] || { score1: "?", score2: "?" };
      const r1m2Scores = entry.scores[r1m2Id] || { score1: "?", score2: "?" };
      const r2m1Scores = entry.scores[r2m1Id] || { score1: "?", score2: "?" };
      const r2m2Scores = entry.scores[r2m2Id] || { score1: "?", score2: "?" };

      let winner1Name = "Vítěz (R1 M1)";
      let loser1Name = "Poražený (R1 M1)";
      if (r1m1Scores.score1 !== "?" && r1m1Scores.score2 !== "?") {
        const s1 = parseInt(r1m1Scores.score1, 10);
        const s2 = parseInt(r1m1Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2) && p1 && p4) {
          winner1Name = s1 > s2 ? p1.name : p4.name;
          loser1Name = s1 > s2 ? p4.name : p1.name;
        }
      }

      let winner2Name = "Vítěz (R1 M2)";
      let loser2Name = "Poražený (R1 M2)";
      if (r1m2Scores.score1 !== "?" && r1m2Scores.score2 !== "?") {
        const s1 = parseInt(r1m2Scores.score1, 10);
        const s2 = parseInt(r1m2Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2) && p2 && p3) {
          winner2Name = s1 > s2 ? p2.name : p3.name;
          loser2Name = s1 > s2 ? p3.name : p2.name;
        }
      }

      return (
        <div className="space-y-3">
          <div>
            <h6 className="font-semibold text-gray-400 mb-1 text-xs">
              1. kolo
            </h6>
            <div className="space-y-1">
              {p1 && p4 && (
                <StaticMatch
                  player1Name={p1.name}
                  player2Name={p4.name}
                  score1={r1m1Scores.score1}
                  score2={r1m1Scores.score2}
                  note={r1m1Scores.note}
                />
              )}
              {p2 && p3 && (
                <StaticMatch
                  player1Name={p2.name}
                  player2Name={p3.name}
                  score1={r1m2Scores.score1}
                  score2={r1m2Scores.score2}
                  note={r1m2Scores.note}
                />
              )}
            </div>
          </div>
          <div>
            <h6 className="font-semibold text-gray-400 mb-1 text-xs">
              2. kolo
            </h6>
            <div className="space-y-1">
              <StaticMatch
                player1Name={winner1Name}
                player2Name={winner2Name}
                score1={r2m1Scores.score1}
                score2={r2m1Scores.score2}
                note={r2m1Scores.note}
              />
              <StaticMatch
                player1Name={loser1Name}
                player2Name={loser2Name}
                score1={r2m2Scores.score1}
                score2={r2m2Scores.score2}
              />
            </div>
          </div>
        </div>
      );
    }

    if (group.length === 3) {
      const [p1, p2, p3] = group;
      const m1Id = `g${groupNumber}-m1`;
      const m2Id = `g${groupNumber}-m2`;
      const m3Id = `g${groupNumber}-m3`;

      const m1Scores = entry.scores[m1Id] || { score1: "?", score2: "?" };
      const m2Scores = entry.scores[m2Id] || { score1: "?", score2: "?" };
      const m3Scores = entry.scores[m3Id] || { score1: "?", score2: "?" };

      return (
        <div className="space-y-1">
          {p1 && p2 && (
            <StaticMatch
              player1Name={p1.name}
              player2Name={p2.name}
              score1={m1Scores.score1}
              score2={m1Scores.score2}
              note={m1Scores.note}
            />
          )}
          {p1 && p3 && (
            <StaticMatch
              player1Name={p1.name}
              player2Name={p3.name}
              score1={m2Scores.score1}
              score2={m2Scores.score2}
              note={m2Scores.note}
            />
          )}
          {p2 && p3 && (
            <StaticMatch
              player1Name={p2.name}
              player2Name={p3.name}
              score1={m3Scores.score1}
              score2={m3Scores.score2}
              note={m3Scores.note}
            />
          )}
        </div>
      );
    }

    if (group.length === 2) {
      const [p1, p2] = group;
      const m1Id = `g${groupNumber}-m1`;
      const m1Scores = entry.scores[m1Id] || { score1: "?", score2: "?" };

      return (
        <div className="space-y-1">
          {p1 && p2 && (
            <StaticMatch
              player1Name={p1.name}
              player2Name={p2.name}
              score1={m1Scores.score1}
              score2={m1Scores.score2}
              note={m1Scores.note}
            />
          )}
        </div>
      );
    }

    return null;
  };

  const handleDelete = async () => {
    if (!onDelete || !isLastRound) return;
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!onEdit || !isLastRound || !isAuthenticated) return;
    onEdit(entry);
  };

  const handleUndo = async () => {
    if (!onUndoEdit || !isLastRound || !isAuthenticated) return;
    setIsUndoing(true);
    try {
      await onUndoEdit(entry);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300">
      <div
        className="w-full text-left p-4 flex justify-between items-center bg-gray-700 hover:bg-gray-600 focus:outline-none cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(entry.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-indigo-500 focus:ring-indigo-600 cursor-pointer"
            aria-label={`Vybrat kolo ze dne ${new Date(
              entry.date,
            ).toLocaleDateString("cs-CZ")}`}
          />
          <span className="font-semibold text-indigo-400">
            {roundNumber}. Kolo přidáno dne{" "}
            {new Date(entry.date).toLocaleDateString("cs-CZ")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLastRound && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-400 disabled:text-gray-600 transition-colors"
              title="Smazat toto kolo"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          {isLastRound && isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              title="Upravit výsledky tohoto kola"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4h2m-1 0v16m7-7H5"
                />
              </svg>
            </button>
          )}
          {isLastRound && isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUndo();
              }}
              disabled={isUndoing}
              className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 transition-colors"
              title="Vrátit poslední úpravu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l-7 7 7 7M22 12H2"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2 text-indigo-400">
              Zápasy a výsledky
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.groups &&
                entry.groups.map((group, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded-md">
                    <h5 className="font-bold text-gray-300 mb-2">
                      Skupina {index + 1}
                    </h5>
                    {renderMatchesFromHistory(group, index)}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 text-indigo-400">
              Konečné pořadí ve skupinách
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.finalPlacements &&
                entry.finalPlacements.map((placements, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded-md">
                    <h5 className="font-bold text-gray-300 mb-2">
                      Skupina {index + 1}
                    </h5>
                    <ol className="list-decimal list-inside space-y-1">
                      {placements.map((player) => (
                        <li key={player.id} className="text-gray-200">
                          {player.name}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
            </div>
          </div>

          {rankChanges.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2 text-indigo-400">
                Změny v žebříčku
              </h4>
              <div className="bg-gray-900 p-3 rounded-md space-y-2">
                {rankChanges.map(({ player, oldRank, newRank }) => (
                  <RankChangeDisplay
                    key={player.id}
                    player={player}
                    oldRank={oldRank}
                    newRank={newRank}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoundHistoryCard;
