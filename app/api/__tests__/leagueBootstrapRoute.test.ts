import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getBootstrap } from "../league/bootstrap/route";
import { fetchBootstrapLeagueData } from "@/features/league/services";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";

vi.mock("@/features/league/services", () => ({
  fetchBootstrapLeagueData: vi.fn(),
}));

vi.mock("@/utils/supabaseServer", () => ({
  createPublicServerSupabase: vi.fn(),
}));

vi.mock("@/utils/authValidation", () => ({
  getAccessTokenFromRequest: vi.fn(),
  validateSessionToken: vi.fn(),
}));

function makeReq(url = "http://localhost/api/league/bootstrap") {
  return {
    nextUrl: new URL(url),
  } as any;
}

describe("league bootstrap route", () => {
  const supabase = { auth: {} } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createPublicServerSupabase).mockReturnValue(supabase);
    vi.mocked(validateSessionToken).mockResolvedValue({ valid: true });
  });

  it("allows anonymous bootstrap reads", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);
    vi.mocked(fetchBootstrapLeagueData).mockResolvedValue({
      leagues: [],
      seasons: [],
      globalPlayers: [],
      players: [],
      events: [],
      roundHistory: [],
      selectedLeagueId: "",
      selectedSeasonId: "",
    } as any);

    const res = await getBootstrap(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createPublicServerSupabase).toHaveBeenCalledWith(undefined);
    expect(validateSessionToken).not.toHaveBeenCalled();
    expect(fetchBootstrapLeagueData).toHaveBeenCalledWith(supabase, "", "");
    expect(body.leagues).toEqual([]);
  });

  it("returns 401 when authenticated token validation fails", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("bad-token");
    vi.mocked(validateSessionToken).mockResolvedValue({
      valid: false,
      error: "Invalid token",
    });

    const res = await getBootstrap(makeReq());
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid token");
    expect(fetchBootstrapLeagueData).not.toHaveBeenCalled();
  });

  it("forwards leagueId and seasonId query params", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-1");
    vi.mocked(fetchBootstrapLeagueData).mockResolvedValue({
      leagues: [{ id: "league-1", name: "L1" }],
      seasons: [{ id: "season-1", league_id: "league-1", name: "S1" }],
      globalPlayers: [],
      players: [],
      events: [],
      roundHistory: [],
      selectedLeagueId: "league-1",
      selectedSeasonId: "season-1",
    } as any);

    const req = makeReq(
      "http://localhost/api/league/bootstrap?leagueId=league-1&seasonId=season-1",
    );
    const res = await getBootstrap(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createPublicServerSupabase).toHaveBeenCalledWith("token-1");
    expect(validateSessionToken).toHaveBeenCalledWith(supabase, req);
    expect(fetchBootstrapLeagueData).toHaveBeenCalledWith(
      supabase,
      "league-1",
      "season-1",
    );
    expect(body.selectedLeagueId).toBe("league-1");
    expect(body.selectedSeasonId).toBe("season-1");
  });

  it("returns 500 when bootstrap service throws", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);
    vi.mocked(fetchBootstrapLeagueData).mockRejectedValue(new Error("boom"));

    const res = await getBootstrap(makeReq());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("boom");
  });
});
