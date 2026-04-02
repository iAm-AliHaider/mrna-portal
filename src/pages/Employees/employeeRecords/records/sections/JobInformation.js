import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../../components/common/FormikInputField'
import FormikSelectField from '../../../../../components/common/FormikSelectField'
import SubmitButton from '../../../../../components/common/SubmitButton'
import FormikCheckbox from '../../../../../components/common/FormikCheckbox'

const jobTitleOptions = [
  { label: 'Application Support Specialist', value: 'application_support_specialist' },
]

const managerOptions = [
  { label: 'Taha Abdullah Ali Alebrahim', value: 'taha_abdullah' },
]

const unitOptions = [
  { label: 'IT (Information Technology)', value: 'it' },
]

const departmentOptions = [
  { label: 'Network Services', value: 'network_services' },
]

const initialValues = {
  jobTitle: '',
  managerCode: '',
  manager: '',
  unit: '',
  department: '',
  subSection1: '',
  subSection2: '',
  isGeneralManager: false,
  isBoardMember: false
}

const validationSchema = Yup.object({
  jobTitle: Yup.string().required('Required'),
  unit: Yup.string().required('Required')
})

const JobInformation = () => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={values => {}}
    >
      {() => (
        <Form>
          <div className='bg-gray-50 p-4 rounded-lg space-y-6'>
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
              <FormikSelectField
                name='jobTitle'
                label='Job Title'
                options={jobTitleOptions}
                required
              />
            </div>
            <h2 className='text-xl font-semibold text-gray-700'>Employement Grade</h2>
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
              <FormikInputField
                name='managerCode'
                label='Manager Code'
              />
              <FormikSelectField
                name='manager'
                label='Manager'
                options={managerOptions}
              />
            </div>
            <h2 className='text-xl font-semibold text-gray-700'>Organizational Unit</h2>
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
              <FormikSelectField
                name='unit'
                label='Unit'
                options={unitOptions}
                required
              />
              <FormikSelectField
                name='department'
                label='Department'
                options={departmentOptions}
              />
            </div>

            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
              <FormikInputField
                name='subSection1'
                label='Sub-Section Level 1'
              />
              <FormikInputField
                name='subSection2'
                label='Sub-Section Level 2'
              />
            </div>

            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
              <FormikCheckbox label='General Manager' name='isGeneralManager' />

              <FormikCheckbox label='Board Member' name='isBoardMember' />
            </div>
          </div>

          <div className='mt-6 flex justify-end border-t pt-4'>
            <SubmitButton title='Save & Update' type='submit' />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default JobInformation
