import React, { useState } from "react";
import { getSupabase } from "@/utils/supabase";
import { useLeagueStore } from "@/stores";
import { useCsrfValidation } from "@/features/auth/hooks";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface LeagueSectionProps {
  onLeagueSelect: (id: string) => void;
  onRefresh: () => void;
}

const LeagueSection: React.FC<LeagueSectionProps> = ({
  onLeagueSelect,
  onRefresh,
}) => {
  const leagues = useLeagueStore((state) => state.leagues);
  const currentLeagueId = useLeagueStore((state) => state.currentLeagueId);
  const [newLeagueName, setNewLeagueName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rlsError, setRlsError] = useState<string | null>(null);

  const supabase = getSupabase();
  const { validateAndExecute } = useCsrfValidation();

  const handleAddLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newLeagueName.trim()) return;
    setIsLoading(true);
    setRlsError(null);

    await validateAndExecute(
      async () => {
        const { error } = await supabase.from("leagues").insert({
          name: newLeagueName.trim(),
        });

        if (error) {
          if (error.message.includes("row-level security policy")) {
            setRlsError(
              "Databáze Supabase blokuje tuto akci kvůli zásadám zabezpečení (Row-Level Security - RLS). Musíte povolit přístup v nastavení projektu Supabase."
            );
          } else {
            alert(error.message);
          }
        } else {
          setNewLeagueName("");
          onRefresh();
        }
      },
      {
        onError: (error) => {
          console.error("CSRF validation failed:", error);
          setRlsError("Bezpečnostní kontrola se nezdařila. Zkuste znovu.");
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
          .from("leagues")
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
          .from("leagues")
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
        title="Smazat ligu"
        message="Opravdu chcete smazat tuto ligu? Tuto akci nelze vzít zpět a může ovlivnit související data."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(null)}
        confirmText="Smazat"
        cancelText="Zrušit"
      />

      {rlsError && (
        <div className="bg-amber-900/30 border border-amber-500/50 p-6 rounded-2xl text-amber-200 animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <svg
              className="w-6 h-6 text-amber-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold">Detekována chyba RLS</h3>
              <p className="mt-1 text-sm opacity-90">{rlsError}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setRlsError(null)}
              className="text-sm font-bold text-amber-400 hover:text-amber-300"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">Ligy</h2>
          <span className="text-xs text-gray-500">Spravujte své ligy</span>
        </div>

        <form onSubmit={handleAddLeague} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newLeagueName}
            onChange={(e) => setNewLeagueName(e.target.value)}
            placeholder="Název nové ligy..."
            className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !newLeagueName.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "..." : "Přidat"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map((league) => (
            <div
              key={league.id}
              onClick={() => onLeagueSelect(league.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                currentLeagueId === league.id
                  ? "bg-indigo-600/40 border-indigo-500"
                  : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800"
              }`}
            >
              {editingId === league.id ? (
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
                  <h3 className="font-bold text-gray-200">{league.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(league.id);
                        setEditName(league.name);
                      }}
                      className="text-gray-500 hover:text-indigo-400 transition-colors"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleting(league.id);
                      }}
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
      </section>
    </>
  );
};

export default LeagueSection;
