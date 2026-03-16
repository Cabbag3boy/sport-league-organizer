import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postCompleteRound } from "../rounds/complete/route";
import { DELETE as deleteRound } from "../rounds/[roundId]/route";
import { PATCH as patchRoundResults } from "../rounds/[roundId]/results/route";
import { POST as postRoundUndo } from "../rounds/[roundId]/undo/route";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import {
  completeRoundCore,
  deleteLastRoundCore,
  updateLastRoundResultsCore,
  undoLastRoundEditCore,
} from "@/features/rounds/services/roundMutationsCore";

vi.mock("@/utils/supabaseServer", () => ({
  createUserServerSupabase: vi.fn(),
}));

vi.mock("@/utils/authValidation", () => ({
  getAccessTokenFromRequest: vi.fn(),
  validateAuthenticatedRequest: vi.fn(),
}));

vi.mock("@/features/rounds/services/roundMutationsCore", () => ({
  completeRoundCore: vi.fn(),
  deleteLastRoundCore: vi.fn(),
  updateLastRoundResultsCore: vi.fn(),
  undoLastRoundEditCore: vi.fn(),
}));

type MockReq = {
  json: () => Promise<unknown>;
};

function makeReq(body: unknown = {}): MockReq {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("round mutation routes", () => {
  const supabase = { auth: {} } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserServerSupabase).mockReturnValue(supabase);
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({ valid: true });
  });

  it("POST /api/rounds/complete returns 401 when token is missing", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);

    const res = await postCompleteRound(makeReq({}) as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Missing session token");
    expect(completeRoundCore).not.toHaveBeenCalled();
  });

  it("POST /api/rounds/complete delegates payload to completeRoundCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-r1");
    vi.mocked(completeRoundCore).mockResolvedValue({ roundId: "r1" } as any);

    const payload = {
      leagueId: "league-1",
      seasonId: "season-1",
      finalPlayers: [],
      entry: {
        id: "temp",
        date: "2026-01-01",
        present_players: [],
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    };

    const res = await postCompleteRound(makeReq(payload) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(completeRoundCore).toHaveBeenCalledWith(supabase, payload);
    expect(body.roundId).toBe("r1");
  });

  it("DELETE /api/rounds/[roundId] returns 401 on failed validation", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-r2");
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({
      valid: false,
      error: "CSRF validation failed",
    });

    const res = await deleteRound(makeReq({}) as any, {
      params: Promise.resolve({ roundId: "round-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("CSRF validation failed");
    expect(deleteLastRoundCore).not.toHaveBeenCalled();
  });

  it("DELETE /api/rounds/[roundId] maps body+route params to deleteLastRoundCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-r3");
    vi.mocked(deleteLastRoundCore).mockResolvedValue({
      success: true,
      revertedCount: 2,
      isLastRound: true,
    } as any);

    const payload = {
      leagueId: "league-1",
      playersBefore: [
        {
          id: "p1",
          first_name: "A",
          last_name: "B",
          name: "A B",
          rank: 1,
        },
      ],
    };

    const res = await deleteRound(makeReq(payload) as any, {
      params: Promise.resolve({ roundId: "round-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(deleteLastRoundCore).toHaveBeenCalledWith(
      supabase,
      "league-1",
      "round-1",
      payload.playersBefore,
    );
    expect(body.success).toBe(true);
  });

  it("PATCH /api/rounds/[roundId]/results maps body+route params to updateLastRoundResultsCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-r4");
    vi.mocked(updateLastRoundResultsCore).mockResolvedValue({
      playersUpdated: 3,
      matchesUpdated: 4,
    } as any);

    const newScores = {
      "g1-m1": { score1: "10", score2: "8" },
    };

    const res = await patchRoundResults(
      makeReq({ leagueId: "league-1", newScores }) as any,
      {
        params: Promise.resolve({ roundId: "round-2" }),
      },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(updateLastRoundResultsCore).toHaveBeenCalledWith(
      supabase,
      "league-1",
      "round-2",
      newScores,
    );
    expect(body.matchesUpdated).toBe(4);
  });

  it("POST /api/rounds/[roundId]/undo maps body+route params to undoLastRoundEditCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-r5");
    vi.mocked(undoLastRoundEditCore).mockResolvedValue({
      playersUpdated: 2,
      matchesUpdated: 3,
    } as any);

    const res = await postRoundUndo(makeReq({ leagueId: "league-1" }) as any, {
      params: Promise.resolve({ roundId: "round-3" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(undoLastRoundEditCore).toHaveBeenCalledWith(
      supabase,
      "league-1",
      "round-3",
    );
    expect(body.playersUpdated).toBe(2);
  });
});
