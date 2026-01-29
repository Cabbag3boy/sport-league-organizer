import { useCallback } from "react";
import type { Player } from "../../../types";
import * as playerService from "../services/playerService";

interface UsePlayerDataResult {
  addPlayer: (leagueId: string, playerName: string) => Promise<Player>;
  addExistingPlayer: (leagueId: string, playerId: string) => Promise<Player>;
  removePlayer: (leagueId: string, playerId: string) => Promise<void>;
  updatePlayer: (leagueId: string, player: Player) => Promise<Player>;
  fetchPlayers: (leagueId: string) => Promise<Player[]>;
}

/**
 * Custom hook for player data operations
 * Encapsulates all player-related service calls
 * Provides consistent error handling and typing
 */
export const usePlayerData = (): UsePlayerDataResult => {
  const addPlayer = useCallback(
    async (leagueId: string, playerName: string): Promise<Player> => {
      return playerService.addPlayer({
        leagueId,
        playerName,
      });
    },
    []
  );

  const addExistingPlayer = useCallback(
    async (leagueId: string, playerId: string): Promise<Player> => {
      return playerService.addExistingPlayer({
        leagueId,
        playerId,
      });
    },
    []
  );

  const removePlayer = useCallback(
    async (leagueId: string, playerId: string): Promise<void> => {
      return playerService.removePlayer({
        leagueId,
        playerId,
      });
    },
    []
  );

  const updatePlayer = useCallback(
    async (leagueId: string, player: Player): Promise<Player> => {
      return playerService.updatePlayer({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        rank: player.rank,
        leagueId,
      });
    },
    []
  );

  const fetchPlayers = useCallback(
    async (leagueId: string): Promise<Player[]> => {
      return playerService.fetchPlayersInLeague(leagueId);
    },
    []
  );

  return {
    addPlayer,
    addExistingPlayer,
    removePlayer,
    updatePlayer,
    fetchPlayers,
  };
};

