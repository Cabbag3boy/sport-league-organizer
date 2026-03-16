import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postLeague } from "../league/route";
import {
  PATCH as patchLeague,
  DELETE as deleteLeague,
} from "../league/[leagueId]/route";
import { POST as postSeason } from "../seasons/route";
import {
  PATCH as patchSeason,
  DELETE as deleteSeason,
} from "../seasons/[seasonId]/route";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import {
  createLeagueCore,
  updateLeagueCore,
  deleteLeagueCore,
} from "@/features/league/services/leagueMutationsCore";
import {
  createSeasonCore,
  updateSeasonCore,
  deleteSeasonCore,
} from "@/features/seasons/services/seasonMutationsCore";

vi.mock("@/utils/supabaseServer", () => ({
  createUserServerSupabase: vi.fn(),
}));

vi.mock("@/utils/authValidation", () => ({
  getAccessTokenFromRequest: vi.fn(),
  validateAuthenticatedRequest: vi.fn(),
}));

vi.mock("@/features/league/services/leagueMutationsCore", () => ({
  createLeagueCore: vi.fn(),
  updateLeagueCore: vi.fn(),
  deleteLeagueCore: vi.fn(),
}));

vi.mock("@/features/seasons/services/seasonMutationsCore", () => ({
  createSeasonCore: vi.fn(),
  updateSeasonCore: vi.fn(),
  deleteSeasonCore: vi.fn(),
}));

type MockReq = {
  json: () => Promise<unknown>;
};

function makeReq(body: unknown = {}): MockReq {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("league/season mutation routes", () => {
  const supabase = { auth: {} } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserServerSupabase).mockReturnValue(supabase);
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({ valid: true });
  });

  it("POST /api/league returns 401 when token is missing", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);

    const res = await postLeague(makeReq({ name: "A" }) as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Missing session token");
    expect(createLeagueCore).not.toHaveBeenCalled();
  });

  it("POST /api/league creates league when validation passes", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-1");
    vi.mocked(createLeagueCore).mockResolvedValue({
      id: "l1",
      name: "A",
    } as any);

    const res = await postLeague(makeReq({ name: "A" }) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createUserServerSupabase).toHaveBeenCalledWith("token-1");
    expect(validateAuthenticatedRequest).toHaveBeenCalled();
    expect(createLeagueCore).toHaveBeenCalledWith(supabase, { name: "A" });
    expect(body.id).toBe("l1");
  });

  it("PATCH /api/league/[leagueId] returns 401 when validation fails", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-2");
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({
      valid: false,
      error: "Authentication failed",
    });

    const res = await patchLeague(makeReq({ name: "Updated" }) as any, {
      params: Promise.resolve({ leagueId: "league-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Authentication failed");
    expect(updateLeagueCore).not.toHaveBeenCalled();
  });

  it("PATCH /api/league/[leagueId] updates league on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-2");
    vi.mocked(updateLeagueCore).mockResolvedValue({
      id: "league-1",
      name: "Updated",
    } as any);

    const res = await patchLeague(makeReq({ name: "Updated" }) as any, {
      params: Promise.resolve({ leagueId: "league-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(updateLeagueCore).toHaveBeenCalledWith(supabase, "league-1", {
      name: "Updated",
    });
    expect(body.name).toBe("Updated");
  });

  it("DELETE /api/league/[leagueId] deletes league on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-3");

    const res = await deleteLeague(makeReq() as any, {
      params: Promise.resolve({ leagueId: "league-9" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(deleteLeagueCore).toHaveBeenCalledWith(supabase, "league-9");
    expect(body.success).toBe(true);
  });

  it("POST /api/seasons creates season on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-4");
    vi.mocked(createSeasonCore).mockResolvedValue({
      id: "s1",
      league_id: "l1",
      name: "S",
      created_at: "2026-01-01",
    } as any);

    const res = await postSeason(makeReq({ name: "S", leagueId: "l1" }) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createSeasonCore).toHaveBeenCalledWith(supabase, {
      name: "S",
      leagueId: "l1",
    });
    expect(body.id).toBe("s1");
  });

  it("PATCH /api/seasons/[seasonId] updates season on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-5");
    vi.mocked(updateSeasonCore).mockResolvedValue({
      id: "season-1",
      league_id: "league-1",
      name: "Season X",
      created_at: "2026-01-01",
    } as any);

    const res = await patchSeason(makeReq({ name: "Season X" }) as any, {
      params: Promise.resolve({ seasonId: "season-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(updateSeasonCore).toHaveBeenCalledWith(supabase, "season-1", {
      name: "Season X",
    });
    expect(body.name).toBe("Season X");
  });

  it("DELETE /api/seasons/[seasonId] returns 401 when validation fails", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-6");
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({
      valid: false,
      error: "CSRF validation failed",
    });

    const res = await deleteSeason(makeReq() as any, {
      params: Promise.resolve({ seasonId: "season-4" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("CSRF validation failed");
    expect(deleteSeasonCore).not.toHaveBeenCalled();
  });

  it("DELETE /api/seasons/[seasonId] deletes season on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-7");

    const res = await deleteSeason(makeReq() as any, {
      params: Promise.resolve({ seasonId: "season-7" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(deleteSeasonCore).toHaveBeenCalledWith(supabase, "season-7");
    expect(body.success).toBe(true);
  });
});
