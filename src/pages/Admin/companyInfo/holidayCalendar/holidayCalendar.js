'use client';

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, IconButton, Chip, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Company Info", href: "/admin/company-info/general" },
  { title: "Holiday Calendar" },
];

const HOLIDAY_COLORS = {
  national: { bg: "#dbeafe", color: "#2563eb", label: "National" },
  religious: { bg: "#dcfce7", color: "#16a34a", label: "Religious" },
  company: { bg: "#ede9fe", color: "#7c3aed", label: "Company" },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getMonthData = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  return { firstDay, lastDay, daysInMonth, startDayOfWeek };
};

const HolidayCalendarPage = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("holiday_definitions")
          .select("*")
          .eq("is_deleted", false)
          .eq("holiday_year", currentYear);
        setHolidays(data || []);
      } catch (err) {
        console.error("Error fetching holidays:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [currentYear]);

  const { daysInMonth, startDayOfWeek } = getMonthData(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (day) => today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const isWeekend = (dayIndex) => dayIndex === 5 || dayIndex === 6;

  // Build holiday map: { "YYYY-MM-DD": holiday }
  const holidayMap = {};
  (holidays || []).forEach(h => {
    const dateStr = h.start_date || h.holiday_date;
    if (dateStr) {
      holidayMap[dateStr] = h;
    }
    // For date ranges
    if (h.start_date && h.end_date && h.start_date !== h.end_date) {
      const start = new Date(h.start_date);
      const end = new Date(h.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split("T")[0];
        if (!holidayMap[ds]) holidayMap[ds] = h;
      }
    }
  });

  // Build calendar grid
  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ day: null, dateStr: null });
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const holiday = holidayMap[dateStr];
    calendarDays.push({ day, dateStr, holiday });
  }

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <Box>
      <PageWrapperWithHeading
        title="Holiday Calendar"
        subtitle={`${monthName} ${currentYear}`}
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/company-info/holiday-definition")} sx={{ borderRadius: 2 }}>Manage Holidays</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Month Navigator */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={prevMonth} size="small"><ChevronLeftIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, minWidth: 220, textAlign: "center" }}>{monthName} {currentYear}</Typography>
          <IconButton onClick={nextMonth} size="small"><ChevronRightIcon /></IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b" }}>{holidays.length} holidays in {currentYear}</Typography>
      </Paper>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {Object.entries(HOLIDAY_COLORS).map(([type, { bg, color, label }]) => (
          <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: bg, border: `2px solid ${color}` }} />
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Day Headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
          {DAY_NAMES.map((name, i) => (
            <Box key={name} sx={{ p: 1.5, textAlign: "center", bgcolor: isWeekend(i) ? "#f1f5f9" : "transparent" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: isWeekend(i) ? "#94a3b8" : "#64748b" }}>{name}</Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Cells */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarDays.map(({ day, dateStr, holiday }, idx) => {
            const dayIndex = idx % 7;
            const isEmpty = day === null;
            const colors = holiday ? HOLIDAY_COLORS[holiday.religion?.toLowerCase()] || HOLIDAY_COLORS.company : null;
            const isHoliday = !!holiday;

            return (
              <Box key={idx} sx={{
                minHeight: 100, borderRight: (dayIndex !== 6) ? "1px solid #f1f5f9" : "none",
                borderBottom: "1px solid #f1f5f9",
                p: 1, position: "relative",
                bgcolor: isEmpty ? "#fafafa" : isHoliday ? colors?.bg : isWeekend(dayIndex) ? "#fafafa" : "white",
                opacity: isEmpty ? 0.5 : 1,
              }}>
                {day !== null && (
                  <>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: isToday(day) ? "#7c3aed" : "transparent",
                      mb: 0.5,
                    }}>
                      <Typography sx={{
                        fontSize: 13, fontWeight: isToday(day) ? 700 : 500,
                        color: isToday(day) ? "white" : "#1e293b",
                      }}>{day}</Typography>
                    </Box>
                    {holiday && (
                      <Box>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: colors?.color, lineHeight: 1.3, mt: 0.5 }}>
                          {holiday.name?.length > 20 ? holiday.name.substring(0, 18) + "..." : holiday.name}
                        </Typography>
                        {holiday.repeatable && <Chip label="Repeating" size="small" sx={{ mt: 0.5, height: 16, fontSize: 9, bgcolor: colors?.bg, color: colors?.color }} />}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Holiday List for Current Month */}
      <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Holidays in {monthName} {currentYear}</Typography>
        {holidays.filter(h => {
          const start = h.start_date;
          if (!start) return false;
          const d = new Date(start);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        }).length === 0 ? (
          <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>No holidays in this month</Typography>
        ) : (
          <Box>
            {holidays.filter(h => {
              const start = h.start_date;
              if (!start) return false;
              const d = new Date(start);
              return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            }).map(h => {
              const colors = HOLIDAY_COLORS[h.religion?.toLowerCase()] || HOLIDAY_COLORS.company;
              return (
                <Box key={h.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colors.color }} />
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>{h.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                        {h.start_date}{h.end_date && h.end_date !== h.start_date ? ` - ${h.end_date}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={colors.label} size="small" sx={{ bgcolor: colors.bg, color: colors.color, fontSize: 11 }} />
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HolidayCalendarPage;
