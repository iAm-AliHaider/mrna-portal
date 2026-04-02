import React, { useState } from "react";
import { useCorporateEventsList } from '../../Employees/corporateEvents/../../../utils/hooks/api/corporateEvents';
import CorporateEventModal from '../../Employees/corporateEvents/modal';

const CorporateEventsCard = () => {
  const { eventData = [], loading } = useCorporateEventsList(0, 3);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);


  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Corporate Events
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3 p-4">
        {eventData.length === 0 && !loading && (
          <div className="text-gray-500 text-center">No events found.</div>
        )}
        {eventData.map((event, index) => (
          <div key={event.id || index} className="bg-gray-50 rounded-md p-3 shadow-sm flex flex-col gap-2">
            <div className="text-xs text-gray-500">{event.time} - {event.start_date}</div>
            <div className="text-sm text-gray-800 leading-snug">{event.description}</div>
            <div className="text-right">
              <button
                className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-md  transition"
                onClick={() => handleViewDetails(event)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <CorporateEventModal open={modalOpen} onClose={handleCloseModal} event={selectedEvent} />
    </div>
  );
};

export default CorporateEventsCard;
