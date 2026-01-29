import React, { useEffect, useMemo, useState } from "react";
import type { Player, RoundHistoryEntry } from "@/types";
import Match from "@/components/shared/Match";

interface EditRoundModalProps {
  entry: RoundHistoryEntry;
  isOpen: boolean;
  onConfirm: (
    scores: Record<string, { score1: string; score2: string; note?: string }>,
  ) => Promise<void> | void;
  onCancel: () => void;
}

const EditRoundModal: React.FC<EditRoundModalProps> = ({
  entry,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [scores, setScores] = useState<
    Record<string, { score1: string; score2: string; note?: string }>
  >(() => ({ ...entry.scores }));

  useEffect(() => {
    setScores({ ...entry.scores });
  }, [entry]);

  const expectedMatchIds = useMemo(() => {
    const ids: string[] = [];
    entry.groups.forEach((group, idx) => {
      const g = idx + 1;
      if (group.length === 4) {
        ids.push(`g${g}-r1-m1`, `g${g}-r1-m2`, `g${g}-r2-m1`, `g${g}-r2-m2`);
      } else if (group.length === 3) {
        ids.push(`g${g}-m1`, `g${g}-m2`, `g${g}-m3`);
      } else if (group.length === 2) {
        ids.push(`g${g}-m1`);
      }
    });
    return ids;
  }, [entry.groups]);

  const allValid = useMemo(() => {
    return expectedMatchIds.every((id) => {
      const s = scores[id];
      if (!s) return false;
      if (s.score1 === "" || s.score2 === "") return false;
      const n1 = parseInt(s.score1, 10);
      const n2 = parseInt(s.score2, 10);
      return !isNaN(n1) && !isNaN(n2);
    });
  }, [expectedMatchIds, scores]);

  const updateScore = (id: string, score1: string, score2: string) => {
    setScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], score1, score2 },
    }));
  };

  const updateNote = (id: string, note: string) => {
    setScores((prev) => ({
      ...prev,
      [id]: { ...prev[id], note },
    }));
  };

  if (!isOpen) return null;

  const renderMatches = (group: Player[], groupIndex: number) => {
    const g = groupIndex + 1;
    if (group.length === 4) {
      const [p1, p2, p3, p4] = group;
      const r1m1Id = `g${g}-r1-m1`;
      const r1m2Id = `g${g}-r1-m2`;
      const r2m1Id = `g${g}-r2-m1`;
      const r2m2Id = `g${g}-r2-m2`;
      const s1 = scores[r1m1Id] || { score1: "", score2: "" };
      const s2 = scores[r1m2Id] || { score1: "", score2: "" };
      const s3 = scores[r2m1Id] || { score1: "", score2: "" };
      const s4 = scores[r2m2Id] || { score1: "", score2: "" };
      return (
        <div className="space-y-2">
          {p1 && p4 && (
            <Match
              player1Name={p1.name}
              player2Name={p4.name}
              score1={s1.score1}
              score2={s1.score2}
              onScoreChange={(a, b) => updateScore(r1m1Id, a, b)}
              note={s1.note}
              onNoteChange={(n) => updateNote(r1m1Id, n)}
            />
          )}
          {p2 && p3 && (
            <Match
              player1Name={p2.name}
              player2Name={p3.name}
              score1={s2.score1}
              score2={s2.score2}
              onScoreChange={(a, b) => updateScore(r1m2Id, a, b)}
              note={s2.note}
              onNoteChange={(n) => updateNote(r1m2Id, n)}
            />
          )}
          <div className="mt-2">
            <h6 className="font-semibold text-gray-400 mb-1 text-xs">
              Druhé kolo
            </h6>
            <div className="space-y-2">
              <Match
                player1Name="Vítěz (R1 M1)"
                player2Name="Vítěz (R1 M2)"
                score1={s3.score1}
                score2={s3.score2}
                onScoreChange={(a, b) => updateScore(r2m1Id, a, b)}
                note={s3.note}
                onNoteChange={(n) => updateNote(r2m1Id, n)}
              />
              <Match
                player1Name="Poražený (R1 M1)"
                player2Name="Poražený (R1 M2)"
                score1={s4.score1}
                score2={s4.score2}
                onScoreChange={(a, b) => updateScore(r2m2Id, a, b)}
                note={s4.note}
                onNoteChange={(n) => updateNote(r2m2Id, n)}
              />
            </div>
          </div>
        </div>
      );
    }
    if (group.length === 3) {
      const [p1, p2, p3] = group;
      const m1Id = `g${g}-m1`;
      const m2Id = `g${g}-m2`;
      const m3Id = `g${g}-m3`;
      const s1 = scores[m1Id] || { score1: "", score2: "" };
      const s2 = scores[m2Id] || { score1: "", score2: "" };
      const s3 = scores[m3Id] || { score1: "", score2: "" };
      return (
        <div className="space-y-2">
          {p1 && p2 && (
            <Match
              player1Name={p1.name}
              player2Name={p2.name}
              score1={s1.score1}
              score2={s1.score2}
              onScoreChange={(a, b) => updateScore(m1Id, a, b)}
              note={s1.note}
              onNoteChange={(n) => updateNote(m1Id, n)}
            />
          )}
          {p1 && p3 && (
            <Match
              player1Name={p1.name}
              player2Name={p3.name}
              score1={s2.score1}
              score2={s2.score2}
              onScoreChange={(a, b) => updateScore(m2Id, a, b)}
              note={s2.note}
              onNoteChange={(n) => updateNote(m2Id, n)}
            />
          )}
          {p2 && p3 && (
            <Match
              player1Name={p2.name}
              player2Name={p3.name}
              score1={s3.score1}
              score2={s3.score2}
              onScoreChange={(a, b) => updateScore(m3Id, a, b)}
              note={s3.note}
              onNoteChange={(n) => updateNote(m3Id, n)}
            />
          )}
        </div>
      );
    }
    if (group.length === 2) {
      const [p1, p2] = group;
      const m1Id = `g${g}-m1`;
      const s = scores[m1Id] || { score1: "", score2: "" };
      return (
        <div className="space-y-2">
          {p1 && p2 && (
            <Match
              player1Name={p1.name}
              player2Name={p2.name}
              score1={s.score1}
              score2={s.score2}
              onScoreChange={(a, b) => updateScore(m1Id, a, b)}
              note={s.note}
              onNoteChange={(n) => updateNote(m1Id, n)}
            />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-3xl m-4">
        <h2 className="text-xl font-bold text-indigo-400 mb-4">
          Upravit výsledky posledního kola
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {entry.groups.map((group, idx) => (
            <div key={idx} className="bg-gray-900 p-3 rounded-md">
              <h5 className="font-bold text-gray-300 mb-2">
                Skupina {idx + 1}
              </h5>
              {renderMatches(group, idx)}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={() => onConfirm(scores)}
            disabled={!allValid}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Uložit změny
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoundModal;
