import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DBLeague, DBSeason } from "../types";

interface LeagueState {
  leagues: DBLeague[];
  currentLeagueId: string | null;
  seasons: DBSeason[];
  currentSeasonId: string | null;
  activeTab: string;

  // Actions
  setLeagues: (leagues: DBLeague[]) => void;
  setCurrentLeagueId: (id: string | null) => void;
  setSeasons: (seasons: DBSeason[]) => void;
  setCurrentSeasonId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const useLeagueStore = create<LeagueState>()(
  devtools(
    persist(
      (set) => ({
        leagues: [],
        currentLeagueId: null,
        seasons: [],
        currentSeasonId: null,
        activeTab: "Players",

        setLeagues: (leagues) => set({ leagues }),
        setCurrentLeagueId: (currentLeagueId) => set({ currentLeagueId }),
        setSeasons: (seasons) => set({ seasons }),
        setCurrentSeasonId: (currentSeasonId) => set({ currentSeasonId }),
        setActiveTab: (activeTab) => set({ activeTab }),
      }),
      {
        name: "league-store",
        // Prevent unnecessary re-renders from rehydration
        onRehydrateStorage: () => (state) => {
          // Rehydration hook - state is already restored from localStorage
          // No need to manually update anything
        },
      },
    ),
    { name: "LeagueStore" },
  ),
);
