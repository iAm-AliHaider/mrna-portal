import React from 'react'
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import CheckboxField from '../../../../components/common/FormikCheckbox/CheckboxField'
import SelectField from '../../../../components/common/SelectField'
import InputField from '../../../../components/common/FormikInputField/Input'

const STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: '', label: 'all' }
]

const ListFilter = ({ values, handleChange, options }) => {
  return (
    <React.Fragment>
      <CheckboxField
        onChange={event => handleChange('is_approved', event.target.checked)}
        label='Show approved/rejected transactions'
        checked={values.is_approved}
        className='mt-3'
      />
      <div className='flex flex-col justify-start items-start mt-2'>
        <span className='text-sm font-medium'>Approval Status</span>
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
      </div>
      <SelectField
        label={'Filter by Transaction'}
        value={values.transaction_type}
        onChange={event => handleChange('transaction_type', event)}
        options={options}
        placeholder={'Filter by Transaction'}
      />
      <div className='display flex flex-col gap-2 mt-2'>
        <InputField
          label='Creation Date'
          type='date'
          value={values.creation_date}
          name='creation_at'
          onChange={event => handleChange('creation_date', event)}
        />
        <InputField
          label='Last Updated'
          type='date'
          value={values.last_update}
          name='last_update'
          onChange={event => handleChange('last_update', event)}
        />
      </div>
    </React.Fragment>
  )
}
export default ListFilter

