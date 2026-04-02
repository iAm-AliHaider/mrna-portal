// OvertimeRequestsPage.js
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filter";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useOvertimeRequestsList } from "../../../../utils/hooks/api/overtimeRequests";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { useUser } from "../../../../context/UserContext";

const OvertimeRequestsPage = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    overtimeType: "",
    date: "",
    employeeName: "",
  });


  const navigate = useNavigate();

  // Use the overtime requests hook
  const { 
    overtimeRequestsData, 
    totalCount, 
    loading, 
    error, 
    refetch 
  } = useOvertimeRequestsList(currentPage - 1, perPage, searchQuery);

  const columns = [
    { key: "date", label: "Date", type: "date" },
    { key: "year", label: "Year" },
    { key: "hours", label: "Hours" },
    { key: "minutes", label: "Minutes" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status", type: "chip" },
    { key: "created_at", label: "Created At", type: "date" },
  ];

  // Transform the data to match the expected format
  const transformedData = overtimeRequestsData.map(item => ({
    id: item.id,
    date: `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`,
    year: item.year,
    hours: item.hours,
    minutes: item.minutes,
    amount: item.amount,
    status: item.status,
    created_at: item.created_at,
  }));

  const overtimeTypeOptions = [
    { value: "", label: "All Types" },
    { value: "Spark Overtime", label: "Spark Overtime" },
    { value: "Other", label: "Other" },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Transactions" },
    { title: "Overtime Requests" },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({ status: "", overtimeType: "", date: "", employeeName: "" });
  };

  const handleAddForm = () => {
    navigate("/transactions/overtime/overtimeForm");
  };

  return (
    <PageWrapperWithHeading
      title="Overtime Requests"
      items={breadcrumbItems}
      action={handleAddForm}
      buttonTitle="Add Overtime Request"
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField 
            value={searchQuery} 
            placeholder="Search by status..."
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }} 
          />
          {/* <div className="flex gap-4">
            <div className="filter-buttons">
              <FiltersWrapper
                onApplyFilters={() => handleApplyFilter(filters)}
                resetFilters={resetFilters}
              >
                <ListFilter
                  values={filters}
                  handleChange={(name, value) =>
                    handleChangeFilter(name, value)
                  }
                  overtimeTypeOptions={overtimeTypeOptions}
                />
              </FiltersWrapper>
              <Button variant="outlined" disabled={selectedIds.length === 0}>
                Delete
              </Button>
            </div>
          </div> */}
        </div>

        <DynamicTable
          columns={columns}
          data={transformedData}
          // showCheckbox={true}
          // onSelectChange={(ids) => setSelectedIds(ids)}
          footerInfo={`Showing ${transformedData.length} of ${totalCount} overtime requests`}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / perPage) || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default OvertimeRequestsPage;
