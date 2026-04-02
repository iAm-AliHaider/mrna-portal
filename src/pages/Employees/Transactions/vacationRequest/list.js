import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import SelectField from "../../../../components/common/SelectField";
import ListFilter from "./filter";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { useVacationRequests, useDeleteVacationRequest } from '../../../../utils/hooks/api/vacationRequests';

const VacationRequestsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    employeeNumber: "",
    dateType: "transaction_date",
    fromDate: "",
    toDate: "",
    status: "",
  });
  const {
    vacationData,
    totalPages,
    loading,
    count,
    refetch
  } = useVacationRequests(page, searchQuery, filters, perPage);
  const { deleteVacationRequest } = useDeleteVacationRequest();

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleAddForm = () => {
    navigate("/transactions/vacation/vacationForm");
  };

  // Edit handler
  const handleEdit = (row) => {
    navigate(`/transactions/vacation/vacationForm/${row.id}`);
  };

  // Delete handler
  const handleDelete = async (row) => {
    await deleteVacationRequest(row.id);
  };

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const resetFilters = () => {
    setFilters({
      employeeNumber: "",
      dateType: "transaction_date",
      fromDate: "",
      toDate: "",
      status: "",
    });
  };

  const columns = [
    { key: "status", label: "Status", type: "chip" },
    // { key: "employee_number", label: "Employee Number" },
    // { key: "employee_name", label: "Employee Name" },
    { key: "vacation_type", label: "Type" },
    { key: "start_date", label: "Start Date" },
    { key: "return_date", label: "Return Date" },
    { key: "actual_return_date", label: "Actual Return Date" },
    { key: "last_returned_date", label: "Last Returned Date" },
    { key: "paid_days", label: "No. of Days" },
    { key: "unpaid_days", label: "Unpaid Days" },
    { key: "task_list_status", label: "Task List Status", type: "chip" },
    { key: "description", label: "Description" },
    // {
    //   type: "custom",
    //   label: "Actions",
    //   width: "10%",
    //   render: row => (
    //     <CustomMenu
    //       items={[
    //         {
    //           label: "Edit",
    //           icon: <EditIcon fontSize="small" />,
    //           action: () =>  handleEdit(row),
    //         },
    //         {
    //           label: "Delete",
    //           icon: <DeleteIcon fontSize="small" />,
    //           action: () => handleDelete(row),
    //         },
    //       ]}
    //     />
    //   )      
    // }
  ];

  // const employeeOptions = Array.from(
  //   new Set(data.map((row) => row.employee_number))
  // ).map((num) => ({ value: num, label: num }));

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Vacation Requests" },
  ];

  return (
    <PageWrapperWithHeading
      title="Vacation Requests"
      items={breadcrumbItems}
      buttonTitle="Add Vacation Request"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} />
          <div className="flex gap-4">
            <div className="w-[300px]">
              <SelectField 
                options={statusOptions} 
                placeholder="Status" 
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
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
                />
              </FiltersWrapper>
            </div>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={vacationData}
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

export default VacationRequestsPage;
