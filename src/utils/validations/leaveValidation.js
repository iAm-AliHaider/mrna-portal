import * as Yup from "yup";

const leaveValidationSchema = Yup.object({
  leave_type_id: Yup.number()
    .typeError("Leave type is required")
    .required("Required"),

  leave_type: Yup.string().required("Required"),

  // email: Yup.string()
  //   .email("Invalid email format")
  //   .when("leave_type", {
  //     is: "Annual Leave",
  //     then: (schema) => schema.required("Email is required for Annual Leave"),
  //     otherwise: (schema) => schema.notRequired(),
  //   }),

  vacation_phone_no: Yup.string().when("leave_type", {
    is: "Annual Leave",
    then: (schema) =>
      schema
        .required("Phone number is required for Annual Leave")
        .min(6, "Phone number is too short")
        .max(20, "Phone number is too long"),
    otherwise: (schema) =>
      schema
        .notRequired()
        .min(6, "Phone number is too short")
        .max(20, "Phone number is too long"),
  }),

  start_date: Yup.string().when("leave_type", {
    is: "Annual Leave",
    then: (schema) =>
      schema
        .required("Required")
        .test(
          "is-future-date",
          "Start date must be after today",
          function (value) {
            if (!value) return true;
            const today = new Date();
            const selected = new Date(value);
            today.setHours(0, 0, 0, 0);
            selected.setHours(0, 0, 0, 0);
            return selected > today;
          }
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  end_date: Yup.string().when("leave_type", {
    is: "Annual Leave",
    then: (schema) =>
      schema
        .required("Required")
        .test(
          "end-date-after-start",
          "End date cannot be before start date",
          function (value) {
            const { start_date } = this.parent;
            if (!start_date || !value) return true;
            return new Date(value) >= new Date(start_date);
          }
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  // is_start_half_day: Yup.boolean().required(),
  // is_end_half_day: Yup.boolean().required(),

  // replacement_employee_id: Yup.string().nullable().notRequired(),

replacement_employee_id: Yup.mixed()
  .nullable()
  .when("leave_type", {
    is: (v) => v !== "Sick Leave",
    then: (schema) => schema.required("Replacement is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  attachment_path: Yup.mixed()
    .nullable()
    .when("leave_type", {
      is: "Sick Leave",
      then: (schema) =>
        schema.required("attachment is required for Sick Leave"),
      otherwise: (schema) => schema.notRequired(),
    }),

  reason: Yup.string(),
});

export default leaveValidationSchema;
