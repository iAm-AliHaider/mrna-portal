// TicketRequestsPage.js
import React, { useState, useEffect } from "react";
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
import { useTicketRequests } from "../../../../utils/hooks/api/ticketRequests";
import { format } from "date-fns";
import { useUser } from "../../../../context/UserContext";

const TicketRequestsPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const employeeEmail = user?.email;
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    employee_no: "",
    from_date: "",
    to_date: "",
    country: "",
    city: "",
    status: "",
  });
  const [userEmails, setUserEmails] = useState({});

  const { ticketData, totalPages, loading, count, refetch } = useTicketRequests(
    page,
    searchQuery,
    filters,
    perPage
  );

  const handleAddForm = () => {
    navigate("/transactions/ticket/ticketRequestForm");
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({
      employee_no: "",
      from_date: "",
      to_date: "",
      country: "",
      city: "",
      status: "",
    });
  };

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const columns = [
    { key: "status", label: "Status", type: "chip" },
    { key: "ref_number", label: "Code" },
    // { key: "employee_name", label: "Employee Name" },
    // { key: "Job_title", label: "Job Title" },
    // { key: "branch", label: "Branch" },
    {
      key: "created_at",
      label: "Date",
      type: "custom",
      render: (row) =>
        row.created_at ? format(new Date(row.created_at), "dd-MM-yyyy") : "-",
    },
    {
      key: "adult_number_of_tickets",
      label: "No. ofTickets",
      type: "custom",
      render: (row) =>
        row.adult_number_of_tickets + row.child_number_of_tickets,
    },
    {
      key: "adult_number_of_tickets",
      label: "Total Cost",
      type: "custom",
      render: (row) => row.total_cost,
    },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    {
      key: "created_by",
      label: "Created By",
      type: "custom",
      render: () => employeeEmail || "-",
    },
    {
      key: "updated_by",
      label: "Last Modified By",
      type: "custom",
      render: () => employeeEmail || "-",
    },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Ticket Requests" },
  ];

  return (
    <PageWrapperWithHeading
      title="Ticket Requests"
      items={breadcrumbItems}
      buttonTitle="Add Ticket Request"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search country or city..."
          />
          <div className="flex gap-4">
            <div className="w-[300px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
            {/* <div className="filter-buttons">
              <FiltersWrapper
                onApplyFilters={() => handleApplyFilter(filters)}
                resetFilters={resetFilters}
              >
                <ListFilter
                  values={filters}
                  handleChange={(name, value) => handleChangeFilter(name, value)}
                  employeeOptions={[]}
                />
              </FiltersWrapper>
            </div> */}
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={ticketData}
          footerInfo={`Requests out of ${count}`}
          currentPage={page}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default TicketRequestsPage;
