
import React from 'react';
import type { Group, Player } from '../types';

interface GroupCardProps {
  group: Group;
  groupNumber: number;
  scores: Record<string, { score1: string; score2: string }>;
  onScoreUpdate: (matchId: string, score1: string, score2: string) => void;
}

interface MatchProps {
    player1Name: string;
    player2Name: string;
    score1: string;
    score2: string;
    onScoreChange: (score1: string, score2: string) => void;
    isPlaceholder: boolean;
}

const Match: React.FC<MatchProps> = ({ player1Name, player2Name, score1, score2, onScoreChange, isPlaceholder }) => {
    const handleScore1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        onScoreChange(e.target.value, score2);
    };
    const handleScore2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        onScoreChange(score1, e.target.value);
    };

    const inputClasses = "w-12 bg-gray-700 text-white text-center rounded-md p-1 mx-1 focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-800 disabled:text-gray-500 transition-colors";
    
    let player1Classes = `font-medium text-right w-2/5 truncate transition-colors ${isPlaceholder ? 'text-gray-500' : 'text-gray-200'}`;
    let player2Classes = `font-medium text-left w-2/5 truncate transition-colors ${isPlaceholder ? 'text-gray-500' : 'text-gray-200'}`;

    if (!isPlaceholder && score1 !== '' && score2 !== '') {
        const s1 = parseInt(score1, 10);
        const s2 = parseInt(score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
            if (s1 > s2) {
                player1Classes = `${player1Classes.split(' text-')[0]} text-green-400 font-bold`;
                player2Classes = `${player2Classes.split(' text-')[0]} text-gray-500`;
            } else if (s2 > s1) {
                player2Classes = `${player2Classes.split(' text-')[0]} text-green-400 font-bold`;
                player1Classes = `${player1Classes.split(' text-')[0]} text-gray-500`;
            }
        }
    }

    return (
        <li className="flex justify-center items-center bg-gray-900 p-2 rounded-md">
            <span className={player1Classes}>{player1Name}</span>
            <input type="number" value={score1} onChange={handleScore1Change} disabled={isPlaceholder} className={inputClasses} aria-label={`${player1Name} score`} />
            <span className="font-bold text-indigo-400 mx-1 text-sm">VS</span>
            <input type="number" value={score2} onChange={handleScore2Change} disabled={isPlaceholder} className={inputClasses} aria-label={`${player2Name} score`} />
            <span className={player2Classes}>{player2Name}</span>
        </li>
    );
};

const GroupCard: React.FC<GroupCardProps> = ({ group, groupNumber, scores, onScoreUpdate }) => {
  const renderMatches = () => {
    if (group.length === 4) {
      const [p1, p2, p3, p4] = group;

      const r1m1Id = `g${groupNumber}-r1-m1`;
      const r1m2Id = `g${groupNumber}-r1-m2`;
      const r2m1Id = `g${groupNumber}-r2-m1`;
      const r2m2Id = `g${groupNumber}-r2-m2`;

      const r1m1Scores = scores[r1m1Id] || { score1: '', score2: '' };
      const r1m2Scores = scores[r1m2Id] || { score1: '', score2: '' };
      const r2m1Scores = scores[r2m1Id] || { score1: '', score2: '' };
      const r2m2Scores = scores[r2m2Id] || { score1: '', score2: '' };

      let winner1: Player | null = null, loser1: Player | null = null;
      if (r1m1Scores.score1 !== '' && r1m1Scores.score2 !== '') {
        const s1 = parseInt(r1m1Scores.score1, 10);
        const s2 = parseInt(r1m1Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner1 = s1 > s2 ? p1 : p4;
          loser1 = s1 > s2 ? p4 : p1;
        }
      }

      let winner2: Player | null = null, loser2: Player | null = null;
      if (r1m2Scores.score1 !== '' && r1m2Scores.score2 !== '') {
        const s1 = parseInt(r1m2Scores.score1, 10);
        const s2 = parseInt(r1m2Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner2 = s1 > s2 ? p2 : p3;
          loser2 = s1 > s2 ? p3 : p2;
        }
      }

      return (
        <>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2 text-sm">Round 1</h4>
            <ul className="space-y-2">
              <Match 
                player1Name={p1.name} 
                player2Name={p4.name}
                score1={r1m1Scores.score1}
                score2={r1m1Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r1m1Id, s1, s2)}
                isPlaceholder={false}
              />
              <Match 
                player1Name={p2.name} 
                player2Name={p3.name}
                score1={r1m2Scores.score1}
                score2={r1m2Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r1m2Id, s1, s2)}
                isPlaceholder={false}
              />
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mt-4 mb-2 text-sm">Round 2</h4>
            <ul className="space-y-2">
              <Match 
                player1Name={winner1 ? winner1.name : "Winner (R1 M1)"}
                player2Name={winner2 ? winner2.name : "Winner (R1 M2)"}
                score1={r2m1Scores.score1}
                score2={r2m1Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r2m1Id, s1, s2)}
                isPlaceholder={!winner1 || !winner2}
              />
              <Match 
                player1Name={loser1 ? loser1.name : "Loser (R1 M1)"}
                player2Name={loser2 ? loser2.name : "Loser (R1 M2)"}
                score1={r2m2Scores.score1}
                score2={r2m2Scores.score2}
                onScoreChange={(s1, s2) => onScoreUpdate(r2m2Id, s1, s2)}
                isPlaceholder={!loser1 || !loser2}
              />
            </ul>
          </div>
        </>
      );
    }
    
    if (group.length === 3) {
      const [p1, p2, p3] = group;
      const m1Id = `g${groupNumber}-m1`;
      const m2Id = `g${groupNumber}-m2`;
      const m3Id = `g${groupNumber}-m3`;
      
      const m1Scores = scores[m1Id] || { score1: '', score2: '' };
      const m2Scores = scores[m2Id] || { score1: '', score2: '' };
      const m3Scores = scores[m3Id] || { score1: '', score2: '' };

      return (
        <div>
          <h4 className="font-semibold text-gray-300 mb-2 text-sm">Round Robin</h4>
          <ul className="space-y-2">
            <Match 
              player1Name={p1.name} 
              player2Name={p2.name}
              score1={m1Scores.score1}
              score2={m1Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m1Id, s1, s2)}
              isPlaceholder={false}
            />
            <Match 
              player1Name={p1.name} 
              player2Name={p3.name}
              score1={m2Scores.score1}
              score2={m2Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m2Id, s1, s2)}
              isPlaceholder={false}
            />
            <Match 
              player1Name={p2.name} 
              player2Name={p3.name}
              score1={m3Scores.score1}
              score2={m3Scores.score2}
              onScoreChange={(s1, s2) => onScoreUpdate(m3Id, s1, s2)}
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
      <div className="space-y-4 flex-grow">
        {renderMatches()}
      </div>
    </div>
  );
};

export default GroupCard;