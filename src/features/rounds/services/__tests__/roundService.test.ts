import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeRound,
  deleteLastRound,
  fetchRoundHistory,
  undoLastRoundEdit,
  updateLastRoundResults,
} from "../roundService";
import { apiFetch, apiMutate } from "@/utils/apiClient";

vi.mock("@/utils/apiClient", () => ({
  apiFetch: vi.fn(),
  apiMutate: vi.fn(),
}));

describe("roundService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completeRound delegates to POST /api/rounds/complete", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ roundId: "r1" } as any);

    const input = {
      leagueId: "l1",
      seasonId: "s1",
      finalPlayers: [],
      entry: {
        id: "r1",
        date: "2026-01-01",
        present_players: [],
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    } as any;

    await completeRound(input);

    expect(apiMutate).toHaveBeenCalledWith(
      "/api/rounds/complete",
      "POST",
      input,
    );
  });

  it("fetchRoundHistory delegates to GET /api/seasons/[id]/rounds", async () => {
    vi.mocked(apiFetch).mockResolvedValue([] as any);

    await fetchRoundHistory("season-1");

    expect(apiFetch).toHaveBeenCalledWith("/api/seasons/season-1/rounds");
  });

  it("deleteLastRound delegates to DELETE /api/rounds/[id] with payload", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ success: true } as any);

    const playersBefore = [
      { id: "p1", first_name: "A", last_name: "B", name: "A B", rank: 1 },
    ];

    await deleteLastRound("league-1", "round-1", playersBefore as any);

    expect(apiMutate).toHaveBeenCalledWith("/api/rounds/round-1", "DELETE", {
      leagueId: "league-1",
      playersBefore,
    });
  });

  it("updateLastRoundResults delegates to PATCH /api/rounds/[id]/results", async () => {
    vi.mocked(apiMutate).mockResolvedValue({
      playersUpdated: 1,
      matchesUpdated: 1,
    } as any);

    const newScores = {
      "g1-m1": { score1: "10", score2: "8" },
    };

    await updateLastRoundResults("league-1", "round-1", newScores);

    expect(apiMutate).toHaveBeenCalledWith(
      "/api/rounds/round-1/results",
      "PATCH",
      {
        leagueId: "league-1",
        newScores,
      },
    );
  });

  it("undoLastRoundEdit delegates to POST /api/rounds/[id]/undo", async () => {
    vi.mocked(apiMutate).mockResolvedValue({
      playersUpdated: 1,
      matchesUpdated: 1,
    } as any);

    await undoLastRoundEdit("league-1", "round-1");

    expect(apiMutate).toHaveBeenCalledWith("/api/rounds/round-1/undo", "POST", {
      leagueId: "league-1",
    });
  });
});
