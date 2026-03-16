import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  toggleEventPin,
  updateEvent,
} from "../eventService";
import { apiFetch, apiMutate } from "@/utils/apiClient";

vi.mock("@/utils/apiClient", () => ({
  apiFetch: vi.fn(),
  apiMutate: vi.fn(),
}));

describe("eventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEvent delegates to POST /api/events", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "e1" } as any);

    await createEvent({
      leagueId: "l1",
      title: "Title",
      content: "Body",
      pinned: false,
    });

    expect(apiMutate).toHaveBeenCalledWith("/api/events", "POST", {
      leagueId: "l1",
      title: "Title",
      content: "Body",
      pinned: false,
    });
  });

  it("deleteEvent delegates to DELETE /api/events/[id]", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ success: true } as any);

    await deleteEvent({ eventId: "e1" });

    expect(apiMutate).toHaveBeenCalledWith("/api/events/e1", "DELETE");
  });

  it("updateEvent delegates to PATCH /api/events/[id]", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "e1" } as any);

    await updateEvent({ eventId: "e1", title: "New" });

    expect(apiMutate).toHaveBeenCalledWith("/api/events/e1", "PATCH", {
      title: "New",
    });
  });

  it("toggleEventPin flips current pin value", async () => {
    vi.mocked(apiMutate).mockResolvedValue({ id: "e1", pinned: true } as any);

    await toggleEventPin({ eventId: "e1", currentPinned: false });

    expect(apiMutate).toHaveBeenCalledWith("/api/events/e1", "PATCH", {
      pinned: true,
    });
  });

  it("fetchEvents delegates to GET /api/league/[id]/events", async () => {
    vi.mocked(apiFetch).mockResolvedValue([] as any);

    await fetchEvents("league-1");

    expect(apiFetch).toHaveBeenCalledWith("/api/league/league-1/events");
  });
});
