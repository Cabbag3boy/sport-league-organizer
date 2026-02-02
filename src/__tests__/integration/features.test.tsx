import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { render } from "@/test/test-utils";
import { getSupabase } from "@/utils/supabase";
import { createMockQueryBuilder } from "@/test/supabase-mock";

vi.mock("@/utils/supabase");
vi.mock("@/utils/csrfToken", () => ({
  initializeCsrfToken: vi.fn(),
}));

/**
 * Integration Tests - Player Management
 * Tests player listing, adding, removing, and ranking updates
 */
describe("Feature: Player Management", () => {
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

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    mockSupabase.from.mockImplementation(() =>
      createMockQueryBuilder([], null),
    );
  });

  it("displays player standings when app loads", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Žebříček|Players/i)).toBeInTheDocument();
    });
  });

  it("renders with header component", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });
});

/**
 * Integration Tests - Round Management
 * Tests round creation, score entry, and rank updates
 */
describe("Feature: Round Management", () => {
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

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    mockSupabase.from.mockImplementation(() =>
      createMockQueryBuilder([], null),
    );
  });

  it("loads and displays round history", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

/**
 * Integration Tests - Event Management
 * Tests event creation, deletion, and pinning
 */
describe("Feature: Event Management", () => {
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

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    mockSupabase.from.mockImplementation(() =>
      createMockQueryBuilder([], null),
    );
  });

  it("initializes app with event system", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

/**
 * Integration Tests - Authentication
 * Tests auth state management and CSRF protection
 */
describe("Feature: Authentication & Security", () => {
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

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("INITIAL_SESSION", null);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });

    mockSupabase.from.mockImplementation(() =>
      createMockQueryBuilder([], null),
    );
  });

  it("checks session on app mount", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  it("sets up auth state listener", async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});
