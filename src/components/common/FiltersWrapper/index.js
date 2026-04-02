import React, { useState } from 'react'
import { Button } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterModal from './Modal'

const FiltersWrapper = ({ resetFilters, onApplyFilters, children }) => {
  const [open, setOpen] = useState(false)

  const openModal = () => setOpen(true)
  const closeModal = () => {
    setOpen(false)
    resetFilters()
  }

  const applyFilter = () => {
    onApplyFilters()
    setOpen(false)
  }
  return (
    <React.Fragment>
      <Button
        variant='contained'
        startIcon={<FilterListIcon />}
        size='medium'
        sx={{ textTransform: 'none' }}
        onClick={openModal}
      >
        Filters
      </Button>

      <FilterModal
        open={open}
        onClose={closeModal}
        handleApply={applyFilter}
        title='Filters'
        description='Customize the filters below for more accurate results'
        onClear={resetFilters}
      >
        {children}
      </FilterModal>
    </React.Fragment>
  )
}

export default FiltersWrapper
