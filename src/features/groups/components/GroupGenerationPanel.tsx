import React, { useMemo } from "react";

interface GroupGenerationPanelProps {
  presentPlayersCount: number;
  isLoading?: boolean;
  error: string | null;
  onGenerateGroups: () => void;
}

const GroupGenerationPanel: React.FC<GroupGenerationPanelProps> = ({
  presentPlayersCount,
  isLoading = false,
  error,
  onGenerateGroups,
}) => {
  const generateBtnText = useMemo(() => {
    if (presentPlayersCount === 2) return "Generovat samostatný zápas";
    return `Generovat skupiny (${presentPlayersCount} vybráno)`;
  }, [presentPlayersCount]);

  return (
    <div className="text-center">
      <button
        onClick={onGenerateGroups}
        disabled={presentPlayersCount < 2 || isLoading}
        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg transform hover:scale-105"
      >
        {isLoading ? "Generuji..." : generateBtnText}
      </button>
      {error && <p className="text-red-400 mt-4 font-medium">{error}</p>}
    </div>
  );
};

export default GroupGenerationPanel;

