import React from "react";
import type { Group, Player } from "@/types";
import Match from "@/components/shared/Match";

interface GroupCardProps {
  group: Group;
  groupNumber: number;
  scores: Record<string, { score1: string; score2: string; note?: string }>;
  onScoreUpdate: (matchId: string, score1: string, score2: string) => void;
  onNoteUpdate?: (matchId: string, note: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  groupNumber,
  scores,
  onScoreUpdate,
  onNoteUpdate,
}) => {
  const renderMatches = () => {
    if (group.length === 4) {
      const [p1, p2, p3, p4] = group as [Player, Player, Player, Player];

      const r1m1Id = `g${groupNumber}-r1-m1`;
      const r1m2Id = `g${groupNumber}-r1-m2`;
      const r2m1Id = `g${groupNumber}-r2-m1`;
      const r2m2Id = `g${groupNumber}-r2-m2`;

      const r1m1Scores = scores[r1m1Id] || { score1: "", score2: "" };
      const r1m2Scores = scores[r1m2Id] || { score1: "", score2: "" };
      const r2m1Scores = scores[r2m1Id] || { score1: "", score2: "" };
      const r2m2Scores = scores[r2m2Id] || { score1: "", score2: "" };

      let winner1: Player | null = null,
        loser1: Player | null = null;
      if (r1m1Scores.score1 !== "" && r1m1Scores.score2 !== "") {
        const s1 = parseInt(r1m1Scores.score1, 10);
        const s2 = parseInt(r1m1Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner1 = s1 > s2 ? p1 : p4!;
          loser1 = s1 > s2 ? p4! : p1;
        }
      }

      let winner2: Player | null = null,
        loser2: Player | null = null;
      if (r1m2Scores.score1 !== "" && r1m2Scores.score2 !== "") {
        const s1 = parseInt(r1m2Scores.score1, 10);
        const s2 = parseInt(r1m2Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner2 = s1 > s2 ? p2 : p3!;
          loser2 = s1 > s2 ? p3! : p2;
        }
      }

      return (
        <>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2 text-sm">
              Round 1
            </h4>
            <ul className="space-y-2">
              <Match
                player1Name={p1?.name || ""}
                player2Name={p4?.name || ""}
                score1={r1m1Scores.score1}
                score2={r1m1Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r1m1Id, s1, s2)}
                note={r1m1Scores.note}
                onNoteChange={(n) => onNoteUpdate?.(r1m1Id, n)}
                isPlaceholder={false}
              />
              <Match
                player1Name={p2?.name || ""}
                player2Name={p3?.name || ""}
                score1={r1m2Scores.score1}
                score2={r1m2Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r1m2Id, s1, s2)}
                note={r1m2Scores.note}
                onNoteChange={(n) => onNoteUpdate?.(r1m2Id, n)}
                isPlaceholder={false}
              />
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mt-4 mb-2 text-sm">
              Round 2
            </h4>
            <ul className="space-y-2">
              <Match
                player1Name={winner1 ? winner1.name : "Winner (R1 M1)"}
                player2Name={winner2 ? winner2.name : "Winner (R1 M2)"}
                score1={r2m1Scores.score1}
                score2={r2m1Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r2m1Id, s1, s2)}
                note={r2m1Scores.note}
                onNoteChange={(n) => onNoteUpdate?.(r2m1Id, n)}
                isPlaceholder={!winner1 || !winner2}
              />
              <Match
                player1Name={loser1 ? loser1.name : "Loser (R1 M1)"}
                player2Name={loser2 ? loser2.name : "Loser (R1 M2)"}
                score1={r2m2Scores.score1}
                score2={r2m2Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r2m2Id, s1, s2)}
                note={r2m2Scores.note}
                onNoteChange={(n) => onNoteUpdate?.(r2m2Id, n)}
                isPlaceholder={!loser1 || !loser2}
              />
            </ul>
          </div>
        </>
      );
    }

    if (group.length === 3) {
      const [p1, p2, p3] = group as [Player, Player, Player];
      const m1Id = `g${groupNumber}-m1`;
      const m2Id = `g${groupNumber}-m2`;
      const m3Id = `g${groupNumber}-m3`;

      const m1Scores = scores[m1Id] || { score1: "", score2: "" };
      const m2Scores = scores[m2Id] || { score1: "", score2: "" };
      const m3Scores = scores[m3Id] || { score1: "", score2: "" };

      return (
        <div>
          <h4 className="font-semibold text-gray-300 mb-2 text-sm">
            Round Robin
          </h4>
          <ul className="space-y-2">
            <Match
              player1Name={p1?.name || ""}
              player2Name={p2?.name || ""}
              score1={m1Scores.score1}
              score2={m1Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m1Id, s1, s2)}
              note={m1Scores.note}
              onNoteChange={(n) => onNoteUpdate?.(m1Id, n)}
              isPlaceholder={false}
            />
            <Match
              player1Name={p1?.name || ""}
              player2Name={p3?.name || ""}
              score1={m2Scores.score1}
              score2={m2Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m2Id, s1, s2)}
              note={m2Scores.note}
              onNoteChange={(n) => onNoteUpdate?.(m2Id, n)}
              isPlaceholder={false}
            />
            <Match
              player1Name={p2?.name || ""}
              player2Name={p3?.name || ""}
              score1={m3Scores.score1}
              score2={m3Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m3Id, s1, s2)}
              note={m3Scores.note}
              onNoteChange={(n) => onNoteUpdate?.(m3Id, n)}
              isPlaceholder={false}
            />
          </ul>
        </div>
      );
    }

    if (group.length === 2) {
      const [p1, p2] = group as [Player, Player];
      const m1Id = `g${groupNumber}-m1`;
      const m1Scores = scores[m1Id] || { score1: "", score2: "" };

      return (
        <div>
          <h4 className="font-semibold text-gray-300 mb-2 text-sm">Match</h4>
          <ul className="space-y-2">
            <Match
              player1Name={p1?.name || ""}
              player2Name={p2?.name || ""}
              score1={m1Scores.score1}
              score2={m1Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m1Id, s1, s2)}
              note={m1Scores.note}
              onNoteChange={(n) => onNoteUpdate?.(m1Id, n)}
              isPlaceholder={false}
            />
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-indigo-500/20 transition-shadow duration-300 flex flex-col">
      <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">
        Group {groupNumber}
      </h3>
      <div className="space-y-4 flex-grow">{renderMatches()}</div>
    </div>
  );
};

export default GroupCard;
