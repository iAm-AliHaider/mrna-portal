import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../components/common/FormikInputField'
import { supabase } from '../../../../supabaseClient'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useUser } from '../../../../context/UserContext'
import SubmitButton from '../../../../components/common/SubmitButton'

const EmploymentVacation = ({ employment_type_id, isEditMode }) => {
  const user = useUser();
  const [leavesList, setLeavesList] = useState([])
  const [addDisabled, setAddDisabled] = useState(false)
  const TABLE_NAME = 'leaves_vacations_insurance'

  const defaultLeaves = [
    { name: 'Annual Leave', days_allowed: 30 },
    { name: 'Birth Leave', days_allowed: 3 },
    { name: 'Death Leave', days_allowed: 5 },
    { name: 'Delegation Leave', days_allowed: 60 },
    { name: 'Hajj Leave', days_allowed: 5 },
    { name: 'Marriage Leave', days_allowed: 5 },
    { name: 'Sick Leave', days_allowed: 120 },
    { name: 'Study Leave', days_allowed: 14 },
    { name: 'Unpaid Leave', days_allowed: 60 },
    { name: 'Maternity Leave Before Birth', days_allowed: 30 },
    { name: 'Maternity Leave After Birth', days_allowed: 70 }
  ]

  const isHr =  user?.user?.role === 'hr'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: leaves, error: leaveError } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .eq('type', 'leave')
          .eq('employment_type_id', employment_type_id)
        if (leaveError) throw leaveError
        setLeavesList(leaves || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [employment_type_id])

  // Add this function inside the EmploymentVacation component
  const handleAddAllLeaves = async (default_leave_inputs) => {
    const recordsToInsert = default_leave_inputs
      .filter(input => input && input.employment_type.trim())
      .map(input => ({
        name: input.employment_type.trim(),
        days_allowed: input.days_allowed,
        type: 'leave',
        employment_type_id,
        company_id: 1
      }));
    if (recordsToInsert.length === 0) return;
    try {
      const { data: insertedData, error } = await supabase
        .from(TABLE_NAME)
        .insert(recordsToInsert)
        .select();
      if (error) {
        console.error('Error inserting data:', error);
        return;
      }
      setLeavesList(prev => [...prev, ...insertedData]);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Formik
        initialValues={{
          default_leave_inputs: defaultLeaves.map(item => ({
            employment_type: item.name,
            days_allowed: item.days_allowed
          }))
        }}
        validationSchema={Yup.object({
          default_leave_inputs: Yup.array().of(
            Yup.object().shape({
              employment_type: Yup.string().required('Required'),
              days_allowed: Yup.number()
                .required('Required')
                .min(1, 'Must be at least 1')
            })
          )
        })}
        onSubmit={async (values, { resetForm }) => {
          // Only batch insert for defaultLeaves
          await handleAddAllLeaves(values.default_leave_inputs)
          resetForm()
          setAddDisabled(true)
        }}
      >
      {({ values, isSubmitting }) => (
  <Form>
    <Box width='100%' mt={2}>
      <>
      {values.default_leave_inputs.map((input, index) => (
        <Box
          key={index}
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
          gap={2}
          flexWrap='wrap'
        >
          <Box sx={{flex: 1}}>
            <FormikInputField
              name={`default_leave_inputs[${index}].employment_type`}
              label='Leave Type'
              required
              disabled
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormikInputField
              name={`default_leave_inputs[${index}].days_allowed`}
              label='Days Allowed'
              type='number'
              required
              disabled={!isHr}
            />
          </Box>
        </Box>
      ))}
      <div className='flex w-full flex-row-reverse my-5'>
       
        <SubmitButton 
                    title= "Add"
                    type='submit' 
                    isLoading={isSubmitting }
                    disabled={!employment_type_id || isEditMode || isSubmitting || addDisabled}
                  />
      </div>
      </>
    </Box>
  </Form>
)}
      </Formik>

      <Paper>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f0ff' }}>
              <TableCell>
                <strong>Leave</strong>
              </TableCell>
              <TableCell>
                <strong>Days Allowed</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leavesList.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item?.name}</TableCell>
                <TableCell>{item?.days_allowed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

export default EmploymentVacation
