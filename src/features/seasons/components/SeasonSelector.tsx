import React from "react";
import Dropdown from "@/components/shared/Dropdown";
import { useSeasonSelector } from "../hooks";
import type { DBSeason } from "@/types";

interface SeasonSelectorProps {
  seasons: DBSeason[];
  currentSeasonId: string | null;
  onSeasonChange: (id: string) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  currentSeasonId,
  onSeasonChange,
}) => {
  const { getSeasonLabel, getSeasonId } = useSeasonSelector(
    seasons,
    currentSeasonId
  );

  return (
    <Dropdown
      items={seasons}
      selectedId={currentSeasonId}
      onSelect={onSeasonChange}
      getLabel={getSeasonLabel}
      getId={getSeasonId}
      placeholder="Vybrat sezónu"
      className="w-full md:w-56"
    />
  );
};

export default SeasonSelector;
