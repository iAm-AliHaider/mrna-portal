import React from 'react'
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import CheckboxField from '../../../../components/common/FormikCheckbox/CheckboxField'
import InputField from '../../../../components/common/FormikInputField/Input'

const LEAVES_TYPES = [
  { value: 'sick', label: 'Sick' },
  { value: 'casual', label: 'Casual' },
  { value: 'annual', label: 'Annual' },
  { value: '', label: 'all' }
]

const STATUS = [
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pending', label: 'Pending' },
  { value: '', label: 'all' }
]

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <React.Fragment>
      {/* <div className='flex flex-col justify-start items-start mt-2'>
        <span className='text-sm font-medium'>Leave Type</span>
        <RadioGroup
          name='type'
          value={values.type}
          onChange={event => handleChange('type', event.target.value)}
          className='flex !flex-row'
        >
          {LEAVES_TYPES.map((item, index) => {
            return (
              <FormControlLabel
                key={`${item.value}-${index}`}
                value={item.value}
                control={<Radio />}
                label={item.label}
              />
            )
          })}
        </RadioGroup>
      </div> */}
      <div className='flex gap-2 mt-2'>
        <div className='w-full'>
          <InputField
            label='Leave From'
            type='date'
            value={values.leave_from}
            name='leave_from'
            onChange={event => handleChange('leave_from', event.target.value)}
          />
        </div>
        <div className='w-full'>
          <InputField
            label='Leave To'
            type='date'
            value={values.leave_to}
            name='leave_to'
            onChange={event => handleChange('leave_to', event.target.value)}
          />
        </div>
      </div>
      <div className='flex gap-6'>
        <CheckboxField
          onChange={event => handleChange('is_start_half_day', event.target.checked)}
          label='Is Start Half Day?'
          checked={values.is_start_half_day}
          className='mt-3'
        />
        <CheckboxField
          onChange={event => handleChange('is_end_half_day', event.target.checked)}
          label='Is End Half Day?'
          checked={values.is_end_half_day}
          className='mt-3'
        />
      </div>
      {/* <div className='flex flex-col justify-start items-start mt-2'>
        <span className='text-sm font-medium'>Status</span>
        <RadioGroup
          name='status'
          value={values.status}
          onChange={event => handleChange('status', event.target.value)}
          className='flex !flex-row'
        >
          {STATUS.map((item, index) => {
            return (
              <FormControlLabel
                key={`${item.value}-${index}`}
                value={item.value}
                control={<Radio />}
                label={item.label}
              />
            )
          })}
        </RadioGroup>
      </div> */}
    </React.Fragment>
  )
}
export default ListFilter
