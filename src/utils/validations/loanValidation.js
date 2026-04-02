import * as Yup from "yup";

const loanValidationSchema = Yup.object({
  loan_type_id: Yup.string().required("Required"),
  request_date: Yup.date()
    .required("Required")
    .min(new Date(), "Request date cannot be in the past"),
  requested_amount: Yup.number().required("Required"),
  reason: Yup.string().test("no-spaces", "Spaces are not allowed", (value) => {
    return !value || value.trim().length > 0;
  }),
  duration: Yup.number()
    .required("Duration is required")
    .max(60, "Duration cannot exceed 60 months"),
  notes: Yup.string().test("no-spaces", "Spaces are not allowed", (value) => {
    return !value || value.trim().length > 0;
  }),
});

export default loanValidationSchema;
