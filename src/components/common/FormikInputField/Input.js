import React, { useState, memo, useCallback } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'

const InputField = memo(function InputField({
  label,
  className = '',
  required = false,
  Icon,
  rows = 1,
  type = 'text',
  isErrorField = false,
  ...fieldProps
}) {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type

  const handleToggle = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return (
    <>
      {label && (
        <div className='flex items-center gap-2'>
          <label className='text-xs sm:text-sm dark-color'>
            {label}
            {required && <span className='text-red-500'>*</span>}
          </label>
        </div>
      )}
      <div
        className={`border ${
          rows <= 1 ? 'h-[48px]' : ''
        } ${fieldProps.disabled ? 'bg-gray-100' : 'bg-white'} border-gray-200 rounded-xl p-2 flex items-center justify-between`}
        style={{ border: isErrorField ? '1px solid #D32F2F' : undefined }}
      >
        {rows > 1 ? (
          <textarea
            {...fieldProps}
            rows={rows}
            className={`w-full outline-none placeholder:text-gray-300 placeholder:text-xs placeholder:font-extralight ${className}`}/>
        ) : (
          <input
            {...fieldProps}
            type={inputType}
            className={`w-full outline-none placeholder:text-gray-300 placeholder:text-xs placeholder:font-extralight ${className}`}
          />
        )}
        {type === 'password' ? (
          showPassword ? (
            <VisibilityOffOutlinedIcon
              className='text-gray-300 cursor-pointer'
              onClick={handleToggle}
              fontSize='small'
            />
          ) : (
            <VisibilityOutlinedIcon
              className='text-gray-300 cursor-pointer'
              onClick={handleToggle}
              fontSize='small'
            />
          )
        ) : null}
        {Icon && type !== 'password' && (
          <Icon className='text-gray-300' fontSize='small' />
        )}
      </div>
    </>
  )
})

export default InputField
