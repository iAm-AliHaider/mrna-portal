import React from 'react'
import { Formik, Form } from 'formik'
import HomeIcon from '@mui/icons-material/Home'
import * as Yup from 'yup'
import FormikInputField from '../../../../components/common/FormikInputField'
import SubmitButton from '../../../../components/common/SubmitButton'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import { useNavigate } from 'react-router-dom'
// import { startOfToday } from 'date-fns'
// import FormikSelectField from '../../../../components/common/FormikSelectField'
import {
  useAddOrganizationalObjective,
  // useOrganizationalUnits,
  useUpdateOrganizationalObjective
} from '../../../../utils/hooks/api/companyObjectives'

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
    .required('End period is required'),
  // organizational_unit_id: Yup.string().required(
  //   'Organizational unit is required'
  // )
})

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Organizational Objectives", href: "/performance/org-objectives" },
  { title: 'Add/Update New Objective' }
];

const OrganizationalObjectivesForm = ({ selectedObjective = null }) => {
  const navigate = useNavigate()

  const { addOrganizationalObjective, loading } =
    useAddOrganizationalObjective()
  const { updateOrganizationalObjective, loading: updateLoading } =
    useUpdateOrganizationalObjective()

  // const { organizationalUnits, loading: organizationalUnitsLoading } =
  //   useOrganizationalUnits()

  const handleSubmit = async (values, { resetForm }) => {
    if (selectedObjective && selectedObjective?.id) {
      await updateOrganizationalObjective(selectedObjective.id, values)
      navigate('/performance/org-objectives')
      return
    }
    await addOrganizationalObjective(values)
    resetForm()
  }

  const initialValues = {
    objective_title: selectedObjective?.objective_title || '',
    weight: selectedObjective?.weight || 0,
    score: selectedObjective?.is_probation ? 5 : 100,
    start_period: selectedObjective?.start_period || '',
    end_period: selectedObjective?.end_period || '',
    // evaluation_360: selectedObjective?.evaluation_360 || false,
    performance_level: selectedObjective?.performance_level || '',
    notes: selectedObjective?.notes || '',
    // organizational_unit_id: selectedObjective?.organizational_unit_id || ''
  }

  // console.log('selectedObjective', selectedObjective)

  return (
    <PageWrapperWithHeading title='Add New Organizational Objective' items={breadcrumbItems}>
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
                <FormikInputField
                  name='objective_title'
                  label='Title'
                  required
                />
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
                  max={selectedObjective?.is_probation ? 5 : 100}
                  min={0}
                  disabled
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {/* <FormikSelectField
                  name='organizational_unit_id'
                  label='Organizational Unit'
                  required
                  options={organizationalUnits}
                  disabled={organizationalUnitsLoading}
                  getOptionLabel={option => option?.name}
                  selectKey='id'
                /> */}
                <FormikInputField
                  name='start_period'
                  label='Start Period'
                  type='date'
                  max="2100-12-31"
                  required
                />
                <FormikInputField
                  name='end_period'
                  label='End Period'
                  type='date'
                  max="2100-12-31"
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

export default OrganizationalObjectivesForm
