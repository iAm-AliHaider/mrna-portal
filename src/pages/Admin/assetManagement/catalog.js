'use client';

import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import Modal from "../../../../components/common/Modal";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikDateField from "../../../../components/common/FormikDateField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useNavigate } from "react-router-dom";
import { useAssets, useCreateAsset } from "../../../../utils/hooks/api/useAssets";
import { useAssetCategories } from "../../../../utils/hooks/api/assetCategories";
import { useBranches } from "../../../../utils/hooks/api/useBranches";
import { useUser } from "../../../../context/UserContext";
import { useEffect } from "react";
import toast from "react-hot-toast/headless";
import * as Yup from "yup";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management", href: "/admin/assets" },
  { title: "Asset Catalog" },
];

const validationSchema = Yup.object({
  asset_code: Yup.string().required("Asset code is required"),
  asset_category_id: Yup.string().required("Category is required"),
  serial_number: Yup.string().required("Serial number is required"),
  asset_value: Yup.number().positive("Must be positive").required("Asset value is required"),
  from_date: Yup.date().required("Assignment date is required"),
  status: Yup.string().required("Status is required"),
  assignment_type: Yup.string().required("Assignment type is required"),
});

const initialValues = {
  asset_code: "",
  asset_note: "",
  asset_category_id: "",
  serial_number: "",
  asset_value: "",
  from_date: "",
  to_date: "",
  status: "available",
  assignment_type: "add_asset_to_employee",
  notes: "",
  employee_id: null,
};

const AssetCatalogPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", category_id: "", branch_id: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { user } = useUser();
  const { assetsData, totalPages, loading, refetch } = useAssets(page, searchQuery, filters, perPage);
  const { create } = useCreateAsset();
  const { data: categories = [] } = useAssetCategories();
  const { branches = [] } = useBranches();

  const statusOptions = [
    { label: "Available", value: "available" },
    { label: "Assigned", value: "assigned" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Disposed", value: "disposed" },
  ];

  const assignmentTypeOptions = [
    { label: "Assign to Employee", value: "add_asset_to_employee" },
    { label: "Remove from Employee", value: "remove_asset_from_employee" },
    { label: "Takeback", value: "takeback" },
  ];

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const branchOptions = (branches || []).map(b => ({ label: b.name, value: b.id }));

  const columns = [
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_note", label: "Asset Name" },
    { key: "categoryName", label: "Category" },
    {
      key: "status", label: "Status", type: "chip",
      render: (row) => {
        const statusMap = { available: "#dcfce7/#16a34a", assigned: "#dbeafe/#2563eb", maintenance: "#fef3c7/#d97706", disposed: "#fee2e2/#dc2626" };
        const [bg, color] = (statusMap[row.status] || "#f1f5f9/#64748b").split("/");
        return <span style={{ padding: "4px 10px", borderRadius: 12, background: bg, color, fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>{row.status || "N/A"}</span>;
      }
    },
    { key: "employeeName", label: "Assigned To" },
    { key: "asset_value", label: "Value", render: row => row.asset_value ? `SAR ${parseFloat(row.asset_value).toLocaleString()}` : "N/A" },
    { key: "created_at", label: "Date Added", type: "date" },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleAdd = () => {
    setSelectedAsset(null);
    setModalOpen(true);
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setModalOpen(true);
  };

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      asset_category_id: parseInt(values.asset_category_id),
      asset_value: parseFloat(values.asset_value),
      from_date: values.from_date,
      to_date: values.to_date || null,
      created_by: user?.id,
    };
    const result = await create(payload);
    if (result) {
      resetForm();
      setModalOpen(false);
      refetch();
    }
  };

  const transformedData = (assetsData || []).map(a => ({
    ...a,
    created_at: a.created_at ? new Date(a.created_at).toLocaleDateString() : "-",
  }));

  return (
    <Box>
      <PageWrapperWithHeading
        title="Asset Catalog"
        subtitle="View and manage all company assets"
        breadcrumbs={breadcrumbItems}
        loading={loading}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}>
            Add Asset
          </Button>
        </Box>
      </PageWrapperWithHeading>

      {/* Search & Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <SearchField value={searchQuery} onChange={handleSearch} placeholder="Search by asset code, serial number..." />
        <FiltersWrapper onApply={(vals) => { setFilters(prev => ({ ...prev, ...vals })); setPage(0); }}>
          <FormikSelectField name="status" label="Status" options={statusOptions} />
          <FormikSelectField name="category_id" label="Category" options={categoryOptions} />
          <FormikSelectField name="branch_id" label="Branch" options={branchOptions} />
        </FiltersWrapper>
      </Paper>

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
          onRowClick={(id) => {
            const asset = assetsData.find(a => a.id === id);
            if (asset) handleEdit(asset);
          }}
          rowCursor
        />
      </Paper>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedAsset ? "Edit Asset" : "Add New Asset"} maxWidth="md">
        <Formik initialValues={selectedAsset ? {
          asset_code: selectedAsset.asset_code || "",
          asset_note: selectedAsset.asset_note || "",
          asset_category_id: selectedAsset.asset_category_id || "",
          serial_number: selectedAsset.serial_number || "",
          asset_value: selectedAsset.asset_value || "",
          from_date: selectedAsset.from_date || "",
          to_date: selectedAsset.to_date || "",
          status: selectedAsset.status || "available",
          assignment_type: selectedAsset.assignment_type || "add_asset_to_employee",
          notes: selectedAsset.notes || "",
        } : initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, p: 2 }}>
                <FormikInputField name="asset_code" label="Asset Code" required />
                <FormikSelectField name="asset_category_id" label="Category" options={categoryOptions} required />
                <FormikInputField name="asset_note" label="Asset Name / Description" />
                <FormikInputField name="serial_number" label="Serial Number" required />
                <FormikInputField name="asset_value" label="Asset Value (SAR)" type="number" required />
                <FormikDateField name="from_date" label="Assignment Date" required />
                <FormikDateField name="to_date" label="Return Date" />
                <FormikSelectField name="status" label="Status" options={statusOptions} required />
                <FormikSelectField name="assignment_type" label="Assignment Type" options={assignmentTypeOptions} required sx={{ gridColumn: "1 / -1" }} />
                <FormikInputField name="notes" label="Notes" multiline rows={2} sx={{ gridColumn: "1 / -1" }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button variant="outlined" onClick={() => setModalOpen(false)}>Cancel</Button>
                <SubmitButton loading={isSubmitting}>{selectedAsset ? "Update Asset" : "Add Asset"}</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Modal>
    </Box>
  );
};

export default AssetCatalogPage;
