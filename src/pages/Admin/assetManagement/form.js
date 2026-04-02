'use client';

import React, { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikDateField from "../../../../components/common/FormikDateField";
import SubmitButton from "../../../../components/common/SubmitButton";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import { useNavigate } from "react-router-dom";
import { useCreateAsset } from "../../../../utils/hooks/api/useAssets";
import { useAssetCategories } from "../../../../utils/hooks/api/assetCategories";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast/headless";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management", href: "/admin/assets" },
  { title: "Add Asset" },
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
};

const AssetFormPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { create, loading } = useCreateAsset();
  const { data: categories = [] } = useAssetCategories();

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
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

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      asset_category_id: parseInt(values.asset_category_id),
      asset_value: parseFloat(values.asset_value),
      created_by: user?.id,
    };
    const result = await create(payload);
    if (result) {
      toast.success("Asset added successfully!");
      navigate("/admin/assets/catalog");
    }
  };

  return (
    <Box>
      <PageWrapperWithHeading
        title="Add New Asset"
        subtitle="Register a new asset in the system"
        breadcrumbs={breadcrumbItems}
      />

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e5e7eb", maxWidth: 800 }}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <FormikInputField name="asset_code" label="Asset Code" required fullWidth />
                <FormikSelectField name="asset_category_id" label="Category" options={categoryOptions} required fullWidth />
                <FormikInputField name="asset_note" label="Asset Name / Description" fullWidth sx={{ gridColumn: "1 / -1" }} />
                <FormikInputField name="serial_number" label="Serial Number" required fullWidth />
                <FormikInputField name="asset_value" label="Asset Value (SAR)" type="number" required fullWidth />
                <FormikDateField name="from_date" label="Assignment Date" required fullWidth />
                <FormikDateField name="to_date" label="Return Date" fullWidth />
                <FormikSelectField name="status" label="Status" options={statusOptions} required fullWidth />
                <FormikSelectField name="assignment_type" label="Assignment Type" options={assignmentTypeOptions} required fullWidth sx={{ gridColumn: "1 / -1" }} />
                <FormikInputField name="notes" label="Notes" multiline rows={3} fullWidth sx={{ gridColumn: "1 / -1" }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <Button variant="outlined" onClick={() => navigate("/admin/assets/catalog")}>Cancel</Button>
                <SubmitButton loading={isSubmitting || loading}>Add Asset</SubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default AssetFormPage;
