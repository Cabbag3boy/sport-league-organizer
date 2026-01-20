import React, { useState, useMemo } from "react";
import type { RoundHistoryEntry, Player } from "@/types";
import StaticMatch from "@/components/shared/StaticMatch";

interface RoundHistoryCardProps {
  entry: RoundHistoryEntry;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  roundNumber: number;
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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          change.oldRank !== undefined && change.oldRank !== change.newRank
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
                />
              )}
              {p2 && p3 && (
                <StaticMatch
                  player1Name={p2.name}
                  player2Name={p3.name}
                  score1={r1m2Scores.score1}
                  score2={r1m2Scores.score2}
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
            />
          )}
          {p1 && p3 && (
            <StaticMatch
              player1Name={p1.name}
              player2Name={p3.name}
              score1={m2Scores.score1}
              score2={m2Scores.score2}
            />
          )}
          {p2 && p3 && (
            <StaticMatch
              player1Name={p2.name}
              player2Name={p3.name}
              score1={m3Scores.score1}
              score2={m3Scores.score2}
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
            />
          )}
        </div>
      );
    }

    return null;
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
              entry.date
            ).toLocaleDateString("cs-CZ")}`}
          />
          <span className="font-semibold text-indigo-400">
            {roundNumber}. Kolo přidáno dne{" "}
            {new Date(entry.date).toLocaleDateString("cs-CZ")}
          </span>
        </div>
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
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
