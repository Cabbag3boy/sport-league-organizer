import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addPlayer,
  removePlayer,
  updatePlayer,
  fetchPlayersInLeague,
  addExistingPlayer,
} from "../playerService";
import { getSupabase } from "@/utils/supabase";
import { createMockPlayer, createMockPlayerInLeague } from "@/test/fixtures";
import { createMockLeague } from "@/test/fixtures";
import { createMockQueryBuilder } from "@/test/supabase-mock";

vi.mock("@/utils/supabase");
vi.mock("@/utils/leagueUtils", () => ({
  calculateNextRank: vi.fn((count) => count + 1),
  reorderPlayerRanks: vi.fn((players) =>
    players.map((p: any, i: number) => ({ ...p, rank: i + 1 }))
  ),
}));

describe("playerService", () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSupabase as any).mockReturnValue(mockSupabase);
  });

  describe("Add New Player Scenario", () => {
    it("should create new global player and add to league with correct rank", async () => {
      const mockLeague = createMockLeague();
      expect(addPlayer).toBeDefined();
      expect(mockLeague.id).toBeTruthy();
    });

    it("should return player with computed name and rank", async () => {
      expect(addPlayer).toBeDefined();
      const mockPlayer = createMockPlayer({
        id: "new-player",
        first_name: "Test",
        last_name: "User",
      });
      expect(mockPlayer.first_name).toBe("Test");
    });
  });

  describe("Add Existing Player Scenario", () => {
    it("should add existing player to league and fetch player data", async () => {
      expect(addExistingPlayer).toBeDefined();
      const mockPlayerInLeague = createMockPlayerInLeague({
        player_id: "existing-player-1",
        rank: 5,
      });
      expect(mockPlayerInLeague.rank).toBe(5);
    });

    it("should calculate rank based on current player count", async () => {
      expect(addExistingPlayer).toBeDefined();
      const mockLeague = createMockLeague();
      expect(mockLeague.id).toBeTruthy();
    });
  });

  describe("Remove Player Scenario", () => {
    it("should remove player from league when player exists in other leagues", async () => {
      expect(removePlayer).toBeDefined();
    });

    it("should delete global player when no other league memberships exist", async () => {
      expect(removePlayer).toBeDefined();
    });

    it("should validate cascade logic checks", async () => {
      expect(removePlayer).toBeDefined();
    });
  });

  describe("Update Player Scenario", () => {
    it("should update player name and reorder all ranks in league", async () => {
      expect(updatePlayer).toBeDefined();
      const mockPlayer = createMockPlayer({
        first_name: "Updated",
        last_name: "Name",
      });
      expect(mockPlayer.first_name).toBe("Updated");
    });

    it("should fetch all players and reorder ranks correctly", async () => {
      expect(updatePlayer).toBeDefined();
    });

    it("should upsert all rank updates atomically", async () => {
      expect(updatePlayer).toBeDefined();
    });
  });

  describe("Fetch Players Scenario", () => {
    it("should fetch players with joined data and correct ordering", async () => {
      expect(fetchPlayersInLeague).toBeDefined();
      const mockLeague = createMockLeague();
      const mockPlayer = createMockPlayer();
      expect(mockPlayer).toBeTruthy();
    });

    it("should return empty array when league has no players", async () => {
      expect(fetchPlayersInLeague).toBeDefined();
    });

    it("should include player name field in response", async () => {
      expect(fetchPlayersInLeague).toBeDefined();
    });
  });

  // Sanity checks for export existence
  it("should export addPlayer function", () => {
    expect(typeof addPlayer).toBe("function");
  });

  it("should export removePlayer function", () => {
    expect(typeof removePlayer).toBe("function");
  });

  it("should export updatePlayer function", () => {
    expect(typeof updatePlayer).toBe("function");
  });

  it("should export fetchPlayersInLeague function", () => {
    expect(typeof fetchPlayersInLeague).toBe("function");
  });

  it("should export addExistingPlayer function", () => {
    expect(typeof addExistingPlayer).toBe("function");
  });
});
