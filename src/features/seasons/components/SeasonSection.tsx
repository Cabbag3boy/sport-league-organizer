import React, { useState } from "react";
import { getSupabase } from "@/utils/supabase";
import { useLeagueStore } from "@/stores";
import { useCsrfValidation } from "@/features/auth/hooks";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface SeasonSectionProps {
  onRefresh: () => void;
}

const SeasonSection: React.FC<SeasonSectionProps> = ({ onRefresh }) => {
  const seasons = useLeagueStore((state) => state.seasons);
  const currentLeagueId = useLeagueStore((state) => state.currentLeagueId);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = getSupabase();
  const { validateAndExecute } = useCsrfValidation();

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newSeasonName.trim() || !currentLeagueId) return;
    setIsLoading(true);

    await validateAndExecute(
      async () => {
        const { error } = await supabase.from("seasons").insert({
          name: newSeasonName.trim(),
          league_id: currentLeagueId,
        });

        if (error) {
          alert(error.message);
        } else {
          setNewSeasonName("");
          onRefresh();
        }
      },
      {
        onError: (error) => {
          console.error("CSRF validation failed:", error);
          alert("Bezpečnostní kontrola se nezdařila. Zkuste znovu.");
        },
      }
    );
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    if (!supabase || !editingId) return;
    setIsLoading(true);

    await validateAndExecute(
      async () => {
        const { error } = await supabase
          .from("seasons")
          .update({ name: editName.trim() })
          .eq("id", editingId);

        if (error) {
          alert(error.message);
        } else {
          setEditingId(null);
          setEditName("");
          onRefresh();
        }
      },
      {
        onError: (error) => {
          console.error("CSRF validation failed:", error);
          alert("Bezpečnostní kontrola se nezdařila. Zkuste znovu.");
        },
      }
    );
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!supabase || !isDeleting) return;
    setIsLoading(true);

    await validateAndExecute(
      async () => {
        const { error } = await supabase
          .from("seasons")
          .delete()
          .eq("id", isDeleting);

        if (error) {
          alert(error.message);
        } else {
          setIsDeleting(null);
          onRefresh();
        }
      },
      {
        onError: (error) => {
          console.error("CSRF validation failed:", error);
          alert("Bezpečnostní kontrola se nezdařila. Zkuste znovu.");
        },
      }
    );
    setIsLoading(false);
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!isDeleting}
        title="Smazat sezónu"
        message="Opravdu chcete smazat tuto sezónu? Tuto akci nelze vzít zpět a může ovlivnit související data."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(null)}
        confirmText="Smazat"
        cancelText="Zrušit"
      />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-400">Sezóny</h2>
          {currentLeagueId && (
            <span className="text-xs text-gray-500">
              Správa sezón pro aktivní ligu
            </span>
          )}
        </div>

        {!currentLeagueId ? (
          <div className="p-8 text-center bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 text-gray-500">
            Pro správu sezón vyberte výše ligu.
          </div>
        ) : (
          <>
            <form onSubmit={handleAddSeason} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                placeholder="Název nové sezóny..."
                className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={isLoading || !newSeasonName.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "..." : "Přidat"}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-2xl hover:bg-gray-800 transition-all"
                >
                  {editingId === season.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-sm outline-none"
                      />
                      <button
                        onClick={() => handleUpdate()}
                        className="text-green-400 hover:text-green-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-200">{season.name}</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(season.id);
                            setEditName(season.name);
                          }}
                          className="text-gray-500 hover:text-purple-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setIsDeleting(season.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default SeasonSection;
