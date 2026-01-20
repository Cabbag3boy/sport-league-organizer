import React, { useState } from "react";
import { getSupabase } from "../../../utils/supabase";

interface AuthProps {
  onCancel?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabase();

    if (!supabase) {
      setError("Připojení k databázi není nakonfigurováno.");
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg === "Invalid login credentials"
          ? "Neplatné přihlašovací údaje"
          : msg || "Při přihlašování došlo k chybě"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin přihlášení
          </h2>
          <p className="text-gray-400">Zadejte své údaje pro správu ligy</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-gray-300 mb-1"
              htmlFor="email"
            >
              E-mailová adresa
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="jmeno@priklad.cz"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-300 mb-1"
              htmlFor="password"
            >
              Heslo
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all active:scale-95"
              >
                Zrušit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 ${
                onCancel ? "flex-[2]" : "w-full"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Přihlašování...
                </span>
              ) : (
                "Přihlásit se"
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Pouze pro autorizované osoby. Kontaktujte správce ligy pro přístup.
        </p>
      </div>
    </div>
  );
};

export default Auth;

