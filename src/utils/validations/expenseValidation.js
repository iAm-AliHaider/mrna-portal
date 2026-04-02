import * as Yup from "yup";

const expenseValidationSchema = Yup.object({
  // expense_type: Yup.string().required("Required"),
  amount: Yup.number().typeError("Must be a number").positive("Amount must be positive").required("Required"),
  requested_date: Yup.date().required("Required"),
  reason: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  is_repeatable: Yup.boolean().required("Required"),
  // receipt: Yup.mixed(),
});

export default expenseValidationSchema; 