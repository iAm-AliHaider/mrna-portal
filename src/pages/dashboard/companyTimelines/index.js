import React, { useState, useMemo } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useCorporateEventsList } from '../../../utils/hooks/api/corporateEvents';

const CompanyTimelines = () => {
  // Fetch all events (large pageSize)
  const { eventData = [], loading } = useCorporateEventsList(0, 1000);

  // Group events by year using useMemo for performance
  const { years, eventsByYear } = useMemo(() => {
    const grouped = {};
    (eventData || []).forEach(event => {
      const year = (event.created_at || '').slice(0, 4);
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(event);
    });
    const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
    return { years: sortedYears, eventsByYear: grouped };
  }, [eventData]);

  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const selectedYear = years[selectedYearIndex];
  const events = eventsByYear[selectedYear] || [];

  const canGoUp = selectedYearIndex > 0;
  const canGoDown = selectedYearIndex < years.length - 1;

  const goUp = () => canGoUp && setSelectedYearIndex((prev) => prev - 1);
  const goDown = () => canGoDown && setSelectedYearIndex((prev) => prev + 1);

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Company Timelines
      </div>

      {/* Content */}
      <div className="flex items-center gap-4 p-4">
        {/* Year switcher */}
        <div className="flex flex-col items-center">
          <button
            onClick={goUp}
            disabled={!canGoUp}
            className="text-gray-500 hover:text-primary disabled:opacity-30"
          >
            <KeyboardArrowUpIcon />
          </button>
          <div className="font-bold text-lg text-primary">{selectedYear || '-'}</div>
          <button
            onClick={goDown}
            disabled={!canGoDown}
            className="text-gray-500 hover:text-primary disabled:opacity-30"
          >
            <KeyboardArrowDownIcon />
          </button>
        </div>

        {/* Event cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 min-h-[80px]">
          {loading && <div className="text-gray-400">Loading...</div>}
          {!loading && events.length === 0 && <div className="text-gray-400">No events for this year.</div>}
          {events.map((event, idx) => (
            <div
              key={event.id || idx}
              className="min-w-[120px] bg-gray-100 rounded-md p-3 flex flex-col items-center justify-center text-sm text-gray-800 shadow-sm"
            >
              <EmojiEventsIcon className="text-indigo-600 mb-1" />
              <span>{event.name}</span>
              {event.start_date && <span className="text-xs text-gray-500 mt-1">{event.start_date}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyTimelines;
