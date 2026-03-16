import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { DBEvent } from "@/types";
import * as eventService from "@/features/events/services";
import { useAuthStore, useLeagueStore } from "@/stores";

type NotificationHandlers = {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  handleSecurityError: (err: unknown) => boolean;
};

interface UseEventActionsOptions extends NotificationHandlers {
  setEvents: Dispatch<SetStateAction<DBEvent[]>>;
  fetchData: (
    leagueId?: string,
    seasonId?: string,
    forceRefresh?: boolean,
  ) => Promise<void>;
  executeWithCsrf: (fn: () => Promise<void>) => Promise<void | null>;
}

/**
 * Wraps event mutation service calls with auth guard, CSRF execution,
 * optimistic local state update, toast notification, and data refresh.
 */
export function useEventActions({
  setEvents,
  fetchData,
  executeWithCsrf,
  showToast,
  handleSecurityError,
}: UseEventActionsOptions) {
  const handleCreateEvent = useCallback(
    async (title: string, content: string, pinned: boolean) => {
      const { currentLeagueId } = useLeagueStore.getState();
      if (!useAuthStore.getState().session || !currentLeagueId) return;

      try {
        await executeWithCsrf(async () => {
          const newEvent = await eventService.createEvent({
            leagueId: currentLeagueId,
            title,
            content,
            pinned,
          });
          setEvents((prev) => [newEvent, ...prev]);
          showToast("Událost byla úspěšně vytvořena.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při vytváření události.", "error");
        }
      }
    },
    [executeWithCsrf, fetchData, handleSecurityError, setEvents, showToast],
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      if (!useAuthStore.getState().session) return;

      try {
        await executeWithCsrf(async () => {
          await eventService.deleteEvent({ eventId: id });
          setEvents((prev) => prev.filter((e) => e.id !== id));
          showToast("Událost byla smazána.");
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při mazání události.", "error");
        }
      }
    },
    [executeWithCsrf, fetchData, handleSecurityError, setEvents, showToast],
  );

  const handleToggleEventPin = useCallback(
    async (id: string, currentPinned: boolean) => {
      if (!useAuthStore.getState().session) return;

      try {
        await executeWithCsrf(async () => {
          const updatedEvent = await eventService.toggleEventPin({
            eventId: id,
            currentPinned,
          });
          setEvents((prev) =>
            prev
              .map((e) => (e.id === id ? updatedEvent : e))
              .sort((a, b) => {
                if (a.pinned === b.pinned) return 0;
                return a.pinned ? -1 : 1;
              }),
          );
          showToast(
            currentPinned ? "Událost byla odepnuta." : "Událost byla připnuta.",
          );
          await fetchData();
        });
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          showToast("Chyba při změně připnutí.", "error");
        }
      }
    },
    [executeWithCsrf, fetchData, handleSecurityError, setEvents, showToast],
  );

  return { handleCreateEvent, handleDeleteEvent, handleToggleEventPin };
}
