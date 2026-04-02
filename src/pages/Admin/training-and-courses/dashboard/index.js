'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { useNavigate } from "react-router-dom";
import { useTrainingDashboard } from "../../../../utils/hooks/api/useTrainingDashboard";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training & Courses" },
];

const TrainingDashboard = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading } = useTrainingDashboard(year);

  const statCards = [
    { label: "Total Trainings", value: data.totalTrainings, icon: <SchoolIcon sx={{ fontSize: 32, color: "#7c3aed" }} />, color: "#ede9fe", path: "/admin/training-and-courses/trainings" },
    { label: "Enrolled Employees", value: data.enrolledEmployees, icon: <PeopleIcon sx={{ fontSize: 32, color: "#2563eb" }} />, color: "#dbeafe", path: "/admin/training-and-courses/courses" },
    { label: "Completed", value: data.completed, icon: <CheckCircleIcon sx={{ fontSize: 32, color: "#16a34a" }} />, color: "#dcfce7", path: "/admin/training-and-courses/courses" },
    { label: "In Progress", value: data.inProgress, icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#d97706" }} />, color: "#fef3c7" },
    { label: "Upcoming Sessions", value: data.upcoming, icon: <CalendarMonthIcon sx={{ fontSize: 32, color: "#dc2626" }} />, color: "#fee2e2", path: "/admin/training-and-courses/calendar" },
    { label: "Certifications Issued", value: data.certificationsIssued, icon: <VerifiedIcon sx={{ fontSize: 32, color: "#059669" }} />, color: "#d1fae5" },
    { label: "Trainers", value: data.trainersCount, icon: <PersonIcon sx={{ fontSize: 32, color: "#6366f1" }} />, color: "#e0e7ff", path: "/admin/training-and-courses/trainers" },
    { label: "Completion Rate", value: `${data.completionRate}%`, icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#7c3aed" }} />, color: "#ede9fe" },
  ];

  const upcomingColumns = [
    { key: "course", label: "Course", render: row => row.course?.course_name || "N/A" },
    { key: "start_date", label: "Start Date", render: row => row.start_date ? new Date(row.start_date).toLocaleDateString() : "-" },
    { key: "end_date", label: "End Date", render: row => row.end_date ? new Date(row.end_date).toLocaleDateString() : "-" },
    { key: "location", label: "Location", render: row => row.location || "-" },
    { key: "status", label: "Status", type: "chip", render: row => {
      const s = { scheduled: { bg: "#dbeafe", color: "#2563eb" }, completed: { bg: "#dcfce7", color: "#16a34a" }, cancelled: { bg: "#fee2e2", color: "#dc2626" } }[row.status] || { bg: "#f1f5f9", color: "#64748b" };
      return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, textTransform: "capitalize" }}>{row.status || "scheduled"}</span>;
    }},
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxMonthCount = Math.max(...(data.byMonth || []).map(m => m.count), 1);

  return (
    <Box>
      <PageWrapperWithHeading
        title="Training Dashboard"
        subtitle="Training program overview and statistics"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={e => setYear(e.target.value)} label="Year">
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => navigate("/admin/training-and-courses/training-and-courses")} sx={{ borderRadius: 2 }}>All Trainings</Button>
          <Button variant="contained" onClick={() => navigate("/admin/training-and-courses/courses")} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>Manage Courses</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3, border: "1px solid #e5e7eb", cursor: card.path ? "pointer" : "default",
                transition: "all 0.2s", "&:hover": card.path ? { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" } : {},
              }}
              onClick={() => card.path && navigate(card.path)}
            >
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.color, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, maxWidth: 56 }}>
                {card.icon}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>{card.value}</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Trainings by Month */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Trainings by Month ({year})</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {monthNames.map((name, idx) => {
                const monthData = (data.byMonth || [])[idx] || { count: 0 };
                const pct = Math.round((monthData.count / maxMonthCount) * 100);
                return (
                  <Box key={name} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: 12, color: "#64748b", minWidth: 30 }}>{name}</Typography>
                    <Box sx={{ flex: 1, height: 20, bgcolor: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: "#7c3aed", borderRadius: 2, transition: "width 0.5s", display: "flex", alignItems: "center", pl: 1 }}>
                        {monthData.count > 0 && <Typography sx={{ fontSize: 10, fontWeight: 600, color: "white" }}>{monthData.count}</Typography>}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Top Courses */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Top Courses by Enrollment</Typography>
            {(data.topCourses || []).length === 0 ? (
              <Typography sx={{ color: "#94a3b8", textAlign: "center", py: 4 }}>No enrollment data yet</Typography>
            ) : (
              <Box>
                {(data.topCourses || []).map((course, idx) => (
                  <Box key={course.course_id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: idx === 0 ? "#7c3aed" : idx === 1 ? "#6366f1" : idx === 2 ? "#2563eb" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "white" }}>{idx + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 500 }}>Course #{course.course_id}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: "#7c3aed" }}>{course.enrollment} enrolled</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Sessions */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Training Sessions</Typography>
              <Button size="small" variant="outlined" onClick={() => navigate("/admin/training-and-courses/calendar")} sx={{ borderRadius: 2 }}>Calendar View</Button>
            </Box>
            <DynamicTable
              columns={upcomingColumns}
              data={(data.upcomingSessions || []).map(s => ({ ...s, course: { course_name: s.course?.course_name } }))}
              loading={loading}
              showPagination={false}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingDashboard;
