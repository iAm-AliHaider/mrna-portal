'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import FlightIcon from "@mui/icons-material/Flight";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublicIcon from "@mui/icons-material/Public";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTravelDashboard } from "../../../../utils/hooks/api/useTravelDashboard";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Transactions" },
  { title: "Travel Dashboard" },
];

const TravelDashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useTravelDashboard();

  const statCards = [
    { label: "Active Travels", value: stats.activeRequests, icon: <FlightIcon sx={{ fontSize: 32, color: "#7c3aed" }} />, color: "#ede9fe" },
    { label: "Pending Approvals", value: stats.pendingApprovals, icon: <PendingIcon sx={{ fontSize: 32, color: "#d97706" }} />, color: "#fef3c7" },
    { label: "Approved This Month", value: stats.approvedThisMonth, icon: <CheckCircleIcon sx={{ fontSize: 32, color: "#16a34a" }} />, color: "#dcfce7" },
    { label: "Countries Visited", value: stats.countriesVisited, icon: <PublicIcon sx={{ fontSize: 32, color: "#2563eb" }} />, color: "#dbeafe" },
    { label: "Total Expense Claimed", value: `SAR ${(stats.totalExpenseClaimed || 0).toLocaleString()}`, icon: <AttachMoneyIcon sx={{ fontSize: 32, color: "#dc2626" }} />, color: "#fee2e2" },
    { label: "Per Diem Paid", value: `SAR ${(stats.perDiemPaid || 0).toLocaleString()}`, icon: <AttachMoneyIcon sx={{ fontSize: 32, color: "#059669" }} />, color: "#d1fae5" },
  ];

  const columns = [
    { key: "reference", label: "Reference" },
    { key: "employeeName", label: "Employee" },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    {
      key: "from_date", label: "From",
      render: row => row.from_date ? new Date(row.from_date).toLocaleDateString() : "-",
    },
    {
      key: "to_date", label: "To",
      render: row => row.to_date ? new Date(row.to_date).toLocaleDateString() : "-",
    },
    {
      key: "status", label: "Status", type: "chip",
      render: (row) => {
        const statusMap = {
          pending: { bg: "#fef3c7", color: "#d97706" },
          approved: { bg: "#dcfce7", color: "#16a34a" },
          declined: { bg: "#fee2e2", color: "#dc2626" },
        };
        const s = statusMap[row.status] || statusMap.pending;
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, textTransform: "capitalize" }}>{row.status || "pending"}</span>;
      },
    },
    {
      key: "amount_due", label: "Amount Due (SAR)",
      render: row => row.amount_due ? parseFloat(row.amount_due).toLocaleString() : "-",
    },
  ];

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    approved: { bg: "#dcfce7", color: "#16a34a" },
    declined: { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <Box>
      <PageWrapperWithHeading
        title="Travel Dashboard"
        subtitle="Overview of business travel requests and expenses"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/transactions/travels")} sx={{ borderRadius: 2 }}>View My Travels</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/transactions/travels/businessTravelForm")} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>New Travel Request</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" } }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.color, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, maxWidth: 56 }}>
                {card.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", fontSize: typeof card.value === "string" && card.value.length > 10 ? 16 : "h5" }}>{card.value}</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>{card.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Requests */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Travel Requests</Typography>
          <Button size="small" variant="outlined" onClick={() => navigate("/transactions/travels")} sx={{ borderRadius: 2 }}>View All</Button>
        </Box>
        <DynamicTable
          columns={columns}
          data={(stats.recentRequests || []).map(r => ({
            ...r,
            from_date: r.from_date || r.created_at,
            to_date: r.to_date || r.created_at,
          }))}
          loading={loading}
          showPagination={false}
        />
      </Paper>
    </Box>
  );
};

export default TravelDashboard;
