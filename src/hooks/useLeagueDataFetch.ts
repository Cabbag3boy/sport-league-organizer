import { useCallback } from "react";
import type {
  DBLeague,
  DBSeason,
  DBPlayer,
  Player,
  DBEvent,
  RoundHistoryEntry,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
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

type ApiErrorPayload = {
  error?: string;
};

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

        const supabase = getSupabase();
        const headers: Record<string, string> = {};

        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }
        }

        const url = `/api/league/bootstrap${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as Partial<FetchCompleteDataResult> &
          ApiErrorPayload;

        if (!response.ok) {
          throw new Error(payload.error || "Nepodařilo se načíst data.");
        }

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
