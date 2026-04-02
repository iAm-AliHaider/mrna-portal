import React, { useState } from 'react'
import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import FiltersWrapper from '../../../../../components/common/FiltersWrapper'
import ListFilter from '../../../../../components/common/ListFilter'
import PageWrapperWithHeading from '../../../../../components/common/PageHeadSection'
import SearchInput from '../../../../../components/common/searchField'

import './style.css'
import {
  useDeleteVacancy,
  useVacanciesList
} from '../../../../../utils/hooks/api/vacancies'
import CustomMenu from '../../../../../components/common/CustomMenu'
import EditIcon from '@mui/icons-material/Edit'
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AlertModal from '../../../../../components/common/Modal/AlertModal'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Human Resource', href: '#' },
  { title: 'Talent Acquisition' },
  { title: 'Vacancies' }
]

const VacanciesList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [open, setOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [candidateNumber, setCandidateNumber] = useState('')

  const navigate = useNavigate()

  const { vacancyData, totalPages, count, error, loading, refetch } = useVacanciesList(
    currentPage - 1,
    perPage,
    searchQuery
  )

  const { deleteVacancies, loading: deleteLoading } = useDeleteVacancy()

  const handleColumnAction = (row, column, value) => {
  }

  const onSelectChange = ids => setSelectedIds(ids)

  const handleAddVacancy = () => {
    navigate('/admin/human-resource/talent-acquisition/vacancies/add')
  }

  const handleChangeFilter = value => {
    setCandidateNumber(value)
  }

  const handleApplyFilter = newValues => {
  }

  const resetFilters = () => {
    setCandidateNumber('')
  }

  const columns = [
    { key: 'title', label: 'Job Title', type: 'html', width: '25%' },
    {
      key: 'no_of_vacancies',
      label: 'Number of Vacancies',
      type: 'html',
      width: '25%'
    },
    {
      key: 'organizationalUnit',
      label: 'Organizational Unit',
      type: 'custom',
      width: '20%',
      render: row => row?.organizational_units?.name || ''
    },
    {
      key: 'canBeSeenOutsideIntranetPortal',
      label: 'Vacancy can be seen outside IntranetPortal',
      type: 'checkbox',
      width: '20%'
    },
    {
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            // {
            //   label: 'View',
            //   icon: <VisibilityOutlinedIcon fontSize='small' />,
            //   action: () => console.log('View')
            // },
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () =>
                navigate(
                  `/admin/human-resource/talent-acquisition/vacancies/edit/${row?.id}`
                )
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

  const handleClose = () => {
    setOpen(false)
    setSelectedIds([])
  }

  const handleDeleteVacancies = async () => {
    const ids = selectedIds.length ? selectedIds : open
    await deleteVacancies(ids)
    handleClose()
    refetch()
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Vacancies'
        items={breadcrumbItems}
        action={handleAddVacancy}
        buttonTitle='+ Add Vacancy'
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <SearchInput value={searchQuery} onChange={setSearchQuery} />

            <div className='flex gap-4'>
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
              >
                <ListFilter
                  value={candidateNumber}
                  label='Candidate Number'
                  options={[]}
                  handleChange={handleChangeFilter}
                  placeholder='Select'
                />
              </FiltersWrapper>

              <Button
                variant='outlined'
                startIcon={<DeleteIcon />}
                size='medium'
                disabled={selectedIds.length === 0}
                sx={{ textTransform: 'none' }}
                onClick={() => {
                  setOpen(true)
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Table */}
          <DynamicTable
            columns={columns}
            data={vacancyData}
            showCheckbox={true}
            onSelectChange={onSelectChange}
            onAction={handleColumnAction}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={p => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            footerInfo={`Showing ${vacancyData.length} of ${count} vacancies`}
            loading={loading}
          />

          {error && (
            <div className='text-red-600 text-sm'>
              Error loading vacancies: {error}
            </div>
          )}
        </div>
      </PageWrapperWithHeading>
      <AlertModal
        loading={deleteLoading}
        type='danger'
        buttonTitle={'Delete'}
        title={'Delete Vacanci(es)'}
        description={'Are you sure you want to delete these vacanci(es)?'}
        open={!!open}
        onClose={handleClose}
        onConfirm={handleDeleteVacancies}
      />
    </React.Fragment>
  )
}

export default VacanciesList
