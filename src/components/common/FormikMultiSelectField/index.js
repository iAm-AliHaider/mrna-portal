import { useCallback, useEffect } from 'react'
import { useField } from 'formik'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const FormikMultiSelectField = ({
  name,
  label,
  options = [],
  placeholder,
  Icon,
  required = false,
  selectKey = 'value',
  getOptionLabel = option => option.label,
  onChange = null,
  disabled = false,
}) => {
  const [field, meta, helpers] = useField(name)

  const handleChange = useCallback(
    (_, selectedOptions) => {
      const selectedValues = selectedOptions.map(opt => opt[selectKey])
      if (onChange) {
        onChange(selectedValues)
      } else {
        helpers.setValue(selectedValues)
      }
    },
    [onChange, helpers, selectKey]
  )

  // Get current selected full objects
  const selectedOptions = options.filter(
    opt => Array.isArray(field.value) && field.value.includes(opt[selectKey])
  )

  // Remove selected options from dropdown list
  const filteredOptions = options.filter(
    opt => !field.value?.includes(opt[selectKey])
  )

  const isErrorField = Boolean(meta.error)

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm dark-color">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}
      <div className="relative">
        <Autocomplete
          multiple
          id={name}
          options={filteredOptions}
          getOptionLabel={getOptionLabel}
          value={selectedOptions}
          onChange={handleChange}
          disabled={disabled}
          isOptionEqualToValue={(option, value) => option[selectKey] === value[selectKey]}
          renderInput={params => (
            <TextField
              {...params}
              placeholder={placeholder}
              error={isErrorField}
              helperText={isErrorField ? meta.error : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: isErrorField ? '#FF0000' : 'rgb(229 231 235)',
                    borderWidth: 1,
                    transition: 'border-color 0.3s',
                  },
                  '&:hover fieldset': {
                    borderColor: isErrorField ? '#FF0000' : 'rgb(229 231 235)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isErrorField ? '#FF0000' : 'rgb(229 231 235)',
                    boxShadow: 'none',
                  },
                },
              }}
              InputProps={{
                ...params.InputProps,
                style: { minHeight: 48 },
              }}
            />
          )}
          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                borderWidth: '2px',
                borderColor: '#e2e8f0',
              },
            },
          }}
        />
        {Icon && (
          <span className="absolute right-4 top-4 pointer-events-none">
            <Icon size={20} color="#B5BDC8" />
          </span>
        )}
      </div>
    </div>
  )
}

export default FormikMultiSelectField
