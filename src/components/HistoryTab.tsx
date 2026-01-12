import React, { useRef, useCallback, useState } from "react";
import type { RoundHistoryEntry } from "../types";
import RoundHistoryCard from "./RoundHistoryCard";
import { generateXLSContent, downloadFile } from "../utils/exportUtils";

interface HistoryTabProps {
  roundHistory: RoundHistoryEntry[];
  onImport: (history: RoundHistoryEntry[]) => void;
  isAuthenticated: boolean;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  roundHistory,
  onImport,
  isAuthenticated,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [selectedRoundIds, setSelectedRoundIds] = useState<Set<string>>(
    new Set()
  );

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
      selectedRoundIds.has(r.id)
    );
    const content = generateXLSContent(selectedRounds);
    downloadFile(
      content,
      `historie-ligy-${new Date().toISOString().slice(0, 10)}.xls`,
      "application/vnd.ms-excel"
    );
  }, [roundHistory, selectedRoundIds]);

  const handleExportJson = useCallback(() => {
    if (roundHistory.length === 0) return;
    downloadFile(
      JSON.stringify(roundHistory, null, 2),
      `kompletni-historie-ligy-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json"
    );
  }, [roundHistory]);

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
          Zatím nebyla odehrána žádná kola.
        </p>
      )}
    </div>
  );
};

export default HistoryTab;
