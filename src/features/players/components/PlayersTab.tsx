import React, { useMemo, useState } from "react";
import type { Player, Streaks, PlayerStats, RoundHistoryEntry } from "@/types";
import { PlayerStatsRow } from "./index";
import ProgressionTab from "./ProgressionTab";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface PlayersTabProps {
  players: Player[];
  calculatedStats: Record<string, PlayerStats>;
  calculatedStreaks: Record<string, Streaks>;
  roundHistory?: RoundHistoryEntry[];
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (player: Player) => void;
  isAuthenticated: boolean;
}

const PlayersTab: React.FC<PlayersTabProps> = ({
  players,
  calculatedStats,
  calculatedStreaks,
  roundHistory = [],
  onRemovePlayer,
  onUpdatePlayer,
  isAuthenticated,
}) => {
  const [playerIdToRemove, setPlayerIdToRemove] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "progression">(
    "stats",
  );

  const playerToRemove = useMemo(
    () => players.find((p) => p.id === playerIdToRemove) || null,
    [players, playerIdToRemove],
  );

  const handleConfirmRemove = () => {
    if (playerIdToRemove !== null && isAuthenticated) {
      onRemovePlayer(playerIdToRemove);
      setPlayerIdToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!playerToRemove}
        title="Potvrdit odebrání"
        message={`Opravdu chcete odebrat hráče ${playerToRemove?.name}? Tuto akci nelze vzít zpět.`}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPlayerIdToRemove(null)}
        confirmText="Odebrat"
        cancelText="Zrušit"
      />

      {/* Sub-tabs for Players section */}
      <div className="flex gap-2 border-b border-gray-700/50">
        <button
          onClick={() => setActiveSubTab("stats")}
          className={`px-4 py-2 font-semibold transition-colors duration-150 ${
            activeSubTab === "stats"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Liga
        </button>
        <button
          onClick={() => setActiveSubTab("progression")}
          className={`px-4 py-2 font-semibold transition-colors duration-150 ${
            activeSubTab === "progression"
              ? "text-indigo-400 border-b-2 border-indigo-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Skokan
        </button>
      </div>

      {/* Stats Tab */}
      {activeSubTab === "stats" && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-900/40 border-b border-gray-700/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="p-4 w-16 text-center">Pořadí</th>
                  <th className="p-4">Jméno</th>
                  <th className="p-4 w-20 text-center">Výhry</th>
                  <th className="p-4 w-20 text-center">Prohry</th>
                  <th className="p-4 w-24 text-center">Zápasy</th>
                  <th className="p-4 w-28 text-center" colSpan={2}>
                    Série
                  </th>
                  {isAuthenticated && (
                    <th className="p-4 w-24 text-center">Akce</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {players.map((player) => (
                  <PlayerStatsRow
                    key={player.id}
                    player={player}
                    stats={
                      calculatedStats[player.id] || {
                        wins: 0,
                        losses: 0,
                        matches: 0,
                      }
                    }
                    streaks={
                      calculatedStreaks[player.id] || {
                        winStreak: 0,
                        lossStreak: 0,
                      }
                    }
                    onUpdate={onUpdatePlayer}
                    onRemove={(id: string) =>
                      isAuthenticated && setPlayerIdToRemove(id)
                    }
                    isAuthenticated={isAuthenticated}
                    totalPlayersInLeague={players.length}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {players.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-500 font-medium">
                V této lize zatím nejsou žádní hráči.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progression Tab */}
      {activeSubTab === "progression" && (
        <ProgressionTab players={players} roundHistory={roundHistory} />
      )}
    </div>
  );
};

export default PlayersTab;
