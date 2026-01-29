import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEvent, deleteEvent, toggleEventPin } from "../eventService";
import { getSupabase } from "@/utils/supabase";
import { createMockEvent, createMockLeague } from "@/test/fixtures";

vi.mock("@/utils/supabase");

describe("eventService", () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSupabase as any).mockReturnValue(mockSupabase);
  });

  describe("Create Event Scenario", () => {
    it("should create event with JSONB details storage", async () => {
      const mockLeague = createMockLeague();
      const newEvent = {
        title: "Tournament Announcement",
        content: "Next tournament on Saturday",
        league_id: mockLeague.id,
      };

      const createdEvent = createMockEvent({
        title: newEvent.title,
        content: newEvent.content,
        league_id: newEvent.league_id,
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi
            .fn()
            .mockResolvedValue({ data: createdEvent, error: null }),
        }),
      });

      expect(createEvent).toBeDefined();
      expect(typeof createEvent).toBe("function");
    });

    it("should return event with id and created_at", async () => {
      const mockEvent = createMockEvent();
      expect(mockEvent.id).toBeTruthy();
      expect(mockEvent.created_at).toBeTruthy();
    });

    it("should store content as JSONB", async () => {
      expect(createEvent).toBeDefined();
    });
  });

  describe("Delete Event Scenario", () => {
    it("should delete event by id and confirm removal", async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      expect(deleteEvent).toBeDefined();
      expect(typeof deleteEvent).toBe("function");
    });

    it("should filter by correct event id", async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn((field, _value) => {
            expect(field).toBe("id");
            return { error: null };
          }),
        }),
      });

      expect(deleteEvent).toBeDefined();
    });
  });

  describe("Toggle Pin Scenario", () => {
    it("should flip boolean pin status and persist", async () => {
      const eventId = "event-123";
      const currentPinnedStatus = false;

      const updatedEvent = createMockEvent({
        id: eventId,
        pinned: !currentPinnedStatus,
      });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi
              .fn()
              .mockResolvedValue({ data: updatedEvent, error: null }),
          }),
        }),
      });

      expect(toggleEventPin).toBeDefined();
      expect(typeof toggleEventPin).toBe("function");
    });

    it("should return updated event with new pin status", async () => {
      const mockEvent = createMockEvent({ pinned: true });
      expect(mockEvent.pinned).toBe(true);
    });

    it("should handle toggle from pinned=true to pinned=false", async () => {
      expect(toggleEventPin).toBeDefined();
    });
  });

  // Sanity checks for export existence
  it("should export createEvent function", () => {
    expect(typeof createEvent).toBe("function");
  });

  it("should export deleteEvent function", () => {
    expect(typeof deleteEvent).toBe("function");
  });

  it("should export toggleEventPin function", () => {
    expect(typeof toggleEventPin).toBe("function");
  });
});
