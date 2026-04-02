import React, { useEffect, useState } from 'react'
import { Formik, Form, useFormikContext } from 'formik'
import { useUser } from '../../../../../context/UserContext'
import FormikSelectField from '../../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../../components/common/FormikInputField'
import JobContractPDF from '../../../../../components/ContractsForms/ContractPdf/ContractPDF'
import SubmitButton from '../../../../../components/common/SubmitButton'
import {
  useCandidates,
  useCreateJobContract,
  useOfferRequestByCandidateId
} from '../../../../../utils/hooks/api/contract'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { sendContractEmail } from '../../../../../utils/emailSenderHelper'
import { useUpdateCandidate } from '../../../../../utils/hooks/api/candidates'
import { supabase } from '../../../../../supabaseClient'

// ✅ Validation schema: both dates nullable + transformed
export const validationSchema = Yup.object().shape({
  candidate_id: Yup.number().required('Candidate is required'),
  branch_id: Yup.string().required('Branch is required'),
   contract_end_date: Yup.string()
    .required("Contract End Date is required")
    .test("is-valid-date", "Invalid contract end date", (value) => {
      if (!value) return false;
      return !isNaN(new Date(value).getTime());
    })
    .test(
      "is-after-joining",
      "End date must be after joining date",
      function (value) {
        const { joining_date } = this.parent;
        if (!joining_date || !value) return true; // skip if missing
        return new Date(value) > new Date(joining_date);
      }
    ),
})


// 🔹 Helper: calculate + format contract duration in Arabic
const DurationWatcher = ({ setContractDuration }) => {
  const { values } = useFormikContext()

  useEffect(() => {
    if (values.joining_date && values.contract_end_date) {
      const start = new Date(values.joining_date)
      const end = new Date(values.contract_end_date)

      if (end > start) {
        let years = end.getFullYear() - start.getFullYear()
        let months = end.getMonth() - start.getMonth()
        let days = end.getDate() - start.getDate()

        if (days < 0) {
          months -= 1
          days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
        }
        if (months < 0) {
          years -= 1
          months += 12
        }

        // Arabic labels with Roman numbers
        let parts = []
        if (years > 0) parts.push(`${years} سنة`)
        if (months > 0) parts.push(`${months} شهر`)
        if (days > 0) parts.push(`${days} يوم`)

        if (parts.length > 1) {
          const last = parts.pop()
          setContractDuration(parts.join(' و ') + ' و ' + last)
        } else {
          setContractDuration(parts[0] || '')
        }
      } else {
        setContractDuration('')
      }
    } else {
      setContractDuration('')
    }
  }, [values.joining_date, values.contract_end_date, setContractDuration])

  return null
}


// // 🔹 Helper: calculates contract duration whenever Formik values change
// const DurationWatcher = ({ setContractDuration }) => {
//   const { values } = useFormikContext();

//   useEffect(() => {
//     if (values.joining_date && values.contract_end_date) {
//       const start = new Date(values.joining_date);
//       const end = new Date(values.contract_end_date);

//       if (end > start) {
//         let years = end.getFullYear() - start.getFullYear();
//         let months = end.getMonth() - start.getMonth();
//         let days = end.getDate() - start.getDate();

//         if (days < 0) {
//           months -= 1;
//           days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
//         }
//         if (months < 0) {
//           years -= 1;
//           months += 12;
//         }

//         let parts = [];
//         if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
//         if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
//         if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

//         let formatted = "";
//         if (parts.length > 1) {
//           const last = parts.pop();
//           formatted = `(${parts.join(", ")} and ${last})`;
//         } else {
//           formatted = `(${parts[0] || "0 days"})`;
//         }

//         setContractDuration(formatted);
//       } else {
//         setContractDuration("");
//       }
//     } else {
//       setContractDuration("");
//     }
//   }, [values.joining_date, values.contract_end_date, setContractDuration]);

//   return null;
// };


const ContractRequestForm = () => {
  const { user } = useUser()
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const { candidates, loading: candidatesLoading } = useCandidates()
  const { offerRequest, fetchOfferRequestById } = useOfferRequestByCandidateId(
    selectedCandidate?.id
  )
  const { createJobContract, loading } = useCreateJobContract()
  const { updateCandidate, loading: updateLoading } = useUpdateCandidate()
  const navigate = useNavigate()

  const [contractDuration, setContractDuration] = useState('')
  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [selectedBranchName, setSelectedBranchName] = useState('')

  // Fetch branches from DB
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true)
      const { data, error } = await supabase.from('branches').select('id, name').eq('is_deleted', false)
      if (!error) {
        setBranches(data.map(b => ({ label: b.name, value: b.id.toString() })))
      } else {
        console.error('Error fetching branches:', error.message)
      }
      setLoadingBranches(false)
    }
    fetchBranches()
  }, [])

  // Initial form values
  const initialValues = {
    candidate_id: '',
    branch_id: '',
    note_en: '',
    note_ar: '',
    company_name: 'Certified Audit Company for Finance',
    postal_code: '3969',
    zip_code: '14925 - 8055',
    phone: '1',
    cr_number: '1010337706',
    representative: 'Mr. Waleed Yousef Al-Otlani',
    joining_date: offerRequest?.joining_date || null,
    contract_end_date: offerRequest?.contract_end_date || null
  }

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Create Contract Request</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          const element = document.getElementById('cotract-pdf-preview')
          const html2pdf = (await import('html2pdf.js')).default
          const blob = await html2pdf().from(element).outputPdf('blob')
          const file = new File(
            [blob],
            `offer-${values.candidate_id}-${Date.now()}.pdf`,
            { type: 'application/pdf' }
          )
          const { uploadFile } = await import('../../../../../utils/s3')
          const uploadedUrl = await uploadFile(file)

          const success = await createJobContract({
            ...values,
            pdf_url: uploadedUrl,
            status: 'pending',
            created_by: user?.id,
            updated_by: user?.id
          })
          await updateCandidate(values.candidate_id, { contract: 'pending' })
          await sendContractEmail({
            candidateName: `${selectedCandidate?.first_name ?? ''} ${
              selectedCandidate?.second_name ?? ''
            } ${selectedCandidate?.third_name ?? ''} ${selectedCandidate?.forth_name ?? ''}`
              .replace(/\s+/g, ' ')
              .trim(),
            email: selectedCandidate?.email
          })
          setSubmitting(false)
          if (success) navigate(-1)
        }}
      >
        {({ setFieldValue, isSubmitting, values }) => {
          const handleChange = value => {
            const candidate = candidates.find(c => c.id === value) || {}
            setSelectedCandidate(candidate)
            setFieldValue('candidate_id', value)
            fetchOfferRequestById(value)
          }

          return (
            <Form className='space-y-4'>
              {/* Watch contract duration */}
              <DurationWatcher setContractDuration={setContractDuration} />

              {/* Candidate Dropdown */}
              <FormikSelectField
                name='candidate_id'
                className='w-full border p-2 rounded'
                options={candidates}
                selectKey='id'
                label='Candidate'
                getOptionLabel={c =>
                  `${c.first_name || ''} ${c.second_name || ''} ${c.third_name || ''} ${c.forth_name || ''} ${c.family_name || ''}`
                }
                disabled={candidatesLoading}
                onChange={handleChange}
              />

              {/* Branch Dropdown */}
              <FormikSelectField
                name='branch_id'
                label='Branch'
                options={branches}
                disabled={loadingBranches}
                placeholder='Select Branch'
                onChange={(branchId) => {
                  setFieldValue('branch_id', branchId)
                  const branch = branches.find(b => b.value === branchId)
                  setSelectedBranchName(branch ? branch.label : '')
                }}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormikInputField label='Company Name' name='company_name' />
                <FormikInputField label='Postal Code' name='postal_code' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormikInputField label='Zip Code' name='zip_code' />
                <FormikInputField label='Phone' name='phone' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormikInputField label='CR Number' name='cr_number' />
                <FormikInputField label='Representative' name='representative' />
              </div>

              {/* Joining + End Date */}
              <div className='grid grid-cols-2 gap-4'>
                <FormikInputField
                  label='Joining Date'
                  name='joining_date'
                  type='date'
                  max='2100-12-31'
                />
                <FormikInputField
                  label='Contract End Date'
                  name='contract_end_date'
                  type='date'
                  max='2100-12-31'
                />
              </div>

              {contractDuration && (
                <p className='text-sm text-gray-600 mt-2'>
                  Contract Duration: {contractDuration}
                </p>
              )}

              <FormikInputField label='Note (English)' name='note_en' rows={4} />
              <FormikInputField label='Note (Arabic)' name='note_ar' rows={4} />

              <div className='border p-4 rounded bg-gray-50 mt-6'>
                <h3 className='font-semibold mb-2'>PDF Preview</h3>
                <div id='cotract-pdf-preview'>
                  <JobContractPDF
                    data={{
                      name: `${selectedCandidate?.first_name || ''} ${selectedCandidate?.family_name || ''}`,
                      national_id: selectedCandidate?.national_id,
                      phone: selectedCandidate?.mobile,
                      job_title: selectedCandidate?.designation?.name || selectedCandidate?.own_designation,
                      basic_salary: offerRequest?.salary,
                      housing_allowance: Math.round(offerRequest?.salary * 0.25),
                      transportation_allowance: Math.round(offerRequest?.salary * 0.1),
                      total_salary: Math.round(offerRequest?.salary * 1.35),
                      date: new Date().toLocaleDateString('ar-SA'),
                      branch: selectedBranchName,
                      duration: contractDuration,
                      ...values
                    }}
                  />
                </div>
              </div>

              <div className='text-right mt-4 flex justify-end gap-4'>
                <SubmitButton
                  type='button'
                  onClick={() => {
                    const element = document.getElementById('cotract-pdf-preview')
                    import('html2pdf.js').then(html2pdf => {
                      html2pdf.default().from(element).save('JobContract.pdf')
                    })
                  }}
                  title='Download Contract'
                  variant='outlined'
                  disabled={!offerRequest}
                />
                <SubmitButton
                  label='Create Contract'
                  disabled={!offerRequest}
                  isLoading={loading || isSubmitting || updateLoading}
                  type='submit'
                />
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default ContractRequestForm




// import React, { useEffect, useState } from 'react'
// import { Formik, Form } from 'formik'
// import { useUser } from '../../../../../context/UserContext'
// import FormikSelectField from '../../../../../components/common/FormikSelectField'
// import FormikInputField from '../../../../../components/common/FormikInputField'
// import JobContractPDF from '../../../../../components/ContractsForms/ContractPdf/ContractPDF'
// import SubmitButton from '../../../../../components/common/SubmitButton'
// import {
//   useCandidates,
//   useCreateJobContract,
//   useOfferRequestByCandidateId
// } from '../../../../../utils/hooks/api/contract'
// import * as Yup from 'yup'
// import { useNavigate } from 'react-router-dom'
// import { sendContractEmail } from '../../../../../utils/emailSenderHelper'
// import { useUpdateCandidate } from '../../../../../utils/hooks/api/candidates'

// export const validationSchema = Yup.object().shape({
//   candidate_id: Yup.number().required('Candidate is required')
// })

// const ContractRequestForm = () => {
//   const { user } = useUser()
//   const [selectedCandidate, setSelectedCandidate] = useState(null)
//   const { candidates, loading: candidatesLoading } = useCandidates()
//   const { offerRequest, fetchOfferRequestById } = useOfferRequestByCandidateId(
//     selectedCandidate?.id
//   )
//   const { createJobContract, loading } = useCreateJobContract()
//   const { updateCandidate, loading: updateLoading } = useUpdateCandidate()

//   const navigate = useNavigate()

//   // Local states for dates
//   const [joiningDate, setJoiningDate] = useState('')
//   const [contractEndDate, setContractEndDate] = useState('')
//   const [contractDuration, setContractDuration] = useState('')

//   // prefill joining date if exists
//   useEffect(() => {
//     if (offerRequest?.joining_date) {
//       setJoiningDate(offerRequest.joining_date)
//     }
//     if (offerRequest?.contract_end_date) {
//       setContractEndDate(offerRequest.contract_end_date)
//     }
//   }, [offerRequest])

//   useEffect(() => {
//   if (joiningDate && contractEndDate) {
//     const start = new Date(joiningDate);
//     const end = new Date(contractEndDate);

//     if (end > start) {
//       let years = end.getFullYear() - start.getFullYear();
//       let months = end.getMonth() - start.getMonth();
//       let days = end.getDate() - start.getDate();

//       if (days < 0) {
//         months -= 1;
//         days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
//       }
//       if (months < 0) {
//         years -= 1;
//         months += 12;
//       }

//       let parts = [];
//       if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
//       if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
//       if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);

//       // join with commas and "and" before last item
//       if (parts.length > 1) {
//         const last = parts.pop();
//         setContractDuration(parts.join(", ") + " and " + last);
//       } else {
//         setContractDuration(parts[0] || "0 days");
//       }
//     } else {
//       setContractDuration("");
//     }
//   } else {
//     setContractDuration("");
//   }
// }, [joiningDate, contractEndDate]);


//   const initialValues = {
//     candidate_id: '',
//     note_en: '',
//     note_ar: '',
//     company_name: 'Certified Audit Company for Finance',
//     postal_code: '3969',
//     zip_code: '14925 - 8055',
//     phone: '1',
//     cr_number: '1010337706',
//     representative: 'Mr. Waleed Yousef Al-Otlani',
//     joining_date: joiningDate || '',
//     contract_end_date: contractEndDate || ''
//   }

//   return (
//     <div className='p-4 max-w-4xl mx-auto'>
//       <h2 className='text-xl font-semibold mb-4'>Create Contract Request</h2>
//       <Formik
//         initialValues={initialValues}
//         validationSchema={validationSchema}
//         onSubmit={async (values, { setSubmitting }) => {
//           const element = document.getElementById('cotract-pdf-preview')
//           const html2pdf = (await import('html2pdf.js')).default
//           const blob = await html2pdf().from(element).outputPdf('blob')
//           const file = new File(
//             [blob],
//             `offer-${values.candidate_id}-${Date.now()}.pdf`,
//             { type: 'application/pdf' }
//           )
//           const { uploadFile } = await import('../../../../../utils/s3')
//           const uploadedUrl = await uploadFile(file)

//           const success = await createJobContract({
//             ...values,
//             pdf_url: uploadedUrl,
//             status: 'pending',
//             created_by: user?.id,
//             updated_by: user?.id
//           })
//           await updateCandidate(values.candidate_id, { contract: 'pending' })
//           await sendContractEmail({
//             candidateName: `${selectedCandidate?.first_name ?? ''} ${
//               selectedCandidate?.second_name ?? ''
//             } ${selectedCandidate?.third_name ?? ''} ${
//               selectedCandidate?.forth_name ?? ''
//             }`
//               .replace(/\s+/g, ' ')
//               .trim(),
//             email: selectedCandidate?.email
//           })
//           setSubmitting(false)
//           if (success) navigate(-1)
//         }}
//       >
//         {({ setFieldValue, isSubmitting }) => {
//           const handleChange = value => {
//             const candidate = candidates.find(c => c.id === value) || {}
//             setSelectedCandidate(candidate)
//             setFieldValue('candidate_id', value)
//             fetchOfferRequestById(value)
//           }

//           return (
//             <Form className='space-y-4'>
//               <FormikSelectField
//                 name='candidate_id'
//                 className='w-full border p-2 rounded'
//                 options={candidates}
//                 selectKey='id'
//                 label='Candidate'
//                 getOptionLabel={c =>
//                   `${c.first_name || ''} ${c.second_name || ''} ${
//                     c.third_name || ''
//                   } ${c.forth_name || ''} ${c.family_name || ''}`
//                 }
//                 disabled={candidatesLoading}
//                 onChange={handleChange}
//               />

//               <div className='grid grid-cols-2 gap-4'>
//                 <FormikInputField label='Company Name' name='company_name' />
//                 <FormikInputField label='Postal Code' name='postal_code' />
//               </div>

//               <div className='grid grid-cols-2 gap-4'>
//                 <FormikInputField label='Zip Code' name='zip_code' />
//                 <FormikInputField label='Phone' name='phone' />
//               </div>

//               <div className='grid grid-cols-2 gap-4'>
//                 <FormikInputField label='CR Number' name='cr_number' />
//                 <FormikInputField label='Representative' name='representative' />
//               </div>

//               {/* Joining Date and Contract End Date */}
//               <div className='grid grid-cols-2 gap-4'>
//                 <FormikInputField
//                   label='Joining Date'
//                   name='joining_date'
//                   type='date'
//                   max='2100-12-31'
//                   value={joiningDate}
//                   onChange={e => setJoiningDate(e.target.value)}
//                 />
//                 <FormikInputField
//                   label='Contract End Date'
//                   name='contract_end_date'
//                   type='date'
//                   max='2100-12-31'
//                   value={contractEndDate}
//                   onChange={e => setContractEndDate(e.target.value)}
//                 />
//               </div>

//               {contractDuration && (
//                 <p className='text-sm text-gray-600 mt-2'>
//                   Contract Duration: {contractDuration}
//                 </p>
//               )}

//               <FormikInputField label='Note (English)' name='note_en' rows={4} />
//               <FormikInputField label='Note (Arabic)' name='note_ar' rows={4} />

//               <div className='border p-4 rounded bg-gray-50 mt-6'>
//                 <h3 className='font-semibold mb-2'>PDF Preview this</h3>
//                 <div id='cotract-pdf-preview'>
//                   <JobContractPDF
//                     data={{
//                       name: `${selectedCandidate?.first_name || ''} ${
//                         selectedCandidate?.family_name || ''
//                       }`,
//                       national_id: selectedCandidate?.national_id,
//                       phone: selectedCandidate?.mobile,
//                       job_title:
//                         selectedCandidate?.designation?.name ||
//                         selectedCandidate?.own_designation,
//                       basic_salary: offerRequest?.salary,
//                       housing_allowance: Math.round(offerRequest?.salary * 0.25),
//                       transportation_allowance: Math.round(
//                         offerRequest?.salary * 0.1
//                       ),
//                       total_salary: Math.round(offerRequest?.salary * 1.35),
//                       date: new Date().toLocaleDateString('ar-SA'),
//                       ...initialValues
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className='text-right mt-4 flex justify-end gap-4'>
//                 <SubmitButton
//                   type='button'
//                   onClick={() => {
//                     const element = document.getElementById(
//                       'cotract-pdf-preview'
//                     )
//                     import('html2pdf.js').then(html2pdf => {
//                       html2pdf.default().from(element).save('JobContract.pdf')
//                     })
//                   }}
//                   title='Download Contract'
//                   variant='outlined'
//                   disabled={!offerRequest}
//                 />
//                 <SubmitButton
//                   label='Create Contract'
//                   disabled={!offerRequest}
//                   isLoading={loading || isSubmitting || updateLoading}
//                   type='submit'
//                 />
//               </div>
//             </Form>
//           )
//         }}
//       </Formik>
//     </div>
//   )
// }

// export default ContractRequestForm
