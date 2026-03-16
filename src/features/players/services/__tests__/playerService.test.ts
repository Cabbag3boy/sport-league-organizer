import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addExistingPlayer,
  addPlayer,
  fetchAllPlayers,
  fetchPlayersInLeague,
  removePlayer,
  updatePlayer,
} from "../playerService";
import { apiFetch, apiMutate } from "@/utils/apiClient";

vi.mock("@/utils/apiClient", () => ({
  apiFetch: vi.fn(),
  apiMutate: vi.fn(),
}));

describe("playerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addPlayer delegates to POST /api/players", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "p1" } as any);

    await addPlayer({ leagueId: "l1", playerName: "Jane Doe" });

    expect(apiMutate).toHaveBeenCalledWith("/api/players", "POST", {
      leagueId: "l1",
      playerName: "Jane Doe",
    });
  });

  it("addExistingPlayer delegates to POST /api/players", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "p2" } as any);

    await addExistingPlayer({ leagueId: "l1", playerId: "p2" });

    expect(apiMutate).toHaveBeenCalledWith("/api/players", "POST", {
      leagueId: "l1",
      playerId: "p2",
    });
  });

  it("removePlayer delegates to DELETE /api/players/[id] with leagueId", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ success: true } as any);

    await removePlayer({ leagueId: "l1", playerId: "p3" });

    expect(apiMutate).toHaveBeenCalledWith("/api/players/p3", "DELETE", {
      leagueId: "l1",
    });
  });

  it("updatePlayer delegates to PATCH /api/players/[id]/edit", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "p4" } as any);

    await updatePlayer({
      id: "p4",
      first_name: "Jan",
      last_name: "Novak",
      rank: 2,
      leagueId: "l1",
    });

    expect(apiMutate).toHaveBeenCalledWith("/api/players/p4/edit", "PATCH", {
      first_name: "Jan",
      last_name: "Novak",
      rank: 2,
      leagueId: "l1",
    });
  });

  it("fetchPlayersInLeague delegates to GET /api/league/[id]/players", async () => {
    vi.mocked(apiFetch).mockResolvedValue([] as any);

    await fetchPlayersInLeague("league-1");

    expect(apiFetch).toHaveBeenCalledWith("/api/league/league-1/players");
  });

  it("fetchAllPlayers reuses fetchPlayersInLeague", async () => {
    const players = [{ id: "p1" }];
    vi.mocked(apiFetch).mockResolvedValue(players as any);

    const result = await fetchAllPlayers("league-1");

    expect(apiFetch).toHaveBeenCalledWith("/api/league/league-1/players");
    expect(result).toEqual(players);
  });
});
