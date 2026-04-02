import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useOffBoardingRequests,
  useDeleteOffBoardingRequest,
  useUpdateOffBoardingRequest,
  useCreateOffBoardingRequest,
  useFinalEmploymentCalls,
} from "../../../../utils/hooks/api/offBoardingRequests";
import OffBoardingRequestForm from "./form";
import { toast } from "react-hot-toast";
import { STATUS_FILTER_OPTIONS } from "../../../../utils/constants";
import AlertModal from "../../../../components/common/Modal/AlertModal";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Off-Boarding Request" },
];

const OffBoardingRequestsPage = () => {
  const { user } = useUser();
  const isManager = user?.role === "manager";
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOffBoardingRecord, setSelectedOffBoardingRecord] =
    useState(null);
  const [deleteSelect, setDeleteSelect] = useState(null);
  const [openFormModal, setOpenFormModal] = useState(false);

  const { offBoardingData, totalPages, loading, count, refetch } =
    useOffBoardingRequests({
      page,
      rowsPerPage: perPage,
      searchQuery,
      status,
    });

  const { canCreateAny, eligibleToCreate } = useFinalEmploymentCalls();

  const employment_type_ids =
    eligibleToCreate?.map((r) => r.employmentTypeId) || [];

  const { createOffBoardingRequest } = useCreateOffBoardingRequest();
  const { updateOffBoardingRequest } = useUpdateOffBoardingRequest();
  const { deleteOffBoardingRequest, loading: isLoadingDelete } =
    useDeleteOffBoardingRequest();

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset page when searching
  };

  // React.useEffect(() => {
  //   // console.log("🔥 AutoFill useEffect triggered with values:", {
  //   //   effected_date: values.effected_date,
  //   //   employee_id: values.employee_id,
  //   //   all_values: values
  //   // });
  //   console.log("Eligible to create changed:", eligibleToCreate);
  // }, [eligibleToCreate]);

  const columns = [
    {
      key: "Employee",
      label: "Employee",
      type: "custom",
      render: (row) =>
        `${row?.employee_info?.employee?.candidate?.first_name || ""} ${
          row?.employee_info?.employee?.candidate?.family_name || ""
        }`,
    },
    { key: "termination_date", label: "Termination Date" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", type: "chip" },
    {
      type: "custom",
      label: "Actions",
      width: "10%",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "Edit",
              icon: <EditIcon fontSize="small" />,
              action: () => handleEdit(row),
            },
            {
              label: "Delete",
              icon: <DeleteIcon fontSize="small" />,
              action: () => setDeleteSelect(row?.id),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  const handleEdit = (row) => {
    setSelectedOffBoardingRecord(row);
    setOpenFormModal(true);
  };

  const handleCreate = () => {
    setSelectedOffBoardingRecord(null);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => setOpenFormModal(false);
  const closeConfirmationModal = () => setDeleteSelect(null);

  const handleDelete = async () => {
    await deleteOffBoardingRequest(deleteSelect);
    refetch();
    closeConfirmationModal();
  };

const handleSubmit = async (values) => {
  try {
    // Destructure last_working_date and collect the rest of the values in 'payload'
    const { last_working_date, request_type, ...payload } = values;

    if (selectedOffBoardingRecord) {
      await updateOffBoardingRequest({
        ...selectedOffBoardingRecord,
        ...payload, // Use 'payload' which excludes last_working_date
      });
    } else await createOffBoardingRequest(payload); // Use 'payload' which excludes last_working_date

    handleCloseFormModal();
    refetch();
  } catch (error) {
    console.error("Submission failed:", error);
    toast.error(error.message || "Failed to submit off-boarding request");
  }
};

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Off-Boarding Request"
        items={breadcrumbItems}
        action={canCreateAny ? handleCreate : null}
        buttonTitle="Add Off-Boarding Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={handleSearch} />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField
                  options={STATUS_FILTER_OPTIONS}
                  onChange={setStatus}
                  value={status}
                  placeholder="Status"
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={offBoardingData}
            onAction={() => {}}
            footerInfo={`Showing ${offBoardingData?.length} Requests out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <OffBoardingRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        selected={selectedOffBoardingRecord}
        offBoardingData={offBoardingData}
        handleSubmit={handleSubmit}
        employment_type_ids={employment_type_ids}
      />
      <AlertModal
        type="confirm"
        open={!!deleteSelect}
        onClose={closeConfirmationModal}
        onConfirm={handleDelete}
        buttonTitle={"Delete"}
        description={
          "Are you sure you want to delete this off-boarding request?"
        }
        title={"Delete Off-Boarding Request"}
        loading={isLoadingDelete}
      />
    </React.Fragment>
  );
};

export default OffBoardingRequestsPage;
