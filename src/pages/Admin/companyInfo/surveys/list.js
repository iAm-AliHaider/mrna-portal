import React, { useState } from "react";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import CustomMenu from "../../../../components/common/CustomMenu";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import SearchInput from "../../../../components/common/searchField";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabaseClient";
import Modal from "../../../../components/common/Modal";
import { useSurveyList } from "../../../../utils/hooks/api/surveys";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import EditSurveys from "./editModal";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Company Info" },
  { title: "Survey" },
];

const SurveyList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [handler, setHandler] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    created_from: "",
    created_to: "",
  });

  const { surveyData, totalPages, count, error, loading, refetch } =
    useSurveyList(currentPage - 1, perPage, searchQuery, filters);

  const onSelectChange = (ids) => setSelectedIds(ids);
  const [openModal, setOpenModal] = useState(false);

  const handleAddSurvey = () => {
    navigate("/admin/company-info/surveys/add");
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    refetch({ ...filters, ...newValues });
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "",
      created_from: "",
      created_to: "",
    };
    setFilters(resetFilters);
    refetch(resetFilters);
  };

  // const confirmSingleDelete = id => {
  //   setDeleteTarget(id)
  //   setConfirmOpen(true)
  //   setCurrentData(null)
  //   setOpenModal(false)
  // }

  // const confirmBulkDelete = () => {
  //   setDeleteTarget('bulk')
  //   setConfirmOpen(true)
  //   setOpenModal(false)
  // }

  const handleConfirmDelete = async () => {
    const idsToDelete = deleteTarget === "bulk" ? selectedIds : [deleteTarget];
    const { error } = await supabase
      .from("policy")
      .delete()
      .in("id", idsToDelete);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Surveys deleted successfully");
      setSelectedIds([]);
      refetch();
    }
    setConfirmOpen(false);
  };

  const handleSurveyView = (surveyId) => {
    setOpenModal(false);
    navigate(`/admin/company-info/surveys/${surveyId}`);
  };

  const columns = [
    { key: "survey_name", label: "Title" },
    { key: "priority", label: "Priority" },
    { key: "survey_type", label: "Type" },
    {
      key: "status",
      label: "Status",
      type: "chip",
    },
    {
      key: "created_at",
      label: "Created At",
      type: "date",
    },
    {
      type: "custom",
      label: "Actions",
      width: "8%",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "View",
              icon: <VisibilityOutlinedIcon fontSize="small" />,
              action: () => handleSurveyView(row?.id),
            },
            // {
            //   label: 'Archive',
            //   icon: <DeleteIcon fontSize='small' />,
            //   // action: () => confirmSingleDelete(row?.id),

            //   danger: true
            // }
          ]}
        />
      ),
    },
  ];

  const [currentData, setCurrentData] = useState();

  const onRowClick = async (id) => {
    setOpenModal(true);
    try {
      const getSingleData = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();
      if (!getSingleData?.data?.id) {
        toast.error("can not found data");
        return;
      }
      setCurrentData(getSingleData?.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const handleUpdate = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const updatedSurvey = {
        ...values,
        status: values.status,
      };

      const { error: updateError } = await supabase
        .from("surveys")
        .update(updatedSurvey)
        .eq("id", currentData?.id);

      if (updateError) {
        throw new Error("Survey update failed: " + updateError.message);
      }
      toast.success("Survey updated successfully!");
      setSubmitting(false)
      setOpenModal(false);
      refetch();
    } catch (err) {
      toast.error("Survey update error:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <PageWrapperWithHeading
      title="Survey"
      items={breadcrumbItems}
      action={handleAddSurvey}
      buttonTitle="+ Add Survey"
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchInput value={searchQuery} onChange={handleSearch} placeholder="search by survey title..." />

          <div className="flex gap-2">
            {/* Filters */}
            <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter values={filters} handleChange={handleChangeFilter} />
            </FiltersWrapper>

            {/* <Button
              variant='outlined'
              startIcon={<DeleteIcon />}
              disabled={selectedIds.length === 0}
              onClick={confirmBulkDelete}
              sx={{ textTransform: 'none', fontSize: '14px' }}
            >
              Delete
            </Button> */}
          </div>
        </div>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={surveyData}
          // showCheckbox={true}
          onSelectChange={onSelectChange}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          loading={loading}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${surveyData.length} of ${count} Surveys`}
          onRowClick={onRowClick}
          rowCursor={true}
        />
        {openModal && currentData?.id ? (
          <EditSurveys
            currentData={currentData}
            setCurrentData={setCurrentData}
            handleUpdate={handleUpdate}
          />
        ) : null}

        {error && (
          <div className="text-red-600 text-sm">
            Error loading surveys: {error}
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Archieved"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{" "}
            {deleteTarget === "bulk" ? "selected surveys" : "this survey"}?
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
              Archieved
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapperWithHeading>
  );
};

export default SurveyList;
