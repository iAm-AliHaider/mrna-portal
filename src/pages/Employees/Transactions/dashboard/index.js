'use client'

import { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import SearchInput from '../../../../components/common/searchField'

const columns = [
  { key: 'readNew', label: 'ReadNew', type: 'badge' },
  { key: 'reference_no', label: 'Reference No.', type: 'html' },
  { key: 'title', label: 'Subject', type: 'html' },
  { key: 'views', label: 'Views', type: 'html' },
  { key: 'likes', label: 'Likes', type: 'html' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'active_date', label: 'Active Date', type: 'date' },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { key: 'updated_at', label: 'Updated On', type: 'date' },
  { key: 'created_by_id', label: 'Created By', type: 'html' },
]

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Transactions' },
]

const staticAnnouncements = [
  {
    id: 1,
    readNew: 'New',
    reference_no: 'REF-001',
    title: 'Company Holiday Schedule 2024',
    views: 150,
    likes: 45,
    status: 'Active',
    active_date: '2024-01-01',
    expiry_date: '2024-12-31',
    updated_at: '2024-01-15',
    created_by_id: 'John Smith',
  },
  {
    id: 2,
    readNew: 'Read',
    reference_no: 'REF-002',
    title: 'New Office Policy Update',
    views: 200,
    likes: 78,
    status: 'Active',
    active_date: '2024-02-01',
    expiry_date: '2024-12-31',
    updated_at: '2024-02-10',
    created_by_id: 'Sarah Johnson',
  },
  {
    id: 3,
    readNew: 'New',
    reference_no: 'REF-003',
    title: 'Team Building Event',
    views: 120,
    likes: 35,
    status: 'Inactive',
    active_date: '2024-03-01',
    expiry_date: '2024-03-15',
    updated_at: '2024-02-28',
    created_by_id: 'Mike Wilson',
  },
  {
    id: 4,
    readNew: 'Read',
    reference_no: 'REF-004',
    title: 'System Maintenance Notice',
    views: 180,
    likes: 25,
    status: 'Active',
    active_date: '2024-02-15',
    expiry_date: '2024-02-16',
    updated_at: '2024-02-14',
    created_by_id: 'IT Department',
  },
  {
    id: 5,
    readNew: 'New',
    reference_no: 'REF-005',
    title: 'Annual Performance Review',
    views: 250,
    likes: 90,
    status: 'Active',
    active_date: '2024-03-01',
    expiry_date: '2024-03-31',
    updated_at: '2024-02-25',
    created_by_id: 'HR Department',
  },
]

const TransactionDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [loading, setLoading] = useState(false)

  const filteredAnnouncements = staticAnnouncements.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reference_no.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedData = filteredAnnouncements.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalPages = Math.ceil(filteredAnnouncements.length / perPage)
  const count = filteredAnnouncements.length

  return (
    <PageWrapperWithHeading title="Dashboard" items={breadcrumbItems}>
      {/* Status Cards Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['Active', 'Upcoming', 'Expired'].map((label) => (
          <div key={label} className="shadow-md rounded-lg">
            <div className="bg-primary text-center py-2 rounded-t-lg">
              <div className="text-sm font-semibold text-white">{label}</div>
            </div>
            <div className="py-4 px-8 flex justify-between items-center">
              <div className="text-center">
                <div className="text-xl text-black font-medium">1</div>
                <div className="text-xs text-gray-500">General</div>
              </div>
              <div className="h-8 w-px bg-black" />
              <div className="text-center">
                <div className="text-xl text-black font-medium">1</div>
                <div className="text-xs text-gray-500">Mandatory</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Announcements Section */}
      <div className="bg-primary text-white p-3 text-center rounded-t-lg">
        <h1 className="text-lg font-semibold">All Transactions</h1>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        <DynamicTable
          columns={columns}
          data={paginatedData}
          onSelectChange={setSelectedIds}
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
          loading={loading}
          footerInfo={`Showing ${paginatedData.length} of ${count} announcements`}
        />
      </div>
    </PageWrapperWithHeading>
  )
}

export default TransactionDashboard
