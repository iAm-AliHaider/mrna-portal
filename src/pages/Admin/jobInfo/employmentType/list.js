import React, { useState } from 'react'
import { Box, Typography, Paper, Button, Stack } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import './style.css'
import CustomBreadcrumbs from '../../../../components/common/BreadCrumbs'
import { useNavigate } from 'react-router-dom'
// import FiltersWrapper from '../../../../components/common/FiltersWrapper'
// import ListFilter from '../../../../components/common/ListFilter'
import { useEmploymentTypeList } from '../../../../utils/hooks/api/employmentType'
import SearchInput from '../../../../components/common/searchField'
import Modal from '../../../../components/common/Modal'
import { supabase } from '../../../../supabaseClient'
import toast from 'react-hot-toast'
import CustomMenu from '../../../../components/common/CustomMenu'
import EditIcon from '@mui/icons-material/Edit'
import SubmitButton from '../../../../components/common/SubmitButton'
// import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Job Info' },
  { title: 'Employment type' }
]
const EmploymentType = () => {
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [searchQuery, setSearchQuery] = useState('')
  // const [name, setName] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const navigate = useNavigate()

  const columns = [
    { key: 'employment_type', label: 'Name', type: 'html', width: '15%' },
    {
      key: 'payment_type',
      label: 'Payment Frequency',
      type: 'html',
      width: '15%'
    },
    {
      key: 'allow_overtime',
      label: 'Allow Overtime',
      type: 'checkbox',
      width: '10%'
    },
    {
      key: 'allow_shift_work',
      label: 'Allow Shift Work',
      type: 'checkbox',
      width: '10%'
    },
    {
      key: 'exclude_additional_salary',
      label: 'Exclude from additional salary month',
      type: 'checkbox',
      width: '20%'
    },
    // { key: 'exclude_from_salary_calculation', label: 'Exclude from Salary Calculation', type: 'checkbox', width: '15%' },
    {
      key: 'tax_exemption',
      label: 'Tax Exemption',
      type: 'checkbox',
      width: '10%'
    },
    {
      key: 'allow_delay',
      label: 'Allow Delay',
      type: 'checkbox',
      width: '10%'
    },

    {
      type: 'custom',
      label: 'Actions',
      render: row => (
        <CustomMenu
          items={[
            // {
            //   label: "View",
            //   icon: <VisibilityOutlinedIcon fontSize="small" />,
            //   action: () => console.log("View"),
            // },
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () =>
                navigate(`/admin/job-info/employment-type/edit/${row?.id}`)
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => confirmSingleDelete(row?.id),
              danger: true
            }
          ]}
        />
      )
    }
  ]

  const { employmentTypeData, totalPages, count, error, loading, refetch } =
    useEmploymentTypeList(currentPage - 1, perPage, searchQuery)



  const onSelectChange = ids => setSelectedIds(ids)

  const handleColumnAction = (row, column, value) => {
  }

  const handleAddEmploymentType = () => {
    navigate('/admin/job-info/employment-type/add')
  }

  // const handleChangeFilter = (value) => {
  //   setName(value);
  // };

  // const handleApplyFilter = (newValues) => {
  //   console.log("values", newValues);
  // };

  // const resetFilters = () => {
  //   setName("");
  // };

  const confirmSingleDelete = id => {
    setDeleteTarget(id)
    setConfirmOpen(true)
  }

  const confirmBulkDelete = () => {
    setDeleteTarget('bulk')
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    const idsToDelete = deleteTarget === 'bulk' ? selectedIds : [deleteTarget]

    if (!idsToDelete || idsToDelete.length === 0) {
      toast.error('No employment types selected for deletion')
      setConfirmOpen(false)
      return
    }

    setDeleteLoading(true)

    let referencingEmployees = []
    let finalCalls = []
    let leavesVacations = []

    try {
      const res = await supabase
        .from('employees')
        .select('id, employment_type_id')
        .in('employment_type_id', idsToDelete)

      referencingEmployees = res.data || []
      if (res.error) throw new Error('Error checking employee references')

      if (referencingEmployees.length > 0) {
        toast.error(
          'Cannot delete employment type which is already assigned to employees'
        )
        return
      }

      const [finalCallRes, leaveVacRes] = await Promise.all([
        supabase
          .from('final_employment_calls')
          .select('*')
          .in('employment_type_id', idsToDelete),
        supabase
          .from('leaves_vacations_insurance')
          .select('*')
          .in('employment_type_id', idsToDelete)
      ])

      finalCalls = finalCallRes.data || []
      leavesVacations = leaveVacRes.data || []

      if (finalCallRes.error || leaveVacRes.error)
        throw new Error('Error fetching dependent data')

      const [delFinalErr, delLeaveErr] = await Promise.all([
        supabase
          .from('final_employment_calls')
          .delete()
          .in('employment_type_id', idsToDelete),
        supabase
          .from('leaves_vacations_insurance')
          .delete()
          .in('employment_type_id', idsToDelete)
      ])

      if (delFinalErr.error || delLeaveErr.error)
        throw new Error('Error deleting dependent records')

      const { error: deleteMainError } = await supabase
        .from('employment_types')
        .delete()
        .in('id', idsToDelete)

      if (deleteMainError) throw new Error('Error deleting employment types')

      toast.success('Employment types deleted successfully')
      refetch()
      setSelectedIds([])
      setCurrentPage(prev => prev)
    } catch (err) {
      console.error(err)
      try {
        if (referencingEmployees.length > 0) {
          await Promise.all(
            referencingEmployees.map(emp =>
              supabase
                .from('employees')
                .update({ employment_type_id: emp.employment_type_id })
                .eq('id', emp.id)
            )
          )
        }

        if (finalCalls.length > 0) {
          await supabase.from('final_employment_calls').insert(finalCalls)
        }

        if (leavesVacations.length > 0) {
          await supabase
            .from('leaves_vacations_insurance')
            .insert(leavesVacations)
        }

        toast.error(
          'Failed to delete employment types. Process is rolled backed.'
        )
      } catch (rollbackError) {
        console.error('Rollback failed', rollbackError)
        toast.error('Rollback failed. Manual recovery may be needed.')
      }
    } finally {
      setDeleteLoading(false)
      setConfirmOpen(false)
    }
  }

  const handleSearchQueryChange = value => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <Box className='my-surveys-wrapper'>
      {/* Title */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h5' fontWeight='bold'>
          Employment Types
        </Typography>
        <Button
          variant='contained'
          size='medium'
          onClick={handleAddEmploymentType}
        >
          + Add Type
        </Button>
      </Stack>

      {/* Breadcrumbs */}
      <CustomBreadcrumbs items={breadcrumbItems} />

      {/* Content Box */}
      <Paper elevation={0} className='my-surveys-content-box'>
        {/* Search and Filter Bar */}
        <Box className='search-filter-bar'>
          {/* Search Box */}
          <SearchInput value={searchQuery} onChange={handleSearchQueryChange} />
          {/* Filter & Delete Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter
                value={name}
                label="Name"
                options={[]}
                handleChange={handleChangeFilter}
                placeholder="Select"
              />
            </FiltersWrapper> */}

            <Button
              variant='outlined'
              startIcon={<DeleteIcon />}
              size='medium'
              disabled={selectedIds.length === 0}
              sx={{ textTransform: 'none' }}
              onClick={confirmBulkDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={employmentTypeData}
          loading={loading}
          onSelectChange={onSelectChange}
          onAction={handleColumnAction}
          showCheckbox={true}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={p => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${employmentTypeData.length} of ${count} types`}
        />

        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title='Confirm Deletion'
        >
          <div className='space-y-4'>
            <p>
              Are you sure you want to delete{' '}
              {deleteTarget === 'bulk'
                ? 'selected Employment Type'
                : 'this Employment Type'}
              ?
            </p>
            <div className='flex justify-end gap-2'>
              <SubmitButton
                onClick={() => setConfirmOpen(false)}
                variant='secondary'
                title='Cancel'
              />
              <SubmitButton
                onClick={handleConfirmDelete}
                isLoading={deleteLoading}
                variant='danger'
                title='Delete'
              />
            </div>
          </div>
        </Modal>
      </Paper>
    </Box>
  )
}

export default EmploymentType
