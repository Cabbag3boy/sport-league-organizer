import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiFetch, apiMutate } from "@/utils/apiClient";
import { getSupabase } from "@/utils/supabase";
import { getCsrfToken } from "@/features/auth/utils/csrfToken";

vi.mock("@/utils/supabase");
vi.mock("@/features/auth/utils/csrfToken");

describe("apiClient", () => {
  const mockSupabase = {
    auth: { getSession: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("apiFetch adds Bearer token when session exists", async () => {
    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "token-1" } },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ items: [1, 2] }),
    } as unknown as Response);

    const result = await apiFetch<{ items: number[] }>("/api/x");

    expect(fetch).toHaveBeenCalledWith("/api/x", {
      headers: { Authorization: "Bearer token-1" },
    });
    expect(result.items).toEqual([1, 2]);
  });

  it("apiMutate throws when there is no active session", async () => {
    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    await expect(apiMutate("/api/x", "POST", { a: 1 })).rejects.toThrow(
      "No active session",
    );
  });

  it("apiMutate sends auth and CSRF headers and parses payload", async () => {
    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "token-2" } },
    });
    vi.mocked(getCsrfToken).mockReturnValue("csrf-1");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as Response);

    const result = await apiMutate<{ ok: boolean }>("/api/y", "PATCH", {
      v: 42,
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/y",
      expect.objectContaining({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-2",
          "X-CSRF-Token": "csrf-1",
        },
        body: JSON.stringify({ v: 42 }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("apiFetch surfaces error payload message", async () => {
    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ error: "Unauthorized" }),
    } as unknown as Response);

    await expect(apiFetch("/api/protected")).rejects.toThrow("Unauthorized");
  });
});
