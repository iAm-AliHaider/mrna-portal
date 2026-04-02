import * as Yup from 'yup';

const advanceSalaryValidationSchema = Yup.object({
  // amount: Yup.number().typeError('Amount must be a number').required('Amount is required'),
  requested_date: Yup.date()
    .required('Requested date is required')
    .min(new Date(), 'Requested date cannot be in the past'),
  reason: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
});

export default advanceSalaryValidationSchema; 