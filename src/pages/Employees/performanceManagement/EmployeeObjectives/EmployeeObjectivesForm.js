import React from 'react'
import { Formik, Form } from 'formik'
import { FormControlLabel, Radio } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import * as Yup from 'yup'
import FormikInputField from '../../../../components/common/FormikInputField'
import SubmitButton from '../../../../components/common/SubmitButton'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import {
  useAddEmployeeObjective,
  useUpdateEmployeeObjective
} from '../../../../utils/hooks/api/employeeObjectives'
import { useNavigate } from 'react-router-dom'
// import { startOfToday } from 'date-fns'

const validationSchema = Yup.object({
  objective_title: Yup.string().required('Title is required'),
  weight: Yup.number()
    .typeError('Weight must be a number')
    .required('Weight is required')
    .min(1, 'Weight cannot be less than 1')
    .max(100, 'Weight cannot be greater than 100'),
  score: Yup.number()
    .typeError('Score must be a number')
    .required('Score is required'),
  start_period: Yup.date()
    // .min(startOfToday(), 'Start period cannot be in the past')
    .required('Start period is required'),
  end_period: Yup.date()
    .min(Yup.ref('start_period'), 'End period cannot be before start period')
    .required('End period is required')
})

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Performance Management', href: '/performance/appraisals' },
  { title: 'Employees Objectives', href: '/performance/employee-objectives' },
  { title: 'Add/Update New Objective' }
]

const EmployeeObjectivesForm = ({ selectedObjective = null }) => {
  const navigate = useNavigate()
  const { addEmployeeObjective, loading } = useAddEmployeeObjective()
  const { updateEmployeeObjective, loading: updateLoading } =
    useUpdateEmployeeObjective()

  const handleSubmit = async (values, { resetForm }) => {
    if (selectedObjective && selectedObjective?.id) {
      await updateEmployeeObjective(selectedObjective.id, values)
      navigate('/performance/employee-objectives')
      return
    }
    await addEmployeeObjective(values)
    resetForm()
  }

  const initialValues = {
    objective_title: selectedObjective?.objective_title || '',
    weight: selectedObjective?.weight || 0,
    score: 100,
    start_period: selectedObjective?.start_period || '',
    end_period: selectedObjective?.end_period || '',
    evaluation_360: selectedObjective?.evaluation_360 || false,
    performance_level: selectedObjective?.performance_level || '',
    notes: selectedObjective?.notes || ''
  }

  return (
    <PageWrapperWithHeading title='Add New Objective' items={breadcrumbItems}>
      <div className='bg-white p-4 rounded-lg shadow-md'>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue }) => (
            <Form className='space-y-6'>
              <div className='grid grid-cols-3 gap-4'>
                <FormikInputField name='objective_title' label='Title' required />
                <FormikInputField
                  name='weight'
                  label='Weight'
                  type='number'
                  max={100}
                  min={0}
                  required
                />
                <FormikInputField
                  name='score'
                  label='Target Score'
                  type='number'
                  disabled
                  max={100}
                  min={0}
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormikInputField
                  name='start_period'
                  label='Start Period'
                  type='date'
                  required
                />
                <FormikInputField
                  name='end_period'
                  label='End Period'
                  type='date'
                  required
                />
              </div>
              {/* <FormControlLabel
                control={
                  <Radio
                    checked={values.evaluation_360}
                    onChange={e =>
                      setFieldValue('evaluation_360', e.target.checked)
                    }
                  />
                }
                label='Evaluation 360'
              /> */}

              <FormikInputField
                name='performance_level'
                label='Performance Level'
              />
              <FormikInputField
                name='notes'
                label='Notes'
                type='text'
                rows={4}
              />

              <div className='flex justify-end'>
                <SubmitButton
                  type='submit'
                  isLoading={loading || updateLoading}
                  title={
                    selectedObjective ? 'Update Objective' : 'Add Objective'
                  }
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  )
}

export default EmployeeObjectivesForm
