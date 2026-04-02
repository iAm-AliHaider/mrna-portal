import * as Yup from 'yup'

export const overtimeRequestValidationSchema = Yup.object().shape({
  date: Yup.date()
    .required('Date is required')
    .min(new Date(2020, 0, 1), 'Date must be 2020 or later')
    .max(new Date(2030, 11, 31), 'Date must be 2030 or earlier'),

  hours: Yup.number()
    .required('Hours is required')
    .min(0, 'Hours must be 0 or greater')
    .max(24, 'Hours cannot exceed 24')
    .integer('Hours must be an integer'),

  minutes: Yup.number()
    .required('Minutes is required')
    .min(0, 'Minutes must be between 0 and 59')
    .max(59, 'Minutes must be between 0 and 59')
    .integer('Minutes must be an integer'),

  amount: Yup.number()
    .required('Amount is required')
    .min(0, 'Amount must be 0 or greater')
    .typeError('Amount must be a valid number'),
})

export const validateOvertimeRequest = (values) => {
  const errors = {}

  // Custom validation for total time
  if (values.hours === 0 && values.minutes === 0) {
    errors.hours = 'Total time cannot be zero'
  }

  // Custom validation for amount vs time
  if (values.amount && values.hours && values.minutes) {
    const totalMinutes = (values.hours * 60) + values.minutes
    if (totalMinutes > 0 && values.amount <= 0) {
      errors.amount = 'Amount must be greater than 0 for overtime'
    }
  }

  return errors
} 