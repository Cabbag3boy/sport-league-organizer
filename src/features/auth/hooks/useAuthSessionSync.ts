import { useEffect, useRef } from "react";
import { getSupabase } from "@/utils/supabase";
import { useAuthStore } from "@/stores";
import { initializeCsrfToken } from "@/features/auth/utils";
import {
  clearServerSession,
  syncServerSession,
} from "@/features/auth/services/sessionSyncService";

interface UseAuthSessionSyncOptions {
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  setDbError: (v: string | null) => void;
  showToast: (msg: string) => void;
  onInitialSession: () => void;
  onSignedIn: () => void;
  onSignedOut: () => void;
  shouldRunInitialBootstrap?: boolean;
}

/**
 * Sets up the Supabase auth state listener, keeps the auth store and
 * server-side session cookie in sync, and fires lifecycle callbacks.
 */
export function useAuthSessionSync({
  showLogin,
  setShowLogin,
  setDbError,
  showToast,
  onInitialSession,
  onSignedIn,
  onSignedOut,
  shouldRunInitialBootstrap = true,
}: UseAuthSessionSyncOptions): void {
  // Keep a ref so the stable effect closure can read the latest showLogin value.
  const showLoginRef = useRef(showLogin);
  useEffect(() => {
    showLoginRef.current = showLogin;
  }, [showLogin]);

  useEffect(() => {
    initializeCsrfToken();

    const supabase = getSupabase();

    if (!supabase) {
      if (shouldRunInitialBootstrap) {
        onInitialSession();
      }
      return;
    }

    const syncCookie = (accessToken: string | null) => {
      const p = accessToken
        ? syncServerSession(accessToken)
        : clearServerSession();
      p.catch((err) => console.error("Failed to sync server session:", err));
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      useAuthStore.setState({ session: currentSession });
      syncCookie(currentSession?.access_token ?? null);

      if (event === "INITIAL_SESSION" && shouldRunInitialBootstrap) {
        onInitialSession();
      } else if (event === "SIGNED_IN" && currentSession) {
        if (showLoginRef.current) {
          setShowLogin(false);
          setDbError(null);
          showToast("Přihlášení proběhlo úspěšně.");
          onSignedIn();
        }
      } else if (event === "SIGNED_OUT") {
        setShowLogin(false);
        setDbError(null);
        showToast("Odhlášení bylo úspěšné.");
        onSignedOut();
      } else if (event === "TOKEN_REFRESHED" && currentSession) {
        useAuthStore.setState({ session: currentSession });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
