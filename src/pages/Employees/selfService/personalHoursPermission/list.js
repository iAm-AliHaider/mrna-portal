import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import PersonalHoursPermissionForm from "./form";
import {
  usePersonalHoursPermission,
  useCreatePersonalHoursPermission,
  useUpdatePersonalHoursPermission,
} from "../../../../utils/hooks/api/usePersonalHoursPermission";
import { useUser } from "../../../../context/UserContext";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Personal Hours Permission" },
];

const PersonalHoursPermissionPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", permission_date: "" });

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = usePersonalHoursPermission(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreatePersonalHoursPermission();
  const { update } = useUpdatePersonalHoursPermission();
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  const { workflow_employees } = useGenericFlowEmployees();

  const handleCreate = () => {
    setSelectedId(null);
    setViewOnlyMode(false);
    setOpenFormModal(true);
  };

  const handleViewDetails = (row) => {
    setSelectedId(row);
    setViewOnlyMode(true);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => setOpenFormModal(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      employee_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      status_workflow: workflow_employees,
    };

    try {
      if (selectedId) {
        await update(selectedId, payload);
      } else {
        await create(payload);
        await transactionEmailSender(user, payload, "Personal Hours Permission", "Personal Hours Permission Request");
      }
      handleCloseFormModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "permission_date", label: "Permission Date", type: "date" },
    { key: "permission_time_from", label: "Time From" },
    { key: "permission_time_to", label: "Time To" },
    { key: "created_at", label: "Request Date", type: "date" },
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
              action: () => handleViewDetails(row.id),
            },
          ]}
        />
      ),
    },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Personal Hours Permission"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Request Permission"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search by reason..."
            />
            <div className="flex gap-4">
              <div className="w-[200px]">
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
            footerInfo={`Personal Hours Permissions: ${data.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
            onRowClick={handleViewDetails}
          />
        </div>
      </PageWrapperWithHeading>

      <PersonalHoursPermissionForm
        onClose={handleCloseFormModal}
        open={openFormModal}
        id={selectedId}
        formData={data}
        handleSubmit={handleSubmit}
        isViewOnly={viewOnlyMode}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default PersonalHoursPermissionPage;
