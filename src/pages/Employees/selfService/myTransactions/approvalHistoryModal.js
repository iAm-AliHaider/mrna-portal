import React from 'react'
import Modal from '../../../../components/common/Modal'
import SubmitButton from '../../../../components/common/SubmitButton'
import ApprovalStepper from '../../../../components/common/ApprovalHistory'

const ApprovalHistoryModal = ({
  open,
  onClose,
  title = 'Approval History',
  data = {}
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
        <ApprovalStepper {...data} />
      <div className='mt-4 flex justify-end space-x-3'>
        <SubmitButton
          variant='outlined'
          onClick={onClose}
          title='Cancel'
          type='button'
        />
      </div>
    </Modal>
  )
}

export default ApprovalHistoryModal
