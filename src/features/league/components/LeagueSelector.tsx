import React from "react";
import Dropdown from "@/components/shared/Dropdown";
import { useLeagueSelector } from "../hooks";
import type { DBLeague } from "@/types";

interface LeagueSelectorProps {
  leagues: DBLeague[];
  currentLeagueId: string | null;
  onLeagueChange: (id: string) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  leagues,
  currentLeagueId,
  onLeagueChange,
}) => {
  const { getLeagueLabel, getLeagueId } = useLeagueSelector(
    leagues,
    currentLeagueId
  );

  return (
    <Dropdown
      items={leagues}
      selectedId={currentLeagueId}
      onSelect={onLeagueChange}
      getLabel={getLeagueLabel}
      getId={getLeagueId}
      placeholder="Vybrat ligu"
      className="w-full md:w-64"
    />
  );
};

export default LeagueSelector;
