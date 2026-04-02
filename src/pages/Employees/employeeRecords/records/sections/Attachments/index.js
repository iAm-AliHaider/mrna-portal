import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikSelectField from '../../../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../../../components/common/FormikInputField'
import SubmitButton from '../../../../../../components/common/SubmitButton'
import FileUploadField from '../../../../../../components/common/FormikFileUpload'
import AttachmentsTable from './Table'

const attachmentCategoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Specific', value: 'specific' }
]

const initialValues = {
  attachmentCategory: '',
  attachmentName: '',
  attachmentNameEn: '',
  file: null,
  description: ''
}

const validationSchema = Yup.object({
  attachmentCategory: Yup.string().required('Required'),
  attachmentName: Yup.string().required('Required'),
  file: Yup.mixed().required('File is required'),
  description: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
})

const Attachments = () => {
  return (
    <div className='flex flex-col'>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => {
        }}
      >
        {() =>  (
          <Form className='flex-1'>
            <div className='h-[calc(100vh-350px)] overflow-y-auto scrollbar-hide space-y-6'>
              <AttachmentsTable />
              <div className='bg-gray-50 rounded-lg p-4 mt-6 space-y-6'>
                <h2 className='text-lg font-semibold'>Add New Attachment</h2>

                <FormikSelectField
                  name='attachmentCategory'
                  label='Attachment Categories'
                  options={attachmentCategoryOptions}
                  required
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormikInputField
                    name='attachmentName'
                    label='Attachment Name'
                    required
                  />
                  <FormikInputField
                    name='attachmentNameEn'
                    label='Attachment Name in English'
                  />
                </div>

                <FileUploadField name='file' label='File' />

                <FormikInputField
                  name='description'
                  label='Description'
                  rows={3}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>

      <div className='bg-white border-t mt-4 p-4 flex justify-end'>
        <SubmitButton title='Save & Update' type='submit' />
      </div>
    </div>
  )
}

export default Attachments
