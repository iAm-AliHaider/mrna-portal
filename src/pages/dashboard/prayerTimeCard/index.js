import React, { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const PrayerTimePanel = () => {
  const [timings, setTimings] = useState({});
  const [hijriDate, setHijriDate] = useState("");

  const fetchPrayerTimes = async () => {
    try {
      const res = await fetch(
        "https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi%20Arabia&method=4"
      );
      const data = await res.json();
      if (data.code === 200) {
        setTimings(data.data.timings);
        setHijriDate(data.data.date.hijri.date); // e.g., "14-12-1446"
      }
    } catch (err) {
      console.error("Failed to fetch prayer times:", err);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const displayTimes = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Prayer Time
      </div>
      <div className="flex flex-col gap-3 text-sm text-gray-700 p-4">
        {displayTimes.map((p, idx) => (
          <div key={idx} className="grid grid-cols-3 items-center">
            <span className="text-left">{p.name}</span>
            <span className="font-bold text-black text-base text-center">{p.time}</span>
            <span className="flex justify-end"><LocationOnIcon color="primary" /></span>
          </div>
        ))}
        {hijriDate && (
          <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
            {hijriDate} Hijri
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerTimePanel;
