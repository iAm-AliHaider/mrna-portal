'use client';

import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { useAssetReports } from "../../../../utils/hooks/api/useAssets";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management", href: "/admin/assets" },
  { title: "Asset Reports" },
];

const REPORT_TYPES = [
  { label: "Asset Register", value: "register" },
  { label: "Depreciation", value: "depreciation" },
  { label: "Maintenance Cost", value: "maintenance" },
];

const AssetReportsPage = () => {
  const [reportType, setReportType] = useState("register");
  const { reportData, loading, fetchReports } = useAssetReports();

  React.useEffect(() => {
    fetchReports(reportType);
  }, [reportType, fetchReports]);

  const registerColumns = [
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_note", label: "Asset Name" },
    { key: "category", label: "Category", render: row => row.asset_category?.name || "N/A" },
    { key: "serial_number", label: "Serial No." },
    { key: "employeeName", label: "Assigned To" },
    { key: "asset_value", label: "Value (SAR)", render: row => row.asset_value ? parseFloat(row.asset_value).toLocaleString() : "N/A" },
    { key: "status", label: "Status" },
    { key: "from_date", label: "Acquisition Date", type: "date" },
  ];

  const depreciationColumns = [
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_note", label: "Asset Name" },
    { key: "category", label: "Category", render: row => row.asset_category?.name || "N/A" },
    { key: "asset_value", label: "Original Value (SAR)", render: row => row.asset_value ? parseFloat(row.asset_value).toLocaleString() : "N/A" },
    { key: "depreciated_value", label: "Current Value (SAR)" },
    { key: "years_owned", label: "Years Owned" },
    { key: "from_date", label: "Acquisition Date", type: "date" },
  ];

  const maintenanceColumns = [
    { key: "asset", label: "Asset", render: row => row.asset?.asset_note || row.asset?.asset_code || "N/A" },
    { key: "maintenance_type", label: "Type" },
    { key: "scheduled_date", label: "Scheduled Date", type: "date" },
    { key: "completed_date", label: "Completed Date", type: "date" },
    { key: "cost", label: "Cost (SAR)" },
    { key: "vendor", label: "Vendor" },
    { key: "status", label: "Status" },
  ];

  const currentData = reportData[reportType] || [];
  const currentColumns = reportType === "register" ? registerColumns : reportType === "depreciation" ? depreciationColumns : maintenanceColumns;

  const transformData = (data) => data.map(d => ({
    ...d,
    from_date: d.from_date ? new Date(d.from_date).toLocaleDateString() : "-",
    scheduled_date: d.scheduled_date ? new Date(d.scheduled_date).toLocaleDateString() : "-",
    completed_date: d.completed_date ? new Date(d.completed_date).toLocaleDateString() : "-",
  }));

  const totalValue = currentData.reduce((sum, d) => sum + (parseFloat(d.asset_value) || 0), 0);
  const totalDepreciated = currentData.reduce((sum, d) => sum + (parseFloat(d.depreciated_value) || 0), 0);

  return (
    <Box>
      <PageWrapperWithHeading
        title="Asset Reports"
        subtitle="Generate and view asset-related reports"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      />

      {/* Report Type Selector */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ToggleButtonGroup value={reportType} exclusive onChange={(e, v) => v && setReportType(v)} size="small">
          {REPORT_TYPES.map(r => (
            <ToggleButton key={r.value} value={r.value} sx={{ borderRadius: 2, px: 3 }}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Button variant="outlined" startIcon={<PrintIcon />} size="small" onClick={() => window.print()} sx={{ borderRadius: 2 }}>
          Print Report
        </Button>
      </Paper>

      {/* Summary Cards */}
      {reportType === "register" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#7c3aed" }}>{currentData.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Assets</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#2563eb" }}>SAR {totalValue.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Total Value</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#16a34a" }}>{currentData.filter(d => d.status === "available").length}</Typography>
              <Typography variant="body2" color="text.secondary">Available</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {reportType === "depreciation" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#7c3aed" }}>SAR {totalValue.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Original Value</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#2563eb" }}>SAR {totalDepreciated.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Current Value</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#dc2626" }}>SAR {(totalValue - totalDepreciated).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Depreciated</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Report Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <DynamicTable
          columns={currentColumns}
          data={transformData(currentData)}
          loading={loading}
          showPagination={currentData.length > 20}
          perPage={20}
        />
      </Paper>
    </Box>
  );
};

export default AssetReportsPage;
