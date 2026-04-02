import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../components/common/FormikInputField'
import Modal from '../../../../components/common/Modal'
import SubmitButton from '../../../../components/common/SubmitButton'
import FileUploadField from '../../../../components/common/FormikFileUpload'

const initialValues = {
  attachment_path: null,
  title: '',
  url: '',
  catagory: ''
}
const validationSchema = Yup.object().shape({
  attachment_path: Yup.string()
    .required('File is required')
    .matches(/\.(png|jpe?g)$/i, 'Only PNG or JPG files are allowed'),
  title: Yup.string().required('Title is required'),
  url: Yup.string()
    .required('Video URL is required')
    .matches(/^https:\/\/.+/, 'URL must start with https'),
  catagory: Yup.string().oneOf(['video', 'interview'], 'Select a valid catagory').required('catagory is required')
})

const InspirationVideoForm = ({ onClose, open, handleSubmit }) => {
  return (
    <Modal onClose={onClose} title='Inspiration Video' open={open}>
      <div className='flex flex-col'>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className='flex-1 overflow-y-auto space-y-6'>
              <FormikInputField
                name='title'
                label='Title'
                type='text'
                required={true}
              />
              <FormikInputField
                name='url'
                label='Video Url'
                type='text'
                required={true}
              />

              {/* catagory select field */}
              <div>
                <label htmlFor='catagory' className='block text-sm font-medium text-gray-700 mb-1'>catagory<span className='text-red-500'>*</span></label>
                <select
                  id='catagory'
                  name='catagory'
                  className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                  value={values.catagory}
                  onChange={e => setFieldValue('catagory', e.target.value)}
                  required
                >
                  <option value=''>Select catagory</option>
                  <option value='video'>Video</option>
                  <option value='interview'>Interview</option>
                </select>
              </div>

              {/* Next row: Attachments */}
              <FileUploadField name='attachment_path' label='Attachment'/>

              {/* Buttons row */}
              <div className='mt-5 flex justify-end space-x-2 bg-white'>
                <SubmitButton
                  variant='outlined'
                  title='Cancel'
                  type='button'
                  onClick={onClose}
                />
                <SubmitButton
                  title='Submit'
                  type='submit'
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default InspirationVideoForm
