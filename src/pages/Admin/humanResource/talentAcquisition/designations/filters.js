import React from 'react'
import { TextField, MenuItem, Box } from '@mui/material'

const ListFilter = ({ values, label, options, handleChange, placeholder }) => {
  return (
    <Box sx={{ minWidth: 200 }}>
      <TextField
        select
        label={label}
        value={values.designation_code || ''}
        onChange={(e) => handleChange('designation_code', e.target.value)}
        placeholder={placeholder}
        fullWidth
        size="small"
        sx={{ minWidth: 200 }}
      >
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

export default ListFilter 