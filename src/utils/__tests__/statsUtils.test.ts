import { describe, it, expect } from "vitest";
import { calculateStandings } from "../shared/statsUtils";
import type { Player, RoundHistoryEntry } from "../../types";

describe("statsUtils", () => {
  describe("calculateStandings", () => {
    const mockPlayers: Player[] = [
      {
        id: "p1",
        first_name: "John",
        last_name: "Doe",
        name: "John Doe",
        rank: 1,
      },
      {
        id: "p2",
        first_name: "Jane",
        last_name: "Smith",
        name: "Jane Smith",
        rank: 2,
      },
    ];

    const mockHistory: RoundHistoryEntry[] = [];

    it("should calculate standings for players", () => {
      const result = calculateStandings(mockPlayers, mockHistory);
      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it("should handle empty player list", () => {
      const result = calculateStandings([], mockHistory);
      expect(result).toBeDefined();
    });
  });
});

