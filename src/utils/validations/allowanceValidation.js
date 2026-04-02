import * as Yup from "yup";

const allowanceValidationSchema = Yup.object({
  amount: Yup.string().required("Required"),
  requested_date: Yup.string().required("Required"),
  reason: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  is_repeatable: Yup.boolean().required("Required"),
});

export default allowanceValidationSchema; 