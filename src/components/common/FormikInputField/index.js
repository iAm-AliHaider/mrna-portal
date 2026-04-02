import { useField } from 'formik'
import InputField from './Input'

const FormikInputField = ({
  name: fieldName,
  ...fieldProps
}) => {
  const [field, meta] = useField(fieldName)

  const isErrorField =  meta.error



  return (
    <div>
      <InputField name={fieldName} {...field} {...fieldProps} isErrorField={isErrorField} />
      {isErrorField && <p className='text-[#D32F2F] text-xs pl-2 mt-1'>{meta.error}</p>}
    </div>
  )
}

export default FormikInputField
