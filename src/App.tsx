import React, { useState, useEffect } from "react";
// import supabase from "./utils/supabase";
import type { Player, RoundHistoryEntry } from "./types";
import LeagueManager from "./components/LeagueManager";
import Header from "./components/Header";
import PlayersTab from "./components/PlayersTab";
import HistoryTab from "./components/HistoryTab";
import TabButton from "./components/TabButton";

const initialPlayers: Player[] = [
  { id: 1, name: "Alice", rank: 1 },
  { id: 2, name: "Bob", rank: 2 },
  { id: 3, name: "Charlie", rank: 3 },
  { id: 4, name: "Diana F", rank: 4 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("League");
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const savedPlayers = localStorage.getItem("leaguePlayers");
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed)) {
          return parsed.sort((a: Player, b: Player) => a.rank - b.rank);
        }
      }
    } catch (error) {
      console.error("Error loading players from localStorage:", error);
    }
    return initialPlayers;
  });

  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>(() => {
    try {
      const savedHistory = localStorage.getItem("leagueRoundHistory");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error("Error loading round history from localStorage:", error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("leaguePlayers", JSON.stringify(players));
    } catch (error) {
      console.error("Error saving players to localStorage:", error);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem("leagueRoundHistory", JSON.stringify(roundHistory));
    } catch (error) {
      console.error("Error saving round history to localStorage:", error);
    }
  }, [roundHistory]);

  const handleAddPlayers = (names: string[]) => {
    setPlayers((prevPlayers) => {
      const existingNames = new Set(
        prevPlayers.map((p) => p.name.toLowerCase())
      );

      const newUniqueNames = Array.from(
        new Set(
          names
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
            .filter((name) => !existingNames.has(name.toLowerCase()))
        )
      );

      if (newUniqueNames.length === 0) {
        return prevPlayers;
      }

      const newPlayers: Player[] = newUniqueNames.map((name, index) => ({
        id: Date.now() + index,
        name: name,
        rank: 0, // dummy rank
      }));

      const updatedPlayers = [...prevPlayers, ...newPlayers];

      return updatedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
    });
  };

  const handleRemovePlayer = (playerId: number) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.filter((p) => p.id !== playerId);
      const rerankedPlayers = updatedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
      return rerankedPlayers;
    });
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers((prevPlayers) => {
      const otherPlayers = prevPlayers.filter((p) => p.id !== updatedPlayer.id);
      const newRank = Math.max(
        1,
        Math.min(prevPlayers.length, updatedPlayer.rank)
      );
      const newRankIndex = newRank - 1;

      const newPlayerList = [
        ...otherPlayers.slice(0, newRankIndex),
        { ...updatedPlayer, rank: newRank },
        ...otherPlayers.slice(newRankIndex),
      ];

      return newPlayerList.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
    });
  };

  const handleRoundComplete = (
    finalPlayers: Player[],
    newHistoryEntry: RoundHistoryEntry
  ) => {
    setPlayers(finalPlayers);
    setRoundHistory((prev) => [newHistoryEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center border-b border-gray-700">
            <TabButton
              label="League"
              isActive={activeTab === "League"}
              onClick={() => setActiveTab("League")}
            />
            <TabButton
              label="Players"
              isActive={activeTab === "Players"}
              onClick={() => setActiveTab("Players")}
            />
            <TabButton
              label="History"
              isActive={activeTab === "History"}
              onClick={() => setActiveTab("History")}
            />
          </div>

          <div>
            {activeTab === "League" && (
              <LeagueManager
                allPlayers={players}
                onRoundComplete={handleRoundComplete}
              />
            )}
            {activeTab === "Players" && (
              <PlayersTab
                players={players}
                roundHistory={roundHistory}
                onAddPlayers={handleAddPlayers}
                onRemovePlayer={handleRemovePlayer}
                onUpdatePlayer={handleUpdatePlayer}
              />
            )}
            {activeTab === "History" && (
              <HistoryTab
                roundHistory={roundHistory}
                onImport={(history) => {
                  setRoundHistory(history);
                  if (history.length > 0) {
                    setPlayers(history[0].playersAfter);
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
