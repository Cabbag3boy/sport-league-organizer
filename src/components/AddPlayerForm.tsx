import React, { useState } from 'react';

interface AddPlayerFormProps {
  onAddPlayers: (names: string[]) => void;
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayers }) => {
  const [names, setNames] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameList = names.split('\n').map(name => name.trim()).filter(Boolean);
    if (nameList.length > 0) {
      onAddPlayers(nameList);
      setNames('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
      <textarea
        value={names}
        onChange={(e) => setNames(e.target.value)}
        placeholder="Enter player names, one per line..."
        className="flex-grow bg-gray-700 text-gray-100 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-24 resize-y"
        aria-label="New player names"
        rows={4}
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg self-end"
        disabled={!names.trim()}
      >
        Add Players
      </button>
    </form>
  );
};

export default AddPlayerForm;