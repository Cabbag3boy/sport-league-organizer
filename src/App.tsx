import React, { useState } from "react";
import type { Player } from "@/types";
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
import { calculateStandings } from "@/utils/shared/statsUtils";
import { useCsrfHandler, useAuthSessionSync } from "@/features/auth/hooks";
import { useNotification } from "@/hooks/useNotification";
import { useBootstrapRefresh } from "@/hooks/useBootstrapRefresh";
import { usePlayerActions } from "@/features/players/hooks/usePlayerActions";
import { useRoundActions } from "@/features/rounds/hooks/useRoundActions";
import { useEventActions } from "@/features/events/hooks/useEventActions";
import type { BootstrapLeagueData } from "@/features/league/services/bootstrapService";

interface AppContentProps {
  initialData?: BootstrapLeagueData | null;
}

const AppContent: React.FC<AppContentProps> = ({ initialData }) => {
  const session = useAuthStore((state) => state.session);
  const currentLeagueId = useLeagueStore((state) => state.currentLeagueId);
  const currentSeasonId = useLeagueStore((state) => state.currentSeasonId);
  const activeTab = useLeagueStore((state) => state.activeTab);
  const setActiveTab = useLeagueStore((state) => state.setActiveTab);

  const [showLogin, setShowLogin] = useState(false);
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(
    new Set(),
  );

  const { toast, showToast, clearToast, handleSecurityError } =
    useNotification();
  const { executeWithCsrf } = useCsrfHandler();

  const {
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
  } = useBootstrapRefresh({
    setShowLogin,
    handleSecurityError,
    setPresentPlayerIds,
    initialData,
  });

  useAuthSessionSync({
    showLogin,
    setShowLogin,
    setDbError,
    showToast,
    onInitialSession: runInitialFallbackBootstrap,
    onSignedIn: () => fetchData(undefined, undefined, true),
    onSignedOut: () => fetchData(undefined, undefined, true),
    shouldRunInitialBootstrap: !initialData,
  });

  const {
    handleAddPlayers,
    handleAddExistingPlayer,
    handleRemovePlayer,
    handleUpdatePlayer,
  } = usePlayerActions({
    setPlayers,
    setPresentPlayerIds,
    fetchData,
    executeWithCsrf,
    showToast,
    handleSecurityError,
  });

  const { handleRoundComplete } = useRoundActions({
    fetchData,
    executeWithCsrf,
    showToast,
    handleSecurityError,
  });

  const { handleCreateEvent, handleDeleteEvent, handleToggleEventPin } =
    useEventActions({
      setEvents,
      fetchData,
      executeWithCsrf,
      showToast,
      handleSecurityError,
    });

  const isAuthenticated = !!session;

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
              onUpdateEvent={setEvents}
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
                errorInfo,
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
              roundHistory={roundHistory}
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
              currentLeagueId={currentLeagueId}
              onRefresh={() =>
                fetchData(
                  currentLeagueId ?? undefined,
                  currentSeasonId ?? undefined,
                )
              }
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

interface AppProps {
  initialData?: BootstrapLeagueData | null;
}

const App: React.FC<AppProps> = ({ initialData }) => {
  return (
    <ErrorBoundary
      componentName="App (Global)"
      onError={(error, errorInfo, errorId) => {
        console.error(`Global App error [${errorId}]:`, error, errorInfo);
      }}
    >
      <AppContent initialData={initialData} />
    </ErrorBoundary>
  );
};

export default App;
