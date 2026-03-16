import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as postEvent } from "../events/route";
import {
  DELETE as deleteEvent,
  PATCH as patchEvent,
} from "../events/[eventId]/route";
import { POST as postPlayer } from "../players/route";
import { DELETE as deletePlayer } from "../players/[playerId]/route";
import { PATCH as patchPlayer } from "../players/[playerId]/edit/route";
import { createUserServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateAuthenticatedRequest,
} from "@/utils/authValidation";
import {
  createEventCore,
  deleteEventCore,
  updateEventCore,
} from "@/features/events/services/eventMutationsCore";
import {
  addExistingPlayerCore,
  addPlayerCore,
  removePlayerCore,
  updatePlayerCore,
} from "@/features/players/services/playerMutationsCore";

vi.mock("@/utils/supabaseServer", () => ({
  createUserServerSupabase: vi.fn(),
}));

vi.mock("@/utils/authValidation", () => ({
  getAccessTokenFromRequest: vi.fn(),
  validateAuthenticatedRequest: vi.fn(),
}));

vi.mock("@/features/events/services/eventMutationsCore", () => ({
  createEventCore: vi.fn(),
  deleteEventCore: vi.fn(),
  updateEventCore: vi.fn(),
}));

vi.mock("@/features/players/services/playerMutationsCore", () => ({
  addPlayerCore: vi.fn(),
  addExistingPlayerCore: vi.fn(),
  removePlayerCore: vi.fn(),
  updatePlayerCore: vi.fn(),
}));

type MockReq = {
  json: () => Promise<unknown>;
};

function makeReq(body: unknown = {}): MockReq {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("event/player mutation routes", () => {
  const supabase = { auth: {} } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createUserServerSupabase).mockReturnValue(supabase);
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({ valid: true });
  });

  it("POST /api/events returns 401 when token is missing", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue(null);

    const res = await postEvent(
      makeReq({
        leagueId: "l1",
        title: "T",
        content: "C",
        pinned: false,
      }) as any,
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Missing session token");
    expect(createEventCore).not.toHaveBeenCalled();
  });

  it("POST /api/events creates event on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-e1");
    vi.mocked(createEventCore).mockResolvedValue({ id: "e1" } as any);

    const payload = {
      leagueId: "l1",
      title: "Title",
      content: "Body",
      pinned: false,
    };

    const res = await postEvent(makeReq(payload) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createEventCore).toHaveBeenCalledWith(supabase, payload);
    expect(body.id).toBe("e1");
  });

  it("PATCH /api/events/[eventId] returns 401 on failed validation", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-e2");
    vi.mocked(validateAuthenticatedRequest).mockResolvedValue({
      valid: false,
      error: "CSRF validation failed",
    });

    const res = await patchEvent(makeReq({ title: "Updated" }) as any, {
      params: Promise.resolve({ eventId: "event-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("CSRF validation failed");
    expect(updateEventCore).not.toHaveBeenCalled();
  });

  it("PATCH /api/events/[eventId] updates event on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-e3");
    vi.mocked(updateEventCore).mockResolvedValue({
      id: "event-1",
      title: "Updated",
    } as any);

    const updates = { title: "Updated", pinned: true };
    const res = await patchEvent(makeReq(updates) as any, {
      params: Promise.resolve({ eventId: "event-1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(updateEventCore).toHaveBeenCalledWith(supabase, "event-1", updates);
    expect(body.title).toBe("Updated");
  });

  it("DELETE /api/events/[eventId] deletes event on success", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-e4");

    const res = await deleteEvent(makeReq() as any, {
      params: Promise.resolve({ eventId: "event-9" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(deleteEventCore).toHaveBeenCalledWith(supabase, "event-9");
    expect(body.success).toBe(true);
  });

  it("POST /api/players routes addPlayer body to addPlayerCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-p1");
    vi.mocked(addPlayerCore).mockResolvedValue({ id: "p1" } as any);

    const payload = { leagueId: "l1", playerName: "John Doe" };
    const res = await postPlayer(makeReq(payload) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(addPlayerCore).toHaveBeenCalledWith(supabase, payload);
    expect(addExistingPlayerCore).not.toHaveBeenCalled();
    expect(body.id).toBe("p1");
  });

  it("POST /api/players routes addExisting body to addExistingPlayerCore", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-p2");
    vi.mocked(addExistingPlayerCore).mockResolvedValue({ id: "p2" } as any);

    const payload = { leagueId: "l1", playerId: "p2" };
    const res = await postPlayer(makeReq(payload) as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(addExistingPlayerCore).toHaveBeenCalledWith(supabase, payload);
    expect(addPlayerCore).not.toHaveBeenCalled();
    expect(body.id).toBe("p2");
  });

  it("POST /api/players returns 400 for invalid body", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-p3");

    const res = await postPlayer(makeReq({ leagueId: "l1" }) as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid request body");
    expect(addPlayerCore).not.toHaveBeenCalled();
    expect(addExistingPlayerCore).not.toHaveBeenCalled();
  });

  it("DELETE /api/players/[playerId] calls removePlayerCore with route id", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-p4");

    const res = await deletePlayer(makeReq({ leagueId: "league-1" }) as any, {
      params: Promise.resolve({ playerId: "player-9" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(removePlayerCore).toHaveBeenCalledWith(supabase, {
      playerId: "player-9",
      leagueId: "league-1",
    });
    expect(body.success).toBe(true);
  });

  it("PATCH /api/players/[playerId]/edit calls updatePlayerCore with route id", async () => {
    vi.mocked(getAccessTokenFromRequest).mockReturnValue("token-p5");
    vi.mocked(updatePlayerCore).mockResolvedValue({ id: "player-5" } as any);

    const payload = {
      first_name: "Jan",
      last_name: "Novak",
      rank: 3,
      leagueId: "league-1",
    };

    const res = await patchPlayer(makeReq(payload) as any, {
      params: Promise.resolve({ playerId: "player-5" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(updatePlayerCore).toHaveBeenCalledWith(supabase, {
      id: "player-5",
      first_name: "Jan",
      last_name: "Novak",
      rank: 3,
      leagueId: "league-1",
    });
    expect(body.id).toBe("player-5");
  });
});
