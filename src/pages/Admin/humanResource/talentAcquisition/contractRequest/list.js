import React, { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import { useNavigate } from 'react-router-dom'

import { Button } from '@mui/material'
import PageWrapperWithHeading from '../../../../../components/common/PageHeadSection'
import SearchInput from '../../../../../components/common/searchField'
import SelectField from '../../../../../components/common/SelectField'
import { STATUS_FILTER_OPTIONS } from '../../../../../utils/constants'
import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import DownloadAttachmentsModal from '../../../../../components/common/downloadAttachmentsModal'
import CustomMenu from '../../../../../components/common/CustomMenu'
import { useContractsList } from '../../../../../utils/hooks/api/contract'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Offer Request Approvals' }
]

const ContractsList = () => {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('')
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false)
  const [attachmentOptions, setAttachmentOptions] = useState([])

  const navigate = useNavigate()

  const { data, loading, totalPages } = useContractsList({
    page,
    perPage,
    status,
    searchQuery
  })


  const handleRegenerate = async row => {
    navigate(
      `/admin/human-resource/talent-aquisition/contracts-list/${row.id}/regenerate`
    )
  }

  const openAttachmentsModal = (attachments = []) => {
    setAttachmentOptions(
      attachments.map(url => ({
        label: decodeURIComponent(url.split('/').pop()),
        value: url
      }))
    )
    setAttachmentModalOpen(true)
  }


  const columns = [
    {
      key: 'Candidate',
      label: 'Candidate',
      type: 'custom',
      render: row =>
        `${row?.candidate?.first_name || ''} ${row?.candidate?.second_name || ''} ${row?.candidate?.third_name || ''} ${row?.candidate?.forth_name || ''} ${row?.candidate?.family_name || ''}`
    },
    { key: 'status', label: 'Status', type: 'chip' },
    {
      key: 'rejected_reason',
      label: 'Rejected Reason',
      type: 'description',
      render: row => row.rejection_reason || ''
    },
    {
      key: 'attachments',
      label: 'Attachments',
      type: 'custom',
      render: row => (
        <Button
          size='small'
          variant='outlined'
          onClick={() => openAttachmentsModal(row.attachments || [])}
          disabled={
            !row.attachments ||
            row.attachments.length === 0 ||
            [
              'pending',
              'declined',
            ].includes(row.status)
          }
        >
          View
        </Button>
      )
    },
    // {
    //   key: 'actions',
    //   type: 'custom',
    //   label: 'Actions',
    //   render: row => {
    //     const menu = [
    //       {
    //         label: 'Regenerate Offer',
    //         icon: <SyncAltIcon fontSize='small' />,
    //         action: () => handleRegenerate(row),
    //         className: '!text-orange-500',
    //         disabled: row.status === 'pending' || row.status === 'accepted'
    //       }
    //     ]

    //     return <CustomMenu items={menu} />
    //   }
    // }
  ]

  const handleAddContract = () => {
    navigate('/admin/human-resource/talent-aquisition/contracts-list/create')
  }



  return (
    <>
      <PageWrapperWithHeading
        title='Contract Request Approvals'
        items={breadcrumbItems}
        action={handleAddContract}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
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
            data={data}
            footerInfo={`Offer Requests out of ${data?.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
      <DownloadAttachmentsModal
        open={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachmentOptions={attachmentOptions}
      />
    </>
  )
}

export default ContractsList
