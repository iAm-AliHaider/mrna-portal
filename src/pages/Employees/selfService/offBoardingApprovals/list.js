import React, { useState } from 'react'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SelectField from '../../../../components/common/SelectField'
import SearchField from '../../../../components/common/searchField'
import CustomMenu from '../../../../components/common/CustomMenu'
import { useFinalEmploymentCalls } from '../../../../utils/hooks/api/offBoardingRequests'
import { STATUS_FILTER_OPTIONS } from '../../../../utils/constants'
import AlertModal from '../../../../components/common/Modal/AlertModal'
import { useApproveRequest, useOffBoardingApprovalsRequests, useRejectRequest } from '../../../../utils/hooks/api/offBoardingApprovals'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Off-Boarding Request' }
]

const OffBoardingApprovalsPage = () => {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('')
  const [modalAction, setModalAction] = useState(null);

  const { eligibleToCancel } = useFinalEmploymentCalls()

  const employment_type_ids =
    eligibleToCancel?.map(r => r.employmentTypeId) || []

  const { offBoardingData, totalPages, loading, refetch } =
    useOffBoardingApprovalsRequests({
      page,
      rowsPerPage: perPage,
      searchQuery,
      status,
      employment_type_ids
    })

    const {rejectRequest, loading: loadingReject } = useRejectRequest()
    const {approveRequest, loading: loadingApprove } = useApproveRequest()

  const columns = [
    {
      key: 'Employee',
      label: 'Employee',
      type: 'custom',
      render: row =>
        `${row?.employee_info?.employee?.candidate?.first_name || ''} ${
          row?.employee_info?.employee?.candidate?.family_name || ''
        }`
    },
    { key: 'termination_date', label: 'Termination Date' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', type: 'chip' },
    {
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'Approve',
              icon: <CheckCircleOutlineIcon fontSize='small' />,
              action: () => openApprove(row?.id),
              className: '!text-success',
              disabled: row?.status !== 'pending'
            },
            {
              label: 'Reject',
              icon: <HighlightOffIcon fontSize='small' />,
              action: () => openReject(row?.id),
              className: '!text-danger',
              danger: true,
              disabled: row?.status !== 'pending'
            }
          ]}
        />
      )
    }
  ]

  const openApprove = (id) => setModalAction({ type: 'approve', id });
  const openReject  = (id) => setModalAction({ type: 'reject',  id });

  const closeModal = () => setModalAction(null);

  const handleConfirm = async () => {
    if (!modalAction) return;
    const { type, id } = modalAction;
    try {
      if (type === 'approve') {
        await approveRequest(id);
      } else {
        await rejectRequest(id);
      }
      refetch();
    } finally {
      closeModal();
    }
  };

  const isOpen     = modalAction !== null;
  const isApprove  = modalAction?.type === 'approve';
  const loadingModal    = isApprove ? loadingApprove : loadingReject;
  const title      = isApprove
    ? 'Approve Off-Boarding Request'
    : 'Reject Off-Boarding Request';
  const description = isApprove
    ? 'Are you sure you want to approve this off-boarding request?'
    : 'Are you sure you want to reject this off-boarding request?';
  const buttonTitle = isApprove ? 'Approve' : 'Reject';
  const type       = isApprove ? 'confirm' : 'danger';



  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Off-Boarding Approvals'
        items={breadcrumbItems}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField value={searchQuery} onChange={setSearchQuery} />
            <div className='flex gap-4'>
              <div className='w-[300px]'>
                <SelectField
                  options={STATUS_FILTER_OPTIONS}
                  onChange={setStatus}
                  value={status}
                  placeholder='Status'
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={offBoardingData}
            onAction={() => {}}
            footerInfo={`Off-Boarding Requests out of ${offBoardingData?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <AlertModal
        open={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        type={type}
        title={title}
        description={description}
        buttonTitle={buttonTitle}
        loading={loadingModal}
      />
    </React.Fragment>
  )
}

export default OffBoardingApprovalsPage
