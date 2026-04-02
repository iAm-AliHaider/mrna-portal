import React, { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";

import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import CustomMenu from "../../../../components/common/CustomMenu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUser } from "../../../../context/UserContext";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useNavigate } from "react-router-dom";
import SearchField from "../../../../components/common/searchField";
import NewJustificationRequestForm from "./form";

import {
  useJustificationRequests,
  useCreateJustificationRequest,
  useUpdateJustificationRequest,
} from "../../../../utils/hooks/api/justification";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Employees" },
  { title: "My Justification" },
];

export default function MyJustificationPage() {

    const { user } = useUser();
    const employeeId = user?.id;
  
    const [page, setPage] = useState(0);
    const [selectedEditId, setSelectedEditId] = useState(null);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingData, setEditingData] = useState(null);
  const [editingId, setEditingId] = useState(null)

    const { createJustificationRequest } = useCreateJustificationRequest();
    const { updateJustificationRequest } = useUpdateJustificationRequest();

    const [openFormModal, setOpenFormModal] = useState(false)

  
  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Employees" },
    { title: "My Justifications" },
  ];



  
    // Keep search, drop other filters
    const {
      justificationData,
      totalPages,
      loading,
      refetch,
      error,
      count,
    } = useJustificationRequests(page, searchQuery, {}, perPage, "justification", employeeId);

    
  
  const justificationColumns = [
    {
      key: "employee_name",
      label: "Employee Name",
      type: "description",
      render: (row) => row?.employee?.candidate?.full_name,
    },
    { key: "justification_question", label: "Justification" },
    { key: "justification_reason", label: "Response", type: "description" },
    { key: "created_at", label: "Requested Date", type: "date" },
    { key: "status", label: "Manager Status", type: "chip" },
     {
      type: "custom",
      label: "Actions",
      render: (row) => (
        (
          <CustomMenu
            items={[
              {
                label: "Add Response",
                icon: <QuestionAnswerIcon fontSize="small" />,
                // action: () => console.log("View", row.survey_id),
                disabled: row.justification_reason,
                action: () => handleEdit(row),
              },
              // {
              //   label: "View Response",
              //   icon: <RemoveRedEyeIcon fontSize="small" />,
              //   action: () => handleResponseSurvey(row?.survey_id),
              //   disabled: row.submission_date == "-",
              // },
              // {
              //   label: "Edit response",
              //   icon: <EditIcon fontSize="small" />,
              //   action: () => console.log("Edit", row.survey_id),
              // }
            ]}
          />
        )
      ),
    },
  ];

    const onPageChange = (newPage) => {
    setPage(newPage - 1); // 1-based UI -> 0-based
  };

  const onPerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(0);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // reset page when searching
  };

  
  const handleOpenForm = () => {
    setEditingId(null);
    setOpenFormModal(true);
  }
  
  const handleCloseForm = () => {
    setOpenFormModal(false);
    setEditingId(null);
  }

    const handleEdit = (row) => {
      setEditingData(row);
    setEditingId(row.id);
    setOpenFormModal(true);
  }


  
  const handleSubmit = async (isEditing, values, { setSubmitting }) => {
  const { id, ...payload } = values; // ← id removed from payload

    try {
      if (isEditing) {
        await updateJustificationRequest(id, payload);
      } else {
        await createJustificationRequest(payload);
      }
      handleCloseForm();
      refetch();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };


  return (
       <React.Fragment>
    <PageWrapperWithHeading title="My Justification" items={breadcrumbItems}>
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
      {/* 🔎 Search (kept) */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by justification..."
            />
          </div>

         <DynamicTable
            columns={justificationColumns}
            data={justificationData}
            footerInfo={`Justification Requests out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
            loading={loading}
          />
      </div>
    </PageWrapperWithHeading>

       <NewJustificationRequestForm
        open={openFormModal}
        onClose={handleCloseForm}
        id={selectedEditId}
        handleSubmit={handleSubmit}
        loading={loading}
        editingData={editingData}
        isEditing={!!editingId}
                isManager={false}

      />
      </React.Fragment>
  );
}
