// import * as Yup from "yup";

// // === Compute tomorrow's date string ===
// const today = new Date();
// const tomorrow = new Date(today);
// tomorrow?.setDate(tomorrow?.getDate() + 1);
// const tomorrowStr = tomorrow?.toISOString()?.split("T")[0]; 

// // === Validation schema ===
// export const vacancyValidationSchema = Yup.object({
//   title: Yup.string().required("Job title is required"),
//   vacancies_to_fill: Yup.number()
//     .typeError("Must be a number")
//     .required("Number of vacancies is required"),
//   date_to_fill_by: Yup.date()
//     .min(tomorrowStr, "Date must be in the future")
//     .required("Date is required"),
//   designation_id: Yup.string().required("Designation is required"),
//   organizational_unit_id: Yup.string().required("Department is required"),
//   survey_id: Yup.string().nullable(),
//   notes: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   external_applicant_description: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   // New field validations
//   reporting_to: Yup.number().nullable().typeError("Must be a number"),
//   employment_grade: Yup.string().optional(),
//   start_step: Yup.string().optional(),
//   end_step: Yup.string().optional(),
//   salary_range_objectives: Yup.string().optional(),
//   core_function: Yup.string().optional(),
//   years_of_experience: Yup.number().nullable().typeError("Must be a number"),
//   job_level: Yup.string().optional(),
//   ticket_level: Yup.string().optional(),
//   number_of_tickets_per_year: Yup.number().nullable().typeError("Must be a number"),
//   core_competency_weight: Yup.number().nullable().typeError("Must be a number"),
//   technical_competency_weight: Yup.number().nullable().typeError("Must be a number"),
//   // overtime_type: Yup.string().optional(),
//   additional_salary_definition: Yup.string().optional(),
//   // debit_account: Yup.string().optional(),
//   // no_of_positions: Yup.number().nullable().typeError("Must be a number"),
//   career_paths: Yup.string().optional(),
//   active: Yup.boolean().default(true),
//   allow_promotion_outside_path: Yup.boolean().default(false),
//   allow_sussesion_plan: Yup.boolean().default(false),
//   eligibility_for_bonuses_from_appraisal: Yup.boolean().default(false),
  
//   // New text field validations
//   responsibilities: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   deductions: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   business_travel: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   benefits: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   assets_category: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   training_and_courses: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
  
//   // Simple text field validations
//   education: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   certificates: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   competencies: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
// });

// export default vacancyValidationSchema; 



// validations/vacancyValidationSchema.js
import * as Yup from "yup";

/** === Compute tomorrow (YYYY-MM-DD) === */
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split("T")[0];

/** Reusable ISO date string validator: required + not in past */
const dateISORequiredFuture = Yup.string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .required("This date is required")
  .test("not-in-past", "Date must be in the future", (v) => !v || v >= tomorrowStr);

/** Helper: trim-only guard for optional text fields */
const noSpaces = (v) => !v || v.trim().length > 0;

/** === Final schema ===
 * Uses arrays: date_to_fill_by_start[], date_to_fill_by_end[]
 * Ensures:
 *  - vacancies_to_fill >= 1
 *  - each date is present and >= tomorrow
 *  - end[i] >= start[i] with error shown on the exact end field index
 */
export const vacancyValidationSchema = Yup.object({
  title: Yup.string().required("Job title is required"),

  vacancies_to_fill: Yup.number()
    .transform((v, orig) => (orig === "" || orig == null ? undefined : v))
    .typeError("Must be a number")
    .integer("Enter a whole number")
    .min(1, "At least 1 vacancy required")
    .required("Number of vacancies is required"),

  // ⛔ remove any old single-date rule (date_to_fill_by)
  // ✅ arrays for N rows:
  date_to_fill_by_start: Yup.array()
    .of(dateISORequiredFuture)
    .ensure()
    .when("vacancies_to_fill", (n, schema) =>
      schema.test("starts-length", "Please fill all start dates", (arr) => {
        const count = Number(n || 0);
        return count === 0 || (Array.isArray(arr) && arr.length === count && arr.every(Boolean));
      })
    ),

  date_to_fill_by_end: Yup.array()
    .of(dateISORequiredFuture)
    .ensure()
    .when("vacancies_to_fill", (n, schema) =>
      schema
        .test("ends-length", "Please fill all end dates", (arr) => {
          const count = Number(n || 0);
          return count === 0 || (Array.isArray(arr) && arr.length === count && arr.every(Boolean));
        })
        // Attach error to the exact end[i] if it's before start[i]
        .test("end-after-start-each", function (ends) {
          const starts = this.parent?.date_to_fill_by_start || [];
          const e = Array.isArray(ends) ? ends : [];
          const len = Math.max(starts.length, e.length);
          for (let i = 0; i < len; i++) {
            const s = starts[i];
            const end = e[i];
            if (!s || !end) continue; // required handled by .of() rules above
            // compare as real dates to avoid string pitfalls
            const sd = new Date(s);
            const ed = new Date(end);
            if (!isNaN(sd) && !isNaN(ed) && ed < sd) {
              return this.createError({
                path: `date_to_fill_by_end[${i}]`,
                message: "End date must be on or after start date",
              });
            }
          }
          return true;
        })
    ),

  designation_id: Yup.string().required("Designation is required"),
  organizational_unit_id: Yup.string().required("Department is required"),
  survey_id: Yup.string().nullable(),

  notes: Yup.string().optional().test("no-spaces", "Spaces are not allowed", noSpaces),
  external_applicant_description: Yup.string()
    .optional()
    .test("no-spaces", "Spaces are not allowed", noSpaces),

  // Numeric/select fields
  reporting_to: Yup.number().nullable().typeError("Must be a number"),
  employment_grade: Yup.string().optional(),
  start_step: Yup.string().optional(),
  end_step: Yup.string().optional(),
  salary_range_objectives: Yup.string().optional(),
  core_function: Yup.string().optional(),
  years_of_experience: Yup.number().nullable().typeError("Must be a number"),
  job_level: Yup.string().optional(),
  ticket_level: Yup.string().optional(),
  number_of_tickets_per_year: Yup.number().nullable().typeError("Must be a number"),
  core_competency_weight: Yup.number().nullable().typeError("Must be a number"),
  technical_competency_weight: Yup.number().nullable().typeError("Must be a number"),

  additional_salary_definition: Yup.string().optional(),
  career_paths: Yup.string().optional(),

  active: Yup.boolean().default(true),
  allow_promotion_outside_path: Yup.boolean().default(false),
  allow_sussesion_plan: Yup.boolean().default(false),
  eligibility_for_bonuses_from_appraisal: Yup.boolean().default(false),

  // Long text fields (trim guard)
  responsibilities: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  deductions: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  business_travel: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  benefits: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  assets_category: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  training_and_courses: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),

  // Simple text fields
  education: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  certificates: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
  competencies: Yup.string().test("no-spaces", "Spaces are not allowed", noSpaces),
});

export default vacancyValidationSchema;
