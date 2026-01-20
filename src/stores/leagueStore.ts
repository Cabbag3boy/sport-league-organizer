import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DBLeague, DBSeason } from "../types";

interface LeagueState {
  leagues: DBLeague[];
  currentLeagueId: string | null;
  seasons: DBSeason[];
  currentSeasonId: string | null;

  // Actions
  setLeagues: (leagues: DBLeague[]) => void;
  setCurrentLeagueId: (id: string | null) => void;
  setSeasons: (seasons: DBSeason[]) => void;
  setCurrentSeasonId: (id: string | null) => void;
}

export const useLeagueStore = create<LeagueState>()(
  devtools(
    persist(
      (set) => ({
        leagues: [],
        currentLeagueId: null,
        seasons: [],
        currentSeasonId: null,

        setLeagues: (leagues) => set({ leagues }),
        setCurrentLeagueId: (currentLeagueId) => set({ currentLeagueId }),
        setSeasons: (seasons) => set({ seasons }),
        setCurrentSeasonId: (currentSeasonId) => set({ currentSeasonId }),
      }),
      {
        name: "league-store",
      }
    ),
    { name: "LeagueStore" }
  )
);

