import React, { useEffect, useState } from 'react'
import Modal from '../Modal'
import SubmitButton from '../SubmitButton'

const DownloadAttachmentsModal = ({ open, onClose, attachmentOptions = [] }) => {
  const [selectedAttachments, setSelectedAttachments] = useState([])

  useEffect(() => {
    setSelectedAttachments([])
  }, [attachmentOptions])

  const handleDownloadSelected = () => {
    selectedAttachments.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = url
        link.download = url.split('/').pop()
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 300)
    })
  
    const totalDelay = selectedAttachments.length * 300
    setTimeout(() => {
      onClose()
    }, totalDelay + 500)
  }

  const handleClose = () => {
    setSelectedAttachments([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Download Attachments">
      <div className="flex flex-col gap-2 mt-4">
        {attachmentOptions.length === 0 ? (
          <div className="text-gray-500">No attachments available.</div>
        ) : (
          attachmentOptions.map((item) => (
            <label key={item.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAttachments.includes(item.value)}
                onChange={(e) => {
                  const checked = e.target.checked
                  setSelectedAttachments((prev) =>
                    checked
                      ? [...prev, item.value]
                      : prev.filter((v) => v !== item.value)
                  )
                }}
              />
              {item.label}
            </label>
          ))
        )}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <SubmitButton
          type="button"
          onClick={handleClose}
          variant="secondary"
          title="Cancel"
        />
        <SubmitButton
          type="button"
          onClick={handleDownloadSelected}
          title="Download Selected"
          disabled={selectedAttachments.length === 0}
        />
      </div>
    </Modal>
  )
}

export default DownloadAttachmentsModal
