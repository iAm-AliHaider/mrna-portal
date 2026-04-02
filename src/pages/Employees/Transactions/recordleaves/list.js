// RecordLeavesPage.js
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

const RecordLeavesPage = () => {
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
    { key: "code", label: "Code" },
    { key: "employeeName", label: "Employee Name" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
    { key: "startTime", label: "Start Time" },
    { key: "hours", label: "No. of Hours" },
    { key: "createdBy", label: "Created By" },
    { key: "lastModified", label: "Last Modified By" },
    { key: "description", label: "Description" },
  ];

  const data = [
    {
      id: 1,
      status: "Approved",
      code: "ISS6",
      employeeName: "Ammar Abdelhameed Abdelkareem Ghanim",
      type: "Sick Leave",
      date: "31/12/2017",
      startTime: "08:00",
      hours: "0:11",
      createdBy: "Yasmine Mahfouz Omar Qabbani",
      lastModified: "Yasmine Mahfouz Omar Qabbani",
      description: "Lorem Ipsum dolor sit",
    },
    // Add more rows here as needed
  ];

  const employeeOptions = Array.from(
    new Set(data.map((row) => row.employeeName))
  ).map((name) => ({ value: name, label: name }));

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Record Leaves" },
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
    navigate("/transactions/leaves/recordLeaveForm");
  };

  return (
    <PageWrapperWithHeading
      title="Record Leaves"
      items={breadcrumbItems}
      buttonTitle="Add Record Leave"
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
          footerInfo="Records out of 18"
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

export default RecordLeavesPage;
