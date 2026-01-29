import React, { useState, useEffect } from "react";
import { getSupabase } from "@/utils/supabase";
import { useLeagueStore } from "@/stores";
import { DesktopNav, AuthButton } from "./index";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onSignInClick: () => void;
  onLeagueChange: (id: string) => void;
  onSeasonChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  userEmail,
  onSignInClick,
  onLeagueChange,
  onSeasonChange,
}) => {
  const leagues = useLeagueStore((state) => state.leagues);
  const currentLeagueId = useLeagueStore((state) => state.currentLeagueId);
  const seasons = useLeagueStore((state) => state.seasons);
  const currentSeasonId = useLeagueStore((state) => state.currentSeasonId);
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
          <DesktopNav
            leagues={leagues}
            currentLeagueId={currentLeagueId}
            onLeagueChange={onLeagueChange}
            seasons={seasons}
            currentSeasonId={currentSeasonId}
            onSeasonChange={onSeasonChange}
          />

          {/* Desktop Auth */}
          <AuthButton
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            onSignInClick={onSignInClick}
          />

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

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        leagues={leagues}
        currentLeagueId={currentLeagueId}
        onLeagueChange={onLeagueChange}
        seasons={seasons}
        currentSeasonId={currentSeasonId}
        onSeasonChange={onSeasonChange}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        onSignInClick={onSignInClick}
        onSignOut={handleSignOut}
      />
    </>
  );
};

export default Header;
