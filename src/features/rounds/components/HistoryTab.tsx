import React, { useRef, useCallback, useState } from "react";
import type { RoundHistoryEntry } from "@/types";
import RoundHistoryCard from "./RoundHistoryCard";
import { generateXLSContent, downloadFile } from "@/utils/shared/exportUtils";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { deleteLastRound } from "@/features/rounds/services/roundService";
import { useNotification } from "@/hooks/useNotification";
import { useCsrfValidation } from "@/features/auth/hooks/useCsrfValidation";
import EditRoundModal from "./EditRoundModal";
import {
  updateLastRoundResults,
  undoLastRoundEdit,
} from "@/features/rounds/services/roundService";

interface HistoryTabProps {
  roundHistory: RoundHistoryEntry[];
  isAuthenticated: boolean;
  currentLeagueId?: string | null;
  onRefresh?: () => Promise<void>;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  roundHistory,
  isAuthenticated,
  currentLeagueId,
  onRefresh,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoundIds, setSelectedRoundIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<RoundHistoryEntry | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roundToEdit, setRoundToEdit] = useState<RoundHistoryEntry | null>(
    null,
  );
  const { showToast } = useNotification();
  const { validateAndExecute } = useCsrfValidation();

  // Get the last round (first in DESC ordered array)
  const lastRound = roundHistory[0] || null;

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedRoundIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedRoundIds.size === roundHistory.length)
      setSelectedRoundIds(new Set());
    else setSelectedRoundIds(new Set(roundHistory.map((r) => r.id)));
  };

  const handleExportXLS = useCallback(() => {
    if (selectedRoundIds.size === 0) return;
    const selectedRounds = roundHistory.filter((r) =>
      selectedRoundIds.has(r.id),
    );
    const content = generateXLSContent(selectedRounds);
    downloadFile(
      content,
      `historie-ligy-${new Date().toISOString().slice(0, 10)}.xls`,
      "application/vnd.ms-excel",
    );
  }, [roundHistory, selectedRoundIds]);

  const handleExportJson = useCallback(() => {
    if (roundHistory.length === 0) return;
    downloadFile(
      JSON.stringify(roundHistory, null, 2),
      `kompletni-historie-ligy-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
    );
  }, [roundHistory]);

  const handleDeleteRound = async (roundId: string) => {
    const round = roundHistory.find((r) => r.id === roundId);
    if (!round) return;

    // Check if this is the last round
    if (lastRound?.id !== roundId) {
      showToast("Lze smazat pouze poslední odehrané kolo.", "error");
      return;
    }

    setRoundToDelete(round);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roundToDelete || !lastRound || roundToDelete.id !== lastRound.id) {
      showToast("Lze smazat pouze poslední odehrané kolo.", "error");
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await validateAndExecute(async () => {
        if (!currentLeagueId) throw new Error("Chybí ID ligy");

        await deleteLastRound(
          currentLeagueId,
          roundToDelete.id,
          roundToDelete.playersBefore,
        );

        showToast("Kolo bylo smazáno a žebříček vrácen do předchozího stavu.");
        setIsDeleteModalOpen(false);

        // Refresh data
        if (onRefresh) {
          await onRefresh();
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Chyba při mazání kola: ${message}`, "error");
    }
  };

  const handleEditRound = (entry: RoundHistoryEntry) => {
    // Only allow editing the last round
    if (!lastRound || entry.id !== lastRound.id) {
      showToast("Upravovat lze pouze poslední kolo.", "error");
      return;
    }
    setRoundToEdit(entry);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (
    scores: Record<string, { score1: string; score2: string; note?: string }>,
  ) => {
    if (!roundToEdit || !lastRound || roundToEdit.id !== lastRound.id) {
      showToast("Upravovat lze pouze poslední kolo.", "error");
      setIsEditModalOpen(false);
      return;
    }
    try {
      await validateAndExecute(async () => {
        if (!currentLeagueId) throw new Error("Chybí ID ligy");
        await updateLastRoundResults(currentLeagueId, roundToEdit.id, scores);
        showToast("Výsledky kola byly úspěšně upraveny.");
        setIsEditModalOpen(false);
        setRoundToEdit(null);
        if (onRefresh) await onRefresh();
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Chyba při úpravě kola: ${message}`, "error");
    }
  };

  const handleUndoEdit = async (entry: RoundHistoryEntry) => {
    // Only allow undo on last round
    if (!lastRound || entry.id !== lastRound.id) {
      showToast("Vrátit lze pouze poslední kolo.", "error");
      return;
    }
    try {
      await validateAndExecute(async () => {
        if (!currentLeagueId) throw new Error("Chybí ID ligy");
        await undoLastRoundEdit(currentLeagueId, entry.id);
        showToast("Poslední úprava byla vrácena.");
        if (onRefresh) await onRefresh();
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Chyba při vrácení úpravy: ${message}`, "error");
    }
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-xl font-semibold text-indigo-400">Odehraná kola</h3>
        <div className="flex gap-2 flex-wrap justify-end">
          {isAuthenticated && (
            <>
              <input
                type="file"
                ref={importInputRef}
                onChange={() => {}}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => importInputRef.current?.click()}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
              >
                Importovat
              </button>
            </>
          )}
          {roundHistory.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
              >
                Exportovat JSON
              </button>
              <button
                onClick={handleSelectAll}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
              >
                {selectedRoundIds.size === roundHistory.length
                  ? "Zrušit výběr"
                  : "Vybrat vše"}
              </button>
              <button
                onClick={handleExportXLS}
                disabled={selectedRoundIds.size === 0}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Exportovat XLS ({selectedRoundIds.size})
              </button>
            </>
          )}
        </div>
      </div>
      {roundHistory.length > 0 ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {roundHistory.map((entry, index) => (
            <RoundHistoryCard
              key={entry.id}
              entry={entry}
              roundNumber={roundHistory.length - index}
              isSelected={selectedRoundIds.has(entry.id)}
              onToggleSelection={handleToggleSelection}
              isLastRound={index === 0}
              isAuthenticated={isAuthenticated}
              onDelete={handleDeleteRound}
              onEdit={handleEditRound}
              onUndoEdit={handleUndoEdit}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">
          Zatím nebyla odehrána žádná kola.
        </p>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && roundToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Smazat kolo?"
          message={`Opravdu chcete smazat kolo ze dne ${new Date(
            roundToDelete.date,
          ).toLocaleDateString(
            "cs-CZ",
          )}? Žebříček bude vrácen do stavu před tímto kolem.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setRoundToDelete(null);
          }}
          confirmText="Smazat"
          cancelText="Zrušit"
          confirmButtonClass="bg-red-600 hover:bg-red-500"
        />
      )}

      {/* Edit round modal */}
      {isEditModalOpen && roundToEdit && (
        <EditRoundModal
          isOpen={isEditModalOpen}
          entry={roundToEdit}
          onConfirm={handleConfirmEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setRoundToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default HistoryTab;
