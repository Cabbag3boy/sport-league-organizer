import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthSessionSync } from "../useAuthSessionSync";
import { getSupabase } from "@/utils/supabase";
import { initializeCsrfToken } from "@/features/auth/utils";
import {
  clearServerSession,
  syncServerSession,
} from "@/features/auth/services/sessionSyncService";
import { resetAllStores } from "@/stores/__tests__/setup";

vi.mock("@/utils/supabase");
vi.mock("@/features/auth/utils", () => ({
  initializeCsrfToken: vi.fn(),
}));
vi.mock("@/features/auth/services/sessionSyncService", () => ({
  syncServerSession: vi.fn().mockResolvedValue(undefined),
  clearServerSession: vi.fn().mockResolvedValue(undefined),
}));

describe("useAuthSessionSync", () => {
  const onInitialSession = vi.fn();
  const onSignedIn = vi.fn();
  const onSignedOut = vi.fn();
  const setShowLogin = vi.fn();
  const setDbError = vi.fn();
  const showToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
  });

  it("does not run initial bootstrap when supabase is unavailable and flag is false", () => {
    vi.mocked(getSupabase).mockReturnValue(null);

    renderHook(() =>
      useAuthSessionSync({
        showLogin: false,
        setShowLogin,
        setDbError,
        showToast,
        onInitialSession,
        onSignedIn,
        onSignedOut,
        shouldRunInitialBootstrap: false,
      }),
    );

    expect(initializeCsrfToken).toHaveBeenCalledTimes(1);
    expect(onInitialSession).not.toHaveBeenCalled();
  });

  it("runs initial bootstrap when supabase is unavailable and flag is true", () => {
    vi.mocked(getSupabase).mockReturnValue(null);

    renderHook(() =>
      useAuthSessionSync({
        showLogin: false,
        setShowLogin,
        setDbError,
        showToast,
        onInitialSession,
        onSignedIn,
        onSignedOut,
        shouldRunInitialBootstrap: true,
      }),
    );

    expect(onInitialSession).toHaveBeenCalledTimes(1);
  });

  it("ignores INITIAL_SESSION callback when bootstrap flag is false", () => {
    let authCallback: ((event: string, session: any) => void) | undefined;

    const mockSupabase = {
      auth: {
        onAuthStateChange: vi.fn((cb) => {
          authCallback = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
      },
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    renderHook(() =>
      useAuthSessionSync({
        showLogin: false,
        setShowLogin,
        setDbError,
        showToast,
        onInitialSession,
        onSignedIn,
        onSignedOut,
        shouldRunInitialBootstrap: false,
      }),
    );

    act(() => {
      authCallback?.("INITIAL_SESSION", null);
    });

    expect(onInitialSession).not.toHaveBeenCalled();
    expect(clearServerSession).toHaveBeenCalled();
    expect(syncServerSession).not.toHaveBeenCalled();
  });
});
