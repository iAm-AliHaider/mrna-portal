import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../../components/common/FormikInputField'
import SubmitButton from '../../../../../components/common/SubmitButton'
import { useLocation, useParams } from 'react-router-dom'
import ReviewAssessmentPage from '../viewAssesment'
import {
  useSubmitAppraisalResponse
} from '../../../../../utils/hooks/api/appraisal'

const EmployeeAppraisalAssessmentPage = () => {
  const { id } = useParams()
  const appraisalId = Number(id)
  const initialValues = { response: '' }
  const { state } = useLocation();

  const { submit, loading } = useSubmitAppraisalResponse()

  const validationSchema = Yup.object({
    response: Yup.string().trim().required('Please enter your response')
  })

  const handleSubmit = async values => {
    await submit(appraisalId, values.response)
  }

  return (
    <React.Fragment>
      <ReviewAssessmentPage />
      {!state?.hasResponse && <section className='bg-white rounded-lg shadow p-6 max-w-4xl mx-auto p-6 space-y-8'>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className='space-y-4'>
              <div>
                <FormikInputField
                  label='Feedback'
                  name='response'
                  rows={4}
                />
              </div>

              <div className='flex justify-end'>
                <SubmitButton
                  type='submit'
                  isLoading={isSubmitting}
                  title='Submit Response'
                  disabled={isSubmitting || loading}
                />
              </div>
            </Form>
          )}
        </Formik>
      </section>}
    </React.Fragment>
  )
}

export default EmployeeAppraisalAssessmentPage
