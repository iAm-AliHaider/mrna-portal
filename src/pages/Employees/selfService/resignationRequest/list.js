// import React, { useState, useEffect } from 'react'
// import './style.css'
// import NewResignationRequestForm from './form'
// import { Button } from '@mui/material'
// import AddIcon from '@mui/icons-material/Add'
// import DynamicTable from '../../../../components/tables/AnnouncementsTable'
// import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
// import HomeIcon from '@mui/icons-material/Home'
// import SearchField from '../../../../components/common/searchField'
// // import FiltersWrapper from '../../../../components/common/FiltersWrapper'
// import SelectField from '../../../../components/common/SelectField'
// // import ListFilter from "./filters";
// // import CustomMenu from "../../../../components/common/CustomMenu";
// // import EditIcon from "@mui/icons-material/Edit";
// // import DeleteIcon from "@mui/icons-material/Delete";
// import {
//   useResignationRequests,
//   useCreateResignationRequest
// } from '../../../../utils/hooks/api/resignationRequest'
// import { useUser } from '../../../../context/UserContext'

// const breadcrumbItems = [
//   { href: '/home', icon: HomeIcon },
//   { title: 'Self Service' },
//   { title: 'Resignation Request' }
// ]

// const ResignationRequestPage = () => {
//   const { user } = useUser()
//   const employeeId = user?.id
//   const [page, setPage] = useState(0)
//   const [perPage, setPerPage] = useState(10)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filters, setFilters] = useState({
//     status: ''
//   })

//   const { resignationData, totalPages, loading, refetch } =
//     useResignationRequests(page, searchQuery, filters, perPage)
//   const { createResignationRequest } = useCreateResignationRequest()


//   // const [selectedIds, setSelectedIds] = useState([])
//   const [openFormModal, setOpenFormModal] = useState(false)
//   const [localResignationData, setLocalResignationData] = useState([])

//   const statusOptions = [
//     { label: 'Pending', value: 'pending' },
//     { label: 'Approved', value: 'approved' },
//     { label: 'Declined', value: 'declined' }
//   ]

//   const handleStatusChange = value => {
//     setFilters(prev => ({ ...prev, status: value }))
//   }

//   useEffect(() => {
//     setLocalResignationData(resignationData || [])
//   }, [resignationData])

//   const columns = [
//     { key: 'subject', label: 'Subject' },
//     { key: 'effected_date', label: 'Effected Date' },
//     { key: 'resignation', label: 'Resignation' },
//         { key: 'last_working_date', label: 'Last Working Date' },
//     {
//       key: 'successor_id',
//       label: 'Successor',
//       type: 'custom',
//       render: (row) => {
//   const first = row?.employee?.candidate?.first_name ?? "";
//   const last  = row?.employee?.candidate?.family_name ?? "";
//   const full  = `${first} ${last}`.trim();
//   return full || "-";
// }
//     },
//     {
//       key: 'attachment',
//       label: 'Attachment',
//       type: 'custom',
//       render: row =>
//         row.attachment ? (
//           <Button
//             variant='outlined'
//             size='small'
//             onClick={() => window.open(row.attachment, '_blank')}
//           >
//             View Attachment
//           </Button>
//         ) : (
//           '-'
//         )
//     },
//     { key: 'status', label: 'Status', type: 'chip' }
//   ]

//   const [selectedResignationId, setSelectedResignationId] = useState(null)

//   // const handleEdit = row => {
//   //   setSelectedResignationId(row.id)
//   //   setOpenFormModal(true)
//   // }

//   const handleCreate = () => {
//     setSelectedResignationId(null)
//     setOpenFormModal(true)
//   }

//   const handleCloseFormModal = () => {
//     setOpenFormModal(false)
//   }

//   const handleSubmit = async (values, { setSubmitting }) => {
//     const payload = {
//       ...values,
//       employee_id: employeeId,
//       created_by: employeeId,
//       updated_by: employeeId
//     }

//     if (user?.role === 'manager') {
//       payload.is_manager_approve = 'approved'
//     } else if (user?.role === 'hr') {
//       payload.is_manager_approve = 'approved'
//       payload.is_hr_approve = 'approved'
//     }

//     try {
//       await createResignationRequest(payload)
//       handleCloseFormModal()
//       refetch()
//     } catch (err) {
//       console.error('Submission failed:', err)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <React.Fragment>
//       <PageWrapperWithHeading
//         title='Resignation Request'
//         items={breadcrumbItems}
//         action={handleCreate}
//         buttonTitle='Add Resignation Request'
//         Icon={AddIcon}
//       >
//         <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
//           {/* Filters */}
//           <div className='flex justify-between items-center w-full'>
//             <SearchField
//               value={searchQuery}
//               onChange={value => {
//                 setSearchQuery(value)
//                 setPage(0) // Reset to first page when search changes
//               }}
//             />
//             <div className='w-[300px]'>
//               <SelectField
//                 options={statusOptions}
//                 placeholder='Status'
//                 value={filters.status}
//                 onChange={value => handleStatusChange(value)}
//               />
//             </div>
//           </div>

//           <DynamicTable
//             columns={columns}
//             data={resignationData}
//             footerInfo={`Resignation Requests out of ${resignationData.length}`}
//             currentPage={page + 1}
//             totalPages={totalPages}
//             perPage={perPage}
//             onPageChange={p => setPage(p - 1)}
//             onPerPageChange={setPerPage}
//             loading={loading}
//           />
//         </div>
//       </PageWrapperWithHeading>
//       <NewResignationRequestForm
//         open={openFormModal}
//         onClose={handleCloseFormModal}
//         id={selectedResignationId}
//         handleSubmit={handleSubmit}
//         loading={loading}
//       />
//     </React.Fragment>
//   )
// }

// export default ResignationRequestPage



import React, { useState, useEffect, useMemo } from 'react';
import './style.css';
import NewResignationRequestForm from './form';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DynamicTable from '../../../../components/tables/AnnouncementsTable';
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection';
import HomeIcon from '@mui/icons-material/Home';
import SearchField from '../../../../components/common/searchField';
import SelectField from '../../../../components/common/SelectField';
import {
  useResignationRequests,
  useCreateResignationRequest
} from '../../../../utils/hooks/api/resignationRequest';
import { useUser } from '../../../../context/UserContext';
import { useLocation } from 'react-router-dom';
import { useGenericFlowEmployees } from '../../../../utils/hooks/api/genericApprovalFlow';
import { transactionEmailSender } from '../../../../utils/helper';
import { useGetDepartmentHeads, useGetDepartmentManager } from '../../../../utils/hooks/api/emplyees';

const ResignationRequestPage = () => {
  const { user } = useUser();
  const location = useLocation();

  // Determine if we're on the "on behalf" route
  const isOnBehalf = (location?.pathname || '').toLowerCase().includes('resignation-onbehalf');

  // Dynamic titles based on route
  const pageTitle   = isOnBehalf ? 'Resignation on Behalf' : 'Resignation Request';
  const buttonTitle = isOnBehalf ? 'Add on Behalf Resignation' : 'Add Resignation Request';

  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Self Service' },
    { title: pageTitle },
  ];

  const employeeId = user?.id;
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
  });

  const { resignationData, totalPages, loading, refetch } =
    useResignationRequests(page, searchQuery, filters, perPage);
  const { createResignationRequest } = useCreateResignationRequest();

  const [openFormModal, setOpenFormModal] = useState(false);
  const [localResignationData, setLocalResignationData] = useState([]);
  const [selectedResignationId, setSelectedResignationId] = useState(null);

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  useEffect(() => {
    setLocalResignationData(resignationData || []);
  }, [resignationData]);

  // const columns = [
  //    {
  //     key: "employee_id",
  //     label: "Employee",
  //     type: "custom",
  //     render: (row) => {
  //       const first = row?.employee?.candidate?.first_name ?? "";
  //       const last = row?.employee?.candidate?.family_name ?? "";
  //       const full = `${first} ${last}`.trim();
  //       return full || "-";
  //     },
  //   },
  //   { key: 'subject', label: 'Subject' },
  //   { key: 'effected_date', label: 'Effected Date' },
  //   { key: 'resignation', label: 'Resignation' },
  //   { key: 'last_working_date', label: 'Last Working Date' },
  //   {
  //     key: 'successor_id',
  //     label: 'Successor',
  //     type: 'custom',
  //     render: (row) => {
  //       const first = row?.employee?.candidate?.first_name ?? '';
  //       const last = row?.employee?.candidate?.family_name ?? '';
  //       const full = `${first} ${last}`.trim();
  //       return full || '-';
  //     },
  //   },
  //   {
  //     key: 'attachment',
  //     label: 'Attachment',
  //     type: 'custom',
  //     render: (row) =>
  //       row.attachment ? (
  //         <Button
  //           variant="outlined"
  //           size="small"
  //           onClick={() => window.open(row.attachment, '_blank')}
  //         >
  //           View Attachment
  //         </Button>
  //       ) : (
  //         '-'
  //       ),
  //   },
  //   { key: 'status', label: 'Status', type: 'chip' },
  // ];


  // inside your component (where you already have isOnBehalf)
const employeeColumn = {
  key: "employee_id",
  label: "Employee",
  type: "custom",
  render: (row) => {
    const first = row?.employee?.candidate?.first_name ?? "";
    const last  = row?.employee?.candidate?.family_name ?? "";
    const full  = `${first} ${last}`.trim();
    return full || "-";
  },
};

// your existing non-conditional columns
const baseColumns = [
  { key: 'subject', label: 'Subject' },
  { key: 'effected_date', label: 'Effected Date' },
  { key: 'resignation', label: 'Resignation' },
  { key: 'last_working_date', label: 'Last Working Date' },
  {
    key: 'attachment',
    label: 'Attachment',
    type: 'custom',
    render: row =>
      row.attachment ? (
        <Button
          variant='outlined'
          size='small'
          onClick={() => window.open(row.attachment, '_blank')}
        >
          View Attachment
        </Button>
      ) : (
        '-'
      )
  },
  { key: 'status', label: 'Status', type: 'chip' }
];

// final columns: add Employee only when isOnBehalf is true
const columns = React.useMemo(
  () => (isOnBehalf ? [employeeColumn, ...baseColumns] : baseColumns),
  [isOnBehalf]
);


  const handleCreate = () => {
    setSelectedResignationId(null);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
  };

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
const { heads, fetchDepartmentHeads } = useGetDepartmentHeads();
  
  const handleSubmit = async (values, { setSubmitting }) => {


    const org_id = values.organizational_unit_id
    // Fetch both Manager & HOD
    const { manager, hod } = await fetchDepartmentHeads(org_id);

     // Remove organizational_unit_id from payload
    const { organizational_unit_id, ...restValues } = values;


 const payload = {
      ...restValues
    };



    if(isOnBehalf){

          // Update workflow
    const updatedWorkflow = (workflow_employees || []).map((emp) => {
      let updatedEmp = { ...emp, status: "pending" }; // set all to pending

      // If manager found → update only that object
      if (emp.role === "manager" && manager) {
        updatedEmp.id = manager.id || null;
        updatedEmp.name = manager.first_name || "Manager";
            }

      // If HOD found → update only that object
      if (emp.role === "hod" && hod) {
        updatedEmp.id = hod.id || null;
        updatedEmp.name = hod.first_name || "HOD";

      }

      // If manager/hod is null → do NOT modify that role object at all
      return updatedEmp;
    });

//         const pendingWorkflow = (updatedWorkflow || []).map(emp => ({
//   ...emp,
//   status: "pending"
// }));

          payload.status_workflow = updatedWorkflow

      
    }
    else{
      
      payload.employee_id =  employeeId;
      payload.created_by = employeeId;
      payload.status_workflow = workflow_employees


    }
  
          payload.updated_by = employeeId;


    try {
      await createResignationRequest(payload);
      await transactionEmailSender(user, payload, "Resignation Request", payload?.subject || `Resignation Request`);
      handleCloseFormModal();
      refetch();
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title={pageTitle}
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle={buttonTitle}
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setPage(0); // Reset to first page when search changes
              }}
            />
            <div className="w-[300px]">
              <SelectField
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleStatusChange(value)}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={resignationData}
            footerInfo={`Resignation Requests out of ${resignationData.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <NewResignationRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedResignationId}
        handleSubmit={handleSubmit}
        loading={loading}
        // 👇 pass the flag to the Modal/Form for the on-behalf page
        isOnBehalf={isOnBehalf}
      />
    </React.Fragment>
  );
};

export default ResignationRequestPage;
