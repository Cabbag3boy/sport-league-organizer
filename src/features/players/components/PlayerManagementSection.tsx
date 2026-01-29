import React, { useMemo, useState } from "react";
import type { DBPlayer, Player } from "../../../types";
import AddPlayerForm from "./AddPlayerForm";

interface PlayerManagementSectionProps {
  onAddPlayers: (names: string[]) => void;
  allGlobalPlayers: DBPlayer[];
  playersInCurrentLeague: Player[];
  onAddExistingPlayer: (id: string) => void;
}

const PlayerManagementSection: React.FC<PlayerManagementSectionProps> = ({
  onAddPlayers,
  allGlobalPlayers,
  playersInCurrentLeague,
  onAddExistingPlayer,
}) => {
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

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

  return (
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
  );
};

export default PlayerManagementSection;

