import React from 'react'
import { CheckCircle, Close as CloseIcon } from '@mui/icons-material'
import Modal from '../../../../components/common/Modal'
import SubmitButton from '../../../../components/common/SubmitButton'

const ReminderModal = ({
  open,
  onClose,
  title = 'Approval Reminder',
  description = 'Do you realy want to give a reminder to the manager about the approval?',
  onSendReminder,
  loading = false
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className='text-gray-700'>{description}</p>

      <div className='mt-4 flex justify-end space-x-3'>
        <SubmitButton
          variant='outlined'
          onClick={onClose}
          Icon={CloseIcon}
          title='Cancel'
          type='button'
        />

        <SubmitButton
          onClick={onSendReminder}
          disabled={loading}
          isLoading={loading}
          Icon={CheckCircle}
          title='Send Reminder'
          type='submit'
        />
      </div>
    </Modal>
  )
}

export default ReminderModal
