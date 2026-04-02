// AdvanceSalaryPage.js
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  InputBase,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import NewAdvanceSalaryForm from "./form";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import SelectField from "../../../../components/common/SelectField";
import { useAdvanceSalaryRequests, useCreateAdvanceSalaryRequest, useUpdateAdvanceSalaryRequest, useDeleteAdvanceSalaryRequest } from '../../../../utils/hooks/api/advanceSalary';
import CustomMenu from '../../../../components/common/CustomMenu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../../../../context/UserContext';
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";

const AdvanceSalaryPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    requested_date: "",
    amount: ""
  });

  const {
    advanceSalaryData,
    totalPages,
    loading,
    refetch,
    error,
    count
  } = useAdvanceSalaryRequests(page, searchQuery, filters, perPage, 'advance_salary');
  const { createAdvanceSalaryRequest } = useCreateAdvanceSalaryRequest();
  const { updateAdvanceSalaryRequest } = useUpdateAdvanceSalaryRequest();
  const { deleteAdvanceSalaryRequest } = useDeleteAdvanceSalaryRequest();
  const handleOpenForm = () => { setSelectedEditId(null); setOpenFormModal(true); };
  const handleCloseForm = () => setOpenFormModal(false);
  const handleEdit = (row) => { setSelectedEditId(row.id); setOpenFormModal(true); };
  const handleDelete = async (row) => {
    // await deleteAdvanceSalaryRequest(row.id);
  };

  const onPageChange = (newPage) => {
    setPage(newPage - 1); // Convert from 1-based UI to 0-based API
  };
  const onPerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(0);
  };

  const columns = [
    { key: "amount", label: "Amount" },
    { key: "reason", label: "Reason", type: "description", render: row => row?.reason },
    { key: "requested_date", label: "Requested Date" },
    { key: "status", label: "Status", type: "chip" },
    // {
    //   type: 'custom',
    //   label: 'Actions',
    //   width: '10%',
    //   render: row => (
    //     <CustomMenu
    //       items={[
    //         {
    //           label: 'Edit',
    //           icon: <EditIcon fontSize='small' />,
    //           action: () => handleEdit(row),
    //         },
    //         {
    //           label: 'Delete',
    //           icon: <DeleteIcon fontSize='small' />,
    //           action: () => handleDelete(row),
    //           danger: true,
    //         },
    //       ]}
    //     />
    //   )
    // }
  ];
  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Self Service" },
    { title: "Advance Salary" },
  ];

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filter changes
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // Reset page when searching
  };

  const handleChangeFilter = (key, value) => {
      
    setFilters(prev => ({ ...prev, [key]: value }));
    // Don't apply filters automatically
  };

  const handleApplyFilter = (newValues) => {
   
    const updatedFilters = { ...filters, ...newValues };
    setFilters(updatedFilters);
    setPage(0);
    refetch(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: "",
      requested_date: "",
      amount: ""
    }
    setFilters(resetFilters);
    setPage(0);
    refetch(resetFilters);
  };

        const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

const handleSubmit = async(values, { setSubmitting }) => {
  const payload = {
    ...values,  
    type: 'advance_salary',
    employee_id: employeeId,
    created_by: employeeId,
    updated_by: employeeId,
    status_workflow: workflow_employees
  };

  
  
  try{
    if(selectedEditId){
      delete payload.created_by;
      await updateAdvanceSalaryRequest(selectedEditId, payload);
    } else {
      await createAdvanceSalaryRequest(payload);
      await transactionEmailSender(user, payload, "Advance Salary", `Advance Salary Request`);
    } 
    handleCloseForm();
    refetch();
  } catch (err) {
    console.error("Submission failed:", err);
  } finally {
    setSubmitting(false);
  }
}

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title=" Advance Salary"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Advance Salary"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField 
              value={searchQuery} 
              onChange={handleSearch}
              placeholder="Search by reason..."
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
              <div className="filter-buttons">
                <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                >
                  <ListFilter
                    values={filters}
                    handleChange={handleChangeFilter}
                  />
                </FiltersWrapper>
              </div>
            </div>
          </div>

          <DynamicTable
  columns={columns}
  data={advanceSalaryData}
  footerInfo={`Advance Salary Requests out of ${count}`}
  currentPage={page + 1}  // ✅ 1-based for the table
  totalPages={totalPages}
  perPage={perPage}
  onPageChange={onPageChange}
  onPerPageChange={setPerPage}
  loading={loading}
/>
        </div>
      </PageWrapperWithHeading>
      <NewAdvanceSalaryForm
        open={openFormModal}
        onClose={handleCloseForm}
        id={selectedEditId}
        advanceSalaryData={advanceSalaryData}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default AdvanceSalaryPage;
