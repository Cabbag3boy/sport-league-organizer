import React from "react";
import LeagueSelector from "../../league/components/LeagueSelector";
import SeasonSelector from "../../seasons/components/SeasonSelector";
import type { DBLeague, DBSeason } from "../../../types";

interface DesktopNavProps {
  leagues: DBLeague[];
  currentLeagueId: string | null;
  onLeagueChange: (id: string) => void;
  seasons: DBSeason[];
  currentSeasonId: string | null;
  onSeasonChange: (id: string) => void;
}

const DesktopNav: React.FC<DesktopNavProps> = ({
  leagues,
  currentLeagueId,
  onLeagueChange,
  seasons,
  currentSeasonId,
  onSeasonChange,
}) => {
  return (
    <div className="hidden lg:flex items-center gap-4 flex-grow justify-center">
      <LeagueSelector
        leagues={leagues}
        currentLeagueId={currentLeagueId}
        onLeagueChange={onLeagueChange}
      />
      <SeasonSelector
        seasons={seasons}
        currentSeasonId={currentSeasonId}
        onSeasonChange={onSeasonChange}
      />
    </div>
  );
};

export default DesktopNav;

