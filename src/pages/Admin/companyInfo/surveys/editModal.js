import React, { useState } from 'react'
import { Dialog, Button, Typography } from '@mui/material'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { SURVEYS_OPTIONS } from '../../../../utils/constants'
import FormikSelectField from '../../../../components/common/FormikSelectField'

const EditSurveys = ({ currentData, setCurrentData, handleUpdate }) => {
  const [openModal, setOpenModal] = useState(true)
  const validationSchema = Yup.object().shape({
    status: Yup.string().required('Status is required')
  })

  const initialValues = {
    status: currentData?.status || ''
  }

  const handleClose = async () => {
    if (currentData) {
      setOpenModal(false)
      setCurrentData(null)
    }
  }

  return (
    <Dialog open={openModal} maxWidth='md' fullWidth>
      <div className='p-5'>
      <Typography variant='h5' gutterBottom className='px-5'>
          Name: {currentData?.survey_name}
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUpdate}
        >
          {({ values, isSubmitting }) => (
            <Form className='flex flex-col gap-4 mt-4 px-5'>
              <div>
                <div className='grid grid-cols-1 gap-4'>
                  <FormikSelectField
                    label='Status'
                    name='status'
                    options={SURVEYS_OPTIONS}
                    required
                    placeholder='Select Status'
                  />
                </div>
              </div>

              <div className='mt-4 sticky bottom-0 flex justify-end gap-3'>
                <Button
                  variant="outlined" title="Cancel" type="button"
                  size='large'
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  variant='contained'
                  isLoading={isSubmitting}
                  color='primary'
                  type='submit'
                >
                  Update
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        </div>
    </Dialog>
  )
}

export default EditSurveys
