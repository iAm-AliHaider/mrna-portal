import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikDropZone from '../../../components/common/FormikDropZone'
import SubmitButton from '../../../components/common/SubmitButton'
import { useAcceptContract } from '../../../utils/hooks/api/contract'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Alert } from '@mui/material'
// import { sendContractAcceptedEmail } from '../../../utils/emailSender'
import { sendContractAcceptedEmail } from '../../../utils/emailSenderHelper'

import { useUpdateCandidate } from '../../../utils/hooks/api/candidates'

const UploadContractDocuments = () => {
  const { id } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const navigate = useNavigate()
  const initialValues = {
    attachments: []
  }

  const { acceptContract, loading } = useAcceptContract()
  const { updateCandidate, loading: updateLoading } = useUpdateCandidate()

  const validationSchema = Yup.object().shape({
    attachments: Yup.array()
      .min(1, 'At least one document is required')
      .required('Document is required')
  })

  const handleSubmit = async values => {    
    await acceptContract(id, values)
    await updateCandidate(location?.state?.contract?.candidate?.id, { contract: 'accepted' })
    await sendContractAcceptedEmail({
      candidateName: `${location?.state?.contract?.candidate?.first_name ?? ""}
${location?.state?.contract?.candidate?.second_name ?? ""}
${location?.state?.contract?.candidate?.third_name ?? ""}
${location?.state?.contract?.candidate?.forth_name ?? ""}`
            .replace(/\s+/g, " ") // collapse multiple spaces into one
            .trim(),
      candidateEmail: location?.state?.contract?.candidate?.email,
      email: location?.state?.contract?.hr_manager?.work_email,
    })
    navigate(-1)
  }

  return (
    <React.Fragment>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => (
          <Form className='space-y-4'>
            <FormikDropZone
              label='Upload Attachments'
              name='attachments'
              placeholder='Upload document'
              acceptedFormats={['JPG', 'JPEG', 'PNG', 'PDF']}
              required
            />

            {status === 'accepted' ? (
              <Alert severity='warning' className='text-sm'>
                You have already uploaded the cotract. Uploading and submitting
                new documents will{' '}
                <strong>replace the previously uploaded attachments</strong>.
                Please ensure all required files are included before proceeding.
              </Alert>
            ) : (
              <Alert severity='info' className='text-sm'>
                Please make sure all documents are uploaded. By clicking submit,
                you confirm acceptance of the contract and submission of all
                attached documents.{' '}
                <strong>Only proceed if you are sure.</strong>
              </Alert>
            )}

            <div className='flex justify-end'>
              <SubmitButton
                type='submit'
                title='Accept & Submit Documents'
                disabled={isSubmitting}
                isLoading={loading || updateLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  )
}

export default UploadContractDocuments
