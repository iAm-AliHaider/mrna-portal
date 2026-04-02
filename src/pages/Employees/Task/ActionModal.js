import React, { useState } from 'react'
import Modal from '../../../../components/common/Modal'
import SubmitButton from '../../../../components/common/SubmitButton'
import InputField from '../../../components/common/FormikInputField/Input'

const ActionModal = ({
  open,
  onClose,
  title = 'Reject Request',
  description = '',
  onReject,
  loading = false
}) => {
  const [rejectReason, setRejectReason] = useState('')

  const handleChange = e => {
    setRejectReason(e.target.value)
  }

  const handleReject = () => {
    onReject(rejectReason)
  }


  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className='text-gray-700 text-lg'>Please add reason for rejection.</p>
      <InputField
        label='Reject Reason'
        value={rejectReason}
        onChange={handleChange}
        required
        rows={4}
      />
      <div className='mt-4 flex justify-center items-center gap-12'>
        <SubmitButton
          type='button'
          onClick={onClose}
          variant='secondary'
          title='Cancel'
        />
        <SubmitButton
          variant='danger'
          onClick={handleReject}
          isLoading={loading}
          title='Reject'
          type='button'
        />
      </div>
    </Modal>
  )
}

export default ActionModal
