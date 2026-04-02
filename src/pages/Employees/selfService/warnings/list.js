import React, { useState, useEffect } from 'react'
import './style.css'
import NewWarningRequestForm from './form'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SearchField from '../../../../components/common/searchField'
import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import {
  useWarningRequests,
  useCreateWarningRequest
} from '../../../../utils/hooks/api/warningRequest'
import { useUser } from '../../../../context/UserContext'
import SelectField from '../../../../components/common/SelectField'

   import CustomMenu from '../../../../components/common/CustomMenu'
   import EditIcon from '@mui/icons-material/Edit'
import { toast } from "react-hot-toast";
import ReAssignWarning from './ReAssignWarning'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Warning Letter' }
]

const WarningRequestPage = () => {
  const { user } = useUser()
  const employeeId = user?.id
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: "",
  })

  const { warningData, totalPages, loading, refetch } = useWarningRequests(
    page,
    searchQuery,
    filters,
    perPage
  )
  const { createWarningRequest } = useCreateWarningRequest()

  const [selectedIds, setSelectedIds] = useState([])
  const [openFormModal, setOpenFormModal] = useState(false)
  const [localWarningData, setLocalWarningData] = useState([])
  
      const [showReAssign, setShowReAssign] = useState(false);
      const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedEditId, setSelectedEditId] = useState(null);

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  
  const handleCloseReAssign = () => setShowReAssign(false);


  const handleReAssign = (row) => {
    setSelectedEditId(row.id);
    setSelectedRowData(row); 
    setShowReAssign(true);
  };


  useEffect(() => {
    setLocalWarningData(warningData || [])
  }, [warningData])


  const columns = [
    {
      key: 'employee_id',
      label: 'Assigned To',
      type: 'custom',
      render: row => (
        <span>{`${row?.employee?.candidate?.first_name || ''} ${
          row?.employee?.candidate?.family_name || ''
        }`}</span>
      )
    },
    { key: 'subject', label: 'Subject' },
    { key: 'effected_date', label: 'Effected Date' },
    { key: 'warning', label: 'Warning' },
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
    { key: 'status', label: 'Status', type: 'chip' },
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
  ]

  const [selectedWarningId, setSelectedWarningId] = useState(null)

  const handleEdit = row => {
    setSelectedWarningId(row.id)
    setOpenFormModal(true)
  }

  const handleCreate = () => {
    setSelectedWarningId(null)
    setOpenFormModal(true)
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      created_by: employeeId,
      updated_by: employeeId
    }

    if (user?.role === 'manager') {
      payload.is_manager_approve = 'approved';
    } else if(user?.role === 'hr'){
      payload.is_manager_approve = 'approved';
      payload.is_hr_approve = 'approved';
    }
    
    try {
      await createWarningRequest(payload)
      handleCloseFormModal()
      refetch()
    } catch (err) {
      console.error('Submission failed:', err)
    } finally {
      setSubmitting(false)
    }
  }


  // ✅ FIXED handleSubmitReAssign
const handleSubmitReAssign = async (values, { setSubmitting }) => {
  try {
    const { employee_id = [] } = values;

    if (!employee_id.length) {
      toast.error("Please select at least one employee");
      return;
    }

    const createRequests = employee_id.map((empId) => {
      const payload = {
        subject: values.subject,
        warning: values.warning,
        effected_date: values.effected_date,
        attachment: values.attachment,
        employee_id: empId,
        created_by: employeeId,
        updated_by: employeeId,
        status: "pending",
      };
      return createWarningRequest(payload);
    });

    await Promise.all(createRequests);

    toast.success("Reassigned warning letters created successfully");
    handleCloseReAssign(); // ✅ close modal
    refetch(); // ✅ reload data
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
        title='Warning Letter'
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle='Add Warning Letter'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField 
            placeholder='Search by subject or warning...'
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
            data={warningData}
            footerInfo={`Showing ${warningData.length} warnings out of ${warningData.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <NewWarningRequestForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedWarningId}
        handleSubmit={handleSubmit}
        loading={loading}
      />

        <ReAssignWarning
        open={showReAssign}
        onClose={handleCloseReAssign}
        id={selectedWarningId}
  handleSubmit={handleSubmitReAssign}
        loading={loading}
        editingData={selectedRowData}

      />
      
    </React.Fragment>
  )
}

export default WarningRequestPage
