import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Player, DBPlayer } from "@/types";
import { usePlayerData } from "./usePlayerData";
import { useAuthStore, useLeagueStore } from "@/stores";

type NotificationHandlers = {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  handleSecurityError: (err: unknown) => boolean;
};

interface UsePlayerActionsOptions extends NotificationHandlers {
  setPlayers: Dispatch<SetStateAction<DBPlayer[]>>;
  setPresentPlayerIds: Dispatch<SetStateAction<Set<string>>>;
  fetchData: (
    leagueId?: string,
    seasonId?: string,
    forceRefresh?: boolean,
  ) => Promise<void>;
  executeWithCsrf: (fn: () => Promise<void>) => Promise<void | null>;
}

/**
 * Wraps player mutation service calls with auth guard, CSRF execution,
 * optimistic local state update, toast notification, and data refresh.
 */
export function usePlayerActions({
  setPlayers,
  setPresentPlayerIds,
  fetchData,
  executeWithCsrf,
  showToast,
  handleSecurityError,
}: UsePlayerActionsOptions) {
  const { addPlayer, addExistingPlayer, removePlayer, updatePlayer } =
    usePlayerData();

  const handleAddPlayers = useCallback(
    async (names: string[]) => {
      const { currentLeagueId } = useLeagueStore.getState();
      if (!useAuthStore.getState().session || !currentLeagueId) return;

      try {
        await executeWithCsrf(async () => {
          const newPlayers: Player[] = [];
          for (const fullName of names) {
            const newPlayer = await addPlayer(currentLeagueId, fullName);
            newPlayers.push(newPlayer);
          }
          setPlayers((prev) => [...prev, ...newPlayers]);
          showToast(`${names.length} hráč(ů) byl úspěšně přidán.`);
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při přidávání hráčů.", "error");
        }
      }
    },
    [
      addPlayer,
      executeWithCsrf,
      fetchData,
      handleSecurityError,
      setPlayers,
      showToast,
    ],
  );

  const handleAddExistingPlayer = useCallback(
    async (playerId: string) => {
      const { currentLeagueId } = useLeagueStore.getState();
      if (!useAuthStore.getState().session || !currentLeagueId) return;

      try {
        await executeWithCsrf(async () => {
          const newPlayer = await addExistingPlayer(currentLeagueId, playerId);
          setPlayers((prev) => [...prev, newPlayer]);
          showToast("Hráč byl úspěšně přidán do ligy.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při přidávání hráče.", "error");
        }
      }
    },
    [
      addExistingPlayer,
      executeWithCsrf,
      fetchData,
      handleSecurityError,
      setPlayers,
      showToast,
    ],
  );

  const handleRemovePlayer = useCallback(
    async (playerId: string) => {
      const { currentLeagueId } = useLeagueStore.getState();
      if (!useAuthStore.getState().session || !currentLeagueId) return;

      try {
        await executeWithCsrf(async () => {
          await removePlayer(currentLeagueId, playerId);
          setPresentPlayerIds((prev) => {
            const next = new Set(prev);
            next.delete(playerId);
            return next;
          });
          setPlayers((prev) => prev.filter((p) => p.id !== playerId));
          showToast("Hráč byl odebrán z aktuální ligy.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při odebírání hráče.", "error");
        }
      }
    },
    [
      removePlayer,
      executeWithCsrf,
      fetchData,
      handleSecurityError,
      setPlayers,
      setPresentPlayerIds,
      showToast,
    ],
  );

  const handleUpdatePlayer = useCallback(
    async (updatedPlayer: Player) => {
      const { currentLeagueId } = useLeagueStore.getState();
      if (!useAuthStore.getState().session || !currentLeagueId) return;

      try {
        await executeWithCsrf(async () => {
          const updated = await updatePlayer(currentLeagueId, updatedPlayer);
          setPlayers((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
          showToast("Hráč byl aktualizován.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při aktualizaci hráče.", "error");
        }
      }
    },
    [
      updatePlayer,
      executeWithCsrf,
      fetchData,
      handleSecurityError,
      setPlayers,
      showToast,
    ],
  );

  return {
    handleAddPlayers,
    handleAddExistingPlayer,
    handleRemovePlayer,
    handleUpdatePlayer,
  };
}
