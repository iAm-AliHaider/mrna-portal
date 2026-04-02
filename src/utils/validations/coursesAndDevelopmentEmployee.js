import * as Yup from "yup";



export const validationSchema = Yup.object().shape({
  type: Yup.string().required("Required"),
  course_id: Yup.string().required("Required"),
  required_date: Yup.string().required("Required"),
  determine_need: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  attachment_path: Yup.mixed().required("Attachment is required"),
});   