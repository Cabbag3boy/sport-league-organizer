import React, { useMemo, useCallback } from "react";
import type { Player } from "../../../types";
import PlayerCard from "./PlayerCard";

interface PlayerSelectionPanelProps {
  allPlayers: Player[];
  presentPlayerIds: Set<string>;
  onPlayerToggle: (playerId: string) => void;
  rankChanges: Record<string, "up" | "down" | null>;
}

const PlayerSelectionPanel: React.FC<PlayerSelectionPanelProps> = ({
  allPlayers,
  presentPlayerIds,
  onPlayerToggle,
  rankChanges,
}) => {
  const presentPlayersCount = useMemo(
    () => Array.from(presentPlayerIds).length,
    [presentPlayerIds]
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-400 text-center mb-4">
        Vyberte hráče pro toto kolo
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isPresent={presentPlayerIds.has(player.id)}
            onToggle={onPlayerToggle}
            rankChange={rankChanges[player.id] || null}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerSelectionPanel;

