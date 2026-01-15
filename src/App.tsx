import React, { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import type {
  Player,
  RoundHistoryEntry,
  DBLeague,
  DBSeason,
  DBPlayerInLeague,
  DBRound,
  DBPlayer,
  DBMatch,
  DBEvent,
} from "./types";
import LeagueManager from "./components/LeagueManager";
import Header from "./components/Header";
import PlayersTab from "./components/PlayersTab";
import HistoryTab from "./components/HistoryTab";
import SetupTab from "./components/SetupTab";
import EventsTab from "./components/EventsTab";
import TabButton from "./components/TabButton";
import Auth from "./components/Auth";
import Toast, { ToastType } from "./components/Toast";
import { getSupabase } from "./utils/supabase";
import { calculateStandings } from "./utils/statsUtils";
import { reorderPlayerRanks } from "./utils/leagueUtils";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Players");
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allGlobalPlayers, setAllGlobalPlayers] = useState<DBPlayer[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const [leagues, setLeagues] = useState<DBLeague[]>([]);
  const [currentLeagueId, setCurrentLeagueId] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<DBSeason[]>([]);
  const [currentSeasonId, setCurrentSeasonId] = useState<string | null>(null);

  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(
    new Set()
  );

  const isAuthenticated = !!session;

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const handleSecurityError = useCallback((error: any) => {
    if (
      error?.message?.includes("JWT") ||
      error?.status === 401 ||
      error?.status === 403
    ) {
      setDbError("Vaše relace vypršela nebo nemáte dostatečná oprávnění.");
      setSession(null);
      setShowLogin(true);
      return true;
    }
    return false;
  }, []);

  const loadBaseData = useCallback(
    async (leagueId?: string, forceRefreshLeagues = false) => {
      const supabase = getSupabase();
      if (!supabase)
        throw new Error("Připojení k databázi není nakonfigurováno.");

      let activeLeagues = leagues;
      if (activeLeagues.length === 0 || forceRefreshLeagues) {
        const { data, error } = await supabase
          .from("leagues")
          .select("*")
          .order("name");
        if (error) {
          handleSecurityError(error);
          throw error;
        }
        activeLeagues = (data as DBLeague[]) || [];
        setLeagues(activeLeagues);
      }

      const lid =
        leagueId ||
        currentLeagueId ||
        (activeLeagues.length > 0 ? activeLeagues[0].id : null);
      if (!lid) return { leagueId: null, seasons: [] };
      if (!currentLeagueId || currentLeagueId !== lid) setCurrentLeagueId(lid);

      const { data: seasonsData, error: sErr } = await supabase
        .from("seasons")
        .select("*")
        .eq("league_id", lid)
        .order("created_at", { ascending: false });
      if (sErr) {
        handleSecurityError(sErr);
        throw sErr;
      }

      return { leagueId: lid, seasons: (seasonsData as DBSeason[]) || [] };
    },
    [leagues, currentLeagueId, handleSecurityError]
  );

  const fetchGlobalPlayers = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("last_name", { ascending: true });
    if (!error && data) {
      setAllGlobalPlayers(data as DBPlayer[]);
    }
  }, []);

  const fetchData = useCallback(
    async (
      leagueId?: string,
      seasonId?: string,
      forceRefreshLeagues = false
    ) => {
      setIsLoading(true);
      setDbError(null);
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const base = await loadBaseData(leagueId, forceRefreshLeagues);
        setSeasons(base.seasons);

        await fetchGlobalPlayers();

        let sid = seasonId || currentSeasonId;
        if (leagueId && leagueId !== currentLeagueId) {
          sid = base.seasons.length > 0 ? base.seasons[0].id : null;
          setPresentPlayerIds(new Set());
        } else if (!sid || !base.seasons.find((s) => s.id === sid)) {
          sid = base.seasons.length > 0 ? base.seasons[0].id : null;
        }
        setCurrentSeasonId(sid);

        if (base.leagueId) {
          // Fetch Events
          const { data: eventsData, error: eventsErr } = await supabase
            .from("events")
            .select("*")
            .eq("league_id", base.leagueId)
            .order("pinned", { ascending: false })
            .order("created_at", { ascending: false });

          if (!eventsErr) setEvents(eventsData as DBEvent[]);

          const { data: pilData, error: pilErr } = await supabase
            .from("players_in_leagues")
            .select("id, rank, player_id, players(id, first_name, last_name)")
            .eq("league_id", base.leagueId)
            .order("rank", { ascending: true });

          if (pilErr) {
            handleSecurityError(pilErr);
            throw pilErr;
          }

          setPlayers(
            ((pilData as unknown as DBPlayerInLeague[]) || []).map((row) => ({
              id: row.players!.id,
              first_name: row.players!.first_name,
              last_name: row.players!.last_name,
              name: `${row.players!.first_name} ${
                row.players!.last_name
              }`.trim(),
              rank: row.rank,
            }))
          );

          if (sid) {
            const { data: roundsData, error: rErr } = await supabase
              .from("rounds")
              .select("*")
              .eq("season_id", sid)
              .order("created_at", { ascending: false });
            if (rErr) throw rErr;

            setRoundHistory(
              ((roundsData as unknown as DBRound[]) || []).map((r) => ({
                id: r.id,
                date: r.created_at,
                groups: r.details?.groups || [],
                scores: r.details?.scores || {},
                finalPlacements: r.details?.finalPlacements || [],
                playersBefore: r.details?.playersBefore || [],
                playersAfter: r.details?.playersAfter || [],
                present_players: r.present_players || [],
              }))
            );
          } else {
            setRoundHistory([]);
          }
        }
      } catch (err: unknown) {
        if (!handleSecurityError(err)) {
          const msg = err instanceof Error ? err.message : String(err);
          setDbError(msg || "Nepodařilo se načíst data.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentLeagueId,
      currentSeasonId,
      loadBaseData,
      handleSecurityError,
      fetchGlobalPlayers,
    ]
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    fetchData();

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) =>
        setSession(currentSession)
      );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setShowLogin(false);
        setDbError(null);
        showToast("Přihlášení proběhlo úspěšně.");
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchData]);

  const handleAddPlayers = async (names: string[]) => {
    if (!isAuthenticated || !currentLeagueId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      for (const fullName of names) {
        const parts = fullName.trim().split(" ");
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ") || "-";

        const { data: pData, error: pErr } = await supabase
          .from("players")
          .insert({ first_name: firstName, last_name: lastName })
          .select()
          .single();
        if (pErr) throw pErr;

        const insertedPlayer = pData as DBPlayer;

        const { error: pilErr } = await supabase
          .from("players_in_leagues")
          .insert({
            league_id: currentLeagueId,
            player_id: insertedPlayer.id,
            rank: players.length + 1,
          });
        if (pilErr) throw pilErr;
      }
      showToast(`${names.length} hráč(ů) byl úspěšně přidán.`);
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při přidávání hráčů.", "error");
      }
    }
  };

  const handleAddExistingPlayer = async (playerId: string) => {
    if (!isAuthenticated || !currentLeagueId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error: pilErr } = await supabase
        .from("players_in_leagues")
        .insert({
          league_id: currentLeagueId,
          player_id: playerId,
          rank: players.length + 1,
        });
      if (pilErr) throw pilErr;

      showToast("Hráč byl úspěšně přidán do ligy.");
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při přidávání hráče.", "error");
      }
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!isAuthenticated || !currentLeagueId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error: deleteLinkError } = await supabase
        .from("players_in_leagues")
        .delete()
        .eq("player_id", playerId)
        .eq("league_id", currentLeagueId);

      if (deleteLinkError) throw deleteLinkError;

      const { data: otherLeagues, error: checkError } = await supabase
        .from("players_in_leagues")
        .select("id")
        .eq("player_id", playerId);

      if (checkError) throw checkError;

      if (!otherLeagues || otherLeagues.length === 0) {
        const { error: deletePlayerError } = await supabase
          .from("players")
          .delete()
          .eq("id", playerId);
        if (deletePlayerError) throw deletePlayerError;
      }

      setPresentPlayerIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      showToast("Hráč byl odebrán z aktuální ligy.");
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err)) {
        showToast("Chyba při odebírání hráče.", "error");
      }
    }
  };

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    if (!isAuthenticated || !currentLeagueId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      // Update player name fields
      await supabase
        .from("players")
        .update({
          first_name: updatedPlayer.first_name,
          last_name: updatedPlayer.last_name,
        })
        .eq("id", updatedPlayer.id);

      // Reorder ranks if rank changed
      const { reorderedPlayers, error: reorderError } = reorderPlayerRanks(
        players,
        updatedPlayer.id,
        updatedPlayer.rank
      );

      if (reorderError) {
        showToast(reorderError, "error");
        return;
      }

      // Batch upsert all updated ranks to maintain sequential order
      const rankUpdates = reorderedPlayers.map((player) => ({
        player_id: player.id,
        league_id: currentLeagueId,
        rank: player.rank,
      }));

      const { error: upsertError } = await supabase
        .from("players_in_leagues")
        .upsert(rankUpdates, { onConflict: "league_id,player_id" });

      if (upsertError) throw upsertError;

      showToast("Hráč byl aktualizován.");
      fetchData();
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
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const presentIds = finalPlayers
        .filter((p) => entry.present_players?.includes(p.id))
        .map((p) => p.id);

      const { data: roundDataRaw, error: roundErr } = await supabase
        .from("rounds")
        .insert({
          season_id: currentSeasonId,
          present_players: presentIds,
          details: {
            groups: entry.groups,
            scores: entry.scores,
            finalPlacements: entry.finalPlacements,
            playersBefore: entry.playersBefore,
            playersAfter: entry.playersAfter,
          },
        })
        .select()
        .single();

      if (roundErr) throw roundErr;
      const roundData = roundDataRaw as DBRound;

      const matchesToInsert: DBMatch[] = [];
      entry.groups.forEach((group, idx) => {
        const gNum = idx + 1;
        const scores = entry.scores;
        if (group.length === 4) {
          const [p1, p2, p3, p4] = group;
          const m1 = scores[`g${gNum}-r1-m1`];
          const m2 = scores[`g${gNum}-r1-m2`];
          if (m1)
            matchesToInsert.push({
              round_id: roundData.id,
              player_one_id: p1.id,
              player_two_id: p4.id,
              player_one_score: parseInt(m1.score1, 10),
              player_two_score: parseInt(m1.score2, 10),
            });
          if (m2)
            matchesToInsert.push({
              round_id: roundData.id,
              player_one_id: p2.id,
              player_two_id: p3.id,
              player_one_score: parseInt(m2.score1, 10),
              player_two_score: parseInt(m2.score2, 10),
            });

          if (m1 && m2) {
            const w1 =
              parseInt(m1.score1, 10) > parseInt(m1.score2, 10) ? p1 : p4;
            const l1 =
              parseInt(m1.score1, 10) > parseInt(m1.score2, 10) ? p4 : p1;
            const w2 =
              parseInt(m2.score1, 10) > parseInt(m2.score2, 10) ? p2 : p3;
            const l2 =
              parseInt(m2.score1, 10) > parseInt(m2.score2, 10) ? p3 : p2;
            const m3 = scores[`g${gNum}-r2-m1`];
            const m4 = scores[`g${gNum}-r2-m2`];
            if (m3)
              matchesToInsert.push({
                round_id: roundData.id,
                player_one_id: w1.id,
                player_two_id: w2.id,
                player_one_score: parseInt(m3.score1, 10),
                player_two_score: parseInt(m3.score2, 10),
              });
            if (m4)
              matchesToInsert.push({
                round_id: roundData.id,
                player_one_id: l1.id,
                player_two_id: l2.id,
                player_one_score: parseInt(m4.score1, 10),
                player_two_score: parseInt(m4.score2, 10),
              });
          }
        } else if (group.length === 3) {
          const [p1, p2, p3] = group;
          [1, 2, 3].forEach((m) => {
            const ms = scores[`g${gNum}-m${m}`];
            if (!ms) return;
            const pair = m === 1 ? [p1, p2] : m === 2 ? [p1, p3] : [p2, p3];
            matchesToInsert.push({
              round_id: roundData.id,
              player_one_id: pair[0].id,
              player_two_id: pair[1].id,
              player_one_score: parseInt(ms.score1, 10),
              player_two_score: parseInt(ms.score2, 10),
            });
          });
        }
      });

      if (matchesToInsert.length > 0) {
        await supabase.from("matches").insert(matchesToInsert);
      }

      const { data: existingLinks } = await supabase
        .from("players_in_leagues")
        .select("id, player_id")
        .eq("league_id", currentLeagueId);

      const linkMap = new Map(
        ((existingLinks as DBPlayerInLeague[]) || []).map((l) => [
          l.player_id,
          l.id,
        ])
      );

      const updates = finalPlayers
        .map((p) => {
          const rowId = linkMap.get(p.id);
          return {
            id: rowId,
            league_id: currentLeagueId,
            player_id: p.id,
            rank: p.rank,
          };
        })
        .filter((u) => u.id);

      await supabase.from("players_in_leagues").upsert(updates);

      showToast("Výsledky kola byly uloženy a žebříček aktualizován.");
      fetchData();
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
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase.from("events").insert({
        title,
        content,
        pinned,
        league_id: currentLeagueId,
      });
      if (error) throw error;
      showToast("Událost byla úspěšně vytvořena.");
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err))
        showToast("Chyba při vytváření události.", "error");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!isAuthenticated) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      showToast("Událost byla smazána.");
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err))
        showToast("Chyba při mazání události.", "error");
    }
  };

  const handleToggleEventPin = async (id: string, currentPinned: boolean) => {
    if (!isAuthenticated) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("events")
        .update({ pinned: !currentPinned })
        .eq("id", id);
      if (error) throw error;
      showToast(
        currentPinned ? "Událost byla odepnuta." : "Událost byla připnuta."
      );
      fetchData();
    } catch (err: unknown) {
      if (!handleSecurityError(err))
        showToast("Chyba při změně připnutí.", "error");
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
          <EventsTab
            events={events}
            isAuthenticated={isAuthenticated}
            onAddEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            onTogglePin={handleToggleEventPin}
          />
        )}
        {activeTab === "League" && isAuthenticated && (
          <LeagueManager
            allPlayers={players}
            presentPlayerIds={presentPlayerIds}
            setPresentPlayerIds={setPresentPlayerIds}
            onRoundComplete={handleRoundComplete}
          />
        )}
        {activeTab === "Players" && (
          <PlayersTab
            players={players}
            calculatedStats={calculateStandings(players, roundHistory).stats}
            calculatedStreaks={
              calculateStandings(players, roundHistory).streaks
            }
            onRemovePlayer={handleRemovePlayer}
            onUpdatePlayer={handleUpdatePlayer}
            isAuthenticated={isAuthenticated}
          />
        )}
        {activeTab === "History" && (
          <HistoryTab
            roundHistory={roundHistory}
            onImport={() => {}}
            isAuthenticated={isAuthenticated}
          />
        )}
        {activeTab === "Setup" && isAuthenticated && (
          <SetupTab
            leagues={leagues}
            currentLeagueId={currentLeagueId}
            seasons={seasons}
            currentSeasonId={currentSeasonId}
            session={session}
            onRefresh={() => fetchData(undefined, undefined, true)}
            onLeagueSelect={(id) => fetchData(id, undefined)}
            onAddPlayers={handleAddPlayers}
            allGlobalPlayers={allGlobalPlayers}
            playersInCurrentLeague={players}
            onAddExistingPlayer={handleAddExistingPlayer}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500/30">
      <Header
        isAuthenticated={isAuthenticated}
        userEmail={session?.user?.email}
        onSignInClick={() => setShowLogin(true)}
        leagues={leagues}
        currentLeagueId={currentLeagueId}
        onLeagueChange={(id) => fetchData(id, undefined)}
        seasons={seasons}
        currentSeasonId={currentSeasonId}
        onSeasonChange={(id) => fetchData(undefined, id)}
      />
      <main className="container mx-auto p-4 md:p-8">
        {showLogin ? (
          <Auth onCancel={() => setShowLogin(false)} />
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
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
