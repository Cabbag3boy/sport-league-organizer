import React from "react";
import type { DBEvent } from "../../../types";

interface EventCardProps {
  event: DBEvent;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onEditEvent?: (event: DBEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isAdmin,
  onDelete,
  onTogglePin,
  onEditEvent,
}) => {
  const dateStr = new Date(event.created_at).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        event.pinned
          ? "bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/10"
          : "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60"
      }`}
    >
      {event.pinned && (
        <div
          className="absolute top-4 right-4 text-indigo-400"
          title="Připnutá zpráva"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v3.172l.586.586a1 1 0 01.293.707V14a1 1 0 01-1 1h-1v3a1 1 0 11-2 0v-3H7a1 1 0 01-1-1V10.414a1 1 0 01.293-.707L7 9.121V4.172l-.586-.586A1 1 0 016 2.879V2h1v1.172l.586.586A1 1 0 018 4.172V9.121l-.586.586a1 1 0 01-.293.707V14h5V9.828a1 1 0 01.293-.707L13 8.535V4a1 1 0 011-1V2H5v2z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-1 mb-3">
        <h3 className="text-xl font-bold text-gray-100 pr-8">{event.title}</h3>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          Přidáno {dateStr}
        </span>
      </div>

      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {event.content}
      </p>

      {isAdmin && (
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700/50">
          <button
            onClick={() => onEditEvent?.(event)}
            className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
            title="Upravit událost"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onTogglePin(event.id, !!event.pinned)}
            className={`p-2 rounded-lg transition-colors ${
              event.pinned
                ? "text-indigo-400 hover:bg-indigo-400/10"
                : "text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10"
            }`}
            title={event.pinned ? "Odepnout" : "Připnout"}
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm("Opravdu chcete tuto událost smazat?")) {
                onDelete(event.id);
              }
            }}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Smazat událost"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
