import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikSelectField from '../../../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../../../components/common/FormikInputField'
import FormikRadioGroup from '../../../../../../components/common/RadioGroup'
import SubmitButton from '../../../../../../components/common/SubmitButton'
import FileUploadField from '../../../../../../components/common/FormikFileUpload'
import IDTypeTable from './Table'

const idTypeOptions = [
  { label: 'Iqama', value: 'iqama' },
  { label: 'Passport', value: 'passport' }
]

const departmentOptions = [
  { label: 'Network Services', value: 'network_services' },
  { label: 'IT', value: 'it' }
]

const attachmentCategoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Specific', value: 'specific' }
]

const initialValues = {
  idNumber: '',
  idType: '',
  issuePlace: '',
  issueDate: '',
  expiryDate: '',
  hijriIssueDate: '',
  hijriExpiryDate: '',
  categoryType: '',
  forDepartment: 'network_services',
  status: 'active',
  description: '',
  attachmentCategory: '',
  file: null
}

const validationSchema = Yup.object({
  idNumber: Yup.string().required('Required'),
  idType: Yup.string().required('Required'),
  description: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
      return !value || value.trim().length > 0;
    }),
})

const IDTypes = () => {
  return (
    <div className='flex flex-col'>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => {
        }}
      >
        {() => (
          <Form className='flex-1'>
            <div className='h-[calc(100vh-350px)] overflow-y-auto scrollbar-hide space-y-6'>
              <IDTypeTable />
              <div className='bg-gray-50 rounded-lg p-4 mt-6 space-y-6'>

              
              <h2 className='text-lg font-semibold'>Add New ID Types</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='idNumber' label='ID Number' required />
                <FormikSelectField
                  name='idType'
                  label='ID Type'
                  options={idTypeOptions}
                  required
                />
              </div>

              <FormikInputField name='issuePlace' label='Issue Place' />

              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <FormikInputField
                  name='issueDate'
                  label='Issue Date'
                  type='date'
                />
                <FormikInputField
                  name='expiryDate'
                  label='Expiry Date'
                  type='date'
                />
                <FormikInputField
                  name='hijriIssueDate'
                  label='Hijri Issue Date'
                  type='date'
                />
                <FormikInputField
                  name='hijriExpiryDate'
                  label='Hijri Expiry Date'
                  type='date'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='categoryType' label='Category Type' />
                <FormikSelectField
                  name='forDepartment'
                  label='For Department'
                  options={departmentOptions}
                />
              </div>

              <FormikRadioGroup
                name='status'
                label='Status'
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Disabled', value: 'disabled' }
                ]}
              />

              <FormikInputField
                name='description'
                label='Description'
                textarea
                rows={3}
              />

              <h3 className='text-md font-semibold mt-6'>Attachments</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                <FormikSelectField
                  name='attachmentCategory'
                  label='Attachment Categories'
                  options={attachmentCategoryOptions}
                />
                <FileUploadField name='file' label='File' />
              </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      <div className='sticky bottom-0 bg-white border-t mt-4 p-4 flex justify-end'>
        <SubmitButton title='Save & Update' type='submit' />
      </div>
    </div>
  )
}

export default IDTypes
