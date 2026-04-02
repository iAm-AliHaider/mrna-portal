import * as Yup from "yup";

export const trainingAndDevelopmentAdminValidationSchema = Yup.object().shape({
    type: Yup.string().required("Required"),
    course_id: Yup.string().required("Required"),
    required_date: Yup.string().required("Required"),
    determine_need: Yup.string().required("Required").test('no-spaces', 'Determine need cannot be just spaces', value => {
        return !value || value.trim().length > 0;
      }),
    attachment_path: Yup.mixed().nullable() ,
  });
  