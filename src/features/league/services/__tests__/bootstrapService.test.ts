import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBootstrapLeagueData } from "../bootstrapService";
import { createMockQueryBuilder } from "@/test/supabase-mock";

function createSupabaseMock(
  responses: Record<string, { data: unknown; error: unknown }>,
) {
  return {
    from: vi.fn((table: string) => {
      const response = responses[table] || { data: [], error: null };
      return createMockQueryBuilder(response.data, response.error);
    }),
  } as any;
}

describe("bootstrapService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty bootstrap payload when no leagues are available", async () => {
    const supabase = createSupabaseMock({
      leagues: { data: [], error: null },
      players: { data: [], error: null },
    });

    const result = await fetchBootstrapLeagueData(supabase);

    expect(result.leagues).toEqual([]);
    expect(result.selectedLeagueId).toBe("");
    expect(result.selectedSeasonId).toBe("");
    expect(result.players).toEqual([]);
    expect(result.roundHistory).toEqual([]);
  });

  it("hydrates leagues, seasons, players, events, and rounds", async () => {
    const supabase = createSupabaseMock({
      leagues: {
        data: [{ id: "league-1", name: "League 1" }],
        error: null,
      },
      players: {
        data: [{ id: "gp-1", first_name: "A", last_name: "B" }],
        error: null,
      },
      seasons: {
        data: [
          {
            id: "season-1",
            league_id: "league-1",
            name: "2026",
            created_at: "2026-01-01",
          },
        ],
        error: null,
      },
      events: {
        data: [
          {
            id: "event-1",
            created_at: "2026-01-01",
            title: "Opening",
            content: "Start",
            pinned: true,
            league_id: "league-1",
          },
        ],
        error: null,
      },
      players_in_leagues: {
        data: [
          {
            id: "pil-1",
            league_id: "league-1",
            player_id: "gp-1",
            rank: 1,
            players: {
              id: "gp-1",
              first_name: "A",
              last_name: "B",
            },
          },
        ],
        error: null,
      },
      rounds: {
        data: [
          {
            id: "round-1",
            season_id: "season-1",
            created_at: "2026-02-01",
            present_players: ["gp-1"],
            details: {
              groups: [],
              scores: {},
              finalPlacements: [],
              playersBefore: [],
              playersAfter: [],
            },
          },
        ],
        error: null,
      },
    });

    const result = await fetchBootstrapLeagueData(supabase);

    expect(result.selectedLeagueId).toBe("league-1");
    expect(result.selectedSeasonId).toBe("season-1");
    expect(result.players).toHaveLength(1);
    expect(result.players[0]?.name).toBe("A B");
    expect(result.events).toHaveLength(1);
    expect(result.roundHistory).toHaveLength(1);
    expect(result.roundHistory[0]?.id).toBe("round-1");
  });

  it("throws when leagues query fails", async () => {
    const supabase = createSupabaseMock({
      leagues: {
        data: null,
        error: new Error("leagues failed"),
      },
      players: {
        data: [],
        error: null,
      },
    });

    await expect(fetchBootstrapLeagueData(supabase)).rejects.toThrow(
      "leagues failed",
    );
  });
});
