import { Checkbox } from '@mui/material'

const CheckboxField = ({ label, className, ...fieldProps }) => {
  return (
    <div className='mt-3'>
      <label className='flex items-center cursor-pointer'>
        <Checkbox {...fieldProps} className={`mr-2 ${className}`} />
        <span className='text-sm'>{label}</span>
      </label>
    </div>
  )
}

export default CheckboxField
