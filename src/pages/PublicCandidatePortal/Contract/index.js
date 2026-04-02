import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  useContract,
  useRefuseContract
} from '../../../utils/hooks/api/contract'
import LoadingWrapper from '../../../components/common/LoadingWrapper'
import { useParams, useNavigate } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SubmitButton from '../../../components/common/SubmitButton'
import ActionModal from '../../../components/common/ActionModal'
// import { sendContractRejectedEmail } from '../../../utils/emailSender'
import { sendContractRejectedEmail } from '../../../utils/emailSenderHelper'

import { useUpdateCandidate } from '../../../utils/hooks/api/candidates'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const OfficialContract = () => {
  const [numPages, setNumPages] = useState(null)
  const [show, setShow] = useState(false)
  const { contract, loading, error, refetch } = useContract()
  const {
    refuseContract,
    loading: refuseLoading,
    error: refuseError
  } = useRefuseContract()
  const {
    updateCandidate,
    loading: updateLoading
  } = useUpdateCandidate()
  const { id } = useParams()
  const navigate = useNavigate()

  const handleDownload = () => {

    if (contract?.pdf_url) {
      const link = document.createElement('a')
      link.href = contract.pdf_url
      link.download = `contract-letter-${id || 'document'}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleUploadMedia = () => {
    navigate(
      `/public/candidates/contract/${contract?.id}/upload-documents?status=${contract?.status}`,
      {
        state: {
          contract: contract
        }
      }
    )
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const onRefuse = async reason => {
    await refuseContract(contract?.id, reason)
    hideModal()
    await updateCandidate(contract?.candidate?.id, { contract: 'declined' })
    await sendContractRejectedEmail({
      candidateName: `${contract?.candidate?.first_name ?? ''}
${contract?.candidate?.second_name ?? ''}
${contract?.candidate?.third_name ?? ''}
${contract?.candidate?.forth_name ?? ''}`
        .replace(/\s+/g, ' ') // collapse multiple spaces into one
        .trim(),
      candidateEmail: contract?.candidate?.email,
      email: contract?.hr_manager?.work_email
    })
    refetch()
  }

  const showModal = () => setShow(true)

  const hideModal = () => setShow(false)

  if (!contract && !loading)
    return <div className='text-center'>No contract Letter Found</div>


  return (
    <React.Fragment>
      <LoadingWrapper isLoading={loading} error={error}>
        <div className='mt-6'>
          {contract?.status === 'accepted' ? (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
              <h2 className='text-green-700 font-semibold mb-2'>
                You have accepted the contract 🎉
              </h2>
              <p className='text-green-600 text-sm mb-4'>
                Please download the signed contract letter for your records.
              </p>
              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!contract?.pdf_url}
                  Icon={DownloadIcon}
                />
                <SubmitButton
                  type='button'
                  title='Update Documents'
                  onClick={handleUploadMedia}
                  Icon={CloudUploadIcon}
                  variant='outlined'
                />
              </div>
            </div>
          ) : contract?.status === 'declined' ? (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
              <h2 className='text-red-700 font-semibold mb-2'>
                Contract Declined
              </h2>
              <p className='text-red-600 text-sm mb-4'>
                You have declined this contract. If you believe this was a
                mistake, please contact support.
              </p>
              <p className='text-red-600 text-sm mb-4'>
                <strong>Reason:</strong>
                {contract?.rejection_reason}
              </p>
              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!contract?.pdf_url}
                  Icon={DownloadIcon}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Step-by-step Instructions */}
              <div className='bg-white border rounded-lg p-4 mb-6 shadow-sm'>
                <h2 className='text-lg font-semibold mb-2 text-gray-800'>
                  Steps to Complete
                </h2>
                <ol className='list-decimal ml-5 space-y-1 text-gray-700 text-sm'>
                  <li>Download this contract letter</li>
                  <li>Sign the contract letter</li>
                  <li>Upload the signed contract letter</li>
                  <li>Upload additional documents mentioned in the email</li>
                </ol>
              </div>

              {contract?.note_en && (
                <div className='bg-white border rounded-lg p-4 mb-6 shadow-sm'>
                  <h2 className='text-lg font-semibold mb-2 text-gray-800'>
                    Note (English)
                  </h2>
                  <p className='text-gray-700 text-sm'>{contract?.note_en}</p>
                </div>
              )}

              {contract?.note_ar && (
                <div className='bg-white border rounded-lg p-4 mb-6 text-right shadow-sm'>
                  <h2 className='text-lg font-semibold mb-2 text-gray-800'>
                    Note (Arabic)
                  </h2>
                  <p className='text-gray-700 text-sm'>{contract?.note_ar}</p>
                </div>
              )}

              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!contract?.pdf_url}
                  Icon={DownloadIcon}
                />
                <SubmitButton
                  type='button'
                  title='Accept & Upload Signed Contract'
                  onClick={handleUploadMedia}
                  Icon={CloudUploadIcon}
                  variant='outlined'
                />
                <SubmitButton
                  type='button'
                  title='Refuse Contract'
                  onClick={showModal}
                  variant='danger'
                  isLoading={refuseLoading || updateLoading}
                />
              </div>

              {/* PDF Preview */}
              <div className='border p-4 rounded bg-gray-50'>
                <h3 className='font-semibold mb-4 text-gray-800'>
                  PDF Preview
                </h3>
                {contract?.pdf_url ? (
                  // <div className='flex justify-center'>
                  //   <div className='w-full max-w-4xl'>
                  //     <Document
                  //       file={contract.pdf_url}
                  //       onLoadSuccess={onDocumentLoadSuccess}
                  //       loading='Loading PDF...'
                  //       className='flex flex-col items-center'
                  //     >
                  //       {Array.from({ length: numPages }, (_, i) => (
                  //         <Page
                  //           key={i}
                  //           pageNumber={i + 1}
                  //           //  scale={1.2}
                  //           width={Math.min(800, window.innerWidth - 100)}
                  //           className='mb-4 shadow-md'
                  //         />
                  //       ))}
                  //     </Document>
                  //   </div>
                  // </div>

               <div className='flex justify-center'>
  <div className='w-full max-w-4xl'>
    <Document
      file={contract.pdf_url}
      onLoadSuccess={onDocumentLoadSuccess}
      loading='Loading PDF...'
      className='flex flex-col items-center'
    >
      {Array.from({ length: numPages }, (_, i) => (
        <Page
          key={i}
          pageNumber={i + 1}
          width={Math.min(800, window.innerWidth - 100)} // ✅ keep your width
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className='mb-4 shadow-md'
        />
      ))}
    </Document>
  </div>
</div>

                ) : (
                  <p className='text-gray-500'>
                    No PDF available for this contract.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </LoadingWrapper>
      <ActionModal
        onReject={onRefuse}
        buttonTitle='Refuse Contract'
        title='Refuse Contract'
        description='Are you sure you want to refuse this contract?'
        loading={refuseLoading}
        error={refuseError}
        open={show}
        onClose={hideModal}
      />
    </React.Fragment>
  )
}

export default OfficialContract
