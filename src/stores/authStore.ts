import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    { name: "AuthStore" }
  )
);

