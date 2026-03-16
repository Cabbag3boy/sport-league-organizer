import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { DBPlayer, DBEvent, RoundHistoryEntry } from "@/types";
import { useLeagueStore } from "@/stores";
import { useLeagueDataFetch } from "@/hooks/useLeagueDataFetch";
import type { BootstrapLeagueData } from "@/features/league/services/bootstrapService";

interface UseBootstrapRefreshOptions {
  setShowLogin: (v: boolean) => void;
  handleSecurityError: (err: unknown) => boolean;
  setPresentPlayerIds: Dispatch<SetStateAction<Set<string>>>;
  initialData?: BootstrapLeagueData | null;
}

export interface BootstrapRefreshResult {
  isLoading: boolean;
  dbError: string | null;
  setDbError: Dispatch<SetStateAction<string | null>>;
  players: DBPlayer[];
  setPlayers: Dispatch<SetStateAction<DBPlayer[]>>;
  allGlobalPlayers: DBPlayer[];
  events: DBEvent[];
  setEvents: Dispatch<SetStateAction<DBEvent[]>>;
  roundHistory: RoundHistoryEntry[];
  fetchData: (
    leagueId?: string,
    seasonId?: string,
    forceRefreshLeagues?: boolean,
  ) => Promise<void>;
  runInitialFallbackBootstrap: () => void;
}

/**
 * Manages the full bootstrap data lifecycle: fetching, loading state, error state,
 * and hydrating the league/season store after each successful fetch.
 */
export function useBootstrapRefresh({
  setShowLogin,
  handleSecurityError,
  setPresentPlayerIds,
  initialData,
}: UseBootstrapRefreshOptions): BootstrapRefreshResult {
  const [players, setPlayers] = useState<DBPlayer[]>(
    initialData?.players || [],
  );
  const [allGlobalPlayers, setAllGlobalPlayers] = useState<DBPlayer[]>(
    initialData?.globalPlayers || [],
  );
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>(
    initialData?.roundHistory || [],
  );
  const [events, setEvents] = useState<DBEvent[]>(initialData?.events || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [dbError, setDbError] = useState<string | null>(null);
  const initialFallbackBootstrapDoneRef = useRef(false);

  const setLeagues = useLeagueStore((s) => s.setLeagues);
  const setSeasons = useLeagueStore((s) => s.setSeasons);
  const setCurrentLeagueId = useLeagueStore((s) => s.setCurrentLeagueId);
  const setCurrentSeasonId = useLeagueStore((s) => s.setCurrentSeasonId);

  const applyServerBootstrapToStore = useCallback(() => {
    if (!initialData) return;

    setLeagues(initialData.leagues);
    setSeasons(initialData.seasons);
    setCurrentLeagueId(initialData.selectedLeagueId || null);
    setCurrentSeasonId(initialData.selectedSeasonId || null);

    const { activeTab, setActiveTab } = useLeagueStore.getState();
    const validTabs = ["Players", "Events", "History", "League", "Setup"];
    if (!activeTab || !validTabs.includes(activeTab)) {
      setActiveTab("Players");
    }
  }, [
    initialData,
    setCurrentLeagueId,
    setCurrentSeasonId,
    setLeagues,
    setSeasons,
  ]);

  const { fetchCompleteData } = useLeagueDataFetch();

  useEffect(() => {
    if (!initialData) return;

    // Apply immediately and again after persist rehydration to avoid stale
    // localStorage state overriding fresh server bootstrap data.
    applyServerBootstrapToStore();

    const persistApi = (
      useLeagueStore as unknown as {
        persist?: {
          hasHydrated?: () => boolean;
          onFinishHydration?: (cb: () => void) => () => void;
        };
      }
    ).persist;

    const unsubscribe = persistApi?.onFinishHydration?.(() => {
      applyServerBootstrapToStore();
    });

    if (persistApi?.hasHydrated?.()) {
      applyServerBootstrapToStore();
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [initialData, applyServerBootstrapToStore]);

  const fetchData = useCallback(
    async (
      leagueId?: string,
      seasonId?: string,
      forceRefreshLeagues = false,
    ) => {
      // Capture before update so we can detect a league switch.
      const prevLeagueId = useLeagueStore.getState().currentLeagueId;

      setIsLoading(true);
      setDbError(null);

      try {
        const data = await fetchCompleteData(
          leagueId,
          seasonId,
          forceRefreshLeagues,
        );

        setLeagues(data.leagues);
        setSeasons(data.seasons);
        setAllGlobalPlayers(data.globalPlayers);
        setPlayers(data.players);
        setEvents(data.events);
        setRoundHistory(data.roundHistory);
        setCurrentLeagueId(data.selectedLeagueId);
        setCurrentSeasonId(data.selectedSeasonId);

        if (leagueId && leagueId !== prevLeagueId) {
          setPresentPlayerIds(new Set());
        }
      } catch (err: unknown) {
        if (handleSecurityError(err)) {
          setShowLogin(true);
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          setDbError(msg || "Nepodařilo se načíst data.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchCompleteData,
      handleSecurityError,
      setLeagues,
      setSeasons,
      setCurrentLeagueId,
      setCurrentSeasonId,
      setShowLogin,
      setPresentPlayerIds,
    ],
  );

  const runInitialFallbackBootstrap = useCallback(() => {
    if (initialData) return;
    if (initialFallbackBootstrapDoneRef.current) return;
    initialFallbackBootstrapDoneRef.current = true;

    const { activeTab, setActiveTab } = useLeagueStore.getState();
    const validTabs = ["Players", "Events", "History", "League", "Setup"];
    if (!activeTab || !validTabs.includes(activeTab)) {
      setActiveTab("Players");
    }

    fetchData(undefined, undefined, true);
  }, [fetchData, initialData]);

  return {
    isLoading,
    dbError,
    setDbError,
    players,
    setPlayers,
    allGlobalPlayers,
    events,
    setEvents,
    roundHistory,
    fetchData,
    runInitialFallbackBootstrap,
  };
}
