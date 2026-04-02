'use client';

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Grid, Select, MenuItem, FormControl, InputLabel, IconButton, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import Modal from "../../../../components/common/Modal";
import { Formik, Form } from "formik";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useNavigate } from "react-router-dom";
import { useShifts } from "../../../../utils/hooks/api/useShifts";
import { useRosterSchedules, useCreateRosterSchedule, useUpdateRosterSchedule } from "../../../../utils/hooks/api/useShifts";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast/headless";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Shift Management", href: "/admin/shifts" },
  { title: "Roster Schedule" },
];

const SHIFT_COLORS = {
  1: { bg: "#ede9fe", color: "#7c3aed" },
  2: { bg: "#dbeafe", color: "#2563eb" },
  3: { bg: "#dcfce7", color: "#16a34a" },
  4: { bg: "#fef3c7", color: "#d97706" },
  5: { bg: "#fee2e2", color: "#dc2626" },
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (date) => date.toISOString().split("T")[0];
const formatDayName = (date) => date.toLocaleDateString("en-US", { weekday: "short" });
const formatDayNum = (date) => date.getDate();
const formatMonthYear = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const RosterPage = () => {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null); // { employeeId, date }
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [cellData, setCellData] = useState(null);

  // Load employees
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

  // Load shifts
  const { shifts: shiftsData } = useShifts(0, 100);
  useEffect(() => { setShifts(shiftsData || []); }, [shiftsData]);

  const weekStartStr = formatDate(weekStart);
  const { schedules, loading } = useRosterSchedules(weekStartStr);
  const { create: createSchedule } = useCreateRosterSchedule();
  const { update: updateSchedule } = useUpdateRosterSchedule();

  // Build schedule map: { [employeeId]: { [dateStr]: schedule } }
  const scheduleMap = {};
  (schedules || []).forEach(s => {
    const empId = s.employee_id;
    const dateStr = s.schedule_date;
    if (!scheduleMap[empId]) scheduleMap[empId] = {};
    scheduleMap[empId][dateStr] = s;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const shiftOptions = [
    ...(shifts || []).map(s => ({ label: `${s.shift_name} (${s.start_time}-${s.end_time})`, value: s.id })),
    { label: "Off", value: "off" },
  ];

  const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const handleThisWeek = () => setWeekStart(getWeekStart(new Date()));

  const handleCellClick = (employeeId, dateStr) => {
    setCellData({ employeeId, dateStr, schedule: scheduleMap[employeeId]?.[dateStr] });
    setAssignModalOpen(true);
  };

  const handleAssignShift = async (values) => {
    const { employeeId, dateStr, schedule } = cellData;
    try {
      if (values.shift_id === "off") {
        if (schedule?.id) {
          await updateSchedule(schedule.id, { is_off: true, shift_id: null, notes: values.notes || "" });
        } else {
          await createSchedule({ employee_id: employeeId, schedule_date: dateStr, is_off: true, notes: values.notes || "" });
        }
      } else {
        if (schedule?.id) {
          await updateSchedule(schedule.id, { shift_id: values.shift_id, is_off: false, notes: values.notes || "" });
        } else {
          await createSchedule({ employee_id: employeeId, schedule_date: dateStr, shift_id: values.shift_id, is_off: false, notes: values.notes || "" });
        }
      }
      toast.success("Shift assigned successfully!");
      setAssignModalOpen(false);
      // Refetch
      window.location.reload();
    } catch (err) {
      toast.error("Failed to assign shift");
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Box>
      <PageWrapperWithHeading
        title="Roster Schedule"
        subtitle="Weekly roster management"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/shifts/requests")} sx={{ borderRadius: 2 }}>View Requests</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Week Navigator */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={handlePrevWeek} size="small"><ChevronLeftIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 200, textAlign: "center" }}>{formatMonthYear(weekStart)}</Typography>
          <IconButton onClick={handleNextWeek} size="small"><ChevronRightIcon /></IconButton>
        </Box>
        <Button size="small" variant="outlined" onClick={handleThisWeek} sx={{ borderRadius: 2 }}>This Week</Button>
      </Paper>

      {/* Roster Grid */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Header Row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "200px repeat(7, 1fr)", bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
          <Box sx={{ p: 2, fontWeight: 600, color: "#64748b", fontSize: 13 }}>Employee</Box>
          {weekDays.map((day, idx) => (
            <Box key={idx} sx={{
              p: 1.5, textAlign: "center", borderLeft: "1px solid #e5e7eb",
              bgcolor: isToday(day) ? "#ede9fe" : "transparent",
            }}>
              <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{formatDayName(day)}</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: isToday(day) ? "#7c3aed" : "#1e293b" }}>{formatDayNum(day)}</Typography>
            </Box>
          ))}
        </Box>

        {/* Employee Rows */}
        {(employees || []).map((emp) => {
          const empName = emp.candidates
            ? `${emp.candidates.first_name || ""} ${emp.candidates.second_name || ""} ${emp.candidates.family_name || ""}`.trim()
            : `Emp ${emp.employee_code}`;
          return (
            <Box key={emp.id} sx={{ display: "grid", gridTemplateColumns: "200px repeat(7, 1fr)", borderBottom: "1px solid #f1f5f9", "&:hover": { bgcolor: "#fafafa" } }}>
              <Box sx={{ p: 2, display: "flex", alignItems: "center", overflow: "hidden" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{empName}</Typography>
                <Typography sx={{ fontSize: 11, color: "#94a3b8", ml: 0.5 }}>({emp.employee_code})</Typography>
              </Box>
              {weekDays.map((day, idx) => {
                const dateStr = formatDate(day);
                const sched = scheduleMap[emp.id]?.[dateStr];
                const shift = sched?.shift;
                const colorScheme = shift ? SHIFT_COLORS[(shift.id % 5) + 1] || SHIFT_COLORS[1] : null;
                return (
                  <Box key={idx} onClick={() => handleCellClick(emp.id, dateStr)} sx={{
                    p: 1, minHeight: 72, borderLeft: "1px solid #f1f5f9", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: isToday(day) ? "#faf5ff" : "transparent",
                    "&:hover": { bgcolor: isToday(day) ? "#f3e8ff" : "#f0f9ff" },
                    transition: "background 0.15s",
                  }}>
                    {sched?.is_off ? (
                      <Chip label="Off" size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontSize: 11 }} />
                    ) : shift ? (
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.5, bgcolor: colorScheme?.bg, textAlign: "center", width: "100%" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: colorScheme?.color }}>{shift.shift_name}</Typography>
                        <Typography sx={{ fontSize: 9, color: colorScheme?.color, opacity: 0.8 }}>{shift.start_time?.substring(0, 5)}-{shift.end_time?.substring(0, 5)}</Typography>
                      </Paper>
                    ) : (
                      <Typography sx={{ fontSize: 11, color: "#cbd5e1" }}>+</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
        {loading && <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>Loading roster...</Box>}
        {(!employees || employees.length === 0) && !loading && (
          <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>No employees found</Box>
        )}
      </Paper>

      {/* Assign Shift Modal */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Shift" maxWidth="xs">
        <Formik initialValues={{ shift_id: cellData?.schedule?.shift_id || "", notes: cellData?.schedule?.notes || "" }} onSubmit={handleAssignShift}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                  {cellData?.dateStr ? new Date(cellData.dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
                </Typography>
                <FormikSelectField name="shift_id" label="Shift / Off" options={shiftOptions} required />
                <FormikInputField name="notes" label="Notes" multiline rows={2} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button variant="outlined" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                <SubmitButton loading={isSubmitting}>Assign</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    </Box>
  );
};

export default RosterPage;
