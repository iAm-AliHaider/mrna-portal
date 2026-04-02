// PayStopagePage.js
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
import NewPayStopageForm from "./form";
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
import { usePayStopageRequests } from "../../../../utils/hooks/api/payStopage";
import { transactionEmailSender } from "../../../../utils/helper";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { useGetDepartmentHeads } from "../../../../utils/hooks/api/emplyees";


const PayStopagePage = () => {
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
  } = usePayStopageRequests(page, searchQuery, filters, perPage, 'pay_stopage');
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
    {
      key: "employee_name",
      label: "Employee Name",
      type: "description",
      render: row =>row?.employee?.candidate?.full_name
    },
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
    { title: "Pay Stopage" },
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
    const { heads, fetchDepartmentHeads } = useGetDepartmentHeads();


const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const org_id = values.organizational_unit_id;

    // Fetch Manager & HOD
    const { manager, hod } = await fetchDepartmentHeads(org_id);

    // Prepare base payload (exclude organizational_unit_id)
    const { organizational_unit_id, ...restValues } = values;

    const basePayload = {
      ...restValues,
      type: "pay_stopage",
      updated_by: employeeId,
      ...(selectedEditId ? {} : { created_by: employeeId }), // only include created_by for new entries
    };

    // Build workflow only for new entries
    let updatedWorkflow = [];
    if (!selectedEditId) {
      updatedWorkflow = (workflow_employees || []).map((emp) => {
        const updatedEmp = { ...emp, status: "pending" };

        if (emp.role === "manager" && manager) {
          updatedEmp.id = manager.id || null;
          updatedEmp.name = manager.first_name || "Manager";
        }

        if (emp.role === "hod" && hod) {
          updatedEmp.id = hod.id || null;
          updatedEmp.name = hod.first_name || "HOD";
        }

        return updatedEmp;
      });
    }

    // Handle Edit or Create
    if (selectedEditId) {
      await updateAdvanceSalaryRequest(selectedEditId, basePayload);
    } else {
      const newPayload = { ...basePayload, status_workflow: updatedWorkflow };

      await createAdvanceSalaryRequest(newPayload);
      await transactionEmailSender(
        user,
        newPayload,
        "Pay Stopage Request",
        "Pay Stopage Request"
      );
    }

    handleCloseForm();
    refetch();
  } catch (err) {
    console.error("Submission failed:", err);
  } finally {
    setSubmitting(false);
  }
};


// const handleSubmit = async(values, { setSubmitting }) => {

//   const org_id = values.organizational_unit_id
//     // Fetch both Manager & HOD
//     const { manager, hod } = await fetchDepartmentHeads(org_id);

//      // Remove organizational_unit_id from payload
//     const { organizational_unit_id, ...restValues } = values;

//       const payload = {
//     ...restValues,  
//     type: 'pay_stopage',
//     created_by: employeeId,
//     updated_by: employeeId,
//   };

//      // Update workflow
//     const updatedWorkflow = (workflow_employees || []).map((emp) => {
//       let updatedEmp = { ...emp, status: "pending" }; // set all to pending

//       // If manager found → update only that object
//       if (emp.role === "manager" && manager) {
//         updatedEmp.id = manager.id || null;
//         updatedEmp.name = manager.first_name || "Manager";
//             }

//       // If HOD found → update only that object
//       if (emp.role === "hod" && hod) {
//         updatedEmp.id = hod.id || null;
//         updatedEmp.name = hod.first_name || "HOD";

//       }

//       // If manager/hod is null → do NOT modify that role object at all
//       return updatedEmp;
//     });

  
//   try{
//     if(selectedEditId){
      
//       const payload = {
//     ...restValues,  
//     type: 'pay_stopage',
//     created_by: employeeId,
//     updated_by: employeeId,
//   };

//       delete payload.created_by;
//       await updateAdvanceSalaryRequest(selectedEditId, payload);
//     } else {

      
//       const payload = {
//     ...restValues,  
//     type: 'pay_stopage',
//     created_by: employeeId,
//     updated_by: employeeId,
//     status_workflow : updatedWorkflow
//   };


//       await createAdvanceSalaryRequest(payload);
//       await transactionEmailSender(user, payload, "Pay Stopage Request", `Pay Stopage Request`);
//     } 
//     handleCloseForm();
//     refetch();
//   } catch (err) {
//     console.error("Submission failed:", err);
//   } finally {
//     setSubmitting(false);
//   }
// }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Pay Stopage"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Pay Stopage"
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
  footerInfo={`Pay Stopage Requests out of ${count}`}
  currentPage={page + 1}  // ✅ 1-based for the table
  totalPages={totalPages}
  perPage={perPage}
  onPageChange={onPageChange}
  onPerPageChange={setPerPage}
  loading={loading}
/>
        </div>
      </PageWrapperWithHeading>
      <NewPayStopageForm
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

export default PayStopagePage;
