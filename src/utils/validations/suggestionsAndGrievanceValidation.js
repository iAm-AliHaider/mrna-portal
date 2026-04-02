import * as Yup from "yup";

const suggestionsAndGrievanceValidationSchema = Yup.object({
  report_type: Yup.string().required("Report type is required"),

  employees_involved: Yup.array().when("report_type", {
    is: (val) => val === "grievance",
    then: (schema) =>
      schema
        .min(1, "Select at least one employee")
        .required("Employees involved is required"),
    otherwise: (schema) => schema.optional().nullable(true),
  }),

  witnesses: Yup.array().when("report_type", {
    is: (val) => val === "grievance",
    then: (schema) =>
      schema
        .min(1, "Select at least one witness")
        .required("Witnesses is required"),
    otherwise: (schema) => schema.optional().nullable(true),
  }),
  escalation_level: Yup.number().required("Esclation is required"),
  description: Yup.string().required("Description is required"),
  urgency: Yup.string().required("Urgency is required"),
  category: Yup.string().required("Category is required"),
  action_expected: Yup.string().required("Action expected is required"),
  action_taken: Yup.string().optional(),
  resolution_notes: Yup.string().optional(),
  resolution_date: Yup.date().nullable().optional(),

  review_notes: Yup.string(),
  // report_date: Yup.date().required("Report date is required"),
  // reporter_employee_id: Yup.string().required("Reporter employee is required"),
  // closed_date: Yup.date(),
  assigned_to_id: Yup.string(),
  created_by: Yup.string(),
  updated_by: Yup.string(),
});

export default suggestionsAndGrievanceValidationSchema;
