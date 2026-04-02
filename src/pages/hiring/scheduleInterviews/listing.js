// ScheduledInterviewsPage.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  InputBase,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import DynamicTable from "../../../components/tables/AnnouncementsTable";
import SearchField from "../../../components/common/searchField";
import SelectField from "../../../components/common/SelectField";
import FiltersWrapper from "../../../components/common/FiltersWrapper";
import ListFilter from "./filter";

const ScheduledInterviewsPage = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });
  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
  };

  const resetFilters = () => {
    setFilters({
      is_start_half_day: false,
      is_end_half_day: false,
      status: "",
      type: "",
      leave_from: "",
      leave_to: "",
    });
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Note: This page doesn't seem to have pagination, but adding for consistency
  };

  const columns = [
    { key: "Candidate Number", label: "Candidate Number" },
    { key: "Candidate Name", label: "Candidate Name" },
    { key: "Interviewer Name", label: "Interviewer Name" },
    { key: "Second Interviewer Name", label: "Second Interviewer Name" },
    { key: "Status", label: "Status" },
    { key: "Evaluation Grade", label: "Evaluation Grade" },
    { key: "Interview Time", label: "Interview Time" },
    { key: "Modified Date", label: "Modified Date" },
    { key: "Note", label: "Note" },
  ];

  const data = [
    {
      id: 1,
      "Candidate Number": "ISS000042",
      "Candidate Name": "Hussam Eid",
      "Interviewer Name": "Rania Fathi Hussein Eid",
      "Second Interviewer Name": "-",
      Status: "Selected",
      "Evaluation Grade": "0 / 0",
      "Interview Time": "16:00",
      "Modified Date": "27/03/2019",
      Note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 2,
      "Candidate Number": "ISS000042",
      "Candidate Name": "Hussam Eid",
      "Interviewer Name": "Rania Fathi Hussein Eid",
      "Second Interviewer Name": "-",
      Status: "Selected",
      "Evaluation Grade": "0 / 0",
      "Interview Time": "16:00",
      "Modified Date": "27/03/2019",
      Note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 3,
      "Candidate Number": "ISS000042",
      "Candidate Name": "Hussam Eid",
      "Interviewer Name": "Rania Fathi Hussein Eid",
      "Second Interviewer Name": "-",
      Status: "Selected",
      "Evaluation Grade": "0 / 0",
      "Interview Time": "16:00",
      "Modified Date": "27/03/2019",
      Note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ];
  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Hiring" },
    { title: "Scheduled Interviews" },
  ];

  const handleAction = (row, action) => {
  };

  const onClickAdd = () => {
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Scheduled Interviews"
        items={breadcrumbItems}
        action={onClickAdd}
        buttonTitle="Scheduled Interviews"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={handleSearch} />
            <div className="flex gap-4">
              <div className="filter-buttons">
                <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                >
                  <ListFilter
                    values={filters}
                    label="Type"
                    options={[]}
                    handleChange={handleChangeFilter}
                    placeholder="Select Type"
                  />
                </FiltersWrapper>
                <Button variant="outlined" disabled>
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            showCheckbox={true}
            onSelectChange={(ids) => setSelectedIds(ids)}
            onAction={() => {}}
            footerInfo="Leave Requests out of 7"
            currentPage={1}
            totalPages={1}
            perPage={10}
            onPageChange={() => {}}
            onPerPageChange={() => {}}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default ScheduledInterviewsPage;
