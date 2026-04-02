import React from 'react'
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import SelectField from '../../../../../components/common/SelectField'
import InputField from '../../../../../components/common/FormikInputField/Input'
const ListFilter = ({ values, handleChange, options, placeholder, label }) => {
  return (
    <React.Fragment>
      <SelectField
        label={label}
        value={values.candidate_number}
        onChange={event => handleChange('candidate_number', event)}
        options={options}
        placeholder={placeholder}
      />
      <div
        className='flex flex-col justify-start
               items-start mt-2'
      >
        <span className='text-sm font-medium'>Filter by Date</span>
        <RadioGroup
          name='filter_date'
          value={values.filter_date}
          onChange={event => handleChange('filter_date', event.target.value)}
          className='flex !flex-row'
        >
          <FormControlLabel
            value='transaction-date'
            control={<Radio />}
            label='Transaction Date'
          />
          <FormControlLabel
            value='entery-date'
            control={<Radio />}
            label='Date of Entry'
          />
        </RadioGroup>
      </div>
      <div className='display flex flex-col gap-2 mt-2'>
        <InputField
          label='From Date'
          type='date'
          value={values.from_date}
          name='from_date'
          onChange={event => handleChange('from_date', event)}
        />
        <InputField
          label='To Date'
          type='date'
          value={values.to_date}
          name='to_date'
          onChange={event => handleChange('to_date', event)}
        />
      </div>
    </React.Fragment>
  )
}
export default ListFilter
