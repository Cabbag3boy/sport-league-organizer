import React, { useState, useEffect } from "react";
import { getSupabase } from "../utils/supabase";
import LeagueSelector from "./LeagueSelector";
import SeasonSelector from "./SeasonSelector";
import type { DBLeague, DBSeason } from "../types";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onSignInClick: () => void;
  leagues: DBLeague[];
  currentLeagueId: string | null;
  onLeagueChange: (id: string) => void;
  seasons: DBSeason[];
  currentSeasonId: string | null;
  onSeasonChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  userEmail,
  onSignInClick,
  leagues,
  currentLeagueId,
  onLeagueChange,
  seasons,
  currentSeasonId,
  onSeasonChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-gray-800/90 backdrop-blur-lg shadow-xl border-b border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:px-8 flex justify-between items-center">
          {/* Site Name */}
          <div className="flex flex-col items-start lg:min-w-[220px]">
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 whitespace-nowrap tracking-tight">
              LEAGUE MASTER
            </h1>
            <div className="h-0.5 w-12 bg-indigo-500 rounded-full -mt-0.5 opacity-60"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 flex-grow justify-center">
            <LeagueSelector
              leagues={leagues}
              currentLeagueId={currentLeagueId}
              onLeagueChange={onLeagueChange}
            />
            <SeasonSelector
              seasons={seasons}
              currentSeasonId={currentSeasonId}
              onSeasonChange={onSeasonChange}
            />
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex lg:min-w-[220px] justify-end">
            {isAuthenticated ? (
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

          {/* Mobile Burger Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-gray-700/50 text-gray-300 hover:text-white transition-colors border border-gray-600/50"
            aria-label="Otevřít menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Sidebar */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-black text-indigo-400 tracking-wider">
                MENU LIGY
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
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
                      setIsMenuOpen(false);
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
                      setIsMenuOpen(false);
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
                    onClick={handleSignOut}
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
                    setIsMenuOpen(false);
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
      )}
    </>
  );
};

export default Header;
