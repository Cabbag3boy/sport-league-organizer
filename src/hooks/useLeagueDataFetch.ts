import { useCallback } from "react";
import type {
  DBLeague,
  DBSeason,
  DBPlayer,
  Player,
  DBEvent,
  RoundHistoryEntry,
} from "@/types";
import {
  fetchLeagues,
  fetchSeasons,
  fetchGlobalPlayers,
} from "@/features/league/services";
import { fetchAllPlayers } from "@/features/players/services";
import { fetchEvents } from "@/features/events/services";
import { fetchRoundHistory } from "@/features/rounds/services";
import { useNotification } from "@/hooks/useNotification";
import { useServiceError } from "@/utils/shared/serviceErrorHandler";

interface FetchCompleteDataResult {
  leagues: DBLeague[];
  seasons: DBSeason[];
  globalPlayers: DBPlayer[];
  players: Player[];
  events: DBEvent[];
  roundHistory: RoundHistoryEntry[];
  selectedLeagueId: string;
  selectedSeasonId: string;
}

export const useLeagueDataFetch = () => {
  const { showToast } = useNotification();
  const { notifyError } = useServiceError(showToast);

  const fetchCompleteData = useCallback(
    async (
      leagueId?: string,
      seasonId?: string,
      _forceRefreshLeagues = false
    ): Promise<FetchCompleteDataResult> => {
      try {
        // Fetch all leagues
        const leagues = await fetchLeagues();
        const selectedLeagueId = leagueId || leagues[0]?.id || "";

        // Fetch global players
        const globalPlayers = await fetchGlobalPlayers();

        let seasons: DBSeason[] = [];
        let players: Player[] = [];
        let events: DBEvent[] = [];
        let roundHistory: RoundHistoryEntry[] = [];

        // Fetch seasons if we have a selected league
        if (selectedLeagueId) {
          seasons = await fetchSeasons(selectedLeagueId);
          const selectedSeasonId = seasonId || seasons[0]?.id || "";

          // Fetch league-level events
          try {
            events = await fetchEvents(selectedLeagueId);
          } catch (error) {
            notifyError(error, "Nepodařilo se načíst události.");
            events = [];
          }

          // Fetch season-specific data if we have a season
          if (selectedSeasonId) {
            try {
              [players, roundHistory] = await Promise.all([
                fetchAllPlayers(selectedLeagueId),
                fetchRoundHistory(selectedSeasonId),
              ]);
            } catch (error) {
              notifyError(
                error,
                "Nepodařilo se načíst data o hráčích a zápasech."
              );
              // Continue with empty arrays if fetch fails
              players = [];
              roundHistory = [];
            }
          }

          return {
            leagues,
            seasons,
            globalPlayers,
            players,
            events,
            roundHistory,
            selectedLeagueId,
            selectedSeasonId: seasonId || seasons[0]?.id || "",
          };
        }

        return {
          leagues,
          seasons: [],
          globalPlayers,
          players: [],
          events: [],
          roundHistory: [],
          selectedLeagueId,
          selectedSeasonId: "",
        };
      } catch (error) {
        notifyError(error, "Nepodařilo se načíst data.");
        throw error;
      }
    },
    [notifyError]
  );

  return { fetchCompleteData };
};
