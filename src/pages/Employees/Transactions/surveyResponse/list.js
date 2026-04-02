// SurveyResponsesPage.js
import React, { useState } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import SelectField from "../../../../components/common/SelectField";
import ListFilter from "./filter";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const SurveyResponsesPage = () => {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    employeeName: "",
    dateType: "transaction_date",
    fromDate: "",
    toDate: "",
    status: "",
  });

  const navigate = useNavigate();

  const columns = [
    { key: "status", label: "Status", type: "status" },
    { key: "employeeNumber", label: "Employee Number" },
    { key: "employeeName", label: "Employee Name" },
    { key: "surveyName", label: "Survey Name" },
    { key: "dateOfCreation", label: "Date of Creation" },
    { key: "submission", label: "Submission" },
  ];

  const data = [
    {
      id: 1,
      status: "Submitted",
      employeeNumber: "409",
      employeeName: "Akram Abdus Samad",
      surveyName: "AML Course Evaluation",
      dateOfCreation: "Yasmine Mahfouz Omar Qabbani",
      submission: "Yasmine Mahfouz Omar Qabbani",
    },
    {
      id: 2,
      status: "Submitted",
      employeeNumber: "409",
      employeeName: "Akram Abdus Samad",
      surveyName: "Bupa Health Insurance",
      dateOfCreation: "Yasmine Mahfouz Omar Qabbani",
      submission: "Yasmine Mahfouz Omar Qabbani",
    },
    {
      id: 3,
      status: "Submitted",
      employeeNumber: "409",
      employeeName: "Akram Abdus Samad",
      surveyName: "AML Course Evaluation 2-1",
      dateOfCreation: "Yasmine Mahfouz Omar Qabbani",
      submission: "Yasmine Mahfouz Omar Qabbani",
    },
  ];

  const employeeOptions = Array.from(
    new Set(data.map((row) => row.employeeName))
  ).map((name) => ({ value: name, label: name }));

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Survey Responses" },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({
      employeeName: "",
      dateType: "transaction_date",
      fromDate: "",
      toDate: "",
      status: "",
    });
  };

  const handleAddForm = () => {
    navigate("/transactions/surveys/survayResponseForm");
  };

  return (
    <PageWrapperWithHeading
      title="Survey Responses"
      items={breadcrumbItems}
      buttonTitle="Add Survey Response"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} />
          <div className="filter-buttons">
            <FiltersWrapper
              onApplyFilters={() => handleApplyFilter(filters)}
              resetFilters={resetFilters}
            >
              <ListFilter
                values={filters}
                handleChange={(name, value) => handleChangeFilter(name, value)}
                employeeOptions={employeeOptions}
              />
            </FiltersWrapper>
            <Button variant="outlined" disabled={selected.length === 0}>
              Delete
            </Button>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={data}
          showCheckbox={true}
          onSelectChange={setSelected}
          footerInfo="Responses out of 18"
          currentPage={2}
          totalPages={17}
          perPage={7}
          onPageChange={() => {}}
          onPerPageChange={() => {}}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default SurveyResponsesPage;
