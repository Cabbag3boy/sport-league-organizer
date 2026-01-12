import React, { useState } from "react";

interface AddPlayerFormProps {
  onAddPlayers: (names: string[]) => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayers }) => {
  const [names, setNames] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameList = names
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);

    const nameRegex = /^[a-zA-Z\s\u00C0-\u017F.-]+$/;
    const invalidNames = nameList.filter(
      (name) => !nameRegex.test(name) || name.length > 50
    );

    if (invalidNames.length > 0) {
      setError(
        `Neplatný formát: "${invalidNames[0].substring(
          0,
          15
        )}...". Používejte pouze písmena a jména do 50 znaků.`
      );
      return;
    }

    if (nameList.length > 0) {
      onAddPlayers(nameList);
      setNames("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
      <textarea
        value={names}
        onChange={(e) => {
          setNames(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Zadejte jména hráčů (např. Jan Novák), jedno na řádek..."
        className={`flex-grow bg-gray-700 text-gray-100 border ${
          error ? "border-red-500" : "border-gray-600"
        } rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-24 resize-y`}
        aria-label="Jména nových hráčů"
        rows={4}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <span className="text-xs text-red-400 font-medium animate-pulse">
            {error}
          </span>
        ) : (
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            Max 50 znaků na jméno
          </span>
        )}
        <button
          type="submit"
          className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg"
          disabled={!names.trim()}
        >
          Přidat hráče
        </button>
      </div>
    </form>
  );
};

export default AddPlayerForm;
