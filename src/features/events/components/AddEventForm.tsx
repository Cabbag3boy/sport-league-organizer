import React, { useState } from "react";

interface AddEventFormProps {
  onSubmit: (title: string, content: string, pinned: boolean) => void;
}

const AddEventForm: React.FC<AddEventFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit(title.trim(), content.trim(), pinned);
    setTitle("");
    setContent("");
    setPinned(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulek události..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Obsah zprávy..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[100px] resize-y"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
            Připnout nahoru
          </span>
        </label>
        <button
          type="submit"
          disabled={!title.trim() || !content.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publikovat
        </button>
      </div>
    </form>
  );
};

export default AddEventForm;

