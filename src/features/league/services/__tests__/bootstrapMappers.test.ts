import { describe, it, expect } from "vitest";
import {
  mapPlayerInLeagueRowToPlayer,
  mapRoundToHistoryEntry,
} from "../bootstrapMappers";
import type { DBRound } from "@/types";

describe("bootstrapMappers", () => {
  it("maps joined player row into Player shape", () => {
    const result = mapPlayerInLeagueRowToPlayer({
      id: "pil-1",
      league_id: "league-1",
      player_id: "player-1",
      rank: 3,
      players: {
        id: "player-1",
        first_name: "Jan",
        last_name: "Novak",
      },
    });

    expect(result).toEqual({
      id: "player-1",
      first_name: "Jan",
      last_name: "Novak",
      name: "Jan Novak",
      rank: 3,
    });
  });

  it("supports array join payload and picks first player", () => {
    const result = mapPlayerInLeagueRowToPlayer({
      id: "pil-1",
      league_id: "league-1",
      player_id: "player-1",
      rank: 1,
      players: [
        {
          id: "player-1",
          first_name: "Eva",
          last_name: "Kralova",
        },
      ],
    });

    expect(result?.name).toBe("Eva Kralova");
    expect(result?.rank).toBe(1);
  });

  it("returns null when join is missing", () => {
    const result = mapPlayerInLeagueRowToPlayer({
      id: "pil-1",
      league_id: "league-1",
      player_id: "missing",
      rank: 1,
      players: null,
    });

    expect(result).toBeNull();
  });

  it("maps round details into history entry with defaults", () => {
    const round = {
      id: "round-1",
      season_id: "season-1",
      created_at: "2026-03-01T10:00:00Z",
      present_players: ["p1", "p2"],
      details: {
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    } as DBRound;

    const result = mapRoundToHistoryEntry(round);

    expect(result.id).toBe("round-1");
    expect(result.date).toBe("2026-03-01T10:00:00Z");
    expect(result.groups).toEqual([]);
    expect(result.scores).toEqual({});
    expect(result.finalPlacements).toEqual([]);
  });
});
