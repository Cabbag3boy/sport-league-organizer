import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getLeaguePlayers } from "../league/[leagueId]/players/route";
import { GET as getLeagueEvents } from "../league/[leagueId]/events/route";
import { GET as getSeasonRounds } from "../seasons/[seasonId]/rounds/route";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";
import { fetchPlayersInLeagueServer } from "@/features/players/services/playerReadService";
import { fetchLeagueEventsServer } from "@/features/events/services/eventReadService";
import { fetchRoundHistoryServer } from "@/features/rounds/services/roundReadService";

vi.mock("@/utils/supabaseServer", () => ({
  createPublicServerSupabase: vi.fn(),
}));

vi.mock("@/utils/authValidation", () => ({
  getAccessTokenFromRequest: vi.fn(),
  validateSessionToken: vi.fn(),
}));

vi.mock("@/features/players/services/playerReadService", () => ({
  fetchPlayersInLeagueServer: vi.fn(),
}));

vi.mock("@/features/events/services/eventReadService", () => ({
  fetchLeagueEventsServer: vi.fn(),
}));

vi.mock("@/features/rounds/services/roundReadService", () => ({
  fetchRoundHistoryServer: vi.fn(),
}));

describe("league/season read routes", () => {
  const supabase = { auth: {} } as any;
  const req = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createPublicServerSupabase).mockReturnValue(supabase);
    vi.mocked(validateSessionToken).mockResolvedValue({ valid: true });
  });

  it("GET /api/league/[leagueId]/players allows anonymous reads", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);
    vi.mocked(fetchPlayersInLeagueServer).mockResolvedValue([
      {
        id: "p1",
        first_name: "A",
        last_name: "B",
        name: "A B",
        rank: 1,
      },
    ] as any);

    const res = await getLeaguePlayers(req, {
      params: Promise.resolve({ leagueId: "league-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createPublicServerSupabase).toHaveBeenCalledWith(undefined);
    expect(validateSessionToken).not.toHaveBeenCalled();
    expect(fetchPlayersInLeagueServer).toHaveBeenCalledWith(
      supabase,
      "league-1",
    );
    expect(body).toHaveLength(1);
  });

  it("GET /api/league/[leagueId]/players returns 401 for invalid token", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("bad-token");
    vi.mocked(validateSessionToken).mockResolvedValue({
      valid: false,
      error: "Invalid token",
    });

    const res = await getLeaguePlayers(req, {
      params: Promise.resolve({ leagueId: "league-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid token");
    expect(fetchPlayersInLeagueServer).not.toHaveBeenCalled();
  });

  it("GET /api/league/[leagueId]/events returns events for valid token", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-1");
    vi.mocked(fetchLeagueEventsServer).mockResolvedValue([
      {
        id: "e1",
        created_at: "2026-01-01",
        title: "T",
        content: "C",
        pinned: false,
        league_id: "league-1",
      },
    ] as any);

    const res = await getLeagueEvents(req, {
      params: Promise.resolve({ leagueId: "league-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createPublicServerSupabase).toHaveBeenCalledWith("token-1");
    expect(validateSessionToken).toHaveBeenCalledWith(supabase, req);
    expect(fetchLeagueEventsServer).toHaveBeenCalledWith(supabase, "league-1");
    expect(body[0]?.id).toBe("e1");
  });

  it("GET /api/league/[leagueId]/events returns 401 for invalid token", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("bad-token");
    vi.mocked(validateSessionToken).mockResolvedValue({
      valid: false,
      error: "Authentication failed",
    });

    const res = await getLeagueEvents(req, {
      params: Promise.resolve({ leagueId: "league-9" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Authentication failed");
    expect(fetchLeagueEventsServer).not.toHaveBeenCalled();
  });

  it("GET /api/seasons/[seasonId]/rounds returns rounds for valid token", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-2");
    vi.mocked(fetchRoundHistoryServer).mockResolvedValue([
      {
        id: "r1",
        date: "2026-01-01",
        present_players: [],
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    ] as any);

    const res = await getSeasonRounds(req, {
      params: Promise.resolve({ seasonId: "season-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createPublicServerSupabase).toHaveBeenCalledWith("token-2");
    expect(validateSessionToken).toHaveBeenCalledWith(supabase, req);
    expect(fetchRoundHistoryServer).toHaveBeenCalledWith(supabase, "season-1");
    expect(body[0]?.id).toBe("r1");
  });

  it("GET /api/seasons/[seasonId]/rounds allows anonymous reads", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);
    vi.mocked(fetchRoundHistoryServer).mockResolvedValue([] as any);

    const res = await getSeasonRounds(req, {
      params: Promise.resolve({ seasonId: "season-2" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(validateSessionToken).not.toHaveBeenCalled();
    expect(fetchRoundHistoryServer).toHaveBeenCalledWith(supabase, "season-2");
    expect(body).toEqual([]);
  });
});
