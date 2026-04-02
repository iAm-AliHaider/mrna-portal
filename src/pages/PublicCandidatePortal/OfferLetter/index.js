import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  useOfferLetter,
  useRefuseOffer
} from '../../../utils/hooks/api/contract'
import LoadingWrapper from '../../../components/common/LoadingWrapper'
import { useParams, useNavigate } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SubmitButton from '../../../components/common/SubmitButton'
import ActionModal from '../../../components/common/ActionModal'
import { useUpdateCandidate } from '../../../utils/hooks/api/candidates'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CandidateOfferLetter = () => {
  const [numPages, setNumPages] = useState(null)
  const [show, setShow] = useState(false)
  const { offer, loading, error, refetch } = useOfferLetter()
  const { updateCandidate, loading: updateLoading } = useUpdateCandidate()
  const {
    refuseOffer,
    loading: refuseLoading,
    error: refuseError
  } = useRefuseOffer()
  const { id } = useParams()
  const navigate = useNavigate()


  const handleDownload = () => {
    if (offer?.pdf_url) {
      const link = document.createElement('a')
      link.href = offer.pdf_url
      link.download = `offer-letter-${id || 'document'}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleUploadMedia = () => {
    navigate(`/public/candidates/offer-letter/${offer?.id}/upload-documents?status=${offer?.status}`)
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const onRefuse = async reason => {
    await refuseOffer(offer?.id, reason)
    await updateCandidate(offer?.candidate_id, { offer_letter: 'declined' })
    hideModal()
    refetch()
  }

   const createdAt = new Date(offer?.created_at);
  const now = new Date();

  // difference in milliseconds
  const diffMs = now - createdAt;
  const hoursDiff = diffMs / (1000 * 60 * 60);

  const isExpired = hoursDiff >= 72;


  const showModal = () => setShow(true)

  const hideModal = () => setShow(false)

  if(!offer && !loading) return <div className='text-center'>No Offer Letter Found</div>

  return (
    <React.Fragment>
      <LoadingWrapper isLoading={loading} error={error}>
        <div className='mt-6'>
          {offer?.status === 'accepted' ? (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
              <h2 className='text-green-700 font-semibold mb-2'>
                You have accepted the offer 🎉
              </h2>
              <p className='text-green-600 text-sm mb-4'>
                Please download the signed offer letter for your records.
              </p>
              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!offer?.pdf_url}
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
          ) : offer?.status === 'declined' ? (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
              <h2 className='text-red-700 font-semibold mb-2'>
                Offer Declined
              </h2>
              <p className='text-red-600 text-sm mb-4'>
                You have declined this offer. If you believe this was a mistake,
                please contact support.
              </p>
              <p className='text-red-600 text-sm mb-4'>
                <strong>Reason:</strong>{offer?.rejection_reason}
              </p>
              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!offer?.pdf_url}
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
                  <li>Download this offer letter</li>
                  <li>Sign the offer letter</li>
                  <li>Upload the signed offer letter</li>
                  <li>Upload additional documents mentioned in the email</li>
                  <li>Please Submit the Signed Offer Letter with in 3 days of receiving</li>
                </ol>
              </div>

{/* Show error if expired */}
      {isExpired && (
        <p className="mt-3 mb-3 text-sm text-red-600 font-medium">
          This offer has expired as more than 3 days have passed since it was issued.
        </p>
      )}

             {offer?.note_en && <div className='bg-white border rounded-lg p-4 mb-6 shadow-sm'>
                <h2 className='text-lg font-semibold mb-2 text-gray-800'>
                  Note (English)
                </h2>
                <p className='text-gray-700 text-sm'>
                  {offer?.note_en}
                </p>
              </div>}

              {offer?.note_ar && <div className='bg-white border rounded-lg p-4 mb-6 text-right shadow-sm'>
                <h2 className='text-lg font-semibold mb-2 text-gray-800'>
                  Note (Arabic)
                </h2>
                <p className='text-gray-700 text-sm'>
                  {offer?.note_ar}
                </p>
              </div>}

              <div className='flex justify-end gap-3 mb-4'>
                <SubmitButton
                  type='button'
                  title='Download PDF'
                  onClick={handleDownload}
                  disabled={!offer?.pdf_url}
                  Icon={DownloadIcon}
                />
                <SubmitButton
                  type='button'
                  title='Accept & Upload Documents'
                  onClick={handleUploadMedia}
                  Icon={CloudUploadIcon}
                  variant='outlined'
                  disabled={isExpired}
                />
                <SubmitButton
                  type='button'
                  title='Refuse Offer'
                  onClick={showModal}
                  variant='danger'
                  isLoading={refuseLoading || updateLoading}
                  disabled={isExpired}

                />
              </div>

              {/* PDF Preview */}
              <div className='border p-4 rounded bg-gray-50'>
                <h3 className='font-semibold mb-4 text-gray-800'>
                  PDF Preview
                </h3>
                {offer?.pdf_url ? (
                  <div className='flex justify-center'>
                    <div className='w-full max-w-4xl'>
                      <Document
                        file={offer.pdf_url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading='Loading PDF...'
                        className='flex flex-col items-center'
                      >
                        {Array.from({ length: numPages }, (_, i) => (
                          <Page
                            key={i}
                            pageNumber={i + 1}
                            width={Math.min(800, window.innerWidth - 100)}
                            className='mb-4 shadow-md'
                          />
                        ))}
                      </Document>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-500'>
                    No PDF available for this offer.
                  </p>
                )}
              </div>
            </>
          )} 
        </div>
      </LoadingWrapper>
      <ActionModal
        onReject={onRefuse}
        buttonTitle='Refuse Offer'
        title='Refuse Offer'
        description='Are you sure you want to refuse this offer?'
        loading={refuseLoading}
        error={refuseError}
        open={show}
        onClose={hideModal}
      />
    </React.Fragment>
  )
}

export default CandidateOfferLetter
