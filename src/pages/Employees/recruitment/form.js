import React from 'react'
import Modal from '../../../components/common/Modal'
import { getSchduledInterviewFieldName } from '../../../utils/helper'
import * as Yup from 'yup'
import InterviewEvaluationForm from './intervireEvaluationForm'
import { useUser } from '../../../context/UserContext'

const UpdateInterviewForm = ({
  onClose,
  open,
  currentData,
  handleSubmit,
  scheduleLoading = false,
  currentEmployeeId
}) => {
  let { noteFieldName, interviewType, interviewUrl, interviewLocation  } = getSchduledInterviewFieldName(
    currentData,
    currentEmployeeId
  )
  const { user } = useUser()
  const initialValues = currentData?.[noteFieldName]
    ? JSON.parse(currentData?.[noteFieldName])
    : {}

  const validationSchema = Yup.object().shape({
    [noteFieldName]: Yup.string().trim().required('Please enter your notes')
  })

  //   return (
  //     <Modal onClose={onClose} title="Update Interview" open={open}>
  //       <div className="flex flex-col">
  //       <InterviewEvaluationForm
  //   onSubmit={(finalNote) => {
  //     handleSubmit({
  //       note_one: finalNote,
  //       feedback_1: '', // future input
  //       feedback_2: '',
  //       feedback_3: '',
  //     });
  //   }}
  //   interviewerName={user?.full_name}
  // />
  //         {/* <Formik
  //           initialValues={initialValues}
  //           validationSchema={validationSchema}
  //           onSubmit={handleSubmit}
  //         > */}
  //           {({ isSubmitting }) => (
  //             <Form className="flex-1 overflow-y-auto space-y-6">
  //               <FormikInputField
  //                 name={noteFieldName}
  //                 label="Note"
  //                 required={true}
  //                 rows={4}
  //                 disabled={currentData?.[noteFieldName]}
  //               />

  //               <div className="mt-5 flex justify-end space-x-2 bg-white">
  //                 <SubmitButton
  //                   variant="outlined"
  //                   title="Cancel"
  //                   type="button"
  //                   onClick={onClose}
  //                 />
  //                 <SubmitButton
  //                   title="Submit"
  //                   type="submit"
  //                   isLoading={isSubmitting || scheduleLoading}
  //                   disabled={currentData?.[noteFieldName]}
  //                 />
  //               </div>
  //             </Form>
  //           )}
  //         </Formik>
  //       </div>
  //     </Modal>
  //   );

  return (
    <Modal onClose={onClose} title='Update Interview' open={open}>
      <div className='flex flex-col'>
        <InterviewEvaluationForm
          interviewerName={user?.first_name}
          readOnly={Object.keys(initialValues).length > 0}
          initialValues={initialValues}
          interviewType={currentData?.[interviewType] || ""}
          interviewUrl={currentData?.[interviewUrl] || ""}
          interviewLocation={currentData?.[interviewLocation] || ""}
          onSubmit={(finalNote, formikHelpers, isJobOffer) => {
            const { noteFieldName } = getSchduledInterviewFieldName(
              currentData,
              currentEmployeeId
            )

            handleSubmit(
              { [noteFieldName]: finalNote , },
              formikHelpers, // ✅ This will contain { setSubmitting, resetForm, ... }
              finalNote?.recommendation,
              isJobOffer
            )
          }}
        />
      </div>
    </Modal>
  )
}

export default UpdateInterviewForm
