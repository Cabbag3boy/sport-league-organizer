import React, { useEffect } from "react";
import { LeagueSelector } from "../../league/components";
import { SeasonSelector } from "../../seasons/components";
import type { DBLeague, DBSeason } from "@/types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  leagues: DBLeague[];
  currentLeagueId: string | null;
  onLeagueChange: (id: string) => void;
  seasons: DBSeason[];
  currentSeasonId: string | null;
  onSeasonChange: (id: string) => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  leagues,
  currentLeagueId,
  onLeagueChange,
  seasons,
  currentSeasonId,
  onSeasonChange,
  isAuthenticated,
  userEmail,
  onSignInClick,
  onSignOut,
}) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop Blur */}
      <div
        className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Menu Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg font-black text-indigo-400 tracking-wider">
            MENU LIGY
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-8 flex-grow">
          {/* League Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
              Aktuální liga
            </label>
            <div className="bg-gray-800 rounded-2xl p-1 border border-gray-700">
              <LeagueSelector
                leagues={leagues}
                currentLeagueId={currentLeagueId}
                onLeagueChange={(id) => {
                  onLeagueChange(id);
                  onClose();
                }}
              />
            </div>
          </div>

          {/* Season Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
              Aktivní sezóna
            </label>
            <div className="bg-gray-800 rounded-2xl p-1 border border-gray-700">
              <SeasonSelector
                seasons={seasons}
                currentSeasonId={currentSeasonId}
                onSeasonChange={(id) => {
                  onSeasonChange(id);
                  onClose();
                }}
              />
            </div>
          </div>
        </div>

        {/* Auth Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex flex-col bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                  Přihlášen jako
                </span>
                <span className="text-sm text-indigo-400 font-bold truncate">
                  {userEmail}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-400 font-black border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                <span>ODHLÁSIT SE</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onSignInClick();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              <span>ADMIN PŘIHLÁŠENÍ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
