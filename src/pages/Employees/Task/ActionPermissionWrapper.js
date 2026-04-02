import React, { useState} from 'react'
import CustomMenu from '../../../components/common/CustomMenu'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import AlertModal from '../../../components/common/Modal/AlertModal'
import {  useUpdateAssignedTask } from '../../../utils/hooks/api/useAssignedTasks'
import TaskIcon from '@mui/icons-material/Task';import PendingActionsIcon from '@mui/icons-material/PendingActions';
const ActionPermissionWrapper = ({ row, refetch }) => {
  const [openAcknowledge, setOpenAcknowledge] = useState(false)
  const [openPending, setOpenPending] = useState(false)
  const [openCompleted, setOpenCompleted] = useState(false)
  const {updateAssignedTask, updateLoading, updateError} = useUpdateAssignedTask()
  const onAcknowledge = async () => {
    await updateAssignedTask({ id: row?.id, changes: { status: 'acknowledged' }, refetch })
    closeAcknowledgeModal()
  }

  const onPending = async () => {
    await updateAssignedTask({ id: row?.id, changes: { status: 'Pending' }, refetch })
    closePendingModal()
  }
  const onCompleted = async () => {
    await updateAssignedTask({ id: row?.id, changes: { status: 'Completed' }, refetch })
    closeCompletedModal()
  }

  const openAcknowledgeModal = () => setOpenAcknowledge(true)
  const closeAcknowledgeModal = () => setOpenAcknowledge(false)

  const openPendingModal = () => setOpenPending(true)
  const closePendingModal = () => setOpenPending(false)

  const openCompletedModal = () => setOpenCompleted(true)
  const closeCompletedModal = () => setOpenCompleted(false)

  const items = [
    {
      label: 'Acknowledge',
      icon: <CheckCircleOutlineIcon fontSize='small' color='success' />,
      action: openAcknowledgeModal,
      className: '!text-success',
      disabled: row?.status.toLowerCase() === 'acknowledged' || row?.status.toLowerCase() === 'completed' || row?.status.toLowerCase() === 'pending'
    },
    {
      label: 'Pending',
      icon: <PendingActionsIcon fontSize='small' color='warning' />,
      action: openPendingModal,
      danger: false,
      disabled: row?.status.toLowerCase() === 'pending' || row?.status.toLowerCase() === 'completed'
    },
    {
      label: 'Completed',
      icon: <TaskIcon fontSize='small' color='success' />,
      action: openCompletedModal,
      danger: false,
      disabled: row?.status.toLowerCase() === 'completed'
    }
  ]

  return (
    <React.Fragment>
      <CustomMenu items={items} />

      
      <AlertModal
        onConfirm={onAcknowledge}
        open={openAcknowledge}
        onClose={closeAcknowledgeModal}
        type='confirm'
        title={'Acknowledge Task'}
        description={'Are you sure you want to Acknowledge this task?'}
        loading={updateLoading}
        buttonTitle='Acknowledge'
      />
      <AlertModal
        onConfirm={onPending}
        open={openPending}
        onClose={closePendingModal}
        type='confirm'
        title={'Pending Task'}
        description={'Are you sure you want to Pending this task?'}
        loading={updateLoading}
        buttonTitle='Pending'
      />
      <AlertModal
        onConfirm={onCompleted}
        open={openCompleted}
        onClose={closeCompletedModal}
        type='confirm'
        title={'Complete Task'}
        description={'Are you sure you want to Complete this task?'}
        loading={updateLoading}
        buttonTitle='Complete'
      />
      
    </React.Fragment>
  )
}

export default ActionPermissionWrapper
