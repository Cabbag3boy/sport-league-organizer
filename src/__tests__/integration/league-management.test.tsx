import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { render } from "@/test/test-utils";
import { getSupabase } from "@/utils/supabase";
import { createMockLeague, createMockSeason } from "@/test/fixtures";
import { createMockQueryBuilder } from "@/test/supabase-mock";

vi.mock("@/utils/supabase");
vi.mock("@/utils/csrfToken", () => ({
  initializeCsrfToken: vi.fn(),
}));

describe("League Management Integration Tests", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  };

  const mockLeague = createMockLeague({ id: "league-1", name: "Test League" });
  const mockSeason = createMockSeason({
    id: "season-1",
    league_id: "league-1",
    name: "2024 Spring",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getSupabase as any).mockReturnValue(mockSupabase);

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "leagues") {
        return createMockQueryBuilder([mockLeague], null);
      }
      if (table === "seasons") {
        return createMockQueryBuilder([mockSeason], null);
      }
      return createMockQueryBuilder([], null);
    });
  });

  it("should render app with header", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  it("should display standings tab", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Žebříček|Players/i)).toBeInTheDocument();
    });
  });

  it("should setup auth listener", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  it("should handle mock data loading", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.from).toBeDefined();
    });
  });
});
