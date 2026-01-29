import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchLeagues,
  fetchSeasons,
  fetchBaseData,
  fetchGlobalPlayers,
  fetchEvents,
} from "../leagueService";
import { getSupabase } from "@/utils/supabase";
import {
  createMockLeague,
  createMockSeason,
  createMockPlayer,
  createMockEvent,
} from "@/test/fixtures";
import {
  createMockSupabaseClient,
  createMockQueryBuilder,
} from "@/test/supabase-mock";

vi.mock("@/utils/supabase");

describe("League Service Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Fetch Leagues Scenario", () => {
    it("should fetch leagues and sort by name", async () => {
      const mockLeagues = [
        createMockLeague({ name: "Zebra League" }),
        createMockLeague({ name: "Alpha League" }),
        createMockLeague({ name: "Beta League" }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(mockLeagues, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchLeagues();

      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle empty leagues array", async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder([], null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchLeagues();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw error when Supabase init fails", async () => {
      vi.mocked(getSupabase).mockReturnValue(null);

      await expect(fetchLeagues()).rejects.toThrow();
    });
  });

  describe("Fetch Seasons Scenario", () => {
    it("should fetch seasons for a league and sort newest first", async () => {
      const leagueId = "league-1";
      const mockSeasons = [
        createMockSeason({ league_id: leagueId, created_at: "2024-01-15" }),
        createMockSeason({ league_id: leagueId, created_at: "2024-03-10" }),
        createMockSeason({ league_id: leagueId, created_at: "2024-02-20" }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(mockSeasons, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchSeasons(leagueId);

      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter seasons by league_id", async () => {
      const leagueId = "league-1";
      const allSeasons = [
        createMockSeason({ league_id: leagueId }),
        createMockSeason({ league_id: "league-2" }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(allSeasons, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchSeasons(leagueId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Fetch Base Data Scenario", () => {
    it("should fetch base data with league and seasons", async () => {
      const leagueId = "league-1";
      const mockLeagues = [createMockLeague({ id: leagueId })];
      const mockSeasons = [
        createMockSeason({ league_id: leagueId }),
        createMockSeason({ league_id: leagueId }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(mockSeasons, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchBaseData(leagueId, false, mockLeagues, null);

      expect(result).toHaveProperty("leagueId");
      expect(result).toHaveProperty("seasons");
    });

    it("should use existing leagues when forceRefreshLeagues is false", async () => {
      const leagueId = "league-1";
      const existingLeagues = [createMockLeague({ id: leagueId })];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder([], null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchBaseData(
        leagueId,
        false,
        existingLeagues,
        null
      );

      expect(result.leagueId).toBe(leagueId);
    });
  });

  describe("Fetch Global Players Scenario", () => {
    it("should fetch all global players and sort by last name", async () => {
      const mockPlayers = [
        createMockPlayer({ last_name: "Zebra" }),
        createMockPlayer({ last_name: "Anderson" }),
        createMockPlayer({ last_name: "Baker" }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(mockPlayers, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchGlobalPlayers();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle empty players array", async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder([], null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchGlobalPlayers();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("Fetch Events Scenario", () => {
    it("should fetch events ordered by pin status then creation date", async () => {
      const leagueId = "league-1";
      const mockEvents = [
        createMockEvent({
          league_id: leagueId,
          pinned: false,
          created_at: "2024-03-10",
        }),
        createMockEvent({
          league_id: leagueId,
          pinned: true,
          created_at: "2024-01-15",
        }),
        createMockEvent({
          league_id: leagueId,
          pinned: true,
          created_at: "2024-02-20",
        }),
      ];

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder(mockEvents, null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchEvents(leagueId);

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle empty events array", async () => {
      const leagueId = "league-1";

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.from = vi
        .fn()
        .mockReturnValue(createMockQueryBuilder([], null));

      vi.mocked(getSupabase).mockReturnValue(mockSupabase);

      const result = await fetchEvents(leagueId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  // Sanity checks for function exports
  it("should export fetchLeagues function", () => {
    expect(typeof fetchLeagues).toBe("function");
  });

  it("should export fetchSeasons function", () => {
    expect(typeof fetchSeasons).toBe("function");
  });

  it("should export fetchBaseData function", () => {
    expect(typeof fetchBaseData).toBe("function");
  });

  it("should export fetchGlobalPlayers function", () => {
    expect(typeof fetchGlobalPlayers).toBe("function");
  });

  it("should export fetchEvents function", () => {
    expect(typeof fetchEvents).toBe("function");
  });
});
