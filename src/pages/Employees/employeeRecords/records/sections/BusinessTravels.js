import React, { useState } from 'react'
import SearchInput from '../../../../../components/common/searchField'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import { useGetEmployeeRequests } from '../../../../../utils/hooks/api/employeeRecords'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'

const BusinessTravels = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const { record } = useEmployeeRecord()

  const columns = [
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'from_date', label: 'From Date' },
    { key: 'to_date', label: 'To Date' },
    { key: 'amount_due', label: 'Amount Due' },
    { key: 'status', label: 'Status', type: 'chip' },
    {
      key: 'business_travel_definition',
      label: 'Travel Definition',
      type: 'description',
      render: row => row.business_travel_definition
    }
  ]

  const { data, loading, error, totalPages, count } = useGetEmployeeRequests(
    record?.id,
    'business_travels',
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

export default BusinessTravels
