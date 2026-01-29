import React, { useState, useRef, useMemo } from "react";
import type { Player } from "../../types";

interface RankReviewModalProps {
  proposedPlayers: Player[];
  originalPlayers: Player[];
  finalPlacements: Player[][];
  presentPlayerIds: Set<string>;
  onConfirm: (finalPlayers: Player[]) => void;
  onCancel: () => void;
}

const RankReviewModal: React.FC<RankReviewModalProps> = ({
  proposedPlayers,
  originalPlayers,
  finalPlacements,
  presentPlayerIds,
  onConfirm,
  onCancel,
}) => {
  const [rankedPlayers, setRankedPlayers] = useState<Player[]>(proposedPlayers);
  const dragPlayer = useRef<number | null>(null);
  const draggedOverPlayer = useRef<number | null>(null);

  const playerMeta = useMemo(() => {
    const meta = new Map<
      string,
      {
        groupIndex: number;
        isWinner: boolean;
        isLoser: boolean;
      }
    >();
    finalPlacements.forEach((placement, groupIndex) => {
      if (placement.length > 0) {
        const winnerId = placement[0]?.id;
        const loserId = placement[placement.length - 1]?.id;
        placement.forEach((player) => {
          meta.set(player.id, {
            groupIndex,
            isWinner: player.id === winnerId,
            isLoser: player.id === loserId,
          });
        });
      }
    });
    return meta;
  }, [finalPlacements]);

  const handleDragStart = (index: number) => {
    dragPlayer.current = index;
  };

  const handleDragEnter = (index: number) => {
    draggedOverPlayer.current = index;
    if (
      dragPlayer.current === null ||
      dragPlayer.current === draggedOverPlayer.current
    )
      return;

    const newPlayers = [...rankedPlayers];
    const draggedItem = newPlayers.splice(dragPlayer.current, 1)[0];
    if (draggedItem && draggedOverPlayer.current !== null) {
      newPlayers.splice(draggedOverPlayer.current, 0, draggedItem);
      dragPlayer.current = draggedOverPlayer.current;
      setRankedPlayers(newPlayers);
    }
  };

  const handleDragEnd = () => {
    dragPlayer.current = null;
    draggedOverPlayer.current = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl m-4">
        <h2 className="text-2xl font-bold text-indigo-400 mb-2">
          Kontrola a potvrzení pořadí
        </h2>
        <p className="text-gray-400 mb-6">
          Přetažením hráčů v sloupci "Nové pořadí" můžete provést manuální
          úpravy.
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Original Ranks Column (Static) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-3 text-center border-b border-gray-700 pb-2">
              Původní pořadí
            </h3>
            <ul className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
              {originalPlayers.map((player) => {
                const isPresent = presentPlayerIds.has(player.id);
                const meta = isPresent ? playerMeta.get(player.id) : null;

                let liClasses =
                  "flex items-center gap-4 p-3 rounded-lg transition-colors duration-200";
                let badge = null;

                if (isPresent && meta) {
                  const groupColors = ["bg-gray-900/50", "bg-gray-900/70"];
                  liClasses += ` ${groupColors[meta.groupIndex % 2]}`;

                  if (meta.isWinner) {
                    badge = (
                      <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full ml-auto">
                        VÍTĚZ
                      </span>
                    );
                  } else if (meta.isLoser) {
                    badge = (
                      <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full ml-auto">
                        PORAŽENÝ
                      </span>
                    );
                  }
                } else {
                  liClasses += " opacity-60";
                }

                return (
                  <li key={player.id} className={liClasses}>
                    <span className="text-sm font-bold bg-gray-700 text-gray-400 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                      {player.rank}
                    </span>
                    <span className="text-lg font-semibold text-gray-300">
                      {player.name}
                    </span>
                    {badge}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* New Ranks Column (Draggable) */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-3 text-center border-b border-gray-700 pb-2">
              Nové pořadí
            </h3>
            <ul className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
              {rankedPlayers.map((player, index) => (
                <li
                  key={player.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-4 bg-gray-700 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-shadow"
                >
                  <span className="text-sm font-bold bg-gray-900 text-indigo-400 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-lg font-semibold text-gray-100">
                    {player.name}
                  </span>
                  <span className="ml-auto text-sm text-gray-400">
                    (Pův: #{player.rank})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={() => onConfirm(rankedPlayers)}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors"
          >
            Potvrdit pořadí
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankReviewModal;

