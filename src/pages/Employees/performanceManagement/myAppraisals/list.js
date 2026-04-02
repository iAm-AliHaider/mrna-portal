// AppraisalsPage.js
import React, { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import SearchField from '../../../../components/common/searchField'
import CustomMenu from '../../../../components/common/CustomMenu'
import { useNavigate } from 'react-router-dom'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { useGetMyAppraisals } from '../../../../utils/hooks/api/appraisal'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Performance Management' },
  { title: 'My Appraisals' }
]

const MyAppraisalsReviewList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()

  const { appraisals, loading, count, totalPages } = useGetMyAppraisals(
    currentPage - 1,
    perPage,
    searchQuery
  )

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      type: 'custom',
      render: row =>
        `${row?.employee?.candidates?.first_name || ''} ${
          row?.employee?.candidates?.family_name || ''
        }`
    },
    {
      key: 'type',
      label: 'Appraisal Type',
      type: 'custom',
      render: row => <span className='capitalize'>{row?.type}</span>
    },
    { key: 'score', label: 'Score' },
    {
      key: 'review_by',
      label: 'Reviewed By',
      type: 'custom',
      render: row =>
        `${row?.reviewer?.candidates?.first_name || ''} ${
          row?.reviewer?.candidates?.family_name || ''
        }`
    },
    { key: 'status', label: 'Status', type: 'chip' },
    {
      key: 'comments',
      label: 'Comments',
      type: 'description',
      render: row => row?.comments
    },
    {
      key: 'my_response',
      label: 'My Response',
      type: 'description',
      render: row => row?.response
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      render: row => {
        return (
          <CustomMenu
            items={[
              {
                label: 'View / Feedback',
                icon: <RemoveRedEyeIcon fontSize='small' />,
                disabled:
                  !row?.comments || row.status.toLowerCase() === 'pendig',
                action: () =>
                  navigate(
                    `/performance/my-appraisals/view-report/${row?.id}`,
                    { state: { hasResponse: row?.response } }
                  )
              }
            ]}
          />
        )
      }
    }
  ]

  const handleSearch = value => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Appraisals Review List'
        items={breadcrumbItems}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <SearchField value={searchQuery} onChange={handleSearch} />
          </div>

          <DynamicTable
            columns={columns}
            data={appraisals}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={p => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            footerInfo={`Showing ${appraisals?.length} out of ${count}`}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  )
}

export default MyAppraisalsReviewList
