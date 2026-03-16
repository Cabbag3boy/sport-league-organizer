import { useCallback } from "react";
import type {
  DBLeague,
  DBSeason,
  DBPlayer,
  Player,
  DBEvent,
  RoundHistoryEntry,
} from "@/types";
import { useNotification } from "@/hooks/useNotification";
import { useServiceError } from "@/utils/shared/serviceErrorHandler";
import { apiFetch } from "@/utils/apiClient";

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
      _forceRefreshLeagues = false,
    ): Promise<FetchCompleteDataResult> => {
      try {
        const params = new URLSearchParams();
        if (leagueId) params.set("leagueId", leagueId);
        if (seasonId) params.set("seasonId", seasonId);

        const url = `/api/league/bootstrap${params.toString() ? `?${params.toString()}` : ""}`;
        const payload = await apiFetch<Partial<FetchCompleteDataResult>>(url);

        return {
          leagues: payload.leagues || [],
          seasons: payload.seasons || [],
          globalPlayers: payload.globalPlayers || [],
          players: payload.players || [],
          events: payload.events || [],
          roundHistory: payload.roundHistory || [],
          selectedLeagueId: payload.selectedLeagueId || "",
          selectedSeasonId: payload.selectedSeasonId || "",
        };
      } catch (error) {
        notifyError(error, "Nepodařilo se načíst data.");
        throw error;
      }
    },
    [notifyError],
  );

  return { fetchCompleteData };
};
