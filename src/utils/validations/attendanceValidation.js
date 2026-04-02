import * as Yup from "yup";

const attendanceValidationSchema = Yup.object({
  request_type: Yup.string().required("Required"),
  original_date: Yup.date().required("Required").max(new Date(), "Date cannot be in the future"),
  new_time: Yup.string().required("Required"),
  check_type: Yup.string().required("Required"),
  reason: Yup.string().test('no-spaces', 'Reason cannot be just spaces', value => {
    return !value || value.trim().length > 0;
  }),
});

export default attendanceValidationSchema; 