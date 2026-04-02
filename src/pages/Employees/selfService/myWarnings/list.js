import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SearchField from '../../../../components/common/searchField'
import SelectField from '../../../../components/common/SelectField'
import {
  useMyWarningsList
} from '../../../../utils/hooks/api/warningRequest'
import { useUser } from '../../../../context/UserContext'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Warning Letter' }
]

const MyWarningsPage = () => {
  const { user } = useUser()
  const employeeId = user?.id
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: ""
  })

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filter changes
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0); // Reset page when searching
  };

  const { warningData, totalPages, loading } = useMyWarningsList(
    page,
    searchQuery,
    filters,
    perPage
  )

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'effected_date', label: 'Effected Date' },
    { key: 'warning', label: 'Warning', type: 'description', render: row => row?.warning },
    {
      key: 'attachment',
      label: 'Attachment',
      type: 'custom',
      render: row =>
        row.attachment ? (
          <Button
            variant='outlined'
            size='small'
            onClick={() => window.open(row.attachment, '_blank')}
          >
            View Attachment
          </Button>
        ) : (
          '-'
        )
    },
    { key: 'status', label: 'Status', type: 'chip' }
  ]

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Warning Letter'
        items={breadcrumbItems}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField 
              value={searchQuery} 
              onChange={handleSearch}
              placeholder="Search here..."
            />
            <div className="w-[300px]">
              <SelectField 
                options={statusOptions} 
                placeholder="Status" 
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={warningData}
            // showCheckbox={true}
            // onSelectChange={ids => setSelectedIds(ids)}
            onAction={() => {}}
            footerInfo={`Showing ${warningData.length} warnings out of ${warningData.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  )
}

export default MyWarningsPage
