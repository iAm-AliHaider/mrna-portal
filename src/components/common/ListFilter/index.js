import React from 'react'
import SelectField from '../SelectField'
const ListFilter = ({ value, handleChange, options, placeholder, label }) => {
  return (
    <SelectField
      label={label}
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
    />
  )
}
export default ListFilter
