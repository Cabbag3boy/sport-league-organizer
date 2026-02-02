import { useAuthStore } from "../authStore";
import { useLeagueStore } from "../leagueStore";

/**
 * Reset auth store to initial state for test isolation
 */
export const resetAuthStore = () => {
  useAuthStore.setState({
    session: null,
  });
};

/**
 * Reset league store to initial state for test isolation
 */
export const resetLeagueStore = () => {
  useLeagueStore.setState({
    leagues: [],
    currentLeagueId: null,
    seasons: [],
    currentSeasonId: null,
    activeTab: "Players",
  });
};

/**
 * Reset all stores for test isolation
 */
export const resetAllStores = () => {
  resetAuthStore();
  resetLeagueStore();
};
