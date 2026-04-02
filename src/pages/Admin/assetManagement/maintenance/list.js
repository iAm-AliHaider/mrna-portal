import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import {
  useAssetMaintenance,
  useCreateAssetMaintenance,
  useUpdateAssetMaintenance,
} from "../../../../utils/hooks/api/useAssetMaintenance";
import { useAssetsForMaintenance } from "../../../../utils/hooks/api/useAssetMaintenance";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management" },
  { title: "Maintenance" },
];

const AssetMaintenancePage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", maintenance_type: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useAssetMaintenance(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreateAssetMaintenance();
  const { update } = useUpdateAssetMaintenance();
  const { data: assets = [] } = useAssetsForMaintenance();

  const assetOptions = (assets || []).map((a) => ({
    label: `${a.name} (${a.serial_number || "N/A"})`,
    value: a.id,
  }));

  const maintenanceTypeOptions = [
    { label: "Preventive", value: "preventive" },
    { label: "Corrective", value: "corrective" },
    { label: "Inspection", value: "inspection" },
    { label: "Calibration", value: "calibration" },
  ];

  const statusOptions = [
    { label: "Scheduled", value: "scheduled" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const handleCreate = () => {
    setSelectedId(null);
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      created_by: employeeId,
      updated_by: employeeId,
    };

    try {
      if (selectedId) {
        await update(selectedId, payload);
      } else {
        await create(payload);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (row) => {
    try {
      await update(row.id, {
        status: "completed",
        completed_date: new Date().toISOString().split("T")[0],
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: "asset", label: "Asset", render: (row) => row.asset?.name || "-" },
    { key: "serial_number", label: "Serial No.", render: (row) => row.asset?.serial_number || "-" },
    { key: "maintenance_type", label: "Type" },
    { key: "scheduled_date", label: "Scheduled Date", type: "date" },
    { key: "completed_date", label: "Completed Date", type: "date" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "description",
      label: "Description",
      type: "description",
      render: (row) => row?.description || "-",
    },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "Edit",
              action: () => handleEdit(row),
            },
            ...(row.status === "scheduled" || row.status === "in_progress" ? [
              {
                label: "Mark Complete",
                action: () => handleComplete(row),
              },
            ] : []),
          ]}
        />
      ),
    },
  ];

  const filterStatusOptions = [
    { label: "All", value: "" },
    ...statusOptions,
  ];

  const filterTypeOptions = [
    { label: "All Types", value: "" },
    ...maintenanceTypeOptions,
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Asset Maintenance"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Schedule Maintenance"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by asset or description..."
            />
            <div className="flex gap-4">
              <div className="w-[150px]">
                <SelectField
                  options={filterTypeOptions}
                  placeholder="Type"
                  value={filters.maintenance_type}
                  onChange={(v) => { setFilters((p) => ({ ...p, maintenance_type: v })); setPage(0); }}
                />
              </div>
              <div className="w-[150px]">
                <SelectField
                  options={filterStatusOptions}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }}
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Maintenance Records: ${data.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <Modal
        onClose={handleCloseModal}
        title={selectedId ? "Edit Maintenance" : "Schedule Maintenance"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            asset_id: selectedId ? (data.find((r) => r.id === selectedId)?.asset_id || "") : "",
            maintenance_type: selectedId ? (data.find((r) => r.id === selectedId)?.maintenance_type || "") : "",
            scheduled_date: selectedId ? (data.find((r) => r.id === selectedId)?.scheduled_date || "") : "",
            description: selectedId ? (data.find((r) => r.id === selectedId)?.description || "") : "",
            status: selectedId ? (data.find((r) => r.id === selectedId)?.status || "scheduled") : "scheduled",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikSelectField
                name="asset_id"
                label="Select Asset"
                options={assetOptions}
                placeholder="Select Asset"
                required
              />
              <FormikSelectField
                name="maintenance_type"
                label="Maintenance Type"
                options={maintenanceTypeOptions}
                placeholder="Select Type"
                required
              />
              <FormikInputField
                name="scheduled_date"
                label="Scheduled Date"
                type="date"
                required
              />
              <FormikInputField
                name="description"
                label="Description"
                rows={3}
              />
              <FormikSelectField
                name="status"
                label="Status"
                options={statusOptions}
              />
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  onClick={handleCloseModal}
                />
                <SubmitButton
                  title={selectedId ? "Update" : "Schedule"}
                  type="submit"
                  isLoading={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </React.Fragment>
  );
};

export default AssetMaintenancePage;
