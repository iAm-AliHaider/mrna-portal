// AppraisalsPage.js
import React, { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import HomeIcon from '@mui/icons-material/Home'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import AppraisalForm from './AppraisalForm'
import {
  useAllEmployees,
  useAppraisalsList
} from '../../../../utils/hooks/api/appraisal'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import CustomMenu from '../../../../components/common/CustomMenu'
import { useNavigate } from 'react-router-dom'
import SelectField from '../../../../components/common/SelectField'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Performance Management' },
  { title: 'Appraisals' }
]

const AppraisalsPage = () => {
  const [show, setShow] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState('')

  const { employees, loading: empLoading } = useAllEmployees()

  const { data, loading, count, totalPages, refetch } = useAppraisalsList(
    currentPage - 1,
    perPage,
    employeeId
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
        return (
          <CustomMenu
            items={[
              {
                label: 'View',
                icon: <RemoveRedEyeIcon fontSize='small' />,
                disabled:
                  !row?.comments || row.status.toLowerCase() === 'pending',
                action: () =>
                  navigate(`/performance/appraisals/view-report/${row?.id}`, {
                    state: { hasResponse: row?.response }
                  })
              }
            ]}
          />
        )
      }
    }
  ]

  const handleCreateNewAppraisal = () => setShow(true)

  const handleSearch = value => {
    setEmployeeId(value)
    setCurrentPage(1)
  }

  const handleClose = () => setShow(false)

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Appraisals'
        items={breadcrumbItems}
        action={handleCreateNewAppraisal}
        buttonTitle='Add New Appraisal'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-end w-full'>
            <div className='w-[400px]'>
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
      <AppraisalForm show={show} onClose={handleClose} refetch={refetch} />
    </React.Fragment>
  )
}

export default AppraisalsPage
