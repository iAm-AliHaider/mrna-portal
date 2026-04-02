import React, { useEffect, useState } from 'react'
import { Formik, Form, Field } from 'formik'
import {
  useOfferRequestById,
  useOfferRequests
} from '../../../../../utils/hooks/api/useOfferRequests'
import { Button } from '@mui/material'
import { supabase } from '../../../../../supabaseClient'
import JobOfferPDF from '../../../../../components/ContractsForms/OfferLetter'
import { useUser } from '../../../../../context/UserContext'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingWrapper from '../../../../../components/common/LoadingWrapper'
import FormikSelectField from '../../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../../components/common/FormikInputField'

const RegenerateOfferRequestForm = () => {
  const { user } = useUser()
  const { id } = useParams()
  const { updateOfferRequest } = useOfferRequests()
  const { offerRequest, loading, error } = useOfferRequestById(id)
  const [candidates, setCandidates] = useState()
  const navigate = useNavigate()


  const fetchCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_employee', false)
    setCandidates(data)
  }
  useEffect(() => {
    fetchCandidates()
  }, [])

  const uploadToS3 = async (fileBlob, fileName) => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName }),
      headers: { 'Content-Type': 'application/json' }
    })

    const { url } = await res.json()

    // Now upload the file using the signed URL
    await fetch(url, {
      method: 'PUT',
      body: fileBlob,
      headers: {
        'Content-Type': 'application/pdf'
      }
    })

    // Return the S3 URL (strip query params)
    return url.split('?')[0]
  }

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Regenerate Offer Request</h2>
      <LoadingWrapper isLoading={loading} error={error}>
        <Formik
          initialValues={{
            candidate_id: offerRequest?.candidate_id || '',
            salary: offerRequest?.salary || '',
            note_en: offerRequest?.note_en || '',
            note_ar: offerRequest?.note_ar || ''
          }}
          validate={values => {
            const errors = {}
            if (!values.candidate_id)
              errors.candidate_id = 'Candidate is required'
            if (!values.salary) errors.salary = 'Salary is required'
            return errors
          }}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            const element = document.getElementById('offer-pdf-preview')

            const html2pdf = (await import('html2pdf.js')).default

            // 1. Generate PDF as Blob
            const blob = await html2pdf().from(element).outputPdf('blob')

            // 2. Convert blob to File to reuse uploadFile
            const file = new File(
              [blob],
              `offer-${values.candidate_id}-${Date.now()}.pdf`,
              {
                type: 'application/pdf'
              }
            )

            const { uploadFile } = await import('../../../../../utils/s3')
            const uploadedUrl = await uploadFile(file)

            // 4. Save in Supabase
            const success = await updateOfferRequest(id, {
              ...values,
              pdf_url: uploadedUrl,
              status: 'pending',
              is_manager_approve: false,
              is_hod_approve: false,
              is_hr_manager_approve: false,
              rejection_reason: null,
              escalated: false,
              updated_by: user?.id
            })
            setSubmitting(false)
            if (success) navigate('/hr/offer-approvals')
          }}
        >
          {({ values, handleChange }) => (
            <Form className='space-y-4'>
              <div>
                <label>Candidate</label>
                <FormikSelectField
                  as='select'
                  name='candidate_id'
                  className='w-full border p-2 rounded'
                  options={candidates}
                  selectKey='id'
                  disabled
                  getOptionLabel={c =>
                    `${c.first_name || ''} ${c.family_name || ''}`
                  }
                />
              </div>

              <div>
                <FormikInputField
                  label='Basic Salary'
                  onChange={handleChange}
                  name='salary'
                  type='number'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label>Housing Allowance</label>
                  <input
                    value={
                      values.salary ? ((values.salary * 3) / 12).toFixed(2) : ''
                    }
                    disabled
                    className='w-full border p-2 rounded bg-gray-100'
                  />
                </div>
                <div>
                  <label>Travel Allowance</label>
                  <input
                    value={
                      values.salary ? (values.salary * 0.1).toFixed(2) : ''
                    }
                    disabled
                    className='w-full border p-2 rounded bg-gray-100'
                  />
                </div>
                <div>
                  <label>Total Salary</label>
                  <input
                    value={
                      values.salary
                        ? (
                            parseFloat(values.salary) +
                            parseFloat((values.salary * 3) / 12) +
                            parseFloat(values.salary * 0.1)
                          ).toFixed(2)
                        : ''
                    }
                    disabled
                    className='w-full border p-2 rounded bg-gray-100'
                  />
                </div>
              </div>

              <div>
                <FormikInputField
                  label='Note (English)'
                  name='note_en'
                  rows={4}
                />
              </div>

              <div>
                <FormikInputField
                  label='Note (Arabic)'
                  name='note_ar'
                  rows={4}
                />
              </div>

              <div className='border p-4 rounded bg-gray-50 mt-6'>
                <h3 className='font-semibold mb-2'>PDF Preview</h3>
                <JobOfferPDF
                  data={{
                    basic_salary: values.salary,
                    housing_allowance: values.salary
                      ? ((values.salary * 3) / 12).toFixed(2)
                      : 0,
                    transportation_allowance: values.salary
                      ? (values.salary * 0.1).toFixed(2)
                      : 0,
                    total_salary: values.salary
                      ? (
                          parseFloat(values.salary) +
                          parseFloat((values.salary * 3) / 12) +
                          parseFloat(values.salary * 0.1)
                        ).toFixed(2)
                      : 0,
                    note_en: values.note_en,
                    note_ar: values.note_ar
                  }}
                />
              </div>

              <div className='text-right mt-4'>
                <button
                  type='button'
                  className='bg-blue-600 text-white px-4 py-2 rounded'
                  onClick={() => {
                    const element = document.getElementById('offer-pdf-preview')
                    import('html2pdf.js').then(html2pdf => {
                      html2pdf.default().from(element).save('OfferLetter.pdf')
                    })
                  }}
                >
                  Download Offer Letter
                </button>
              </div>

              <Button type='submit' className='mt-4'>
                Update Offer
              </Button>
            </Form>
          )}
        </Formik>
      </LoadingWrapper>
    </div>
  )
}

export default RegenerateOfferRequestForm
