import React from "react";
import { useAuthStore } from "../../../stores";
import { getSupabase } from "../../../utils/supabase";

interface AuthButtonProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onSignInClick: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  isAuthenticated,
  userEmail,
  onSignInClick,
}) => {
  const session = useAuthStore((state) => state.session);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="hidden lg:flex lg:min-w-[220px] justify-end">
      {isAuthenticated && session ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Administrátor
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              {userEmail}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-all bg-gray-900/50 hover:bg-red-500/10 px-4 py-2 rounded-xl border border-gray-700 hover:border-red-500/50"
          >
            <span>Odhlásit se</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={onSignInClick}
          className="flex items-center gap-2 text-xs font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 group"
        >
          <span>Administrace</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AuthButton;

