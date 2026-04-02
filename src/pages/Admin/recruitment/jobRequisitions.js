'use client';

import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import Modal from "../../../../components/common/Modal";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikDateField from "../../../../components/common/FormikDateField";
import SubmitButton from "../../../../components/common/SubmitButton";
import CustomMenu from "../../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useJobRequisitions, useCreateJobRequisition, useUpdateJobRequisition, useDeleteJobRequisition } from "../../../../utils/hooks/api/useJobRequisitions";
import { useDepartments } from "../../../../utils/hooks/api/useDepartments";
import { useDesignations } from "../../../../utils/hooks/api/useDesignations";
import { useEmploymentTypes } from "../../../../utils/hooks/api/employmentType";
import toast from "react-hot-toast/headless";
import * as Yup from "yup";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Recruitment", href: "/admin/recruitment/dashboard" },
  { title: "Job Requisitions" },
];

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Closed", value: "closed" },
  { label: "Cancelled", value: "cancelled" },
];
const urgencyOptions = [
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
];

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  department_id: Yup.string().required("Department is required"),
  designation_id: Yup.string().required("Designation is required"),
  employment_type_id: Yup.string().required("Employment type is required"),
  headcount: Yup.number().positive().integer().required("Headcount is required"),
  status: Yup.string().required("Status is required"),
  urgency: Yup.string().required("Urgency is required"),
});

const initialValues = {
  title: "",
  department_id: "",
  designation_id: "",
  employment_type_id: "",
  urgency: "normal",
  justification: "",
  required_by_date: "",
  salary_range_min: "",
  salary_range_max: "",
  headcount: 1,
  status: "open",
};

const JobRequisitionsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", department_id: "", urgency: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const { requisitions, totalPages, loading, refetch } = useJobRequisitions(page, searchQuery, filters, perPage);
  const { create, loading: createLoading } = useCreateJobRequisition();
  const { update, loading: updateLoading } = useUpdateJobRequisition();
  const { deleteReq, loading: deleteLoading } = useDeleteJobRequisition();
  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();
  const { data: employmentTypes = [] } = useEmploymentTypes();

  const departmentOptions = departments.map(d => ({ label: d.name, value: d.id }));
  const designationOptions = designations.map(d => ({ label: d.title, value: d.id }));
  const employmentTypeOptions = employmentTypes.map(e => ({ label: e.name, value: e.id }));

  const statusColors = { open: "#dcfce7/#16a34a", fulfilled: "#dbeafe/#2563eb", closed: "#f1f5f9/#64748b", cancelled: "#fee2e2/#dc2626" };
  const urgencyColors = { normal: "#f1f5f9/#64748b", urgent: "#fee2e2/#dc2626" };

  const columns = [
    { key: "title", label: "Position Title", render: row => <Typography sx={{ fontWeight: 500 }}>{row.title}</Typography> },
    { key: "departmentName", label: "Department" },
    { key: "designationName", label: "Designation" },
    { key: "headcount", label: "Headcount", render: row => <Typography sx={{ fontWeight: 600 }}>{row.headcount}</Typography> },
    {
      key: "urgency", label: "Urgency", type: "chip",
      render: (row) => {
        const [bg, color] = (urgencyColors[row.urgency] || "#f1f5f9/#64748b").split("/");
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: bg, color, textTransform: "capitalize" }}>{row.urgency || "normal"}</span>;
      },
    },
    {
      key: "status", label: "Status", type: "chip",
      render: (row) => {
        const [bg, color] = (statusColors[row.status] || "#f1f5f9/#64748b").split("/");
        return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: bg, color, textTransform: "capitalize" }}>{row.status || "open"}</span>;
      },
    },
    { key: "required_by_date", label: "Required By", type: "date" },
    {
      type: "custom", label: "Actions", width: "10%",
      render: (row) => (
        <CustomMenu
          items={[
            { label: "Edit", icon: <EditIcon fontSize="small" />, action: () => { setSelectedReq(row); setModalOpen(true); } },
            { label: "Cancel", danger: true, action: () => { deleteReq(row.id); refetch(); } },
          ]}
        />
      ),
    },
  ];

  const handleAdd = () => { setSelectedReq(null); setModalOpen(true); };

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      department_id: parseInt(values.department_id) || null,
      designation_id: parseInt(values.designation_id) || null,
      employment_type_id: parseInt(values.employment_type_id) || null,
      salary_range_min: values.salary_range_min ? parseFloat(values.salary_range_min) : null,
      salary_range_max: values.salary_range_max ? parseFloat(values.salary_range_max) : null,
      headcount: parseInt(values.headcount) || 1,
    };
    let result;
    if (selectedReq) {
      result = await update(selectedReq.id, payload);
    } else {
      result = await create(payload);
    }
    if (result) {
      resetForm();
      setModalOpen(false);
      setSelectedReq(null);
      refetch();
    }
  };

  const editInitialValues = selectedReq ? {
    title: selectedReq.title || "",
    department_id: selectedReq.department_id || "",
    designation_id: selectedReq.designation_id || "",
    employment_type_id: selectedReq.employment_type_id || "",
    urgency: selectedReq.urgency || "normal",
    justification: selectedReq.justification || "",
    required_by_date: selectedReq.required_by_date || "",
    salary_range_min: selectedReq.salary_range_min || "",
    salary_range_max: selectedReq.salary_range_max || "",
    headcount: selectedReq.headcount || 1,
    status: selectedReq.status || "open",
  } : initialValues;

  return (
    <Box>
      <PageWrapperWithHeading
        title="Job Requisitions"
        subtitle="Create and manage hiring requests"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/admin/recruitment/dashboard")} sx={{ borderRadius: 2 }}>Dashboard</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>New Requisition</Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Search & Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <SearchField value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(0); }} placeholder="Search requisitions..." />
        <FiltersWrapper onApply={(vals) => { setFilters(prev => ({ ...prev, ...vals })); setPage(0); }}>
          <FormikSelectField name="status" label="Status" options={statusOptions} />
          <FormikSelectField name="department_id" label="Department" options={departmentOptions} />
          <FormikSelectField name="urgency" label="Urgency" options={urgencyOptions} />
        </FiltersWrapper>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <DynamicTable
          columns={columns}
          data={requisitions || []}
          loading={loading}
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(e, p) => setPage(p - 1)}
          perPage={perPage}
          onRowClick={(id) => { const r = requisitions.find(req => req.id === id); if (r) { setSelectedReq(r); setModalOpen(true); } }}
          rowCursor
        />
      </Paper>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedReq(null); }} title={selectedReq ? "Edit Job Requisition" : "New Job Requisition"} maxWidth="md">
        <Formik initialValues={editInitialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <FormikInputField name="title" label="Position Title" required fullWidth />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <FormikSelectField name="department_id" label="Department" options={departmentOptions} required />
                  <FormikSelectField name="designation_id" label="Designation" options={designationOptions} required />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <FormikSelectField name="employment_type_id" label="Employment Type" options={employmentTypeOptions} required />
                  <FormikInputField name="headcount" label="Headcount" type="number" required />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                  <FormikSelectField name="status" label="Status" options={statusOptions} required />
                  <FormikSelectField name="urgency" label="Urgency" options={urgencyOptions} required />
                  <FormikDateField name="required_by_date" label="Required By Date" />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <FormikInputField name="salary_range_min" label="Min Salary (SAR)" type="number" />
                  <FormikInputField name="salary_range_max" label="Max Salary (SAR)" type="number" />
                </Box>
                <FormikInputField name="justification" label="Justification" multiline rows={2} fullWidth />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button variant="outlined" onClick={() => { setModalOpen(false); setSelectedReq(null); }}>Cancel</Button>
                <SubmitButton loading={isSubmitting || createLoading || updateLoading}>{selectedReq ? "Update" : "Create"}</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    </Box>
  );
};

export default JobRequisitionsPage;
