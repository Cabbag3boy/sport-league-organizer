import React, { useState } from "react";
import type { Player, Streaks, PlayerStats } from "../../../types";

interface PlayerStatsRowProps {
  player: Player;
  stats: PlayerStats;
  streaks: Streaks;
  onUpdate: (player: Player) => void;
  onRemove: (id: string) => void;
  isAuthenticated: boolean;
  totalPlayersInLeague?: number;
}

const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
  player,
  stats,
  streaks,
  onUpdate,
  onRemove,
  isAuthenticated,
  totalPlayersInLeague = 999,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(player.first_name);
  const [lastName, setLastName] = useState(player.last_name);
  const [editedRank, setEditedRank] = useState<string | number>(player.rank);
  const [rankError, setRankError] = useState<string | null>(null);

  const handleRankChange = (value: string) => {
    setEditedRank(value);
    const rankNum = Number(value);
    if (rankNum < 1 || rankNum > totalPlayersInLeague) {
      setRankError(`Pořadí musí být mezi 1 a ${totalPlayersInLeague}.`);
    } else {
      setRankError(null);
    }
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) return;
    const rankAsNumber = Number(editedRank);
    if (
      firstName.trim() &&
      lastName.trim() &&
      !isNaN(rankAsNumber) &&
      rankAsNumber > 0 &&
      rankAsNumber <= totalPlayersInLeague &&
      !rankError
    ) {
      onUpdate({
        ...player,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        rank: rankAsNumber,
      });
      setIsEditing(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    if (rank === 2) return "bg-slate-400/20 text-slate-400 border-slate-400/50";
    if (rank === 3) return "bg-amber-600/20 text-amber-600 border-amber-600/50";
    return "bg-gray-900/50 text-indigo-400 border-gray-700/50";
  };

  if (isEditing && isAuthenticated) {
    return (
      <tr className="border-b border-gray-700/50 bg-gray-800">
        <td className="p-3 text-center">
          <div className="flex flex-col gap-1">
            <input
              type="number"
              value={editedRank}
              onChange={(e) => handleRankChange(e.target.value)}
              max={totalPlayersInLeague}
              min={1}
              className={`w-16 bg-gray-900 text-indigo-400 rounded-md p-1 text-center font-bold ${
                rankError ? "border-2 border-red-500" : ""
              }`}
              aria-label="Upravit pořadí"
            />
            {rankError && (
              <span className="text-xs text-red-400 whitespace-nowrap">
                {rankError}
              </span>
            )}
          </div>
        </td>
        <td className="p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 bg-gray-900 text-gray-100 rounded-md p-1 font-semibold"
              placeholder="Jméno"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 bg-gray-900 text-gray-100 rounded-md p-1 font-semibold"
              placeholder="Příjmení"
            />
          </div>
        </td>
        <td className="p-3 text-center font-mono text-gray-300">
          {stats.wins}
        </td>
        <td className="p-3 text-center font-mono text-gray-300">
          {stats.losses}
        </td>
        <td className="p-3 text-center font-mono text-gray-300">
          {stats.matches}
        </td>
        <td className="p-3 text-center font-mono text-gray-400">
          {streaks.winStreak > 0 ? streaks.winStreak : "-"}
        </td>
        <td className="p-3 text-center font-mono text-gray-400">
          {streaks.lossStreak > 0 ? streaks.lossStreak : "-"}
        </td>
        <td className="p-3 text-center">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={handleSaveClick}
              disabled={rankError !== null}
              className="text-green-400 hover:text-green-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors ${
        player.rank <= 3 ? "bg-indigo-500/[0.02]" : ""
      }`}
    >
      <td className="p-3 w-16 text-center">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold border ${getRankBadge(
            player.rank
          )}`}
        >
          {player.rank}
        </span>
      </td>
      <td className="p-3 font-semibold">
        <div className="flex items-center gap-2">
          {player.name}
          {player.rank === 1 && <span title="Lídr ligy">👑</span>}
        </div>
      </td>
      <td className="p-3 w-20 text-center font-mono text-green-400">
        {stats.wins}
      </td>
      <td className="p-3 w-20 text-center font-mono text-red-400">
        {stats.losses}
      </td>
      <td className="p-3 w-24 text-center font-mono text-gray-300">
        {stats.matches}
      </td>
      <td
        className={`p-3 w-28 text-center font-mono ${
          streaks.winStreak > 0 ? "text-orange-400 font-bold" : "text-gray-400"
        }`}
      >
        {streaks.winStreak > 0 ? `${streaks.winStreak} 🔥` : "-"}
      </td>
      <td
        className={`p-3 w-28 text-center font-mono ${
          streaks.lossStreak > 0 ? "text-blue-400 font-bold" : "text-gray-400"
        }`}
      >
        {streaks.lossStreak > 0 ? `${streaks.lossStreak} ❄️` : "-"}
      </td>
      {isAuthenticated && (
        <td className="p-3 w-24 text-center">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              title="Upravit hráče"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
              onClick={() => onRemove(player.id)}
              title="Odebrat hráče"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </td>
      )}
    </tr>
  );
};

export default PlayerStatsRow;

