import { useCallback } from "react";
import type { Player, RoundHistoryEntry } from "@/types";
import * as roundService from "@/features/rounds/services";
import { useAuthStore, useLeagueStore } from "@/stores";

type NotificationHandlers = {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  handleSecurityError: (err: unknown) => boolean;
};

interface UseRoundActionsOptions extends NotificationHandlers {
  fetchData: (
    leagueId?: string,
    seasonId?: string,
    forceRefresh?: boolean,
  ) => Promise<void>;
  executeWithCsrf: (fn: () => Promise<void>) => Promise<void | null>;
}

/**
 * Wraps round mutation service calls with auth guard, CSRF execution,
 * toast notification, and data refresh.
 */
export function useRoundActions({
  fetchData,
  executeWithCsrf,
  showToast,
  handleSecurityError,
}: UseRoundActionsOptions) {
  const handleRoundComplete = useCallback(
    async (finalPlayers: Player[], entry: RoundHistoryEntry) => {
      const { currentLeagueId, currentSeasonId } = useLeagueStore.getState();
      if (
        !useAuthStore.getState().session ||
        !currentLeagueId ||
        !currentSeasonId
      )
        return;

      try {
        await executeWithCsrf(async () => {
          await roundService.completeRound({
            leagueId: currentLeagueId,
            seasonId: currentSeasonId,
            finalPlayers,
            entry,
          });
          showToast("Výsledky kola byly uloženy a žebříček aktualizován.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při ukládání kola.", "error");
        }
      }
    },
    [executeWithCsrf, fetchData, handleSecurityError, showToast],
  );

  return { handleRoundComplete };
}
