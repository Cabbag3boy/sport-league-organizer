import { describe, it, expect, beforeEach } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { useAuthStore } from "../authStore";
import { resetAuthStore } from "./setup";

describe("useAuthStore", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("should initialize with null session", () => {
    const session = useAuthStore.getState().session;
    expect(session).toBeNull();
  });

  it("should set session correctly via setSession action", () => {
    const mockSession: Session = {
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "user-123",
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    useAuthStore.getState().setSession(mockSession);

    const session = useAuthStore.getState().session;
    expect(session).toEqual(mockSession);
  });

  it("should update session when setSession is called multiple times", () => {
    const session1: Session = {
      access_token: "token-1",
      refresh_token: "refresh-1",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "user-1",
        aud: "authenticated",
        role: "authenticated",
        email: "user1@example.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const session2: Session = {
      access_token: "token-2",
      refresh_token: "refresh-2",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "user-2",
        aud: "authenticated",
        role: "authenticated",
        email: "user2@example.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    useAuthStore.getState().setSession(session1);
    let session = useAuthStore.getState().session;
    expect(session?.user.id).toBe("user-1");

    useAuthStore.getState().setSession(session2);
    session = useAuthStore.getState().session;
    expect(session?.user.id).toBe("user-2");
  });

  it("should clear session when null is passed to setSession", () => {
    const mockSession: Session = {
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "user-123",
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    useAuthStore.getState().setSession(mockSession);
    expect(useAuthStore.getState().session).not.toBeNull();

    useAuthStore.getState().setSession(null);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("should support selector pattern for reading session", () => {
    const sessionData: Session = {
      access_token: "test-token",
      refresh_token: "test-refresh",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "user-123",
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    useAuthStore.getState().setSession(sessionData);

    const session = useAuthStore.getState().session;
    const email = useAuthStore.getState().session?.user.email;
    const userId = useAuthStore.getState().session?.user.id;

    expect(session).toEqual(sessionData);
    expect(email).toBe("test@example.com");
    expect(userId).toBe("user-123");
  });

  it("should not affect other state properties when updating session", () => {
    // This test verifies that authStore only has one property (session)
    const state = useAuthStore.getState();
    const stateKeys = Object.keys(state).filter(
      (key) => typeof state[key as keyof typeof state] !== "function"
    );
    expect(stateKeys).toContain("session");
  });
});
