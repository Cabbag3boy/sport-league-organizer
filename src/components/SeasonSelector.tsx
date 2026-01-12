import React, { useState, useRef, useEffect } from "react";
import type { DBSeason } from "../types";

interface SeasonSelectorProps {
  seasons: DBSeason[];
  currentSeasonId: string | null;
  onSeasonChange: (id: string) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  currentSeasonId,
  onSeasonChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSeason =
    seasons.find((s) => s.id === currentSeasonId) || seasons[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-700 hover:border-purple-500/50 px-4 py-2 rounded-xl transition-all duration-200 group w-full md:w-56"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-200">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="flex flex-col items-start flex-grow overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
            Aktivní sezóna
          </span>
          <span className="text-sm font-semibold text-gray-200 truncate w-full text-left">
            {currentSeason?.name || "Vybrat sezónu"}
          </span>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
            {seasons.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm italic">
                Žádné sezóny k dispozici
              </div>
            ) : (
              seasons.map((season) => {
                const isActive = season.id === currentSeasonId;
                return (
                  <button
                    key={season.id}
                    onClick={() => {
                      onSeasonChange(season.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-150 mb-1 last:mb-0 ${
                      isActive
                        ? "bg-purple-500/10 text-purple-400 font-bold"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span>{season.name}</span>
                    {isActive && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="bg-gray-900/40 p-3 border-t border-gray-700 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-mono uppercase">
              Celkem: {seasons.length} sezón
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonSelector;
