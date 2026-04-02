'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAssetDashboardStats } from "../../../../utils/hooks/api/useAssets";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management" },
];

const AssetManagementDashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useAssetDashboardStats();

  const statCards = [
    { label: "Total Assets", value: stats.totalAssets, icon: <InventoryIcon sx={{ fontSize: 32, color: "#7c3aed" }} />, color: "#ede9fe", path: "/admin/assets/catalog" },
    { label: "Assigned", value: stats.assigned, icon: <AssignmentIndIcon sx={{ fontSize: 32, color: "#2563eb" }} />, color: "#dbeafe", path: "/admin/assets/catalog?filter=assigned" },
    { label: "Available", value: stats.available, icon: <CheckCircleIcon sx={{ fontSize: 32, color: "#16a34a" }} />, color: "#dcfce7", path: "/admin/assets/catalog?filter=available" },
    { label: "Under Maintenance", value: stats.maintenance, icon: <BuildIcon sx={{ fontSize: 32, color: "#d97706" }} />, color: "#fef3c7", path: "/admin/assets/maintenance" },
  ];

  const recentColumns = [
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_note", label: "Asset Name" },
    { key: "category", label: "Category", render: row => row.asset_category?.name || "N/A" },
    { key: "assignment_type", label: "Action" },
    { key: "created_at", label: "Date", type: "date" },
  ];

  const transformRecentData = (data) => {
    return (data || []).map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : "-",
    }));
  };

  return (
    <Box>
      <PageWrapperWithHeading
        title="Asset Management"
        subtitle="Manage and track all company assets"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
              }}
              onClick={() => navigate(card.path)}
            >
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.color, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 56 }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>{card.value}</Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>{card.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Quick Actions</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="contained" size="small" onClick={() => navigate("/admin/assets/catalog?action=add")} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>
            Add New Asset
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate("/admin/assets/maintenance")} sx={{ borderRadius: 2 }}>
            Schedule Maintenance
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate("/admin/assets/disposal")} sx={{ borderRadius: 2 }}>
            Asset Disposal
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate("/admin/assets/reports")} sx={{ borderRadius: 2 }}>
            View Reports
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate("/admin/assets/tracking")} sx={{ borderRadius: 2 }}>
            Track Assets
          </Button>
        </Box>
      </Paper>

      {/* Asset Distribution & Recent Transactions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Asset Distribution by Category</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/admin/assets/catalog")}>View All</Button>
            </Box>
            {(stats.byCategory || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No asset data available</Typography>
            ) : (
              <Box>
                {(stats.byCategory || []).map((cat) => {
                  const total = stats.totalAssets || 1;
                  const pct = Math.round((cat.count / total) * 100);
                  return (
                    <Box key={cat.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.name}</Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>{cat.count} ({pct}%)</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: "#7c3aed", borderRadius: 4, transition: "width 0.3s" }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Asset Transactions</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/admin/assets/tracking")}>View All</Button>
            </Box>
            <DynamicTable
              columns={recentColumns}
              data={transformRecentData(stats.recentTransactions || [])}
              loading={loading}
              showPagination={false}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetManagementDashboard;
