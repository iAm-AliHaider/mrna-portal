import { useField } from 'formik'
import CheckboxField from './CheckboxField'

const FormikCheckbox = ({
  name: fieldName,
  required = false,
  handleChange = null,
  checked = null,
  ...fieldProps
}) => {
  const [field, meta, helpers] = useField({
    name: fieldName,
    type: 'checkbox'
  })

  const isErrorField = meta.touched && meta.error

  const handleCheckboxChange = event => {
    if (handleChange) {
      handleChange(event.target.checked)
      return
    }
    helpers.setValue(!field.value)
  }

  return (
    <div className='mt-3'>
      <CheckboxField
        {...field}
        {...fieldProps}
        name={fieldName}
        checked={checked !== null ? checked : field.value}
        onChange={handleCheckboxChange}
      />
      {isErrorField && (
        <p className='text-[#D32F2F] text-xs pl-2'>{meta.error}</p>
      )}
    </div>
  )
}

export default FormikCheckbox
