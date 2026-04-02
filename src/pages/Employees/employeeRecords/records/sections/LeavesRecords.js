import React, { useState } from 'react'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import SearchInput from '../../../../../components/common/searchField'
import { useGetEmployeeRequests } from '../../../../../utils/hooks/api/employeeRecords'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'

const LeavesRecords = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const { record } = useEmployeeRecord()

  const columns = [
    { key: 'leave_type', label: 'Leave Type' },
    { key: 'start_date', label: 'Leave From' },
    { key: 'end_date', label: 'Leave To' },
    { key: 'is_start_half_day', label: 'Is Start Half Day?', type: 'checkbox' },
    { key: 'is_end_half_day', label: 'Is End Half Day?', type: 'checkbox' },
    { key: 'status', label: 'Status', type: 'chip' },
    { key: 'reason', label: 'Reason to apply for leave', type: 'description', render: row => row.reason },
    { key: 'rejection_reason', label: 'Rejection Reason (if applicable)', type: 'description', render: row => row.rejection_reason }
  ]

  const { data, loading, error, totalPages, count } = useGetEmployeeRequests(
    record?.id,
    'leave_requests',
    page - 1,
    searchTerm,
    perPage
  )

  const handleQueryChange = value => {
    setSearchTerm(value)
    setPage(1)
  }

  return (
    <div className='space-y-4'>
      <SearchInput
        value={searchTerm}
        onChange={handleQueryChange}
        placeholder='Search'
      />

      <DynamicTable
        columns={columns}
        data={data}
        footerInfo={`Requests out of ${count}`}
        currentPage={page}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        loading={loading}
        error={error}
      />
    </div>
  )
}

export default LeavesRecords
