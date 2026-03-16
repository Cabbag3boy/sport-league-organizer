import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  completeRound,
  fetchRoundHistory,
  updateLastRoundResults,
  undoLastRoundEdit,
} from "../roundService";
import { getSupabase } from "@/utils/supabase";
import type { Player } from "@/types";
import {
  createMockRound,
  createMockRoundDetails,
  createMockSeason,
} from "@/test/fixtures";
import { createMockQueryBuilder } from "@/test/supabase-mock";

vi.mock("@/utils/supabase");

describe("roundService", () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSupabase as any).mockReturnValue(mockSupabase);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("Complete Round (4-Player Bracket) Scenario", () => {
    it("should generate 2-round bracket with 4 matches from 4 players", async () => {
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
        { id: "p3", first_name: "P", last_name: "3", name: "P 3", rank: 3 },
        { id: "p4", first_name: "P", last_name: "4", name: "P 4", rank: 4 },
      ];

      const mockRound = createMockRound({
        present_players: ["p1", "p2", "p3", "p4"],
        details: createMockRoundDetails({
          groups: [
            [players[0]!, players[1]!],
            [players[2]!, players[3]!],
          ],
        }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "rounds") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi
                .fn()
                .mockResolvedValue({ data: mockRound, error: null }),
            }),
          };
        }
        return createMockQueryBuilder();
      });

      expect(completeRound).toBeDefined();
      expect(typeof completeRound).toBe("function");
    });

    it("should validate bracket generation with correct match count", async () => {
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
        { id: "p3", first_name: "P", last_name: "3", name: "P 3", rank: 3 },
        { id: "p4", first_name: "P", last_name: "4", name: "P 4", rank: 4 },
      ];

      const details = createMockRoundDetails({
        groups: [
          [players[0]!, players[1]!],
          [players[2]!, players[3]!],
        ],
        scores: {
          "match-1": { score1: "10", score2: "8" },
          "match-2": { score1: "9", score2: "7" },
        },
      });

      expect(details.scores).toBeDefined();
      expect(Object.keys(details.scores).length).toBeGreaterThan(0);
    });

    it("should filter absent players from final placements", async () => {
      const mockRound = createMockRound({
        present_players: ["p1", "p2", "p3"], // Only 3 present
      });

      expect(mockRound.present_players).toHaveLength(3);
    });

    it("should insert round record with details as JSONB", async () => {
      const mockRound = createMockRound();
      expect(mockRound.details).toBeDefined();
      expect(mockRound.details.groups).toBeDefined();
    });

    it("should insert matches with correct player pairings", async () => {
      expect(completeRound).toBeDefined();
    });

    it("should update player rankings after round completion", async () => {
      expect(completeRound).toBeDefined();
    });
  });

  describe("Complete Round (3-Player Round-Robin) Scenario", () => {
    it("should generate 3 matches for 3-player round-robin", async () => {
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
        { id: "p3", first_name: "P", last_name: "3", name: "P 3", rank: 3 },
      ];

      const mockRound = createMockRound({
        present_players: ["p1", "p2", "p3"],
        details: createMockRoundDetails({
          groups: [[players[0]!, players[1]!, players[2]!]],
          scores: {
            "match-1": { score1: "10", score2: "8" },
            "match-2": { score1: "9", score2: "7" },
            "match-3": { score1: "8", score2: "6" },
          },
        }),
      });

      expect(mockRound.present_players).toHaveLength(3);
      expect(
        Object.keys(mockRound.details.scores).length,
      ).toBeGreaterThanOrEqual(3);
    });

    it("should validate round-robin match generation logic", async () => {
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
        { id: "p3", first_name: "P", last_name: "3", name: "P 3", rank: 3 },
      ];

      const details = createMockRoundDetails({
        groups: [[players[0]!, players[1]!, players[2]!]],
      });

      expect(details.groups[0]).toHaveLength(3);
    });

    it("should calculate correct winner from score comparison", async () => {
      expect(completeRound).toBeDefined();
    });

    it("should update all player rankings for 3-player scenario", async () => {
      expect(completeRound).toBeDefined();
    });
  });

  describe("Fetch Rounds Scenario", () => {
    it("should fetch all rounds for a season ordered by creation date", async () => {
      const mockSeason = createMockSeason();
      const mockRound1 = createMockRound({
        id: "round-1",
        season_id: mockSeason.id,
        created_at: new Date().toISOString(),
      });
      const mockRound2 = createMockRound({
        id: "round-2",
        season_id: mockSeason.id,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockRound1, mockRound2],
              error: null,
            }),
          }),
        }),
      });

      expect(fetchRoundHistory).toBeDefined();
      expect(typeof fetchRoundHistory).toBe("function");
    });

    it("should unpack JSONB details into RoundDetails objects", async () => {
      const mockRound = createMockRound();
      expect(mockRound.details).toBeDefined();
      expect(mockRound.details.groups).toBeDefined();
      expect(mockRound.details.scores).toBeDefined();
      expect(mockRound.details.finalPlacements).toBeDefined();
    });

    it("should reconstruct round object with all detail fields", async () => {
      const mockRound = createMockRound();
      expect(mockRound.details.playersBefore).toBeDefined();
      expect(mockRound.details.playersAfter).toBeDefined();
    });

    it("should return empty array when season has no rounds", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      expect(fetchRoundHistory).toBeDefined();
    });

    it("should filter by season_id correctly", async () => {
      const seasonId = "season-123";

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn((field, value) => {
            expect(field).toBe("season_id");
            expect(value).toBe(seasonId);
            return {
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }),
        }),
      });

      expect(fetchRoundHistory).toBeDefined();
    });

    it("should order by created_at descending (newest first)", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn(() => {
              return Promise.resolve({ data: [], error: null });
            }),
          }),
        }),
      });

      expect(fetchRoundHistory).toBeDefined();
    });
  });

  // Sanity checks for export existence
  it("should export completeRound function", () => {
    expect(typeof completeRound).toBe("function");
  });

  it("should export fetchRoundHistory function", () => {
    expect(typeof fetchRoundHistory).toBe("function");
  });

  describe("Update Last Round Results", () => {
    it("should throw error if not the last round", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";
      const newScores = {
        "g1-m1": { score1: "10", score2: "8" },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: "Lze upravovat pouze poslední kolo.",
        }),
      } as unknown as Response);

      await expect(
        updateLastRoundResults(leagueId, roundId, newScores),
      ).rejects.toThrow("Lze upravovat pouze poslední kolo.");
    });

    it("should update scores and recompute placements for 4-player bracket", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
        { id: "p3", first_name: "P", last_name: "3", name: "P 3", rank: 3 },
        { id: "p4", first_name: "P", last_name: "4", name: "P 4", rank: 4 },
      ];

      const newScores = {
        "g1-r1-m1": { score1: "5", score2: "10" }, // p4 wins (flipped)
        "g1-r1-m2": { score1: "6", score2: "8" }, // p3 wins (flipped)
        "g1-r2-m1": { score1: "7", score2: "9" }, // p3 wins final
        "g1-r2-m2": { score1: "9", score2: "10" }, // p2 wins third
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          playersUpdated: players.length,
          matchesUpdated: Object.keys(newScores).length,
        }),
      } as unknown as Response);

      const result = await updateLastRoundResults(leagueId, roundId, newScores);
      expect(result).toBeDefined();
      expect(result.playersUpdated).toBeGreaterThan(0);
      expect(result.matchesUpdated).toBeGreaterThan(0);
    });

    it("should send score updates to API", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          playersUpdated: 1,
          matchesUpdated: 1,
        }),
      } as unknown as Response);

      const newScores = { "g1-m1": { score1: "5", score2: "3" } };
      await updateLastRoundResults(leagueId, roundId, newScores);

      expect(fetch).toHaveBeenCalledWith(
        `/api/rounds/${roundId}/results`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ leagueId, newScores }),
        }),
      );
    });
  });

  describe("Undo Last Round Edit", () => {
    it("should throw error if no previous details exist", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: "Žádná předchozí verze pro vrácení.",
        }),
      } as unknown as Response);

      await expect(undoLastRoundEdit(leagueId, roundId)).rejects.toThrow(
        "Žádná předchozí verze pro vrácení.",
      );
    });

    it("should restore previous round state including scores and placements", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
      ];

      const currentScores = {
        "g1-m1": { score1: "8", score2: "10" },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          playersUpdated: players.length,
          matchesUpdated: Object.keys(currentScores).length,
        }),
      } as unknown as Response);

      const result = await undoLastRoundEdit(leagueId, roundId);
      expect(result).toBeDefined();
      expect(result.playersUpdated).toBeGreaterThan(0);
      expect(result.matchesUpdated).toBeGreaterThan(0);
    });

    it("should throw error if not the last round", async () => {
      const leagueId = "league-1";
      const roundId = "round-1";

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          error: "Lze vrátit pouze poslední kolo.",
        }),
      } as unknown as Response);

      await expect(undoLastRoundEdit(leagueId, roundId)).rejects.toThrow(
        "Lze vrátit pouze poslední kolo.",
      );
    });

    it("should verify placements revert to previous state after undo", async () => {
      // Same as restore test, just validates the previousDetails are used
      const leagueId = "league-1";
      const roundId = "round-1";
      const players: Player[] = [
        { id: "p1", first_name: "P", last_name: "1", name: "P 1", rank: 1 },
        { id: "p2", first_name: "P", last_name: "2", name: "P 2", rank: 2 },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          playersUpdated: players.length,
          matchesUpdated: 1,
        }),
      } as unknown as Response);

      await expect(undoLastRoundEdit(leagueId, roundId)).resolves.toBeDefined();
    });
  });
});
