import React, { useState } from "react";
// import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import SearchInput from "../../../../../components/common/searchField";
import DynamicTable from "../../../../../components/tables/AnnouncementsTable";
import { useEmployeeRecord } from "../../../../../context/EmployeeRecordContext";
import { useGetScheduledInterview } from "../../../../../utils/hooks/api/employeeRecords";
import { getSchduledInterviewFieldName } from "../../../../../utils/helper";
import ViewInterviewNoteModal from "../../../recruitment/viewInterviewModal";

const ScheduledInterviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [filter, setFilter] = useState("upcoming");
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState("");

  const { record } = useEmployeeRecord();

  const { data, loading, error, totalPages, count } = useGetScheduledInterview(
    record?.id,
    filter,
    currentPage - 1,
    searchTerm,
    perPage
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      type: "custom",
      render: (row) => (
        <span>{`${row?.first_name || row?.candidates?.first_name || ""} ${
          row?.family_name || row?.candidate?.family_name || ""
        }`}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      type: "custom",
      render: (row) => row?.email || row?.candidate?.email,
    },
    {
      key: "mobile",
      label: "Phone",
      type: "custom",
      render: (row) => row?.mobile || row?.candidate?.mobile,
    },
    {
      key: "date",
      label: "Date",
      type: "custom",
      render: (row) => {
        const { dateFieldName } = getSchduledInterviewFieldName(
          row,
          record?.id
        );
        return (
          <span className="w-full text-center">
            {row?.[dateFieldName] || "-"}
          </span>
        );
      },
    },
    {
      key: "time",
      label: "Time",
      type: "custom",
      render: (row) => {
        const { timeFieldName } = getSchduledInterviewFieldName(
          row,
          record?.id
        );
        return (
          <span className="w-full text-center">
            {row?.[timeFieldName] || "-"}
          </span>
        );
      },
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   type: "custom",
    //   render: (row) => {
    //     const { dateFieldName } = getSchduledInterviewFieldName(
    //       row,
    //       record?.id
    //     );
    //     if (!row?.[dateFieldName]) {
    //       return <span className="text-gray-500">Not Scheduled</span>;
    //     }
    //     if (new Date(row?.[dateFieldName]) < new Date()) {
    //       return <span className="text-red-500">Past</span>;
    //     }
    //     if (new Date(row?.[dateFieldName]) >= new Date()) {
    //       return <span className="text-green-500">Upcoming</span>;
    //     }
    //   },
    // },
    {
      key: "note_one",
      label: "Notes one",
      type: "custom",
      render: (row) =>
        row?.note_one ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.note_one);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
    {
      key: "note_two",
      label: "Notes two",
      type: "custom",
      render: (row) =>
        row?.note_two ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.note_two);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
    {
      key: "note_three",
      label: "Notes three",
      type: "custom",
      render: (row) =>
        row?.note_three ? (
          <button
            className="text-blue-600 underline text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNoteData(row?.note_three);
              setViewNoteModalOpen(true);
            }}
          >
            View
          </button>
        ) : (
          "-"
        ),
    },
  ];

  const handleChangeQuery = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SearchInput
          value={searchTerm}
          onChange={handleChangeQuery}
          placeholder="Search"
        />

        {/* <Box display='flex' justifyContent='flex-end'>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            size='small'
          >
            <ToggleButton value='upcoming'>Upcoming</ToggleButton>
            <ToggleButton value='past'>Past</ToggleButton>
          </ToggleButtonGroup>
        </Box> */}
      </div>

      <DynamicTable
        columns={columns}
        data={data}
        footerInfo={`records out of ${count}`}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={setPerPage}
        loading={loading}
        error={error}
      />

      <ViewInterviewNoteModal
        open={viewNoteModalOpen}
        onClose={() => setViewNoteModalOpen(false)}
        noteData={selectedNoteData}
      ></ViewInterviewNoteModal>
    </div>
  );
};

export default ScheduledInterviews;
