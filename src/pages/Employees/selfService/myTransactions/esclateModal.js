import React from 'react'
import { CheckCircle, Close as CloseIcon } from '@mui/icons-material'
import Modal from '../../../../components/common/Modal'
import SubmitButton from '../../../../components/common/SubmitButton'

const EscalateModal = ({
  open,
  onClose,
  title = 'Escalate Request',
  description = 'Do you realy want to escalate the request?',
  onEsclate,
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
          onClick={onEsclate}
          isLoading={loading}
          Icon={CheckCircle}
          title='Escalate'
          type='submit'
        />
      </div>
    </Modal>
  )
}

export default EscalateModal
