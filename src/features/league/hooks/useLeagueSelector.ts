import type { DBLeague } from "../../types";

export const useLeagueSelector = (
  leagues: DBLeague[],
  currentLeagueId: string | null
) => {
  const currentLeague =
    leagues.find((l) => l.id === currentLeagueId) || leagues[0];

  return {
    currentLeague,
    getLeagueLabel: (league: DBLeague) => league.name,
    getLeagueId: (league: DBLeague) => league.id,
  };
};

export type { DBLeague } from "../../types";

