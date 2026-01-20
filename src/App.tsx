import React, { useState, useEffect } from "react";
import type { Player, RoundHistoryEntry, DBPlayer, DBEvent } from "@/types";
import { LeagueManager } from "@/features/league/components";
import { Header, SetupTab } from "@/features/layout/components";
import { PlayersTab } from "@/features/players/components";
import { HistoryTab } from "@/features/rounds/components";
import { EventsTab } from "@/features/events/components";
import TabButton from "@/components/shared/TabButton";
import { Auth } from "@/features/auth/components";
import Toast from "@/components/shared/Toast";
import { ErrorBoundary } from "@/components/error";
import { useAuthStore } from "@/stores";
import { useLeagueStore } from "@/stores";
import { getSupabase } from "@/utils/supabase";
import { calculateStandings } from "@/utils/shared/statsUtils";
import { initializeCsrfToken } from "@/features/auth/utils";
import { useCsrfHandler } from "@/features/auth/hooks";
import { useNotification } from "@/hooks/useNotification";
import { useLeagueDataFetch } from "@/hooks/useLeagueDataFetch";
import { usePlayerData } from "@/features/players/hooks";
import * as eventService from "@/features/events/services";
import * as roundService from "@/features/rounds/services";

const AppContent: React.FC = () => {
  const session = useAuthStore((state) => state.session);
  const setLeagues = useLeagueStore((state) => state.setLeagues);
  const currentLeagueId = useLeagueStore((state) => state.currentLeagueId);
  const setCurrentLeagueId = useLeagueStore(
    (state) => state.setCurrentLeagueId
  );
  const setSeasons = useLeagueStore((state) => state.setSeasons);
  const currentSeasonId = useLeagueStore((state) => state.currentSeasonId);
  const setCurrentSeasonId = useLeagueStore(
    (state) => state.setCurrentSeasonId
  );
  const { toast, showToast, clearToast, handleSecurityError } =
    useNotification();
  const { executeWithCsrf } = useCsrfHandler();
  const { fetchCompleteData } = useLeagueDataFetch();
  const { addPlayer, addExistingPlayer, removePlayer, updatePlayer } =
    usePlayerData();

  const [activeTab, setActiveTab] = useState<string>("Players");
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [players, setPlayers] = useState<DBPlayer[]>([]);
  const [allGlobalPlayers, setAllGlobalPlayers] = useState<DBPlayer[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(
    new Set()
  );

  const isAuthenticated = !!session;
  const supabase = getSupabase();

  // Event and Round service wrappers
  const createEvent = (
    leagueId: string,
    title: string,
    content: string,
    pinned: boolean
  ) => eventService.createEvent({ leagueId, title, content, pinned });

  const deleteEvent = (eventId: string) =>
    eventService.deleteEvent({ eventId });

  const toggleEventPin = (eventId: string, currentPinned: boolean) =>
    eventService.toggleEventPin({ eventId, currentPinned });

  const completeRound = (
    leagueId: string,
    seasonId: string,
    finalPlayers: Player[],
    entry: RoundHistoryEntry
  ) =>
    roundService.completeRound({
      leagueId,
      seasonId,
      finalPlayers,
      entry,
    });

  const fetchData = async (
    leagueId?: string,
    seasonId?: string,
    forceRefreshLeagues = false
  ) => {
    setIsLoading(true);
    setDbError(null);

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchCompleteData(
        leagueId,
        seasonId,
        forceRefreshLeagues
      );

      setLeagues(data.leagues);
      setSeasons(data.seasons);
      setAllGlobalPlayers(data.globalPlayers);
      setPlayers(data.players);
      setEvents(data.events);
      setRoundHistory(data.roundHistory);
      setCurrentLeagueId(data.selectedLeagueId);
      setCurrentSeasonId(data.selectedSeasonId);

      if (leagueId && leagueId !== currentLeagueId) {
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
  };

  useEffect(() => {
    initializeCsrfToken();

    if (!supabase) return;

    fetchData();

    supabase.auth.getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      useAuthStore.setState({ session: currentSession });
      if (currentSession) {
        setShowLogin(false);
        setDbError(null);
        showToast("Přihlášení proběhlo úspěšně.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAddPlayers = async (names: string[]) => {
    if (!isAuthenticated || !currentLeagueId) return;

    try {
      await executeWithCsrf(async () => {
        const newPlayers: Player[] = [];
        for (const fullName of names) {
          try {
            const newPlayer = await addPlayer(currentLeagueId, fullName);
            newPlayers.push(newPlayer);
          } catch (err) {
            handleSecurityError(err);
            throw err;
          }
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
  };

  const handleAddExistingPlayer = async (playerId: string) => {
    if (!isAuthenticated || !currentLeagueId) return;

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
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!isAuthenticated || !currentLeagueId) return;

    try {
      await executeWithCsrf(async () => {
        await removePlayer(currentLeagueId, playerId);
        setPresentPlayerIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(playerId);
          return newSet;
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
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    if (!isAuthenticated || !currentLeagueId) return;

    try {
      await executeWithCsrf(async () => {
        const updated = await updatePlayer(currentLeagueId, updatedPlayer);
        setPlayers((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        showToast("Hráč byl aktualizován.");
        await fetchData();
      });
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při aktualizaci hráče.", "error");
      }
    }
  };

  const handleRoundComplete = async (
    finalPlayers: Player[],
    entry: RoundHistoryEntry
  ) => {
    if (!isAuthenticated || !currentSeasonId || !currentLeagueId) return;

    try {
      await executeWithCsrf(async () => {
        await completeRound(
          currentLeagueId,
          currentSeasonId,
          finalPlayers,
          entry
        );
        showToast("Výsledky kola byly uloženy a žebříček aktualizován.");
        await fetchData();
      });
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při ukládání kola.", "error");
      }
    }
  };

  const handleCreateEvent = async (
    title: string,
    content: string,
    pinned: boolean
  ) => {
    if (!isAuthenticated || !currentLeagueId) return;

    try {
      await executeWithCsrf(async () => {
        const newEvent = await createEvent(
          currentLeagueId,
          title,
          content,
          pinned
        );
        setEvents((prev) => [newEvent, ...prev]);
        showToast("Událost byla úspěšně vytvořena.");
        await fetchData();
      });
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při vytváření události.", "error");
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await executeWithCsrf(async () => {
        await deleteEvent(id);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        showToast("Událost byla smazána.");
        await fetchData();
      });
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při mazání události.", "error");
      }
    }
  };

  const handleToggleEventPin = async (id: string, currentPinned: boolean) => {
    if (!isAuthenticated) return;

    try {
      await executeWithCsrf(async () => {
        const updatedEvent = await toggleEventPin(id, currentPinned);
        setEvents((prev) =>
          prev
            .map((e) => (e.id === id ? updatedEvent : e))
            .sort((a, b) => {
              if (a.pinned === b.pinned) return 0;
              return a.pinned ? -1 : 1;
            })
        );
        showToast(
          currentPinned ? "Událost byla odepnuta." : "Událost byla připnuta."
        );
        await fetchData();
      });
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při změně připnutí.", "error");
      }
    }
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );

    if (dbError)
      return (
        <div className="bg-red-900/50 p-6 rounded-2xl text-red-100 flex flex-col items-center gap-4 max-w-lg mx-auto border border-red-500/30">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-center font-medium">{dbError}</span>
          <div className="flex gap-4">
            <button
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition-colors font-bold"
              onClick={() => fetchData()}
            >
              Zkusit znovu
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl transition-colors font-bold shadow-lg"
              onClick={() => setShowLogin(true)}
            >
              Znovu přihlásit
            </button>
          </div>
        </div>
      );

    return (
      <div className="tab-content-enter-active">
        {activeTab === "Events" && (
          <ErrorBoundary
            componentName="EventsTab"
            onError={(error, errorInfo, errorId) => {
              console.error(`EventsTab error [${errorId}]:`, error, errorInfo);
              showToast("Chyba při načítání událostí. ID: " + errorId, "error");
            }}
          >
            <EventsTab
              events={events}
              isAuthenticated={isAuthenticated}
              onAddEvent={handleCreateEvent}
              onDeleteEvent={handleDeleteEvent}
              onTogglePin={handleToggleEventPin}
            />
          </ErrorBoundary>
        )}
        {activeTab === "League" && isAuthenticated && (
          <ErrorBoundary
            componentName="LeagueManager"
            onError={(error, errorInfo, errorId) => {
              console.error(
                `LeagueManager error [${errorId}]:`,
                error,
                errorInfo
              );
              showToast("Chyba v manageru ligy. ID: " + errorId, "error");
            }}
          >
            <LeagueManager
              allPlayers={players as Player[]}
              presentPlayerIds={presentPlayerIds}
              setPresentPlayerIds={setPresentPlayerIds}
              onRoundComplete={handleRoundComplete}
            />
          </ErrorBoundary>
        )}
        {activeTab === "Players" && (
          <ErrorBoundary
            componentName="PlayersTab"
            onError={(error, errorInfo, errorId) => {
              console.error(`PlayersTab error [${errorId}]:`, error, errorInfo);
              showToast("Chyba při načítání hráčů. ID: " + errorId, "error");
            }}
          >
            <PlayersTab
              players={players as Player[]}
              calculatedStats={
                calculateStandings(players as Player[], roundHistory).stats
              }
              calculatedStreaks={
                calculateStandings(players as Player[], roundHistory).streaks
              }
              onRemovePlayer={handleRemovePlayer}
              onUpdatePlayer={handleUpdatePlayer}
              isAuthenticated={isAuthenticated}
            />
          </ErrorBoundary>
        )}
        {activeTab === "History" && (
          <ErrorBoundary
            componentName="HistoryTab"
            onError={(error, errorInfo, errorId) => {
              console.error(`HistoryTab error [${errorId}]:`, error, errorInfo);
              showToast("Chyba při načítání historie. ID: " + errorId, "error");
            }}
          >
            <HistoryTab
              roundHistory={roundHistory}
              isAuthenticated={isAuthenticated}
            />
          </ErrorBoundary>
        )}
        {activeTab === "Setup" && isAuthenticated && (
          <ErrorBoundary
            componentName="SetupTab"
            onError={(error, errorInfo, errorId) => {
              console.error(`SetupTab error [${errorId}]:`, error, errorInfo);
              showToast("Chyba při nastavení. ID: " + errorId, "error");
            }}
          >
            <SetupTab
              currentLeagueId={currentLeagueId}
              onRefresh={() => fetchData(undefined, undefined, true)}
              onLeagueSelect={(id: string) => fetchData(id, undefined)}
              onAddPlayers={handleAddPlayers}
              allGlobalPlayers={allGlobalPlayers}
              playersInCurrentLeague={players as Player[]}
              onAddExistingPlayer={handleAddExistingPlayer}
            />
          </ErrorBoundary>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500/30">
      <ErrorBoundary
        componentName="Header"
        onError={(error, errorInfo, errorId) => {
          console.error(`Header error [${errorId}]:`, error, errorInfo);
          showToast("Chyba v hlavičce. ID: " + errorId, "error");
        }}
      >
        <Header
          isAuthenticated={isAuthenticated}
          userEmail={session?.user?.email}
          onSignInClick={() => setShowLogin(true)}
          onLeagueChange={(id: string) => fetchData(id, undefined)}
          onSeasonChange={(id: string) => fetchData(undefined, id)}
        />
      </ErrorBoundary>
      <main className="container mx-auto p-4 md:p-8">
        {showLogin ? (
          <ErrorBoundary
            componentName="Auth"
            onError={(error, errorInfo, errorId) => {
              console.error(`Auth error [${errorId}]:`, error, errorInfo);
              showToast("Chyba při přihlášení. ID: " + errorId, "error");
            }}
          >
            <Auth onCancel={() => setShowLogin(false)} />
          </ErrorBoundary>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-gray-700/50 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <TabButton
                label="Žebříček"
                isActive={activeTab === "Players"}
                onClick={() => setActiveTab("Players")}
              />
              <TabButton
                label="Události"
                isActive={activeTab === "Events"}
                onClick={() => setActiveTab("Events")}
              />
              <TabButton
                label="Výsledky"
                isActive={activeTab === "History"}
                onClick={() => setActiveTab("History")}
              />
              {isAuthenticated && (
                <>
                  <TabButton
                    label="Správa kol"
                    isActive={activeTab === "League"}
                    onClick={() => setActiveTab("League")}
                  />
                  <TabButton
                    label="Nastavení"
                    isActive={activeTab === "Setup"}
                    onClick={() => setActiveTab("Setup")}
                  />
                </>
              )}
            </div>
            {renderContent()}
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => clearToast()}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const setSession = useAuthStore((state) => state.setSession);

  const supabase = getSupabase();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) =>
        setSession(currentSession)
      );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase, setSession]);

  return (
    <ErrorBoundary
      componentName="App (Global)"
      onError={(error, errorInfo, errorId) => {
        console.error(`Global App error [${errorId}]:`, error, errorInfo);
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
