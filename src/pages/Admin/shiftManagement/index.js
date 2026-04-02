'use client';

import React, { useState } from "react";
import { Box, Button, Typography, Grid, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NightlightIcon from "@mui/icons-material/Nightlight";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchField from "../../../../components/common/searchField";
import Modal from "../../../../components/common/Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";
import SubmitButton from "../../../../components/common/SubmitButton";
import CustomMenu from "../../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useShifts, useCreateShift, useUpdateShift, useDeleteShift } from "../../../../utils/hooks/api/useShifts";
import toast from "react-hot-toast/headless";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Shift Management" },
];

const validationSchema = Yup.object({
  shift_name: Yup.string().required("Shift name is required"),
  start_time: Yup.string().required("Start time is required"),
  end_time: Yup.string().required("End time is required"),
  break_duration_minutes: Yup.number().min(0).default(60),
  grace_period_minutes: Yup.number().min(0).default(15),
});

const ShiftManagementPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  const { shifts, totalPages, loading, refetch } = useShifts(page, perPage);
  const { create, loading: createLoading } = useCreateShift();
  const { update, loading: updateLoading } = useUpdateShift();
  const { deleteShift, loading: deleteLoading } = useDeleteShift();

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const [h, m] = timeStr.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const columns = [
    {
      key: "shift_name", label: "Shift Name",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.is_night_shift ? <NightlightIcon sx={{ fontSize: 18, color: "#6366f1" }} /> : <AccessTimeIcon sx={{ fontSize: 18, color: "#7c3aed" }} />}
          <Typography sx={{ fontWeight: 500 }}>{row.shift_name}</Typography>
        </Box>
      ),
    },
    { key: "start_time", label: "Start Time", render: row => formatTime(row.start_time) },
    { key: "end_time", label: "End Time", render: row => formatTime(row.end_time) },
    { key: "break_duration_minutes", label: "Break (min)" },
    { key: "grace_period_minutes", label: "Grace (min)" },
    {
      key: "is_night_shift", label: "Type", type: "chip",
      render: (row) => (
        <span style={{
          padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500,
          background: row.is_night_shift ? "#ede9fe" : "#f0fdf4",
          color: row.is_night_shift ? "#7c3aed" : "#16a34a",
        }}>
          {row.is_night_shift ? "Night" : "Day"}
        </span>
      ),
    },
    {
      type: "custom", label: "Actions", width: "10%",
      render: (row) => (
        <CustomMenu
          items={[
            { label: "Edit", icon: <EditIcon fontSize="small" />, action: () => { setSelectedShift(row); setModalOpen(true); } },
            { label: "Deactivate", icon: <DeleteIcon fontSize="small" />, danger: true, action: () => { setShiftToDelete(row); setDeleteConfirmOpen(true); } },
          ]}
        />
      ),
    },
  ];

  const handleAdd = () => { setSelectedShift(null); setModalOpen(true); };

  const handleEdit = (shift) => { setSelectedShift(shift); setModalOpen(true); };

  const handleSubmit = async (values, { resetForm }) => {
    let result;
    if (selectedShift) {
      result = await update(selectedShift.id, values);
    } else {
      result = await create(values);
    }
    if (result) {
      resetForm();
      setModalOpen(false);
      setSelectedShift(null);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete.id);
      setDeleteConfirmOpen(false);
      setShiftToDelete(null);
      refetch();
    }
  };

  const initialValues = selectedShift ? {
    shift_name: selectedShift.shift_name || "",
    start_time: selectedShift.start_time || "08:00",
    end_time: selectedShift.end_time || "17:00",
    break_duration_minutes: selectedShift.break_duration_minutes || 60,
    grace_period_minutes: selectedShift.grace_period_minutes || 15,
    is_night_shift: selectedShift.is_night_shift || false,
  } : {
    shift_name: "",
    start_time: "08:00",
    end_time: "17:00",
    break_duration_minutes: 60,
    grace_period_minutes: 15,
    is_night_shift: false,
  };

  return (
    <Box>
      <PageWrapperWithHeading
        title="Shift Management"
        subtitle="Configure work shifts and schedules"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/shifts/roster")} sx={{ borderRadius: 2 }}>View Roster</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>Add Shift</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Shifts List */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <DynamicTable
          columns={columns}
          data={shifts || []}
          loading={loading}
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(e, p) => setPage(p - 1)}
          perPage={perPage}
          onRowClick={(id) => { const s = shifts.find(sh => sh.id === id); if (s) handleEdit(s); }}
          rowCursor
        />
      </Paper>

      {/* Add/Edit Shift Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedShift(null); }} title={selectedShift ? "Edit Shift" : "Add New Shift"} maxWidth="sm">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <FormikInputField name="shift_name" label="Shift Name" required fullWidth placeholder="e.g., Morning Shift, Night Shift" />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormikInputField name="start_time" label="Start Time (HH:MM)" required fullWidth placeholder="08:00" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormikInputField name="end_time" label="End Time (HH:MM)" required fullWidth placeholder="17:00" />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormikInputField name="break_duration_minutes" label="Break Duration (min)" type="number" fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <FormikInputField name="grace_period_minutes" label="Grace Period (min)" type="number" fullWidth />
                  </Grid>
                </Grid>
                <FormikCheckbox name="is_night_shift" label="Night Shift" />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button variant="outlined" onClick={() => { setModalOpen(false); setSelectedShift(null); }}>Cancel</Button>
                <SubmitButton loading={isSubmitting || createLoading || updateLoading}>{selectedShift ? "Update Shift" : "Create Shift"}</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Deactivate Shift" maxWidth="xs">
        <Box sx={{ p: 2 }}>
          <Typography sx={{ mb: 3 }}>Are you sure you want to deactivate <strong>{shiftToDelete?.shift_name}</strong>? This will remove it from active rosters.</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete} loading={deleteLoading}>Deactivate</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ShiftManagementPage;
