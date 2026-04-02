import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import FiltersWrapper from '../../../../../components/common/FiltersWrapper'
import ListFilter from './filters'
import { useNavigate } from 'react-router-dom'
import PageWrapperWithHeading from '../../../../../components/common/PageHeadSection'
import SearchInput from '../../../../../components/common/searchField'
import { useDesignations, useDeleteDesignation } from '../../../../../utils/hooks/api/useDesignations'
import CustomMenu from '../../../../../components/common/CustomMenu'
import toast from 'react-hot-toast'

const DesignationsList = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState({
    designation_code: '',
    filter_date: 'created_at',
    from_date: '',
    to_date: ''
  })

  const { designationsData, totalPages, designationNames, refetch } = useDesignations(currentPage - 1, searchQuery, filters, perPage)
  const { deleteDesignation, loading: deleteLoading } = useDeleteDesignation()

  const handleColumnAction = (row, column, value) => {
    if (column === 'action') {
      navigate(`/admin/human-resource/talent-acquisition/designations/add/${row.id}`);
      return;
    }
    if (column === 'delete') {
      handleDeleteDesignation(row.id);
      refetch()
    }
  };
  
  const columns = [
    {
      key: 'code',
      label: 'Designation Code',
      type: 'html',
      width: '15%'
    },
    { key: 'name', label: 'Designation Name', type: 'html', width: '20%' },
    {
      key: 'jobDescription',
      label: 'Job Description',
      type: 'html',
      width: '25%'
    },
   
    { key: 'modifiedDate', label: 'Modified Date', type: 'html', width: '9%' },
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
              action: () => handleColumnAction(row, 'action'),
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'delete'),
              danger: true
            }
          ]}
        />
      )
    }
  ]
  
  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Human Resource' },
    { title: 'Designations' }
  ]
  

  // useEffect(()=>{
  //   console.log("designationsData",designationsData)
  // },[designationsData])

  // Filtering is already handled by the hook, but you can add extra filtering here if needed
  const [localDeletedIds, setLocalDeletedIds] = useState([])
  const filteredData = designationsData.filter(
    row =>
      !localDeletedIds.includes(row.id) &&
      ((row.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.code || '').toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Map Supabase data to table columns
  const mappedData = filteredData.map(row => ({
    code: row.code || '-',
    name: row.name || '-',
    department: row.department_name || 'N/A',
    jobDescription: row.job_description || '-',
    grade: row.grade_id || '-',
    policy: row.policy_id || '-',
    modifiedDate: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-',
    id: row.id,
    action: row, // Pass the whole row for action column
  }))

  const onSelectChange = ids => setSelectedIds(ids)

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = newValues => {
    setFilters(prev => ({ ...prev, ...newValues }))
  }

  const resetFilters = () => {
    setFilters({
      designation_code: '',
      filter_date: 'created_at',
      from_date: '',
      to_date: ''
    })
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset page when searching
  };

  const handleAddDesignation = () => {
    navigate('/admin/human-resource/talent-acquisition/designations/add')
  }

  const handleDeleteDesignation = async (designationId) => {
    try {
      const result = await deleteDesignation(designationId)
      if (result) {
        setLocalDeletedIds(ids => [...ids, designationId])
        refetch() // Refresh the data after deletion
      }
    } catch (err) {
      console.error(err)
    }
  }
  

  return (
    <PageWrapperWithHeading
      title='Designations'
      items={breadcrumbItems}
      action={handleAddDesignation}
      buttonTitle='+ Add Designation'
    >
      <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
        {/* Search and Filter Bar */}
        <div className='flex justify-between items-center w-full'>
          <SearchInput value={searchQuery} onChange={handleSearch} />
          <div className='flex gap-4'>
            <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <ListFilter
                values={filters}
                label='Type'
                options={designationNames}
                handleChange={handleChangeFilter}
                placeholder='Select Type'
              />
            </FiltersWrapper>
           
          </div>
        </div>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={mappedData}
          onSelectChange={onSelectChange}
          selectedIds={selectedIds}
          onAction={handleColumnAction}
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
          footerInfo={`Designations out of ${mappedData.length}`}
        />
      </div>
    </PageWrapperWithHeading>
  )
}

export default DesignationsList 