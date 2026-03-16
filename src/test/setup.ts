import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Default fetch mock for tests that mount App and hit local API endpoints.
// Individual tests can override this with vi.mocked(fetch).mockResolvedValue(...).
vi.stubGlobal(
  "fetch",
  vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/api/league/bootstrap")) {
      return {
        ok: true,
        json: async () => ({
          leagues: [],
          seasons: [],
          globalPlayers: [],
          players: [],
          events: [],
          roundHistory: [],
          selectedLeagueId: "",
          selectedSeasonId: "",
        }),
      } as Response;
    }

    if (url.includes("/api/auth/session")) {
      return {
        ok: true,
        json: async () => ({ success: true }),
      } as Response;
    }

    return {
      ok: true,
      json: async () => ({}),
    } as Response;
  }),
);
