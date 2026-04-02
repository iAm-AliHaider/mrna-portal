// AppraisalsPage.js
import React, { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import {
  useAllEmployees,
  useAppraisalsList,
  useCancelAppraisal
} from '../../../../utils/hooks/api/appraisal'
import CustomMenu from '../../../../components/common/CustomMenu'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useNavigate } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel'
import ActionModal from '../../../../components/common/ActionModal'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import SelectField from '../../../../components/common/SelectField'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Performance Management' },
  { title: 'Appraisals' }
]

const AppraisalsReviewList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [employeeId, setEmployeeId] = useState('')
  const [open, setOpen] = useState(null)

  const { employees, loading: empLoading } = useAllEmployees()

  const navigate = useNavigate()

  const { data, loading, count, totalPages, refetch } = useAppraisalsList(
    currentPage - 1,
    perPage,
    employeeId
  )

  const { cancel, loading: cancelLoading } = useCancelAppraisal()

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
      key: 'employee_response',
      label: 'Employee Response',
      type: 'description',
      render: row => row?.response
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'custom',
      render: row => {
        const menu = getMenu(row)
        return <CustomMenu items={menu} />
      }
    }
  ]

  const getMenu = row => {
    if (row?.comments && row.status.toLowerCase() !== 'pending') {
      return [
        {
          label: 'View',
          icon: <RemoveRedEyeIcon fontSize='small' />,
          action: () =>
            navigate(`/performance/appraisals/view-report/${row?.id}`)
        }
      ]
    }
    return [
      {
        label: 'Review/Assess',
        icon: <AssessmentIcon fontSize='small' />,
        action: () => navigate(`/performance/appraisals/review/${row?.id}`)
      },
      {
        label: 'Cancel',
        icon: <CancelIcon fontSize='small' />,
        action: () => setOpen(row?.id),
        danger: true
      }
    ]
  }

  const handleSearch = value => {
    setEmployeeId(value)
    setCurrentPage(1)
  }

  const handleClose = () => setOpen(null)

  const handleCancelApparaisal = async comments => {
    await cancel(open, comments)
    refetch()
    handleClose()
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Appraisals Review List'
        items={breadcrumbItems}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <div className='w-[300px]'>
              <SelectField
                options={employees}
                placeholder='Select Employee'
                getOptionLabel={option =>
                  `${option?.candidates?.first_name || ''} ${
                    option?.candidates?.family_name || ''
                  } (${option?.employee_code || ''})`
                }
                onChange={handleSearch}
                value={employeeId}
                loading={empLoading}
                selectKey='id'
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={p => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            footerInfo={`Showing ${data?.length} out of ${count}`}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <ActionModal
        loading={cancelLoading}
        type='danger'
        buttonTitle={'Cancel Apparaisal'}
        title={'Cancel Apparaisal'}
        description={
          'Are you sure you want to cancel this , If yes then add a reason to cancel this request?'
        }
        open={!!open}
        onClose={handleClose}
        onReject={handleCancelApparaisal}
      />
    </React.Fragment>
  )
}

export default AppraisalsReviewList
