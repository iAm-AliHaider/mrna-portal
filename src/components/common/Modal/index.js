import React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const Modal = ({ open, onClose, title = '', children, headless = false }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth='lg'>
      {!headless && (
        <DialogTitle
          className={`!pr-8 !pb-1 flex ${
            title ? 'justify-between' : 'justify-end'
          } items-center`}
        >
          {title}
          <IconButton
            aria-label='close'
            onClick={onClose}
            size='large'
            className='ml-auto'
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent dividers className='space-y-4'>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
