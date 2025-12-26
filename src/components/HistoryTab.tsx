import React, { useRef, useCallback, useState } from "react";
import type { RoundHistoryEntry } from "../types";
import RoundHistoryCard from "./RoundHistoryCard";
import { generateXLSContent, downloadFile } from "../utils/exportUtils";

interface HistoryTabProps {
  roundHistory: RoundHistoryEntry[];
  onImport: (history: RoundHistoryEntry[]) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ roundHistory, onImport }) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoundIds, setSelectedRoundIds] = useState<Set<number>>(
    new Set()
  );

  const handleToggleSelection = useCallback((id: number) => {
    setSelectedRoundIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedRoundIds.size === roundHistory.length) {
      setSelectedRoundIds(new Set());
    } else {
      setSelectedRoundIds(new Set(roundHistory.map((r) => r.id)));
    }
  };

  const handleExportXLS = useCallback(() => {
    if (selectedRoundIds.size === 0) {
      alert("No rounds selected to export.");
      return;
    }
    const selectedRounds = roundHistory.filter((r) =>
      selectedRoundIds.has(r.id)
    );
    const content = generateXLSContent(selectedRounds);
    const exportFileDefaultName = `league-history-${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    downloadFile(content, exportFileDefaultName, "application/vnd.ms-excel");
  }, [roundHistory, selectedRoundIds]);

  const handleExportJson = useCallback(() => {
    if (roundHistory.length === 0) {
      alert("No history to export.");
      return;
    }
    const dataStr = JSON.stringify(roundHistory, null, 2);
    const exportFileDefaultName = `league-history-all-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    downloadFile(dataStr, exportFileDefaultName, "application/json");
  }, [roundHistory]);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== "string")
            throw new Error("File content is not a string.");

          const importedHistory = JSON.parse(text);
          if (
            !Array.isArray(importedHistory) ||
            importedHistory.some((entry) => !entry.id || !entry.playersAfter)
          ) {
            throw new Error("Invalid history file format.");
          }

          onImport(importedHistory);
          alert("History imported successfully!");
        } catch (err) {
          console.error("Failed to import history:", err);
          alert(
            `Error importing file: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        } finally {
          if (importInputRef.current) {
            importInputRef.current.value = "";
          }
        }
      };
      reader.readAsText(file);
    },
    [onImport]
  );

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-xl font-semibold text-indigo-400">Past Rounds</h3>
        <div className="flex gap-2 flex-wrap justify-end">
          <input
            type="file"
            ref={importInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
          >
            Import
          </button>
          {roundHistory.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={handleSelectAll}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold py-1 px-3 rounded-md transition-colors"
              >
                {selectedRoundIds.size === roundHistory.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                onClick={handleExportXLS}
                disabled={selectedRoundIds.size === 0}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Export XLS ({selectedRoundIds.size})
              </button>
            </>
          )}
        </div>
      </div>
      {roundHistory.length > 0 ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {roundHistory.map((entry) => (
            <RoundHistoryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedRoundIds.has(entry.id)}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">
          No rounds have been completed yet.
        </p>
      )}
    </div>
  );
};

export default HistoryTab;
