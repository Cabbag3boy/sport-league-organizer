import React, { useState, useMemo } from "react";
import type { Session } from "@supabase/supabase-js";
import type { DBLeague, DBSeason, DBPlayer, Player } from "../types";
import { getSupabase } from "../utils/supabase";
import ConfirmModal from "./ConfirmModal";
import AddPlayerForm from "./AddPlayerForm";

interface SetupTabProps {
  leagues: DBLeague[];
  currentLeagueId: string | null;
  seasons: DBSeason[];
  currentSeasonId: string | null;
  session: Session | null;
  onRefresh: () => void;
  onLeagueSelect: (id: string) => void;
  onAddPlayers: (names: string[]) => void;
  allGlobalPlayers: DBPlayer[];
  playersInCurrentLeague: Player[];
  onAddExistingPlayer: (id: string) => void;
}

const SetupTab: React.FC<SetupTabProps> = ({
  leagues,
  currentLeagueId,
  seasons,
  onRefresh,
  onLeagueSelect,
  onAddPlayers,
  allGlobalPlayers,
  playersInCurrentLeague,
  onAddExistingPlayer,
  session,
}) => {
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newSeasonName, setNewSeasonName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isDeleting, setIsDeleting] = useState<{
    type: "liga" | "sezóna";
    id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rlsError, setRlsError] = useState<string | null>(null);

  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  const supabase = getSupabase();

  const handleAddLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newLeagueName.trim()) return;
    setIsLoading(true);
    setRlsError(null);
    const { error } = await supabase.from("leagues").insert({
      name: newLeagueName.trim(),
    });

    if (error) {
      if (error.message.includes("row-level security policy")) {
        setRlsError(
          "Databáze Supabase blokuje tuto akci kvůli zásadám zabezpečení (Row-Level Security - RLS). Musíte povolit přístup v nastavení projektu Supabase."
        );
      } else {
        alert(error.message);
      }
    } else {
      setNewLeagueName("");
      onRefresh();
    }
    setIsLoading(false);
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newSeasonName.trim() || !currentLeagueId) return;
    setIsLoading(true);
    setRlsError(null);
    const { error } = await supabase.from("seasons").insert({
      name: newSeasonName.trim(),
      league_id: currentLeagueId,
    });

    if (error) {
      if (error.message.includes("row-level security policy")) {
        setRlsError(
          "Databáze Supabase blokuje tuto akci kvůli zásadám zabezpečení (RLS)."
        );
      } else {
        alert(error.message);
      }
    } else {
      setNewSeasonName("");
      onRefresh();
    }
    setIsLoading(false);
  };

  const handleUpdate = async (type: "liga" | "sezóna") => {
    if (!supabase || !editingId || !editName.trim()) return;
    setIsLoading(true);
    const table = type === "liga" ? "leagues" : "seasons";
    const { error } = await supabase
      .from(table)
      .update({ name: editName.trim() })
      .eq("id", editingId);
    if (error) alert(error.message);
    else {
      setEditingId(null);
      setEditName("");
      onRefresh();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!supabase || !isDeleting) return;
    setIsLoading(true);
    const table = isDeleting.type === "liga" ? "leagues" : "seasons";
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", isDeleting.id);
    if (error) alert(error.message);
    else {
      setIsDeleting(null);
      onRefresh();
    }
    setIsLoading(false);
  };

  const availableExistingPlayers = useMemo(() => {
    const currentLeaguePlayerIds = new Set(
      playersInCurrentLeague.map((p) => p.id)
    );
    return allGlobalPlayers
      .filter((p) => !currentLeaguePlayerIds.has(p.id))
      .filter((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName.includes(playerSearchQuery.toLowerCase());
      });
  }, [allGlobalPlayers, playersInCurrentLeague, playerSearchQuery]);

  const sqlFix =
    `-- Spusťte toto v SQL editoru Supabase pro opravu chyb RLS...`.trim();

  return (
    <div className="space-y-12 pb-12">
      <ConfirmModal
        isOpen={!!isDeleting}
        title={`Smazat ${isDeleting?.type}`}
        message={`Opravdu chcete smazat tuto položku (${isDeleting?.type})? Tuto akci nelze vzít zpět a může ovlivnit související data.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(null)}
        confirmText="Smazat"
        cancelText="Zrušit"
      />

      {rlsError && (
        <div className="bg-amber-900/30 border border-amber-500/50 p-6 rounded-2xl text-amber-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4 mb-4">
            <svg
              className="w-6 h-6 text-amber-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold">Detekována chyba RLS</h3>
              <p className="mt-1 text-sm opacity-90">{rlsError}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setRlsError(null)}
              className="text-sm font-bold text-amber-400 hover:text-amber-300"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {/* Players Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/30">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Vytvořit úplně nové hráče
          </h2>
          <AddPlayerForm onAddPlayers={onAddPlayers} />
        </section>

        <section className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/30 flex flex-col">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Přidat existující hráče do ligy
          </h2>

          <div className="relative mb-4">
            <input
              type="text"
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              placeholder="Vyhledat hráče v systému..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[160px] space-y-2 pr-1 custom-scrollbar">
            {availableExistingPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                {playerSearchQuery
                  ? "Žádní další hráči neodpovídají hledání."
                  : "Všichni hráči ze systému jsou již v této lize."}
              </div>
            ) : (
              availableExistingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 hover:bg-gray-900 transition-colors"
                >
                  <span className="font-medium text-gray-200">
                    {player.first_name} {player.last_name}
                  </span>
                  <button
                    onClick={() => onAddExistingPlayer(player.id)}
                    className="text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all active:scale-95"
                  >
                    Přidat do ligy
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">Ligy</h2>
        </div>

        <form onSubmit={handleAddLeague} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newLeagueName}
            onChange={(e) => setNewLeagueName(e.target.value)}
            placeholder="Název nové ligy..."
            className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !newLeagueName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "..." : "Přidat"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map((league) => (
            <div
              key={league.id}
              className={`p-4 rounded-2xl border transition-all ${
                league.id === currentLeagueId
                  ? "bg-indigo-500/10 border-indigo-500/50"
                  : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800"
              }`}
            >
              {editingId === league.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-sm outline-none"
                  />
                  <button
                    onClick={() => handleUpdate("liga")}
                    className="text-green-400 hover:text-green-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => onLeagueSelect(league.id)}
                  >
                    <h3 className="font-bold text-gray-200">{league.name}</h3>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => {
                        setEditingId(league.id);
                        setEditName(league.name);
                      }}
                      className="text-gray-500 hover:text-indigo-400 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setIsDeleting({ type: "liga", id: league.id })
                      }
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-400">Sezóny</h2>
          {currentLeagueId && (
            <span className="text-xs text-gray-500">
              Správa sezón pro aktivní ligu
            </span>
          )}
        </div>

        {!currentLeagueId ? (
          <div className="p-8 text-center bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 text-gray-500">
            Pro správu sezón vyberte výše ligu.
          </div>
        ) : (
          <>
            <form onSubmit={handleAddSeason} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                placeholder="Název nové sezóny..."
                className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={isLoading || !newSeasonName.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "..." : "Přidat"}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl hover:bg-gray-800 transition-all"
                >
                  {editingId === season.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-sm outline-none"
                      />
                      <button
                        onClick={() => handleUpdate("sezóna")}
                        className="text-green-400 hover:text-green-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-200">{season.name}</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(season.id);
                            setEditName(season.name);
                          }}
                          className="text-gray-500 hover:text-purple-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            setIsDeleting({ type: "sezóna", id: season.id })
                          }
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default SetupTab;
