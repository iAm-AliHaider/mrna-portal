import React, { useState } from 'react'
import SearchInput from '../../../../../components/common/searchField'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import { useGetEmployeeRequests } from '../../../../../utils/hooks/api/employeeRecords'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'
import { format } from "date-fns";


const TicketRequest = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const { record } = useEmployeeRecord()

  const columns = [
    { key: "status", label: "Status", type: "chip" },
    { key: "employee_name", label: "Employee Name", type: "custom", render: () => record?.candidates?.first_name },
    {
      key: "created_at",
      label: "Date",
      type: "custom",
      render: (row) => row.created_at ? format(new Date(row.created_at), "dd-MM-yyyy") : "-",
    },
    {
      key: "adult_number_of_tickets",
      label: "No. ofTickets",
      type: "custom",
      render: (row) => (row?.adult_number_of_tickets || 0 + row?.child_number_of_tickets || 0),
    },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    { key: 'notes', label: 'Notes', type: 'description', render: row => row?.notes }
  ];

  const { data, loading, error, totalPages, count } = useGetEmployeeRequests(
    record?.id,
    'ticket_requests',
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

export default TicketRequest
