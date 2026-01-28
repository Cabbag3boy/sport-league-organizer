import React, { useMemo } from "react";
import type { Player, RoundHistoryEntry } from "@/types";
import { calculatePlayerProgression } from "@/utils/shared/statsUtils";

interface ProgressionTabProps {
  players: Player[];
  roundHistory: RoundHistoryEntry[];
}

const ProgressionTab: React.FC<ProgressionTabProps> = ({
  players,
  roundHistory,
}) => {
  const playerProgression = useMemo(() => {
    return calculatePlayerProgression(players, roundHistory);
  }, [players, roundHistory]);

  // Create sorted list: by progression (desc), then by name (asc)
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const progressionDiff =
        (playerProgression[b.id] || 0) - (playerProgression[a.id] || 0);
      if (progressionDiff !== 0) return progressionDiff;
      return a.name.localeCompare(b.name);
    });
  }, [players, playerProgression]);

  // Find first round participation to get starting rank
  const playerStartingRanks = useMemo(() => {
    const ranks: Record<string, number> = {};
    const sortedHistory = [...roundHistory].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    sortedHistory.forEach((round) => {
      if (!round.playersBefore) return;
      round.playersBefore.forEach((player) => {
        if (!ranks[player.id]) {
          ranks[player.id] = player.rank;
        }
      });
    });

    return ranks;
  }, [roundHistory]);

  const getProgressionDisplay = (
    progression: number,
  ): { text: string; color: string } => {
    if (progression > 0) {
      return {
        text: `↑ +${progression}`,
        color: "text-green-400",
      };
    } else if (progression < 0) {
      return {
        text: `↓ ${progression}`,
        color: "text-red-400",
      };
    } else {
      return {
        text: "→ 0",
        color: "text-gray-400",
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-900/40 border-b border-gray-700/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4 w-16 text-center">Pořadí</th>
                <th className="p-4">Jméno</th>
                <th className="p-4 w-32 text-center">Start. Pořadí</th>
                <th className="p-4 w-32 text-center">Aktuální Pořadí</th>
                <th className="p-4 w-32 text-center">Progrese</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {sortedPlayers.map((player, index) => {
                const progression = playerProgression[player.id] || 0;
                const startingRank = playerStartingRanks[player.id];
                const display = getProgressionDisplay(progression);

                return (
                  <tr
                    key={player.id}
                    className="hover:bg-gray-800/30 transition-colors duration-150"
                  >
                    <td className="p-4 text-center font-bold text-indigo-400">
                      {index + 1}
                    </td>
                    <td className="p-4 font-semibold text-gray-100">
                      {player.name}
                    </td>
                    <td className="p-4 text-center text-gray-300">
                      {startingRank ? `#${startingRank}` : "—"}
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-200">
                      #{player.rank}
                    </td>
                    <td
                      className={`p-4 text-center font-bold ${display.color}`}
                    >
                      {display.text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedPlayers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-medium">
              V této lize zatím nejsou žádní hráči.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressionTab;
