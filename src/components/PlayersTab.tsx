import React, { useMemo, useState } from 'react';
import type { Player, RoundHistoryEntry, Streaks, PlayerStats } from "../types";
import AddPlayerForm from './AddPlayerForm';
import PlayerStatsRow from './PlayerStatsRow';
import ConfirmModal from './ConfirmModal';

interface PlayersTabProps {
    players: Player[];
    roundHistory: RoundHistoryEntry[];
    onAddPlayers: (names: string[]) => void;
    onRemovePlayer: (id: number) => void;
    onUpdatePlayer: (player: Player) => void;
}

const PlayersTab: React.FC<PlayersTabProps> = ({ players, roundHistory, onAddPlayers, onRemovePlayer, onUpdatePlayer }) => {
    
    const [playerIdToRemove, setPlayerIdToRemove] = useState<number | null>(null);

    const playerToRemove = useMemo(() => 
        players.find(p => p.id === playerIdToRemove) || null, 
    [players, playerIdToRemove]);

    const { stats, streaks } = useMemo(() => {
        const currentStats: Record<number, PlayerStats> = {};
        const currentStreaks: Record<number, Streaks> = {};
        const outcomes: Record<number, ('W' | 'L')[]> = {};

        // Initialize for current players
        players.forEach(p => {
            currentStats[p.id] = { wins: 0, losses: 0, matches: 0 };
            currentStreaks[p.id] = { winStreak: 0, lossStreak: 0 };
            outcomes[p.id] = [];
        });

        // Sort history chronologically by ID (timestamp) to ensure correct streak calculation
        const chronologicalHistory = [...roundHistory].sort((a, b) => a.id - b.id);

        const processMatch = (pA: Player | undefined, pB: Player | undefined, score: { score1: string; score2: string } | undefined) => {
             if (!pA || !pB || !score || score.score1 === '' || score.score2 === '') return;

             const s1 = parseInt(score.score1, 10);
             const s2 = parseInt(score.score2, 10);

             if (isNaN(s1) || isNaN(s2)) return;

             // Update Stats
             if (currentStats[pA.id]) {
                 currentStats[pA.id].matches++;
                 if (s1 > s2) currentStats[pA.id].wins++;
                 else currentStats[pA.id].losses++;
             }
             if (currentStats[pB.id]) {
                 currentStats[pB.id].matches++;
                 if (s2 > s1) currentStats[pB.id].wins++;
                 else currentStats[pB.id].losses++;
             }

             // Record Outcome for Streaks
             if (s1 > s2) {
                 outcomes[pA.id]?.push('W');
                 outcomes[pB.id]?.push('L');
             } else if (s2 > s1) {
                 outcomes[pA.id]?.push('L');
                 outcomes[pB.id]?.push('W');
             }
        };

        chronologicalHistory.forEach(entry => {
            entry.groups.forEach((group, groupIndex) => {
                const groupNumber = groupIndex + 1;
                
                if (group.length === 3) {
                    const [p1, p2, p3] = group;
                    processMatch(p1, p2, entry.scores[`g${groupNumber}-m1`]);
                    processMatch(p1, p3, entry.scores[`g${groupNumber}-m2`]);
                    processMatch(p2, p3, entry.scores[`g${groupNumber}-m3`]);
                } else if (group.length === 4) {
                    const [p1, p2, p3, p4] = group;

                    // Round 1
                    const r1m1Scores = entry.scores[`g${groupNumber}-r1-m1`];
                    processMatch(p1, p4, r1m1Scores);

                    const r1m2Scores = entry.scores[`g${groupNumber}-r1-m2`];
                    processMatch(p2, p3, r1m2Scores);

                    // Determine winners and losers for Round 2 logic
                    let winner1: Player | undefined, loser1: Player | undefined;
                    if (r1m1Scores && r1m1Scores.score1 !== '' && r1m1Scores.score2 !== '') {
                        const s1 = parseInt(r1m1Scores.score1, 10);
                        const s2 = parseInt(r1m1Scores.score2, 10);
                        if (!isNaN(s1) && !isNaN(s2)) {
                            winner1 = s1 > s2 ? p1 : p4;
                            loser1 = s1 > s2 ? p4 : p1;
                        }
                    }

                    let winner2: Player | undefined, loser2: Player | undefined;
                     if (r1m2Scores && r1m2Scores.score1 !== '' && r1m2Scores.score2 !== '') {
                        const s1 = parseInt(r1m2Scores.score1, 10);
                        const s2 = parseInt(r1m2Scores.score2, 10);
                        if (!isNaN(s1) && !isNaN(s2)) {
                            winner2 = s1 > s2 ? p2 : p3;
                            loser2 = s1 > s2 ? p3 : p2;
                        }
                    }

                    // Round 2
                    if (winner1 && winner2) {
                        processMatch(winner1, winner2, entry.scores[`g${groupNumber}-r2-m1`]);
                    }
                     if (loser1 && loser2) {
                        processMatch(loser1, loser2, entry.scores[`g${groupNumber}-r2-m2`]);
                    }
                }
            });
        });
        
        // Calculate streaks from outcomes
        players.forEach(p => {
            const playerOutcomes = outcomes[p.id] || [];
            let winStreak = 0;
            let lossStreak = 0;
            
            if (playerOutcomes.length > 0) {
                const lastOutcome = playerOutcomes[playerOutcomes.length - 1];
                for (let i = playerOutcomes.length - 1; i >= 0; i--) {
                    if (playerOutcomes[i] === lastOutcome) {
                        if (lastOutcome === 'W') winStreak++;
                        else lossStreak++;
                    } else {
                        break;
                    }
                }
            }
            currentStreaks[p.id] = { winStreak, lossStreak };
        });

        return { stats: currentStats, streaks: currentStreaks };
    }, [players, roundHistory]);

    const handleInitiateRemove = (id: number) => {
        setPlayerIdToRemove(id);
    };

    const handleConfirmRemove = () => {
        if (playerIdToRemove !== null) {
            onRemovePlayer(playerIdToRemove);
            setPlayerIdToRemove(null);
        }
    };

    const handleCancelRemove = () => {
        setPlayerIdToRemove(null);
    };

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={!!playerToRemove}
                title="Confirm Removal"
                message={`Are you sure you want to remove ${playerToRemove?.name}? This action cannot be undone.`}
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
                confirmText="Remove"
            />
            <div>
                <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Manage Players</h2>
                <AddPlayerForm onAddPlayers={onAddPlayers} />
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead>
                        <tr className="border-b border-gray-700 text-sm text-gray-400">
                            <th className="p-3 w-16 text-center">Rank</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 w-20 text-center">Wins</th>
                            <th className="p-3 w-20 text-center">Losses</th>
                            <th className="p-3 w-24 text-center">Matches</th>
                            <th className="p-3 w-28 text-center">Win Streak</th>
                            <th className="p-3 w-28 text-center">Loss Streak</th>
                            <th className="p-3 w-24 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <PlayerStatsRow 
                                key={player.id}
                                player={player}
                                stats={stats[player.id] || { wins: 0, losses: 0, matches: 0 }}
                                streaks={streaks[player.id] || { winStreak: 0, lossStreak: 0 }}
                                onUpdate={onUpdatePlayer}
                                onRemove={handleInitiateRemove}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlayersTab;