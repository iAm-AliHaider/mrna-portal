import React, { useState } from 'react'
import SearchInput from '../../../../../components/common/searchField'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import { useGetEmployeeRequests } from '../../../../../utils/hooks/api/employeeRecords'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'

const OfficialLetters = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(4)

  const { record } = useEmployeeRecord()

  const columns = [
    { key: "letter_type", label: "Letter Type" },
    { key: "reference_number", label: "Reference Number" },
    { key: "letter_date", label: "Letter Date" },
    { key: "letter_destination", label: "Destination", type: "description", render: row => row?.letter_destination },
    { key: "reason", label: "Reason", type: "description", render: row => row?.reason },
    { key: "status", label: "Status", type: "chip" },
  ];

  const { data, loading, error, totalPages, count } = useGetEmployeeRequests(
    record?.id,
    'official_letters',
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
        placeholder='Search Reference Number'
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

export default OfficialLetters
