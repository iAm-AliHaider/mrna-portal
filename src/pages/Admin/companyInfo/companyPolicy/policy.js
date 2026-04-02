import React, { useState } from "react";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CustomMenu from "../../../../components/common/CustomMenu";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchInput from "../../../../components/common/searchField";
import { usePoliciesList } from "../../../../utils/hooks/api/policy";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabaseClient";
import Modal from "../../../../components/common/Modal";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Company Info" },
  { title: "Company Policy" },
];

const PolicyList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [candidateNumber, setCandidateNumber] = useState("");
  // const [refreshFlag, setRefreshFlag] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { policyData, totalPages, count, error, loading, refetch } = usePoliciesList(
    currentPage - 1,
    perPage,
    searchQuery,
  );

  const handleColumnAction = (row, column, value) => {
  };

  const onSelectChange = (ids) => setSelectedIds(ids);

  const handleAddVacancy = () => {
    navigate("/admin/company-info/policy/add");
  };

  const handleChangeFilter = (value) => {
    setCandidateNumber(value);
  };

  const handleApplyFilter = (newValues) => {
  };

  const resetFilters = () => {
    setCandidateNumber("");
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "effective_from", label: "Date to Fill By" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() +
            row.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    { key: "applicable_to", label: "Applicable", type: 'description', render: (row) => row?.applicable_to },
    { key: "description", label: "Description", type: 'description', render: (row) => row?.description },
    {
      key: "is_mandatory",
      label: "Mandatory",
      type: "checkbox",
    },
    {
      type: "custom",
      label: "Actions",
      render: (row) => (
        <CustomMenu
          items={[
            // {
            //   label: "View",
            //   icon: <VisibilityOutlinedIcon fontSize="small" />,
            //   action: () => console.log("View"),
            // },
            {
              label: "Edit",
              icon: <EditIcon fontSize="small" />,
              action: () =>
                navigate(`/admin/company-info/policy/edit/${row?.id}`),
            },
            {
              label: "Delete",
              icon: <DeleteIcon fontSize="small" />,
              action: () => confirmSingleDelete(row?.id),
              danger: true,
            },
          ]}
        />
      ),
    },
  ];

  const confirmSingleDelete = (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    setDeleteTarget("bulk");
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const idsToDelete = deleteTarget === "bulk" ? selectedIds : [deleteTarget];
    const { error } = await supabase
      .from("policy")
      .delete()
      .in("id", idsToDelete);

    if (error?.code === "23503") {
      toast.error('This policy is already in use and cannot be deleted.');
    } else if (error) {
      toast.error(`Unable to delete policie(s)`);
    } else {
      toast.success("Policies deleted successfully");
      setSelectedIds([]);
      setCurrentPage((prev) => prev); // re-fetch or re-render
      // setRefreshFlag((prev) => !prev);
      refetch()
    }
    setConfirmOpen(false);
  };

  return (
    <PageWrapperWithHeading
      title="Company Policy"
      items={breadcrumbItems}
      action={handleAddVacancy}
      buttonTitle="+ Add Policy"
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          <div className="flex gap-4">
            {/* <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter
                value={candidateNumber}
                label='Candidate Number'
                options={[]}
                handleChange={handleChangeFilter}
                placeholder='Select'
              />
            </FiltersWrapper> */}

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              size="medium"
              sx={{ textTransform: "none" }}
              disabled={selectedIds.length === 0}
              onClick={confirmBulkDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={policyData}
          showCheckbox={true}
          onSelectChange={onSelectChange}
          onAction={handleColumnAction}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          loading={loading}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${policyData.length} of ${count} policis`}
        />

        {error && (
          <div className="text-red-600 text-sm">
            Error loading vacancies: {error}
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{" "}
            {deleteTarget === "bulk" ? "selected policies" : "this policy"}?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapperWithHeading>
  );
};

export default PolicyList;
