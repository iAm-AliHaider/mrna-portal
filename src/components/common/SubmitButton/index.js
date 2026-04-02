import React, { useMemo } from 'react'
import { CircularProgress } from '@mui/material'

const BUTTON_VARIANT = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'danger',
  warning: 'warning',
  success: 'success'
}

const BUTTON_SIZE = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
  '3xl': '3xl',
  '4xl': '4xl',
  '5xl': '5xl'
}

const SubmitButton = ({
  variant = BUTTON_VARIANT.primary,
  size = BUTTON_SIZE.md,
  Icon,
  className = '',
  disabled,
  isLoading = false,
  fullWidth = false,
  children,
  title = 'Submit',
  ...rest
}) => {
  const defaultButtonClasses =
    'rounded-lg border flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition'

  const buttonVariantClasses = useMemo(() => {
    switch (variant) {
      case BUTTON_VARIANT.primary:
        return 'bg-primary text-white border-primary hover:bg-primary/90'
      case BUTTON_VARIANT.secondary:
        return 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
      case BUTTON_VARIANT.danger:
        return 'bg-red-600 text-white border-red-600 hover:bg-red-700'
      case BUTTON_VARIANT.warning:
        return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
      case BUTTON_VARIANT.success:
        return 'bg-success-500 text-white border-success-500 hover:bg-success-600'
      default:
        return ''
    }
  }, [variant])

  const buttonSizeClasses = useMemo(() => {
    switch (size) {
      case BUTTON_SIZE.xs:
        return 'px-2 py-1 text-xs'
      case BUTTON_SIZE.sm:
        return 'px-3 py-1.5 text-sm'
      case BUTTON_SIZE.md:
        return 'px-4 py-2 text-sm'
      case BUTTON_SIZE.lg:
        return 'px-5 py-2.5 text-base'
      case BUTTON_SIZE.xl:
        return 'px-6 py-3 text-base'
      case BUTTON_SIZE['2xl']:
        return 'px-7 py-3.5 text-lg'
      case BUTTON_SIZE['3xl']:
        return 'px-8 py-4 text-lg'
      case BUTTON_SIZE['4xl']:
        return 'px-9 py-4.5 text-xl'
      case BUTTON_SIZE['5xl']:
        return 'px-10 py-5 text-xl'
      default:
        return ''
    }
  }, [size])

  const iconSize = useMemo(() => {
    if ([BUTTON_SIZE.xs, BUTTON_SIZE.sm].includes(size)) return 14
    if ([BUTTON_SIZE.md, BUTTON_SIZE.lg].includes(size)) return 18
    if ([BUTTON_SIZE.xl, BUTTON_SIZE['2xl']].includes(size)) return 22
    return 24
  }, [size])

  return (
    <button
      {...rest}
      disabled={isLoading || disabled}
      className={`
        ${defaultButtonClasses}
        ${buttonVariantClasses}
        ${buttonSizeClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <CircularProgress size={iconSize} color='inherit' />
      ) : (
        Icon && <Icon size={iconSize} />
      )}
      <span>{title}</span>
    </button>
  )
}

export default SubmitButton
