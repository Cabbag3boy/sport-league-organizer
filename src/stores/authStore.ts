import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        session: null,
        setSession: (session) => set({ session }),
      }),
      {
        name: "auth-store",
        partialize: (state) => ({
          session: state.session,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
