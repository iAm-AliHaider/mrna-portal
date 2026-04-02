import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import NewJustificationRequestForm from "./form";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import { useUser } from "../../../../context/UserContext";
import {
  useJustificationRequests,
  useCreateJustificationRequest,
  useUpdateJustificationRequest,
  useDeleteJustificationRequest,
} from "../../../../utils/hooks/api/justification";
import ReAssignJustificationForm from "./reAssignForm";
   import CustomMenu from '../../../../components/common/CustomMenu'
   import EditIcon from '@mui/icons-material/Edit'
import { toast } from "react-hot-toast";


const JustificationRequestPage = () => {
  const { user } = useUser();
  const employeeId = user?.id;

  const [page, setPage] = useState(0);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
    const [showReAssign, setShowReAssign] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

  

  // Keep search, drop other filters
  const {
    justificationData,
    totalPages,
    loading,
    refetch,
    error,
    count,
  } = useJustificationRequests(page, searchQuery, {}, perPage, "justification", null);

  const { createJustificationRequest } = useCreateJustificationRequest();
  const { updateJustificationRequest } = useUpdateJustificationRequest();
  const { deleteJustificationRequest } = useDeleteJustificationRequest();

  const handleOpenForm = () => {
    setSelectedEditId(null);
    setOpenFormModal(true);
  };

  const handleCloseForm = () => setOpenFormModal(false);

  const handleCloseReAssign = () => setShowReAssign(false);


  const handleEdit = (row) => {
    setSelectedEditId(row.id);
    setOpenFormModal(true);
  };

  const handleReAssign = (row) => {
    setSelectedEditId(row.id);
    setSelectedRowData(row); 
    setShowReAssign(true);
  };

  const handleDelete = async (row) => {
    // await deleteJustificationRequest(row.id);
  };

  const onPageChange = (newPage) => {
    setPage(newPage - 1); // 1-based UI -> 0-based
  };

  const onPerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(0);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // reset page when searching
  };

  const columns = [
    {
      key: "employee_name",
      label: "Employee Name",
      type: "description",
      render: (row) => row?.employee?.candidate?.full_name,
    },
    { key: "justification_question", label: "Justification" },
    { key: "justification_reason", label: "Response", type: "description" },
    { key: "created_at", label: "Requested Date", type: "date" },
    { key: "status", label: "Manager Status", type: "chip" },
        {
      type: "custom",
      label: "Actions",
      width: "10%",
      render: row => (
        <CustomMenu
          items={[
            {
              label: "ReAssign",
              icon: <EditIcon fontSize="small" />,
              action: () =>  handleReAssign(row),
            }
          ]}
        />
      )      
    }
  ];

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Self Service" },
    { title: "Justification Request" },
  ];

  const handleSubmit = async (isEditing, values, { setSubmitting }) => {
    const payload = { ...values };
    try {
      if (isEditing) {
        await updateJustificationRequest(isEditing, payload);
      } else {
        await createJustificationRequest(payload);
      }
      handleCloseForm();
      refetch();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };


  const handleSubmitReAssign = async (isEditing, values, { setSubmitting }) => {
  try {
    const { employee_id = [], manager_id = [] } = values;

    if (!employee_id.length) {
      toast.error("Please select at least one employee");
      return;
    }

    // ✅ Ensure both arrays are aligned
    const total = employee_id.length;
    const createRequests = [];

    for (let i = 0; i < total; i++) {
      const empId = employee_id[i];
      const mgrId = manager_id[i] || null;
      if (!empId) continue;

      // ✅ Create clean payload per employee
      const payload = {
        justification_question: values.justification_question,
        justification_reason: values.justification_reason || "",
        created_by: user?.id,
        employee_id: empId,
        manager_id: mgrId,
        status: "pending",
      };

      createRequests.push(createJustificationRequest(payload));
    }

    // ✅ Execute all in parallel
    await Promise.all(createRequests);

    toast.success("Reassigned justification requests created successfully");
    handleCloseReAssign();
    refetch();
  } catch (err) {
    console.error("Reassign submission failed:", err);
    toast.error(err?.message || "Reassign submission failed");
  } finally {
    setSubmitting(false);
  }
};



  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Justification Requests"
        items={breadcrumbItems}
        action={handleOpenForm}
        buttonTitle="Add Justification Request"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* 🔎 Search (kept) */}
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by justification..."
            />
          </div>

          <DynamicTable
            columns={columns}
            data={justificationData}
            footerInfo={`Justification Requests out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <NewJustificationRequestForm
        open={openFormModal}
        onClose={handleCloseForm}
        id={selectedEditId}
        justificationData={justificationData}
        handleSubmit={handleSubmit}
        loading={loading}
        isManager={false}
      />

      <ReAssignJustificationForm
        open={showReAssign}
        onClose={handleCloseReAssign}
        id={selectedEditId}
        editingData={selectedRowData}
        handleSubmit={handleSubmitReAssign}
        loading={loading}
                isManager={false}
                isEditing={true}
      />
    </React.Fragment>
  );
};

export default JustificationRequestPage;



// // JustificationRequestPage.js
// import React, { useState, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   Breadcrumbs,
//   Link,
//   Button,
//   InputBase,
//   Paper,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import DynamicTable from "../../../../components/tables/AnnouncementsTable";
// import "./style.css";
// import NewJustificationRequestForm from "./form";
// import HomeIcon from "@mui/icons-material/Home";
// import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
// import SearchField from "../../../../components/common/searchField";
// import SelectField from "../../../../components/common/SelectField";
// import CustomMenu from '../../../../components/common/CustomMenu';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { useUser } from '../../../../context/UserContext';
// import FiltersWrapper from "../../../../components/common/FiltersWrapper";
// import ListFilter from "./filters";
// import { useJustificationRequests, useCreateJustificationRequest, useUpdateJustificationRequest, useDeleteJustificationRequest  } from "../../../../utils/hooks/api/justification";


// const JustificationRequestPage = () => {
//   const { user } = useUser();
//   const employeeId = user?.id;
//   const [page, setPage] = useState(0);
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [openFormModal, setOpenFormModal] = useState(false);
//   const [selectedEditId, setSelectedEditId] = useState(null);
//   const [perPage, setPerPage] = useState(10);
//   const [filters, setFilters] = useState({
//     status: "",
//     requested_date: "",
//     amount: ""
//   });

//   const {
//     justificationData,
//     totalPages,
//     loading,
//     refetch,
//     error,
//     count
//   } = useJustificationRequests(page, searchQuery, filters, perPage, 'justification');
//   const { createJustificationRequest } = useCreateJustificationRequest();
//   const { updateJustificationRequest } = useUpdateJustificationRequest();
//   const { deleteJustificationRequest } = useDeleteJustificationRequest();
//   const handleOpenForm = () => { setSelectedEditId(null); setOpenFormModal(true); };
//   const handleCloseForm = () => setOpenFormModal(false);
//   const handleEdit = (row) => { setSelectedEditId(row.id); setOpenFormModal(true); };
//   const handleDelete = async (row) => {
//     // await deleteJustificationRequest(row.id);
//     console.log("row", row);
//   };

//   const onPageChange = (newPage) => {
//     setPage(newPage - 1); // Convert from 1-based UI to 0-based API
//   };
//   const onPerPageChange = (newPerPage) => {
//     setPerPage(newPerPage);
//     setPage(0);
//   };

//   const columns = [
//     {
//       key: "employee_name",
//       label: "Employee Name",
//       type: "description",
//       render: row =>row?.employee?.candidate?.full_name
//     },
//     { key: "justification_question", label: "Justification" },
//     { key: "justification_reason", label: "Response", type: "description" },
//     { key: "created_at", label: "Requested Date", type: "date" },
//     { key: "status", label: "Status", type: "chip" },

//   ];

//   const breadcrumbItems = [
//     { href: "/home", icon: HomeIcon },
//     { title: "Self Service" },
//     { title: "Justification Request" },
//   ];

//   const statusOptions = [
//     { label: 'Pending', value: 'pending' },
//     { label: 'Approved', value: 'approved' },
//     { label: 'Declined', value: 'declined' },
//   ];

//   const handleStatusChange = (value) => {
//     setFilters(prev => ({ ...prev, status: value }));
//     setPage(0); // Reset to first page when filter changes
//   }

//   const handleSearch = (value) => {
//     setSearchQuery(value);
//     setPage(0); // Reset page when searching
//   };

//   const handleChangeFilter = (key, value) => {
      
//     setFilters(prev => ({ ...prev, [key]: value }));
//     // Don't apply filters automatically
//   };

//   const handleApplyFilter = (newValues) => {
   
//     const updatedFilters = { ...filters, ...newValues };
//     setFilters(updatedFilters);
//     setPage(0);
//     refetch(updatedFilters);
//   };

//   const resetFilters = () => {
//     const resetFilters = {
//       status: "",
//       requested_date: "",
//       amount: ""
//     }
//     setFilters(resetFilters);
//     setPage(0);
//     refetch(resetFilters);
//   };

// const handleSubmit = async(values, { setSubmitting }) => {
//   const payload = {
//     ...values
//   };

//   console.log("7y2742745")
  
//   try{
//     if(selectedEditId){
//       await updateJustificationRequest(selectedEditId, payload);
//     } else {
//       await createJustificationRequest(payload);
//     } 
//     handleCloseForm();
//     refetch();
//   } catch (err) {
//     console.error("Submission failed:", err);
//   } finally {
//     setSubmitting(false);
//   }
// }

//   return (
//     <React.Fragment>
//       <PageWrapperWithHeading
//         title="Justification Requests"
//         items={breadcrumbItems}
//         action={handleOpenForm}
//         buttonTitle="Add Justification Request"
//         Icon={AddIcon}
//       >
//         <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
//           {/* Filters */}
//           <div className="flex justify-between items-center w-full">
//             <SearchField 
//               value={searchQuery} 
//               onChange={handleSearch}
//               placeholder="Search by reason..."
//             />
//             <div className="flex gap-4">
//               <div className="w-[300px]">
//                 <SelectField 
//                   options={statusOptions} 
//                   placeholder="Status" 
//                   value={filters.status}
//                   onChange={handleStatusChange}
//                 />
//               </div>
//               <div className="filter-buttons">
//                 <FiltersWrapper
//                   onApplyFilters={handleApplyFilter}
//                   resetFilters={resetFilters}
//                 >
//                   <ListFilter
//                     values={filters}
//                     handleChange={handleChangeFilter}
//                   />
//                 </FiltersWrapper>
//               </div>
//             </div>
//           </div>

//           <DynamicTable
//   columns={columns}
//   data={justificationData}
//   footerInfo={`Justification Requests out of ${count}`}
//   currentPage={page + 1}  // ✅ 1-based for the table
//   totalPages={totalPages}
//   perPage={perPage}
//   onPageChange={onPageChange}
//   onPerPageChange={setPerPage}
//   loading={loading}
// />
//         </div>
//       </PageWrapperWithHeading>
//       <NewJustificationRequestForm
//         open={openFormModal}
//         onClose={handleCloseForm}
//         id={selectedEditId}
//         justificationData={justificationData}
//         handleSubmit={handleSubmit}
//         loading={loading}
//       />
//     </React.Fragment>
//   );
// };

// export default JustificationRequestPage;

