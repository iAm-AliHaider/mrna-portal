// import * as Yup from "yup";

// const resignationValidationSchema = Yup.object({
//   effected_date: Yup.date()
//     .required("Effected Date is required"),
//   subject: Yup.string().required("Subject is required"),
//   resignation: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }),
//   attachment: Yup.mixed(),
//   successor_id: Yup.string().required("Successor is required"),
// });

// export default resignationValidationSchema;   



// utils/validations/resignationValidation.js
import * as Yup from "yup";
import { ROLES } from "../constants"; // adjust path if needed

export const resignationValidationSchema = (userRole, type, isOnBehalf) =>
  Yup.object({
    effected_date: Yup.date().required("Effected Date is required"),
    subject: Yup.string().required("Subject is required"),
    resignation: Yup.string().test(
      "no-spaces",
      "Spaces are not allowed",
      (value) => !value || value.trim().length > 0
    ),
    attachment: Yup.mixed(),

    // Required only if the user is an EMPLOYEE; otherwise optional
    successor_id:
      userRole === ROLES.EMPLOYEE || type === 'termination' || type === 'contract'
        ? Yup.string().nullable().notRequired()
        : Yup.string().required("Successor is required"),
    employee_id:
      isOnBehalf
        ? Yup.string().required("Employee is required")
        : Yup.string().nullable().notRequired(),
  });

export default resignationValidationSchema;

