import React, { useState } from "react";
import type { DBEvent } from "../../../types";
import EventCard from "./EventCard";
import AddEventForm from "./AddEventForm";
import EditEventModal from "./EditEventModal";
import { updateEvent } from "../services/eventService";
import { useCsrfHandler } from "../../auth/hooks/useCsrfHandler";

interface EventsTabProps {
  events: DBEvent[];
  isAuthenticated: boolean;
  onAddEvent: (title: string, content: string, pinned: boolean) => void;
  onDeleteEvent: (id: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onUpdateEvent: (events: DBEvent[]) => void;
}

const EventsTab: React.FC<EventsTabProps> = ({
  events,
  isAuthenticated,
  onAddEvent,
  onDeleteEvent,
  onTogglePin,
  onUpdateEvent,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<DBEvent | null>(null);
  const { executeWithCsrf } = useCsrfHandler();

  const handleEditEvent = (event: DBEvent) => {
    if (!isAuthenticated) return;
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (data: {
    title: string;
    content: string;
    pinned: boolean;
  }) => {
    if (!isAuthenticated || !eventToEdit) return;

    await executeWithCsrf(async () => {
      const updatedEvent = await updateEvent({
        eventId: eventToEdit.id,
        title: data.title,
        content: data.content,
        pinned: data.pinned,
      });

      if (updatedEvent) {
        onUpdateEvent(
          events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
        );
        setIsEditModalOpen(false);
        setEventToEdit(null);
      }
    });
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EditEventModal
        isOpen={isEditModalOpen}
        event={eventToEdit}
        onConfirm={handleConfirmEdit}
        onCancel={handleCloseModal}
      />

      {isAuthenticated && (
        <section className="bg-gray-800/40 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            Vytvořit novou událost
          </h2>
          <AddEventForm onSubmit={onAddEvent} />
        </section>
      )}

      <div className="grid grid-cols-1 gap-4">
        {events.length === 0 ? (
          <div className="py-20 text-center bg-gray-800/20 rounded-2xl border border-dashed border-gray-700">
            <p className="text-gray-500 font-medium text-lg italic">
              Zatím žádné události.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={isAuthenticated}
              onDelete={onDeleteEvent}
              onTogglePin={onTogglePin}
              onEditEvent={handleEditEvent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EventsTab;
