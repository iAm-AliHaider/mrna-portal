'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import { useNavigate } from "react-router-dom";
import { useRecruitmentDashboardStats } from "../../../../utils/hooks/api/useJobRequisitions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Recruitment" },
];

const RecruitmentDashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useRecruitmentDashboardStats();

  const statCards = [
    { label: "Total Vacancies", value: stats.totalVacancies, icon: <WorkIcon sx={{ fontSize: 32, color: "#7c3aed" }} />, color: "#ede9fe", path: "/admin/recruitment/requisitions" },
    { label: "Active Vacancies", value: stats.activeVacancies, icon: <TrendingUpIcon sx={{ fontSize: 32, color: "#2563eb" }} />, color: "#dbeafe", path: "/admin/recruitment/requisitions?status=active" },
    { label: "Total Applications", value: stats.totalApplications, icon: <PeopleIcon sx={{ fontSize: 32, color: "#16a34a" }} />, color: "#dcfce7", path: "/admin/human-resource/talent-acquisition/candidates" },
    { label: "Interviews Scheduled", value: stats.interviewsScheduled, icon: <AssignmentIcon sx={{ fontSize: 32, color: "#d97706" }} />, color: "#fef3c7", path: "/admin/recruitment/interviews-list" },
    { label: "Offers Extended", value: stats.offersExtended, icon: <AssignmentIcon sx={{ fontSize: 32, color: "#dc2626" }} />, color: "#fee2e2", path: "/admin/human-resource/talent-acquisition/offers" },
    { label: "Hired This Month", value: stats.hiredThisMonth, icon: <CheckCircleIcon sx={{ fontSize: 32, color: "#059669" }} />, color: "#d1fae5", path: "/admin/human-resource/talent-acquisition/candidates?status=hired" },
  ];

  const funnelStages = [
    { label: "Applications", value: stats.pipelineFunnel?.applications || 0, color: "#7c3aed", width: "100%" },
    { label: "Screening", value: stats.pipelineFunnel?.screening || 0, color: "#2563eb", width: `${Math.max(10, Math.round(((stats.pipelineFunnel?.screening || 0) / (stats.pipelineFunnel?.applications || 1)) * 100))}%` },
    { label: "Interview", value: stats.pipelineFunnel?.interview || 0, color: "#d97706", width: `${Math.max(5, Math.round(((stats.pipelineFunnel?.interview || 0) / (stats.pipelineFunnel?.applications || 1)) * 100))}%` },
    { label: "Offer", value: stats.pipelineFunnel?.offer || 0, color: "#dc2626", width: `${Math.max(3, Math.round(((stats.pipelineFunnel?.offer || 0) / (stats.pipelineFunnel?.applications || 1)) * 100))}%` },
    { label: "Hired", value: stats.pipelineFunnel?.hired || 0, color: "#059669", width: `${Math.max(2, Math.round(((stats.pipelineFunnel?.hired || 0) / (stats.pipelineFunnel?.applications || 1)) * 100))}%` },
  ];

  return (
    <Box>
      <PageWrapperWithHeading
        title="Recruitment Dashboard"
        subtitle="Hiring pipeline overview and statistics"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/recruitment/requisitions")} sx={{ borderRadius: 2 }}>Job Requisitions</Button>
          <Button variant="contained" onClick={() => navigate("/admin/recruitment/requisitions?action=add")} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>New Requisition</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3, border: "1px solid #e5e7eb", cursor: "pointer",
                transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
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

      {/* Pipeline Funnel */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recruitment Pipeline</Typography>
            {funnelStages.map((stage) => (
              <Box key={stage.label} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{stage.label}</Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>{stage.value}</Typography>
                </Box>
                <Box sx={{ height: 24, bgcolor: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: stage.width, bgcolor: stage.color, borderRadius: 2, transition: "width 0.5s", display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 1 }}>
                    {stage.value > 0 && <Typography sx={{ fontSize: 11, fontWeight: 600, color: "white" }}>{stage.value}</Typography>}
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Vacancy Status</Typography>
            {[
              { label: "Active", value: stats.activeVacancies, bg: "#dcfce7", color: "#16a34a" },
              { label: "On Hold", value: stats.onHold, bg: "#fef3c7", color: "#d97706" },
              { label: "Closed", value: stats.closed, bg: "#fee2e2", color: "#dc2626" },
            ].map(item => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: item.color }} />
                  <Typography>{item.label}</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.value}</Typography>
              </Box>
            ))}
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                Total vacancies tracked: <strong>{stats.totalVacancies}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecruitmentDashboard;
