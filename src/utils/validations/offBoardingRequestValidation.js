import * as Yup from 'yup';

const offBoardingRequestValidationSchema = Yup.object().shape({
  employee_id: Yup.string().required('Grade is required'),
  reason: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }).required('Reason is required')
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  // termination_date: Yup.date()
  //   .required('Termination date is required')
  //   .min(new Date(), 'Termination date cannot be in the past'),
});

export default offBoardingRequestValidationSchema; 