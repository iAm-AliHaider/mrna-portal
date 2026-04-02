'use client';

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, IconButton, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import { useNavigate } from "react-router-dom";
import { useRosterSchedules } from "../../../../utils/hooks/api/useShifts";
import { supabase } from "../../../../supabaseClient";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Shift Management", href: "/admin/shifts" },
  { title: "Employee Roster" },
];

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const formatDate = (date) => date.toISOString().split("T")[0];
const formatDayName = (date) => date.toLocaleDateString("en-US", { weekday: "short" });
const formatDayNum = (date) => date.getDate();
const formatMonthYear = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const EmployeeRosterPage = () => {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeSchedule, setEmployeeSchedule] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase
        .from("employees")
        .select("id, employee_code, candidates(first_name, second_name, family_name)")
        .eq("is_active", true)
        .order("employee_code");
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  const weekStartStr = formatDate(weekStart);
  const { schedules, loading } = useRosterSchedules(weekStartStr, selectedEmployeeId || null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const scheduleMap = {};
  (schedules || []).forEach(s => {
    scheduleMap[s.schedule_date] = s;
  });

  const employeeOptions = (employees || []).map(emp => {
    const name = emp.candidates
      ? `${emp.candidates.first_name || ""} ${emp.candidates.second_name || ""}`.trim()
      : `Emp ${emp.employee_code}`;
    return { value: emp.id, label: `${name} (${emp.employee_code})` };
  });

  const selectedEmployee = employees.find(e => e.id === parseInt(selectedEmployeeId));
  const empName = selectedEmployee?.candidates
    ? `${selectedEmployee.candidates.first_name || ""} ${selectedEmployee.candidates.second_name || ""}`.trim()
    : selectedEmployee ? `Emp ${selectedEmployee.employee_code}` : "";

  return (
    <Box>
      <PageWrapperWithHeading
        title="Employee Roster"
        subtitle="View individual employee schedule"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/shifts/roster")} sx={{ borderRadius: 2 }}>Weekly Roster</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Employee Selector & Week Navigator */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Select Employee</InputLabel>
          <Select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} label="Select Employee">
            <MenuItem value=""><em>None</em></MenuItem>
            {employeeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => setWeekStart(prev => addDays(prev, -7))} size="small"><ChevronLeftIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 200, textAlign: "center" }}>{formatMonthYear(weekStart)}</Typography>
          <IconButton onClick={() => setWeekStart(prev => addDays(prev, 7))} size="small"><ChevronRightIcon /></IconButton>
        </Box>
      </Paper>

      {selectedEmployeeId ? (
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            {weekDays.map((day, idx) => (
              <Box key={idx} sx={{ p: 2, textAlign: "center", borderLeft: idx > 0 ? "1px solid #e5e7eb" : "none" }}>
                <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{formatDayName(day)}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>{formatDayNum(day)}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {weekDays.map((day, idx) => {
              const dateStr = formatDate(day);
              const sched = scheduleMap[dateStr];
              const shift = sched?.shift;
              return (
                <Box key={idx} sx={{ p: 2, minHeight: 120, borderLeft: idx > 0 ? "1px solid #f1f5f9" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  {sched?.is_off ? (
                    <Chip label="Off" size="medium" sx={{ bgcolor: "#f1f5f9", color: "#64748b" }} />
                  ) : shift ? (
                    <>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#7c3aed" }}>{shift.shift_name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>{shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}</Typography>
                      <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>Break: {shift.break_duration_minutes || 60}min</Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: "#cbd5e1" }}>No schedule</Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          {loading && <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>Loading...</Box>}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: "1px solid #e5e7eb", textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">Select an employee to view their roster</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EmployeeRosterPage;
