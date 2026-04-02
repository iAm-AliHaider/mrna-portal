import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import FormikSelectField from '../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../components/common/FormikInputField'
import SubmitButton from '../../../../components/common/SubmitButton'
import FormikCheckbox from '../../../../components/common/FormikCheckbox'

const unitTypes = [
  { label: 'Department', value: 'department' },
  { label: 'Division', value: 'division' },
  { label: 'Team', value: 'team' }
]


const initialValues = {
  code: '',
  location: '',
  type: '',
  name: '',
  // description: '',
  not_active: false
}

const validationSchema = Yup.object({
  name: Yup.string().required('name is required'),
  type: Yup.string().required('Unit type is required'),
  code: Yup.string()
    .required('Organizational unit code is required')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Only alphanumeric characters and underscores are allowed'
    ),
  location: Yup.string().required('Location is required'),
  not_active: Yup.boolean()
  // description: Yup.string()
  //   .optional()
  //   .test('no-spaces', 'Empty spaces are not allowed', value => {
  //     return !value || value.trim().length > 0
  //   })
})

const DesignationModalForm = ({
  open,
  handleClose,
  initialData = {},
  accounts,
  handleFormSubmit,
  loading = false
}) => {
  const isEdit = Boolean(initialData?.id)
  const mergedInitialValues = {
    ...initialValues,
    ...initialData,
    not_active: initialData?.status === 'inactive'
  }
  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <Formik
        initialValues={mergedInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {() => (
          <Form>
            <DialogTitle>{isEdit ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogContent dividers className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormikInputField
                  name='code'
                  label='Organizational unit code'
                  required
                  disabled={isEdit}
                />
                <FormikSelectField
                  name='location'
                  label='Location'
                  options={accounts}
                  placeholder='Select'
                  getOptionLabel={option => option.name}
                  selectKey='id'
                  disabled={isEdit}
                  required
                />
                <FormikSelectField
                  name='type'
                  label='Unit Type'
                  required
                  options={unitTypes}
                  placeholder='Select'
                  disabled={isEdit}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='name' label='Unit Name' required />
                {/* <FormikInputField
                  name="unit_name_en"
                  label="Unit Name in English"
                /> */}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* <FormikSelectField
                  name="reporting_to"
                  label="Reporting to"
                  options={accounts}
                  placeholder="Select"
                /> */}
                {/* <FormikInputField name="manager_code" label="Manager Code" /> */}
                {/* <FormikInputField
                  name='manager_name'
                  label='Manager Name'
                  readOnly
                /> */}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* <FormikSelectField
                  name="department_account"
                  label="Organizational Department Account"
                  options={accounts}
                  placeholder="Select"
                /> */}
                {/* <FormikSelectField
                  name="salary_account"
                  label="Salary Account"
                  options={accounts}
                  placeholder="Select"
                /> */}
              </div>

              {/* <FormikInputField
                name='description'
                label='Description'
                rows={4}
              /> */}

              <div className='flex items-center gap-2'>
                <FormikCheckbox label='Not Active' name='not_active' />
              </div>
            </DialogContent>
            <DialogActions>
              <button
                type='button'
                className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
                onClick={handleClose}
              >
                Close
              </button>
              <SubmitButton
                type='submit'
                title={isEdit ? 'Save & Update' : 'Save'}
                isLoading={loading}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

export default DesignationModalForm
