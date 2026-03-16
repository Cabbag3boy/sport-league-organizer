import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const createClientMock = vi.fn(() => ({ mocked: true }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("supabaseServer factories", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("createUserServerSupabase passes anon key and Authorization header", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = "anon-key";

    const mod = await import("@/utils/supabaseServer");
    mod.createUserServerSupabase("user-token");

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: {
          headers: {
            Authorization: "Bearer user-token",
          },
        },
      }),
    );
  });

  it("createPublicServerSupabase works without token", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = "anon-key";

    const mod = await import("@/utils/supabaseServer");
    mod.createPublicServerSupabase();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: undefined,
      }),
    );
  });

  it("throws precise error when URL env var is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = "anon-key";

    const mod = await import("@/utils/supabaseServer");

    expect(() => mod.createPublicServerSupabase()).toThrow(
      "Missing env var: NEXT_PUBLIC_SUPABASE_URL",
    );
  });
});
