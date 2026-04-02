import React, { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import { useNavigate } from 'react-router-dom'
import {
  useHolidayDefinitionsList,
  useDeleteHolidayDefinitions
} from '../../../../utils/hooks/api/holidayDefinitions'
import CustomMenu from '../../../../components/common/CustomMenu'
import SearchInput from '../../../../components/common/searchField'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Company Info' },
  { title: 'Holidays Definition' }
]

const HolidaysDefinition = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const navigate = useNavigate()

  // Use the holiday definitions hook
  const { holidayData, totalPages, count, error, loading, refetch } =
    useHolidayDefinitionsList(currentPage - 1, perPage, searchTerm)

  // Use the delete hook
  const { deleteHolidayDefinitions, loading: deleteLoading } =
    useDeleteHolidayDefinitions()

  const onSelectChange = ids => setSelectedIds(ids)

  const handleAddHoliday = () => {
    navigate('/admin/company-info/holidays/add')
  }

  const handleEditHoliday = id => {
    navigate(`/admin/company-info/holidays/edit/${id}`)
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected holiday(s)?`
      )
    ) {
      const result = await deleteHolidayDefinitions(selectedIds)
      if (result.success) {
        setSelectedIds([])
        refetch() // Refresh the data after deletion
      }
    }
  }

  const handleIndividualDelete = async id => {
    const result = await deleteHolidayDefinitions([id])
    if (result.success) {
      refetch() // Refresh the data after deletion
    }
  }

  const columns = [
    { key: 'name', label: 'Holiday Name' },
    { key: 'holiday_date', label: 'Holiday Date' },
    { key: 'holiday_year', label: 'Holiday Year' },
    { key: 'religion', label: 'Religion' },
    { key: 'repeatable', label: 'Repeatable' },
    {
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () => handleEditHoliday(row.id)
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleIndividualDelete(row.id),
              danger: true
            }
          ]}
        />
      )
    }
  ]

  // Transform data for the table
  const transformedData = holidayData.map(item => ({
    ...item,
    repeatable: item.repeatable ? 'Yes' : 'No',
    holiday_date: new Date(item.holiday_date).toLocaleDateString()
  }))

  const handleChangeSearchTerm = value => {
    setSearchTerm(value)
    setCurrentPage(1)
  }


  return (
    <PageWrapperWithHeading
      title='Holidays Definition'
      items={breadcrumbItems}
      action={handleAddHoliday}
      buttonTitle='+ Add Holiday'
    >
      <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
        <div className='flex justify-between items-center w-full'>
          <SearchInput
            placeholder='Search'
            fullWidth
            value={searchTerm}
            onChange={handleChangeSearchTerm}
          />
        </div>

        {/* Filter & Delete Buttons */}
        {/* <Box sx={{ display: 'flex', gap: 1 }}>
            <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter
                value={typeFilter}
                label='Type'
                options={[]}
                handleChange={handleChangeFilter}
                placeholder='Select Type'
              />
            </FiltersWrapper>

            <Button
              variant='outlined'
              startIcon={<DeleteIcon />}
              size='medium'
              disabled={selectedIds.length === 0 || deleteLoading}
              sx={{ textTransform: 'none' }}
              onClick={handleDelete}
            >
              Delete Selected
            </Button>
          </Box> */}

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={transformedData}
          // showCheckbox={true}
          onSelectChange={onSelectChange}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={p => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${transformedData.length} of ${count} holidays`}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  )
}

export default HolidaysDefinition
