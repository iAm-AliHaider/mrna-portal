import React from 'react'
import CustomMenu from '../../../../components/common/CustomMenu'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import SyncAltIcon from '@mui/icons-material/SyncAlt'

const OfferRequestActions = ({
  row,
  user,
  openApprove,
  openReject,
  handleRegenerate
}) => {
  let disable = false

  if (user?.role === 'hr_manager' && row.status === 'pending_manager') {
    disable = true
  }
  if (user?.role === 'manager' && row.status === 'pending_hr_manager') {
    disable = true
  }
  if (
    user?.role === 'hr' ||
    row.status === 'approved' ||
    row.status === 'rejected' ||
    row.status === 'declined' ||
    row.status === 'accepted'
  ) {
    disable = true
  }

  const menu = [
    {
      label: 'Approve',
      icon: <CheckCircleOutlineIcon fontSize='small' />,
      action: () => openApprove(row),
      className: '!text-success',
      disabled: disable
    },
    {
      label: 'Reject',
      icon: <HighlightOffIcon fontSize='small' />,
      action: () => openReject(row),
      className: '!text-danger',
      danger: true,
      disabled: disable
    }
  ]

  if (
    [
      'rejected_by_manager',
      'rejected_by_hr_manager',
      'rejected',
      'declined'
    ].includes(row.status) &&
    user?.role === 'hr'
  ) {
    menu.push({
      label: 'Regenerate Offer',
      icon: <SyncAltIcon fontSize='small' />,
      action: () => handleRegenerate(row),
      className: '!text-orange-500'
    })
  }

  return <CustomMenu items={menu} />
}

export default OfferRequestActions
