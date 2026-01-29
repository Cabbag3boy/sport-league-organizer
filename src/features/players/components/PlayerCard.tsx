import React from "react";
import type { Player } from "../../../types";

interface PlayerCardProps {
  player: Player;
  isPresent: boolean;
  onToggle: (id: string) => void;
  rankChange: "up" | "down" | null;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isPresent,
  onToggle,
  rankChange,
}) => {
  const rankChangeAnimationClass =
    rankChange === "up"
      ? "animate-rank-up"
      : rankChange === "down"
      ? "animate-rank-down"
      : "";

  const cardBaseClasses =
    "relative group p-4 rounded-lg transition-all duration-300 shadow-lg cursor-pointer transform hover:-translate-y-1";
  const displayClasses = isPresent
    ? "bg-indigo-700 shadow-indigo-500/50"
    : "bg-gray-800 hover:bg-gray-700";

  return (
    <div
      onClick={() => onToggle(player.id)}
      className={`${cardBaseClasses} ${displayClasses} ${rankChangeAnimationClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold bg-gray-900 text-indigo-400 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
          {player.rank}
        </span>
        <span className="text-sm font-semibold pr-2">{player.name}</span>
      </div>
    </div>
  );
};

export default PlayerCard;

