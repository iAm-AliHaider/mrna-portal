import * as Yup from 'yup';
import REQUEST_STATUS from '../enums/requestStatus';

const vacationRequestValidationSchema = Yup.object({
  vacation_type: Yup.string().required('Vacation type is required'),
  start_date: Yup.date().required('Start date is required'),
  return_date: Yup.date()
    .required('Return date is required')
    .min(Yup.ref('start_date'), 'Return date cannot be before start date'),
  actual_return_date: Yup.date()
    .required('Actual return date is required')
    .min(Yup.ref('start_date'), 'Actual return date cannot be before start date'),
  morning_half_day: Yup.boolean().required('Please specify if morning half day applies'),
  evening_half_day: Yup.boolean().required('Please specify if evening half day applies'),
  paid_days: Yup.number().integer('Paid days must be an integer').required('Paid days are required'),
  unpaid_days: Yup.number().integer('Unpaid days must be an integer').required('Unpaid days are required'),
  holiday_days: Yup.number().integer('Holiday days must be an integer').required('Holiday days are required'),
  weekend_days: Yup.number().integer('Weekend days must be an integer').required('Weekend days are required'),
  last_returned_date: Yup.date()
    .required('Last returned date is required')
    .min(Yup.ref('start_date'), 'Last returned date cannot be before start date'),
  task_list_status: Yup.string().oneOf(Object.values(REQUEST_STATUS)).default('pending'),
  ref_number: Yup.string()
    .matches(/^\d{11}$/, 'Reference number must be exactly 11 digits')
    .required('Reference number is required'),
  description: Yup.string().max(1000, 'Description is too long').test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  assigned_to: Yup.string().nullable().notRequired(),
});

export default vacationRequestValidationSchema; 