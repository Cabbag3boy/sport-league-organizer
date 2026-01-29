import React, { useMemo } from "react";
import type { Group } from "../../../types";
import GroupCard from "./GroupCard";

interface GroupRenderingPanelProps {
  groups: Group[];
  scores: Record<string, { score1: string; score2: string; note?: string }>;
  allMatchesScored: boolean;
  onScoreUpdate: (matchId: string, score1: string, score2: string) => void;
  onNoteUpdate?: (matchId: string, note: string) => void;
  onFinishRound: () => void;
}

const GroupRenderingPanel: React.FC<GroupRenderingPanelProps> = ({
  groups,
  scores,
  allMatchesScored,
  onScoreUpdate,
  onNoteUpdate,
  onFinishRound,
}) => {
  const title = useMemo(() => {
    if (groups.length === 1 && groups[0]?.length === 2) {
      return "Samostatný zápas";
    }
    return "Vygenerované skupiny";
  }, [groups]);

  if (groups.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-400">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group, index) => (
          <GroupCard
            key={index}
            group={group}
            groupNumber={index + 1}
            scores={scores}
            onScoreUpdate={onScoreUpdate}
            onNoteUpdate={onNoteUpdate}
          />
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={onFinishRound}
          disabled={!allMatchesScored}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg transform hover:scale-105"
        >
          Ukončit kolo a aktualizovat žebříček
        </button>
      </div>
    </div>
  );
};

export default GroupRenderingPanel;
