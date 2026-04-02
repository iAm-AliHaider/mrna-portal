import React, { memo } from 'react'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { format, parseISO } from 'date-fns' // Ensure this is installed

const DatePickerInput = memo(function DatePickerInput({
  label,
  className = '',
  required = false,
  isErrorField = false,
  value,
  onChange,
  Icon = CalendarTodayIcon,
  formatOutput = 'dd/MM/yyyy', // Custom format
  ...fieldProps
}) {
  const handleChange = (e) => {
    const rawDate = e.target.value
    onChange?.(rawDate)
  }

  // Format the displayed value for custom output formatting (optional)
  const displayValue = value ? format(parseISO(value), formatOutput) : ''

  return (
    <>
      {label && (
        <div className='flex items-center gap-2 mb-1'>
          <label className='text-xs sm:text-sm dark-color'>
            {label}
            {required && <span className='text-red-500'>*</span>}
          </label>
        </div>
      )}
      <div
        className={`border h-[48px] ${
          fieldProps.disabled ? 'bg-gray-100' : 'bg-white'
        } border-gray-200 rounded-xl p-2 flex items-center justify-between`}
        style={{ border: isErrorField ? '1px solid #D32F2F' : undefined }}
      >
        <input
          {...fieldProps}
          type='date'
          value={value}
          onChange={handleChange}
          className={`w-full outline-none placeholder:text-gray-300 placeholder:text-xs placeholder:font-extralight ${className}`}
        />
        {Icon && (
          <Icon className='text-gray-300 ml-2' fontSize='small' />
        )}
      </div>
    </>
  )
})

export default DatePickerInput
