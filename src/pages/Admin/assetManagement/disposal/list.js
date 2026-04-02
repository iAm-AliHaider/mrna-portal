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
  useAssetDisposal,
  useCreateAssetDisposal,
  useUpdateAssetDisposal,
} from "../../../../utils/hooks/api/useAssetDisposal";
import { useAssetsForMaintenance } from "../../../../utils/hooks/api/useAssetMaintenance";
import { useUser } from "../../../../context/UserContext";
import { supabase } from "../../../../supabaseClient";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Asset Management" },
  { title: "Disposal" },
];

const AssetDisposalPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useAssetDisposal(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreateAssetDisposal();
  const { update } = useUpdateAssetDisposal();
  const { data: assets = [] } = useAssetsForMaintenance();

  const assetOptions = (assets || []).map((a) => ({
    label: `${a.name} (${a.serial_number || "N/A"})`,
    value: a.id,
  }));

  const disposalMethodOptions = [
    { label: "Sold", value: "sold" },
    { label: "Recycled", value: "recycled" },
    { label: "Donated", value: "donated" },
    { label: "Scrapped", value: "scrapped" },
    { label: "Returned to Supplier", value: "returned" },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Completed", value: "completed" },
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

  const handleApprove = async (row) => {
    try {
      await update(row.id, { status: "approved" });
      // Update asset status to disposed
      await supabase.from("assets").update({ status: "disposed" }).eq("id", row.asset_id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (row) => {
    try {
      await update(row.id, { status: "rejected" });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: "asset", label: "Asset", render: (row) => row.asset?.name || "-" },
    { key: "serial_number", label: "Serial No.", render: (row) => row.asset?.serial_number || "-" },
    { key: "disposal_method", label: "Disposal Method" },
    { key: "disposal_date", label: "Disposal Date", type: "date" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "reason",
      label: "Reason",
      type: "description",
      render: (row) => row?.reason || "-",
    },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "View Details",
              action: () => handleEdit(row),
            },
            ...(row.status === "pending" ? [
              {
                label: "Approve",
                action: () => handleApprove(row),
              },
              {
                label: "Reject",
                action: () => handleReject(row),
                danger: true,
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

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Asset Disposal"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="New Disposal"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by asset or reason..."
            />
            <div className="w-[150px]">
              <SelectField
                options={filterStatusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Disposal Records: ${data.length}`}
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
        title={selectedId ? "Edit Disposal" : "Asset Disposal Request"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            asset_id: selectedId ? (data.find((r) => r.id === selectedId)?.asset_id || "") : "",
            disposal_method: selectedId ? (data.find((r) => r.id === selectedId)?.disposal_method || "") : "",
            disposal_date: selectedId ? (data.find((r) => r.id === selectedId)?.disposal_date || "") : "",
            reason: selectedId ? (data.find((r) => r.id === selectedId)?.reason || "") : "",
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
                name="disposal_method"
                label="Disposal Method"
                options={disposalMethodOptions}
                placeholder="Select Method"
                required
              />
              <FormikInputField
                name="disposal_date"
                label="Disposal Date"
                type="date"
                required
              />
              <FormikInputField
                name="reason"
                label="Reason for Disposal"
                rows={3}
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  onClick={handleCloseModal}
                />
                <SubmitButton
                  title={selectedId ? "Update" : "Submit"}
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

export default AssetDisposalPage;
