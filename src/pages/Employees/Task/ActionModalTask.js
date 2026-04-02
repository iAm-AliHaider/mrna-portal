import React, { useState } from 'react'
import CustomMenu from '../../../components/common/CustomMenu'
import TaskIcon from '@mui/icons-material/Task'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import AlertModal from '../../../components/common/Modal/AlertModal'
import { useUpdateAssignedTask } from '../../../utils/hooks/api/useAssignedTasks'

const ActionModalTask = ({ row, refetch }) => {
  const [openInProgress, setOpenInProgress] = useState(false)
  const [openCompleted, setOpenCompleted] = useState(false)

  const { updateAssignedTask, updateLoading } = useUpdateAssignedTask()

  const onInProgress = async () => {
    await updateAssignedTask({ id: row?.id, changes: { status: 'In Progress' }, refetch })
    setOpenInProgress(false)
  }

  const onCompleted = async () => {
    await updateAssignedTask({ id: row?.id, changes: { status: 'Completed' }, refetch })
    setOpenCompleted(false)
  }

  const items = [
    {
      label: 'In Progress',
      icon: <PendingActionsIcon fontSize='small' color='warning' />,
      action: () => setOpenInProgress(true),
      disabled: row?.status.toLowerCase() === 'in progress' || row?.status.toLowerCase() === 'completed'
    },
    {
      label: 'Completed',
      icon: <TaskIcon fontSize='small' color='success' />,
      action: () => setOpenCompleted(true),
      disabled: row?.status.toLowerCase() === 'completed'
    }
  ]

  return (
    <>
      <CustomMenu items={items} />

      <AlertModal
        onConfirm={onInProgress}
        open={openInProgress}
        onClose={() => setOpenInProgress(false)}
        type='confirm'
        title='Mark as In Progress'
        description='Are you sure you want to mark this task as In Progress?'
        loading={updateLoading}
        buttonTitle='In Progress'
      />

      <AlertModal
        onConfirm={onCompleted}
        open={openCompleted}
        onClose={() => setOpenCompleted(false)}
        type='confirm'
        title='Complete Task'
        description='Are you sure you want to mark this task as Completed?'
        loading={updateLoading}
        buttonTitle='Complete'
      />
    </>
  )
}

export default ActionModalTask
