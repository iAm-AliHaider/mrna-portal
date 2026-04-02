import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../../components/common/FormikInputField'
import SubmitButton from '../../../../../components/common/SubmitButton'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'
import { useUpdateEmployeeRecord } from '../../../../../utils/hooks/api/employeeRecords'
// import { sendWorkEmailNotification } from '../../../../../utils/emailSender'
import { sendWorkEmailNotification } from '../../../../../utils/emailSenderHelper'


const validationSchema = Yup.object({
  work_email: Yup.string()
    .required('Work email is required')
    .email('Invalid email format'),

  telephone: Yup.string(),

  extension: Yup.string().nullable(),

  mobile: Yup.string()
    .matches(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid mobile number'),

  fax: Yup.string()
    .matches(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid fax number'),

  building: Yup.string()
    .max(100, 'Building name too long'),

  floor: Yup.string()
    .matches(/^[\w\-\/ ]*$/, 'Invalid floor format'),

  office_number: Yup.string()
    .matches(/^[\w\-\/ ]*$/, 'Invalid office number'),

  room_number: Yup.string()
    .matches(/^[\w\-\/ ]*$/, 'Invalid room number')
})


const WorkAddress = () => {
  const { record, loadRecord } = useEmployeeRecord()
  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord()
  const initialValues = {
    work_email: record?.work_email || '',
    telephone: record?.telephone || '',
    extension: record?.extension || '',
    mobile: record?.mobile || '',
    fax: record?.fax || '',
    building: record?.building || '',
    floor: record?.floor || '',
    office_number: record?.office_number || '',
    room_number: record?.room_number || ''
  }

  const handleSubmit = async values => {
    const employee = {
      id: record?.id,
      ...values
    }
  
    const candidate = {
      id: record?.candidate_id,
      work_email: values.work_email
    }

    await updateRecord({ employee, candidate })

    await notifyWorkEmailChange(record, values)
    
    loadRecord()
  }

async function notifyWorkEmailChange(oldRecord, newValues) {
  const prevWorkEmail = oldRecord?.work_email
  const newWorkEmail  = newValues.work_email
  const personalEmail = oldRecord?.email

  if (!prevWorkEmail && newWorkEmail) {
    await sendWorkEmailNotification({
      email: personalEmail,
      workEmail: newWorkEmail
    })
  }

  else if (prevWorkEmail && prevWorkEmail !== newWorkEmail) {
    await sendWorkEmailNotification({
      email: prevWorkEmail,
      workEmail: newWorkEmail
    })
  }
}


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className='space-y-6'>
          <div className='bg-gray-50 rounded-lg p-4'>
            <FormikInputField name='work_email' label='Work Email' required />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormikInputField name='telephone' label='Telephone' />
              <FormikInputField name='extension' label='Extension' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormikInputField name='mobile' label='Mobile' />
              <FormikInputField name='fax' label='Fax' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormikInputField name='building' label='Building' />
              <FormikInputField name='floor' label='Floor' />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormikInputField name='office_number' label='Office Number' />
              <FormikInputField name='room_number' label='Room Number' />
            </div>
          </div>
          <div className='flex justify-end border-t pt-6'>
            <SubmitButton
              title='Save & Update'
              type='submit'
              isLoading={updateLoading}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default WorkAddress
