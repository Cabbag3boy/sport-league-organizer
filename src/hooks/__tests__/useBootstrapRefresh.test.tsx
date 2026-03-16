import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBootstrapRefresh } from "@/hooks/useBootstrapRefresh";
import { useLeagueStore } from "@/stores";
import { resetAllStores } from "@/stores/__tests__/setup";
import { useLeagueDataFetch } from "@/hooks/useLeagueDataFetch";
import type { BootstrapLeagueData } from "@/features/league/services/bootstrapService";

vi.mock("@/hooks/useLeagueDataFetch");

const mockFetchCompleteData = vi.fn();

function makeFetchedData() {
  return {
    leagues: [{ id: "league-x", name: "League X", created_at: "2026-01-01" }],
    seasons: [
      {
        id: "season-x",
        league_id: "league-x",
        name: "Season X",
        created_at: "2026-01-01",
      },
    ],
    globalPlayers: [{ id: "gp-1", first_name: "Global", last_name: "Player" }],
    players: [
      {
        id: "p-1",
        first_name: "Local",
        last_name: "Player",
        name: "Local Player",
        rank: 1,
      },
    ],
    events: [
      {
        id: "e-1",
        created_at: "2026-01-01",
        title: "Event 1",
        content: "Content",
        pinned: false,
        league_id: "league-x",
      },
    ],
    roundHistory: [
      {
        id: "r-1",
        date: "2026-01-01",
        present_players: [],
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    ],
    selectedLeagueId: "league-x",
    selectedSeasonId: "season-x",
  };
}

function makeInitialData(): BootstrapLeagueData {
  return {
    leagues: [{ id: "league-1", name: "League 1", created_at: "2026-01-01" }],
    seasons: [
      {
        id: "season-1",
        league_id: "league-1",
        name: "Season 1",
        created_at: "2026-01-01",
      },
    ],
    globalPlayers: [{ id: "gp-1", first_name: "Global", last_name: "Player" }],
    players: [
      {
        id: "p-1",
        first_name: "Initial",
        last_name: "Player",
        name: "Initial Player",
        rank: 1,
      },
    ],
    events: [
      {
        id: "e-1",
        created_at: "2026-01-01",
        title: "Bootstrapped event",
        content: "Bootstrapped content",
        pinned: true,
        league_id: "league-1",
      },
    ],
    roundHistory: [
      {
        id: "r-1",
        date: "2026-01-01",
        present_players: [],
        groups: [],
        scores: {},
        finalPlacements: [],
        playersBefore: [],
        playersAfter: [],
      },
    ],
    selectedLeagueId: "league-1",
    selectedSeasonId: "season-1",
  };
}

describe("useBootstrapRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    mockFetchCompleteData.mockResolvedValue(makeFetchedData());
    vi.mocked(useLeagueDataFetch).mockReturnValue({
      fetchCompleteData: mockFetchCompleteData,
    } as ReturnType<typeof useLeagueDataFetch>);
  });

  it("seeds from initialData and fallback bootstrap is no-op", async () => {
    const initialData = makeInitialData();
    const setShowLogin = vi.fn();
    const handleSecurityError = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useBootstrapRefresh({
        setShowLogin,
        handleSecurityError,
        setPresentPlayerIds: vi.fn() as any,
        initialData,
      }),
    );

    expect(result.current.players).toEqual(initialData.players);
    expect(result.current.events).toEqual(initialData.events);
    expect(result.current.roundHistory).toEqual(initialData.roundHistory);

    await waitFor(() => {
      expect(useLeagueStore.getState().currentLeagueId).toBe("league-1");
      expect(useLeagueStore.getState().currentSeasonId).toBe("season-1");
    });

    act(() => {
      result.current.runInitialFallbackBootstrap();
    });

    expect(mockFetchCompleteData).not.toHaveBeenCalled();
  });

  it("runs fallback bootstrap at most once when initialData is absent", async () => {
    useLeagueStore.getState().setActiveTab("InvalidTab");

    const { result } = renderHook(() =>
      useBootstrapRefresh({
        setShowLogin: vi.fn(),
        handleSecurityError: vi.fn().mockReturnValue(false),
        setPresentPlayerIds: vi.fn() as any,
      }),
    );

    act(() => {
      result.current.runInitialFallbackBootstrap();
      result.current.runInitialFallbackBootstrap();
    });

    await waitFor(() => {
      expect(mockFetchCompleteData).toHaveBeenCalledTimes(1);
      expect(mockFetchCompleteData).toHaveBeenCalledWith(
        undefined,
        undefined,
        true,
      );
    });

    expect(useLeagueStore.getState().activeTab).toBe("Players");
  });

  it("sets showLogin when fetch fails with security error", async () => {
    const err = new Error("Unauthorized");
    mockFetchCompleteData.mockRejectedValueOnce(err);

    const setShowLogin = vi.fn();
    const handleSecurityError = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useBootstrapRefresh({
        setShowLogin,
        handleSecurityError,
        setPresentPlayerIds: vi.fn() as any,
      }),
    );

    act(() => {
      result.current.runInitialFallbackBootstrap();
    });

    await waitFor(() => {
      expect(handleSecurityError).toHaveBeenCalledWith(err);
      expect(setShowLogin).toHaveBeenCalledWith(true);
    });
  });
});
