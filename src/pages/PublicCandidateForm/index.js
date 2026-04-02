import React from 'react'
import CandidateForm from '../Admin/humanResource/talentAcquisition/candidates/CandidateForm'

const PublicCandidateForm = () => {
  return (
  <div className='p-10 '>
    <div className="relative flex flex-row items-center mb-5" style={{ minHeight: 100 }}>
      <img src='/assets/images/logo.png' alt='Logo' width={250} height={250} />
      <h1 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-[35px]">Candidate Creation Form</h1>
      <div className="flex-1"></div>
    </div>
    <h1 className='font-medium mb-5 text-lg'>Please read the candidate information carefully before completing this form.</h1>
    <CandidateForm isPublicView={true} />
  </div>
  )
}
export default PublicCandidateForm