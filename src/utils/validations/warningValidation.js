import * as Yup from "yup";

const warningValidationSchema = Yup.object({
  effected_date: Yup.string()
    .required("Effected date is required")
    .test('not-past-date', 'Effected date cannot be in the past', function(value) {
      if (!value) return true; // Let required validation handle empty values
      
      const selectedDate = new Date(value);
      const today = new Date();
      
      // Reset time to compare only dates
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      return selectedDate >= today;
    }),
  subject: Yup.string().required("Subject is required"),
  warning: Yup.string().required("Warning text is required").test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  attachment: Yup.string(),
});

export default warningValidationSchema; 