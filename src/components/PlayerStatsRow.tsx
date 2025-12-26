import React, { useState } from 'react';
import type { Player, Streaks, PlayerStats } from "../types";

interface PlayerStatsRowProps {
  player: Player;
  stats: PlayerStats;
  streaks: Streaks;
  onUpdate: (player: Player) => void;
  onRemove: (id: number) => void;
}

const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({ player, stats, streaks, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(player.name);
  const [editedRank, setEditedRank] = useState<string | number>(player.rank);
  
  const handleSaveClick = () => {
    const rankAsNumber = Number(editedRank);
    if (editedName.trim() && !isNaN(rankAsNumber) && rankAsNumber > 0) {
      onUpdate({ ...player, name: editedName.trim(), rank: rankAsNumber });
      setIsEditing(false);
    }
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedName(player.name);
    setEditedRank(player.rank);
  };

  if (isEditing) {
    return (
        <tr className="border-b border-gray-700/50 bg-gray-800">
            <td className="p-3 text-center">
                <input
                    type="number"
                    value={editedRank}
                    onChange={(e) => setEditedRank(e.target.value)}
                    className="w-16 bg-gray-900 text-indigo-400 rounded-md p-1 text-center font-bold"
                    aria-label="Edit rank"
                />
            </td>
            <td className="p-3">
                 <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-gray-900 text-gray-100 rounded-md p-1 font-semibold"
                    aria-label="Edit name"
                />
            </td>
            <td className="p-3 text-center font-mono text-gray-300">{stats.wins}</td>
            <td className="p-3 text-center font-mono text-gray-300">{stats.losses}</td>
            <td className="p-3 text-center font-mono text-gray-300">{stats.matches}</td>
            <td className="p-3 text-center font-mono text-gray-400">{streaks.winStreak > 0 ? streaks.winStreak : '-'}</td>
            <td className="p-3 text-center font-mono text-gray-400">{streaks.lossStreak > 0 ? streaks.lossStreak : '-'}</td>
            <td className="p-3 text-center">
                <div className="flex justify-center gap-3">
                    <button onClick={handleCancelClick} aria-label="Cancel edit" className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={handleSaveClick} aria-label="Save changes" className="text-green-400 hover:text-green-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </td>
        </tr>
    );
  }

  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
      <td className="p-3 w-16 text-center">
        <span className="font-bold text-indigo-400">{player.rank}</span>
      </td>
      <td className="p-3 font-semibold">{player.name}</td>
      <td className="p-3 w-20 text-center font-mono text-green-400">{stats.wins}</td>
      <td className="p-3 w-20 text-center font-mono text-red-400">{stats.losses}</td>
      <td className="p-3 w-24 text-center font-mono text-gray-300">{stats.matches}</td>
      <td className={`p-3 w-28 text-center font-mono ${streaks.winStreak > 0 ? 'text-orange-400 font-bold' : 'text-gray-400'}`}>
        {streaks.winStreak > 0 ? `${streaks.winStreak} 🔥` : '-'}
      </td>
      <td className={`p-3 w-28 text-center font-mono ${streaks.lossStreak > 0 ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
        {streaks.lossStreak > 0 ? `${streaks.lossStreak} ❄️` : '-'}
      </td>
      <td className="p-3 w-24 text-center">
        <div className="flex justify-center gap-3">
            <button onClick={() => setIsEditing(true)} aria-label={`Edit ${player.name}`} className="text-gray-400 hover:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
            </button>
            <button 
                onClick={() => onRemove(player.id)}
                aria-label={`Remove ${player.name}`} 
                className="text-gray-400 hover:text-red-400"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
      </td>
    </tr>
  );
};

export default PlayerStatsRow;