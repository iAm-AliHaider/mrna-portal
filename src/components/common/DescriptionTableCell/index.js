import React from 'react'
import Modal from '../Modal'

const DescriptionTableCell = ({ description }) => {
  const [showModal, setShowModal] = React.useState(false)

  if (!description) {
    return '-'
  }

  const handleShowModal = e => {
    e.stopPropagation();
    setShowModal(true)
  }

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setShowModal(false)
  }

  return (
    <React.Fragment>
       <div
        className="flex items-center space-x-2"
        // onClick={handleShowModal}
      >
        <span
          className="truncate w-32 h-12"
          title={description}
        >
          {description}
        </span>
      </div>
      <Modal title='Detailed View' open={showModal} onClose={handleCloseModal}>
        <div className='p-4'>
          <p className='text-gray-700'>{description}</p>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default DescriptionTableCell
