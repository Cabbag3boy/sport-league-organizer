import type { DBSeason } from "../../../types";

export const useSeasonSelector = (
  seasons: DBSeason[],
  currentSeasonId: string | null
) => {
  const currentSeason =
    seasons.find((s) => s.id === currentSeasonId) || seasons[0];

  return {
    currentSeason,
    getSeasonLabel: (season: DBSeason) => season.name,
    getSeasonId: (season: DBSeason) => season.id,
  };
};

export type { DBSeason } from "../../../types";

