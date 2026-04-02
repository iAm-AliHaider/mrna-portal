import React, { useState } from 'react'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import SearchInput from '../../../../../components/common/searchField'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'
import { useGetEmployeeRequests } from '../../../../../utils/hooks/api/employeeRecords'

const VacationRequest = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const { record } = useEmployeeRecord()

  const columns = [
    { key: 'status', label: 'Status', type: 'chip' },
    {
      key: 'employee_number',
      label: 'Employee Number',
      type: 'custom',
      render: () => record?.employee_code
    },
    {
      key: 'employee_name',
      label: 'Employee Name',
      type: 'custom',
      render: () => record?.candidates?.first_name
    },
    { key: 'vacation_type', label: 'Type' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'return_date', label: 'Return Date' },
    { key: 'actual_return_date', label: 'Actual Return Date' },
    { key: 'last_returned_date', label: 'Last Returned Date' },
    { key: 'paid_days', label: 'No. of Days' },
    { key: 'unpaid_days', label: 'Unpaid Days' },
    { key: 'task_list_status', label: 'Task List Status', type: 'chip' },
    { key: 'description', label: 'Description', type: 'description', render: row => row?.description }
  ]

  const { data, loading, error, totalPages, count } = useGetEmployeeRequests(
    record?.id,
    'vacation_requests',
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

export default VacationRequest
