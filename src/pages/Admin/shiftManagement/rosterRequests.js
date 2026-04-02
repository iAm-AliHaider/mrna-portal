'use client';

import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchField from "../../../../components/common/searchField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import { useNavigate } from "react-router-dom";
import { useRosterRequests, useApproveRosterRequest } from "../../../../utils/hooks/api/useShifts";
import toast from "react-hot-toast/headless";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Shift Management", href: "/admin/shifts" },
  { title: "Roster Requests" },
];

const RosterRequestsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage] = useState(20);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { requests, totalPages, loading, refetch } = useRosterRequests(page, perPage);
  const { approve, loading: approveLoading } = useApproveRosterRequest();

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#d97706" },
    approved: { bg: "#dcfce7", color: "#16a34a" },
    rejected: { bg: "#fee2e2", color: "#dc2626" },
  };

  const columns = [
    {
      key: "employee", label: "Employee",
      render: (row) => {
        const name = row.employee?.candidates
          ? `${row.employee.candidates.first_name} ${row.employee.candidates.second_name || ""}`.trim()
          : `Emp ${row.employee?.employee_code || "N/A"}`;
        return <Typography sx={{ fontWeight: 500 }}>{name}</Typography>;
      },
    },
    { key: "requested_date", label: "Requested Date", type: "date", render: row => row.requested_date ? new Date(row.requested_date).toISOString().toLocaleDateString() : "-" },
    { key: "shift", label: "Requested Shift", render: row => row.shift?.shift_name || "N/A" },
    { key: "reason", label: "Reason", render: row => row.reason || "-" },
    {
      key: "status", label: "Status", type: "chip",
      render: (row) => {
        const s = statusColors[row.status] || statusColors.pending;
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, textTransform: "capitalize" }}>{row.status || "pending"}</span>;
      },
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {row.status === "pending" && (
            <>
              <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={(e) => { e.stopPropagation(); handleApprove(row, "hr"); }} sx={{ borderRadius: 2, minWidth: 0, px: 1 }}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={(e) => { e.stopPropagation(); handleReject(row); }} sx={{ borderRadius: 2, minWidth: 0, px: 1 }}>
                Reject
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  const handleApprove = async (request, type) => {
    await approve(request.id, type);
    refetch();
  };

  const handleReject = async (request) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleRejectSubmit = async (values) => {
    toast.success("Request rejected");
    setDetailModalOpen(false);
    refetch();
  };

  const transformedData = (requests || []).map(r => ({
    ...r,
    requested_date: r.requested_date || r.created_at,
  }));

  return (
    <Box>
      <PageWrapperWithHeading
        title="Roster Requests"
        subtitle="Employee shift swap and change requests"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/shifts")} sx={{ borderRadius: 2 }}>Back to Shifts</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        {["pending", "approved", "rejected"].map(status => {
          const count = (requests || []).filter(r => r.status === status).length;
          const colors = statusColors[status];
          return (
            <Paper key={status} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb", minWidth: 120, textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.color }}>{count}</Typography>
              <Typography sx={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{status}</Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <DynamicTable
          columns={columns}
          data={transformedData}
          loading={loading}
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(e, p) => setPage(p - 1)}
          perPage={perPage}
        />
      </Paper>

      {/* Reject Modal */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Reject Request" maxWidth="xs">
        <Formik initialValues={{ reason: "" }} onSubmit={handleRejectSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ mb: 2, fontSize: 14, color: "#64748b" }}>
                  Please provide a reason for rejecting the shift request from <strong>{selectedRequest?.employee?.candidates?.first_name || "Employee"}</strong>.
                </Typography>
                <FormikInputField name="reason" label="Rejection Reason" multiline rows={3} required />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button variant="outlined" onClick={() => setDetailModalOpen(false)}>Cancel</Button>
                <SubmitButton loading={isSubmitting} color="error">Reject Request</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    </Box>
  );
};

export default RosterRequestsPage;
