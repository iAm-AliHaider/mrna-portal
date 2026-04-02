import React, { useState, useEffect } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import { Box } from '@mui/material'
import DynamicTable from '../../../components/tables/AnnouncementsTable'
import SearchField from '../../../components/common/searchField'
import PageWrapperWithHeading from '../../../components/common/PageHeadSection'
import { useOffboardingTasks } from '../../../utils/hooks/api/useOffboardingTasks'
import { useUser } from '../../../context/UserContext'
import toast from 'react-hot-toast'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Employees' },
  { title: 'Offboarding Tasks' },
]

const OffboardingTasksPage = () => {
  const { user } = useUser()
  const [filters, setFilters] = useState({ status: '', searchTerm: '' })
  const {
    data,
    loading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    count,
    totalPages,
    refetch
  } = useOffboardingTasks({
    searchTerm: filters.searchTerm,
    initialPage: 0,
    initialSize: 4
  })

  useEffect(() => {
    refetch()
  }, [filters, refetch])

  useEffect(() => {
    if (error) toast.error('Failed to fetch onboarding tasks.')
  }, [error])

  const handleSearch = value => setFilters(prev => ({ ...prev, searchTerm: value }))

  const columns = [
    {key:'candidate_name',label:'Employee Name'},
    { key: 'task_name', label: 'Task Name' },
    { key: 'task_description', label: 'Description', type: 'description' ,render: row => row?.task_description},
    {key:'assigned_to_name',label:'Assigned To'},
    { key: 'task_status', label: 'Task Status' },
    { key: 'task_type', label: 'Task Type' },
    { key: 'task_attachment', label: 'Attachments', type: 'description', render: row => row?.task_attachment ? <a href={row?.task_attachment} target="_blank" rel="noopener noreferrer">View Attachment</a> : 'No Attachment' },
    { key: 'status', label: 'Assigned Status', type: 'chip' },
    {key:'assigned_at',label:'Assigned At',type:'date'},

  ]
  return (
    <PageWrapperWithHeading title="Offboarding Tasks" items={breadcrumbItems}>
      <Box className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <Box className="flex justify-between items-center mb-4">
          <SearchField
            value={filters.searchTerm}
            onChange={handleSearch}
            placeholder="Search by name..."
          />
        </Box>
        <DynamicTable
          columns={columns}
          data={data}
          loading={loading}
          footerInfo={`${count} tasks`}
          currentPage={page + 1}
          totalPages={totalPages}
          perPage={pageSize}
          onPageChange={p => setPage(p - 1)}
          onPerPageChange={n => setPageSize(n)}
        />
      </Box>
    </PageWrapperWithHeading>
  )
}

export default OffboardingTasksPage;