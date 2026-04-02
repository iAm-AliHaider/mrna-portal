import React, { useState } from "react";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import FormikInputField from "../../../../components/common/FormikInputField";
import { useTrainingCalendar } from "../../../../utils/hooks/api/useTrainingCalendar";
import CustomTable from "../../../../components/tables/customeTable";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Calendar" },
];

const TrainingCalendarPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, loading } = useTrainingCalendar(month, year);

  const formatTrainerName = (trainer) => {
    if (!trainer?.candidates) return "TBA";
    const c = trainer.candidates;
    return `${trainer.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
  };

  // Group trainings by date
  const trainingsByDate = {};
  (data || []).forEach((t) => {
    const date = t.start_date;
    if (!trainingsByDate[date]) {
      trainingsByDate[date] = [];
    }
    trainingsByDate[date].push(t);
  });

  // Generate calendar days
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const calendarDays = [];

  // Empty cells for days before first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null, trainings: [] });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarDays.push({
      day,
      date: dateStr,
      trainings: trainingsByDate[dateStr] || [],
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Training Calendar"
        items={breadcrumbItems}
      >
        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Previous
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[month - 1]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Next
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-600 border-b">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((item, idx) => (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border-b border-r ${
                    item.day ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {item.day && (
                    <>
                      <div className="font-semibold text-sm mb-1">{item.day}</div>
                      {item.trainings.map((t) => (
                        <div
                          key={t.id}
                          className="text-xs bg-blue-100 text-blue-700 p-1 rounded mb-1 truncate"
                          title={t.course?.name || "Training"}
                        >
                          {t.course?.name || "Training"}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
              Trainings in {monthNames[month - 1]} {year}
            </h3>
            {data?.length > 0 ? (
              <CustomTable
                headers={["Training", "Date", "Time", "Trainer", "Location"]}
                data={data.map((t) => ({
                  Training: t.course?.name || "N/A",
                  Date: t.start_date || "-",
                  Time: t.start_time ? `${t.start_time} - ${t.end_time || ""}` : "-",
                  Trainer: formatTrainerName(t.trainer),
                  Location: t.location || "-",
                }))}
                showCheckbox={false}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No trainings scheduled for this month</p>
            )}
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default TrainingCalendarPage;
