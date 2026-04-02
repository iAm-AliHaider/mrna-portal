// EmployeesObjectivesPage.js
import React, { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import HomeIcon from '@mui/icons-material/Home'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import { useNavigate } from 'react-router-dom'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import SearchField from '../../../../components/common/searchField'
// import FiltersWrapper from '../../../../components/common/FiltersWrapper'
// import ListFilter from './filter'
import {
  useDeleteEmployeeObjective,
  useEmployeeObjectivesList
} from '../../../../utils/hooks/api/employeeObjectives'
import CustomMenu from '../../../../components/common/CustomMenu'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AlertModal from '../../../../components/common/Modal/AlertModal'

const EmployeesObjectivesPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(4)
  const [currentPage, setCurrentPage] = useState(1)
  const [open, setOpen] = useState(false)
  // const [filters, setFilters] = useState({
  //   start_period: '',
  //   end_period: '',
  // })

  const { objectives, loading, count, totalPages, refetch } =
    useEmployeeObjectivesList(currentPage - 1, perPage, searchQuery)

  const { deleteObjectives, loading: deleteLoading } =
    useDeleteEmployeeObjective()

  // const handleChangeFilter = (key, value) => {
  //   setFilters(prev => ({ ...prev, [key]: value }))
  // }

  // const handleApplyFilter = newValues => {
  //   console.log('values', newValues)
  // }

  // const resetFilters = () => {
  //   setFilters({
  //     start_period: '',
  //     end_period: '',
  //   })
  // }

  const columns = [
    { key: 'objective_title', label: 'Title', type: 'status' },
    { key: 'weight', label: 'Weight' },
    { key: 'score', label: 'Score' },
    {
      key: '360_evaluation',
      label: '360 Evaluation',
      type: 'custom',
      render: row => (row?.evaluation_360 ? 'Yes' : 'No')
    },
    { key: 'start_period', label: 'Start Period' },
    { key: 'end_period', label: 'End Period' },
    {
      key: 'notes',
      label: 'Note',
      type: 'description',
      render: row => row?.notes
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () =>
                navigate(`/performance/employee-objectives/edit/${row?.id}`)
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => setOpen(row.id),
              danger: true
            }
          ]}
        />
      )
    }
  ]

  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Performance Management' },
    { title: 'Employees Objectives' }
  ]

  const handleAddOjective = () => {
    navigate('/performance/employee-objectives/org-employees-new')
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDeleteVacancies = async () => {
    await deleteObjectives(open)
    refetch()
    handleClose()
  }

  const handleSearch = value => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Employees Objectives'
        items={breadcrumbItems}
        action={handleAddOjective}
        buttonTitle='Add New Objective'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <SearchField value={searchQuery} onChange={handleSearch} placeholder='Search by title...' />
            {/* <div className='flex gap-4'>
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
              >
                <ListFilter
                  values={filters}
                  handleChange={handleChangeFilter}
                />
              </FiltersWrapper>
            </div> */}
          </div>

          <DynamicTable
            columns={columns}
            data={objectives}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={p => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            footerInfo={`Showing ${objectives?.length} out of ${count}`}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <AlertModal
        loading={deleteLoading}
        type='danger'
        buttonTitle={'Delete'}
        title={'Delete Objective'}
        description={'Are you sure you want to remove this objective?'}
        open={!!open}
        onClose={handleClose}
        onConfirm={handleDeleteVacancies}
      />
    </React.Fragment>
  )
}

export default EmployeesObjectivesPage
