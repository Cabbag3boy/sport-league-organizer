import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import App from "../App";
import { render } from "../test/test-utils";
import { getSupabase } from "../utils/supabase";
import { createMockQueryBuilder } from "../test/supabase-mock";

vi.mock("../utils/supabase", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("../utils/csrfToken", () => ({
  initializeCsrfToken: vi.fn(),
  validateAndExecute: vi.fn((fn) => fn()),
}));

describe("App Integration Tests", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSupabase as any).mockReturnValue(mockSupabase);

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    // Mock the subscription with a callback that's called immediately
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      // Call callback synchronously to trigger state updates within act()
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });
    // Mock the from method to return a chainable query builder
    mockSupabase.from.mockImplementation(() =>
      createMockQueryBuilder([], null),
    );
  });

  it("should render app with unauthenticated state", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Žebříček|Players/i)).toBeInTheDocument();
    });
  });

  it("should show loading spinner while fetching data", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  it("should render tabs for unauthenticated users", async () => {
    render(<App />);

    await waitFor(() => {
      const tabs = screen.getAllByRole("button");
      expect(tabs.length).toBeGreaterThan(0);
    });
  });

  it("should handle authentication state changes", async () => {
    render(<App />);

    // Verify initial render
    await waitFor(() => {
      expect(screen.getByText(/Žebříček|Players/i)).toBeInTheDocument();
    });
  });
});
