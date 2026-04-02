import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FormikInputField from "../../../../components/common/FormikInputField";
import CustomMenu from "../../../../components/common/CustomMenu";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import { useAssetTracking, useUpdateAssetLocation } from "../../../../utils/hooks/api/useAssetTracking";
import { useAssetCategories } from "../../../../utils/hooks/api/assetCategories";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management" },
  { title: "Tracking" },
];

const AssetTrackingPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", category: "", location: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data, totalPages, loading, refetch } = useAssetTracking(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { data: categories = [] } = useAssetCategories();
  const { update } = useUpdateAssetLocation();

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "Unassigned";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
  };

  const handleEditLocation = (asset) => {
    setSelectedAsset(asset);
    setEditModalOpen(true);
  };

  const handleSubmitLocation = async (values, { setSubmitting }) => {
    try {
      await update(selectedAsset.id, {
        location: values.location,
        status: values.status,
      });
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", label: "Asset Name" },
    { key: "serial_number", label: "Serial Number" },
    { key: "category", label: "Category", render: (row) => row.category?.name || "-" },
    { key: "status", label: "Status", type: "chip" },
    { key: "location", label: "Location" },
    { key: "assigned_to", label: "Assigned To", render: (row) => formatEmployeeName(row.assigned_to) },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "Update Location",
              action: () => handleEditLocation(row),
            },
          ]}
        />
      ),
    },
  ];

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Available", value: "available" },
    { label: "Assigned", value: "assigned" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Retired", value: "retired" },
    { label: "Lost", value: "lost" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...(categories || []).map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Asset Tracking"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by asset name or serial number..."
            />
            <div className="flex gap-4">
              <div className="w-[180px]">
                <SelectField
                  options={categoryOptions}
                  placeholder="Category"
                  value={filters.category}
                  onChange={(v) => { setFilters((p) => ({ ...p, category: v })); setPage(0); }}
                />
              </div>
              <div className="w-[150px]">
                <SelectField
                  options={statusOptions}
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
            footerInfo={`Tracked Assets: ${data.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      {/* Edit Location Modal */}
      <Modal
        onClose={() => setEditModalOpen(false)}
        title="Update Asset Location"
        open={editModalOpen}
      >
        {selectedAsset && (
          <Formik
            initialValues={{
              location: selectedAsset.location || "",
              status: selectedAsset.status || "available",
            }}
            validateOnChange={false}
            onSubmit={handleSubmitLocation}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <FormikInputField
                  name="name"
                  label="Asset Name"
                  type="text"
                  value={selectedAsset.name || ""}
                  disabled={true}
                />
                <FormikInputField
                  name="serial_number"
                  label="Serial Number"
                  type="text"
                  value={selectedAsset.serial_number || ""}
                  disabled={true}
                />
                <FormikInputField
                  name="location"
                  label="New Location"
                  type="text"
                  required
                />
                <SelectField
                  name="status"
                  label="Status"
                  options={statusOptions.filter((s) => s.value !== "")}
                  value={selectedAsset.status || "available"}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <SubmitButton
                    variant="outlined"
                    title="Cancel"
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                  />
                  <SubmitButton
                    title="Update"
                    type="submit"
                    isLoading={isSubmitting}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Modal>
    </React.Fragment>
  );
};

export default AssetTrackingPage;
