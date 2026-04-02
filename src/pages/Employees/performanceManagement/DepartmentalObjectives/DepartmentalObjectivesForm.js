import React from 'react'
import { Formik, Form } from 'formik'
import HomeIcon from '@mui/icons-material/Home'
import * as Yup from 'yup'
import FormikInputField from '../../../../components/common/FormikInputField'
import FormikMultiSelectField from '../../../../components/common/FormikMultiSelectField'

import SubmitButton from '../../../../components/common/SubmitButton'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import { useNavigate } from 'react-router-dom'
// import { startOfToday } from 'date-fns'
// import FormikSelectField from '../../../../components/common/FormikSelectField'
import {
  useAddDepartmentalObjective,
  // useDepartmentalUnits,
  useUpdateDepartmentalObjective
} from '../../../../utils/hooks/api/departmentalObjectives'

import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";


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
  // Departmental_unit_id: Yup.string().required(
  //   'Departmental unit is required'
  // )
})

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Departmental Objectives", href: "/performance/dept-objectives" },
  { title: 'Add/Update New Objective' }
];


const DepartmentalObjectivesForm = ({ selectedObjective = null }) => {
  const navigate = useNavigate()

  
    const { employees, loading: employeesLoading } =
      useCompanyEmployeesWithoutMyId();


    // Transform employee data to match the expected format for dropdowns
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label:
      `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
        emp.candidates?.second_name || ""
      } ${emp.candidates?.third_name || ""} ${
        emp.candidates?.forth_name || ""
      } ${emp.candidates?.family_name || ""}`.trim() || `Employee #${emp.id}`,
  }));


  const { addDepartmentalObjective, loading } =
    useAddDepartmentalObjective()
  const { updateDepartmentalObjective, loading: updateLoading } =
    useUpdateDepartmentalObjective()

  // const { DepartmentalUnits, loading: DepartmentalUnitsLoading } =
  //   useDepartmentalUnits()

  const handleSubmit = async (values, { resetForm }) => {

    if (selectedObjective && selectedObjective?.id) {
      await updateDepartmentalObjective(selectedObjective.id, values)
      navigate('/performance/dept-objectives')
      return
    }
    await addDepartmentalObjective(values)
    resetForm()
  }

  const initialValues = {
    objective_title: selectedObjective?.objective_title || '',
    weight: selectedObjective?.weight || 0,
    score: 100,
    start_period: selectedObjective?.start_period || '',
    end_period: selectedObjective?.end_period || '',
    // evaluation_360: selectedObjective?.evaluation_360 || false,
    performance_level: selectedObjective?.performance_level || '',
    notes: selectedObjective?.notes || '',
    // Departmental_unit_id: selectedObjective?.Departmental_unit_id || ''
  }

  return (
    <PageWrapperWithHeading title='Add New Departmental Objective' items={breadcrumbItems}>
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
                  max={100}
                  min={0}
                  disabled
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {/* <FormikSelectField
                  name='Departmental_unit_id'
                  label='Departmental Unit'
                  required
                  options={DepartmentalUnits}
                  disabled={DepartmentalUnitsLoading}
                  getOptionLabel={option => option?.name}
                  selectKey='id'
                /> */}
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

              <FormikMultiSelectField
                  name="employee_ids"
                  label="Employees"
                  options={employeeOptions}
                  disabled={employeesLoading}
                  // optional: when selecting employees, clear others
                  // handleChange={(list) => {
                  //   setFieldValue("employee_id", list);
                  // }}
                />

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

export default DepartmentalObjectivesForm
