// ExpenseClaimRequestPage.js
import React, { useState } from "react";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import "./style.css";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import NewExpenseClaimForm from "./form";
import ListFilter from "./filter";
import { useExpenseRequests, useCreateExpenseRequest, useUpdateExpenseRequest, useDeleteExpenseRequest } from '../../../../utils/hooks/api/allowanceRequests';
import { useUser } from '../../../../context/UserContext';
import SelectField from "../../../../components/common/SelectField";
import { transactionEmailSender } from "../../../../utils/helper";

const ExpenseClaimRequestPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

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

  const handleEdit = (row) => {
    setSelectedEditId(row.id);
    setOpenFormModal(true);
  };
  const handleDelete = async (row) => {
    // await deleteExpenseRequest(row.id);
    // refetch();
  };
  const handleOpenForm = () => { setSelectedEditId(null); setOpenFormModal(true); };
  const handleCloseForm = () => { setOpenFormModal(false); refetch(); };

  const handleSubmit = async(values, { setSubmitting }) => {
      const payload = {
        ...values,
        request_by_id: employeeId,
        created_by: employeeId,
        updated_by: employeeId,
      };
      if (user?.role === 'employee') {
        payload.status = 'pending';
        payload.is_manager_approve = 'pending';
        payload.is_hr_approve = 'pending';
        payload.is_hr_manager_approve = 'pending';
      } else if (user?.role === 'manager') {
        payload.is_hr_approve = 'approved';
      }
       else if (user?.role === 'hod') {
        payload.is_hr_approve = 'approved';
      }else if(user?.role === 'hr'){
        payload.is_manager_approve = 'approved';
        payload.is_hr_approve = 'approved';
      }
    await createExpenseRequest(payload);
    await transactionEmailSender(user, payload, "Expense Claim Request", `Expense Claim Request`);
    handleCloseForm();
    refetch();
    setSubmitting(false);
  };

  const columns = [
    { key: "requested_date", label: "Expense Date" },
    { key: "amount", label: "Amount" },
    { key: "reason", label: "Reason", type: "description", render: row => row?.reason },
    { key: "status", label: "Status", type: "chip" },
    { 
      key: "is_repeatable", 
      label: "Repeatable",
      render: row => row?.is_repeatable ? "Yes" : "No"
    },
    // { key: "receipt", label: "Receipt", type: "button" },
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
    { title: "Expense Claim Request" },
  ];

  const { expenseData, totalPages, loading, refetch } = useExpenseRequests(page, searchQuery, filters, perPage);
  const { createExpenseRequest } = useCreateExpenseRequest();
  const { updateExpenseRequest } = useUpdateExpenseRequest();
  const { deleteExpenseRequest } = useDeleteExpenseRequest();

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Expense Claim Request"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Expense Claim Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField 
            placeholder="Search by reason..."
              value={searchQuery} 
              onChange={(value) => {
                setSearchQuery(value);
                setPage(0); // Reset to first page when search changes
              }} 
            />
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SelectField 
                  options={statusOptions} 
                  placeholder="Status" 
                  value={filters.status}
                  onChange={(value) => handleStatusChange(value)}
                />
              </div>
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
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={expenseData}
            footerInfo={`Expense Claims out of ${expenseData?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <NewExpenseClaimForm 
        open={openFormModal} 
        onClose={handleCloseForm} 
        id={selectedEditId}
        expenseData={expenseData}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );
};

export default ExpenseClaimRequestPage;
