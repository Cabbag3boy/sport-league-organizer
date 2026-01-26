import React, { useEffect, useState } from "react";
import type { DBEvent } from "@/types";

interface EditEventModalProps {
  event: DBEvent | null;
  isOpen: boolean;
  onConfirm: (data: {
    title: string;
    content: string;
    pinned: boolean;
  }) => Promise<void> | void;
  onCancel: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title || "");
      setContent(event.content || "");
      setPinned(event.pinned || false);
    }
  }, [event, isOpen]);

  const isValid = title.trim() && content.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        title: title.trim(),
        content: content.trim(),
        pinned,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl m-4">
        <h2 className="text-xl font-bold text-indigo-400 mb-4">
          Upravit událost
        </h2>

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
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[150px] resize-y"
            />
          </div>

          <div className="flex items-center">
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
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? "Ukládám..." : "Uložit změny"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
