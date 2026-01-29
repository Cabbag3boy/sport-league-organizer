import React from "react";
import type { DBPlayer, Player } from "@/types";
import { PlayerManagementSection } from "../../players/components";
import { LeagueSection } from "../../league/components";
import { SeasonSection } from "../../seasons/components";

interface SetupTabProps {
  currentLeagueId: string | null;
  onRefresh: () => Promise<void>;
  onLeagueSelect: (id: string) => Promise<void>;
  onAddPlayers: (names: string[]) => Promise<void>;
  allGlobalPlayers: DBPlayer[];
  playersInCurrentLeague: Player[];
  onAddExistingPlayer: (playerId: string) => Promise<void>;
}

const SetupTab: React.FC<SetupTabProps> = ({
  onRefresh,
  onLeagueSelect,
  onAddPlayers,
  allGlobalPlayers,
  playersInCurrentLeague,
  onAddExistingPlayer,
}) => {
  return (
    <div className="space-y-12 pb-12">
      <PlayerManagementSection
        onAddPlayers={onAddPlayers}
        allGlobalPlayers={allGlobalPlayers}
        playersInCurrentLeague={playersInCurrentLeague}
        onAddExistingPlayer={onAddExistingPlayer}
      />

      <LeagueSection onLeagueSelect={onLeagueSelect} onRefresh={onRefresh} />

      <SeasonSection onRefresh={onRefresh} />
    </div>
  );
};

export default SetupTab;
