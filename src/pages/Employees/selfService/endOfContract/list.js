import React, { useState, useEffect } from 'react'
import './style.css'
import NewEndContractRequestForm from './form'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SearchField from '../../../../components/common/searchField'
// import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import SelectField from '../../../../components/common/SelectField'
// import ListFilter from "./filters";
// import CustomMenu from "../../../../components/common/CustomMenu";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import {
  useEndContractRequests,
  useCreateEndContractRequest,
  useEmployees
} from '../../../../utils/hooks/api/endContractRequests'
import { useUser } from '../../../../context/UserContext'
import { useGenericFlowEmployees } from '../../../../utils/hooks/api/genericApprovalFlow'
import { useGetDepartmentHeads } from '../../../../utils/hooks/api/emplyees'
import { transactionEmailSender } from '../../../../utils/helper'


const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Contract End Request' }
]

const EndContractRequestPage = () => {
  const { user } = useUser()
  const employeeId = user?.id
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: ''
  })

  const { endContractData, totalPages, loading, refetch } =
    useEndContractRequests(page, searchQuery, filters, perPage)
  const { createEndContractRequest } = useCreateEndContractRequest()
  const { data: employees = [], loading: employeesLoading } = useEmployees();


  // const [selectedIds, setSelectedIds] = useState([])
  const [openFormModal, setOpenFormModal] = useState(false)
  const [localEndContractData, setLocalEndContractData] = useState([])

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' }
  ]

  const handleStatusChange = value => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  useEffect(() => {
    setLocalEndContractData(endContractData || [])
  }, [endContractData])

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'subject', label: 'Subject' },
    { key: 'effected_date', label: 'Effected Date' },
    { key: 'contract', label: 'End Contract Reason' },
    { key: 'last_working_date', label: 'Last Working Date' },
    {
      key: 'successor_id',
      label: 'Successor',
      type: 'custom',
      render: (row) => {
  const first = row?.employee?.candidate?.first_name ?? "";
  const last  = row?.employee?.candidate?.family_name ?? "";
  const full  = `${first} ${last}`.trim();
  return full || "-";
}
    },
    // {
    //   key: 'employee_id',
    //   label: 'Employee',
    //   type: 'custom',
    //   render: row =>
    //     `${row?.employee?.candidate?.first_name} ${row?.employee?.candidate?.family_name}`
    // },
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
  ]

  const [selectedEndContractId, setSelectedEndContractId] = useState(null)

  // const handleEdit = row => {
  //   setSelectedEndContractId(row.id)
  //   setOpenFormModal(true)
  // }

  const handleCreate = () => {
    setSelectedEndContractId(null)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
  }

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
    const { heads, fetchDepartmentHeads } = useGetDepartmentHeads();
    

  const handleSubmit = async (values, { setSubmitting }) => {

  //    const pendingWorkflow = (workflow_employees || []).map(emp => ({
  //   ...emp,
  //   status: "pending"
  // }));

  const org_id = values.organizational_unit_id
    // Fetch both Manager & HOD
    const { manager, hod } = await fetchDepartmentHeads(org_id);

     // Remove organizational_unit_id from payload
    const { organizational_unit_id, ...restValues } = values;

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



    const payload = {
      ...restValues,
      // employee_id: employeeId,
      created_by: employeeId,
      updated_by: employeeId,
      status_workflow : updatedWorkflow
    }

    try {
      await createEndContractRequest(payload)
      await transactionEmailSender(user, payload, "End of Contract Request", `End of Contract Request`);
      
      handleCloseFormModal()
      refetch()
    } catch (err) {
      console.error('Submission failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Contract End Request'
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle='Add Contract End Request'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField
              value={searchQuery}
              onChange={value => {
                setSearchQuery(value)
                setPage(0) // Reset to first page when search changes
              }}
            />
            <div className='w-[300px]'>
              <SelectField
                options={statusOptions}
                placeholder='Status'
                value={filters.status}
                onChange={value => handleStatusChange(value)}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={endContractData}
            footerInfo={`Contract End Requests out of ${endContractData.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <NewEndContractRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedEndContractId}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  )
}

export default EndContractRequestPage
