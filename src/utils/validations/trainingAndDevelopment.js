import * as Yup from "yup";

export const trainingValidationSchema = Yup.object().shape({
  course_name: Yup.string().required("Required"),
  // created_at: Yup.string().required("Required"),
  publisher: Yup.string().required("Required"),
  trainer_type: Yup.string().required("Required"),
  duration: Yup.number().required("Duration is required").positive("Duration must be positive").integer("Duration must be a whole number"),
  internal_trainer: Yup.string().when('trainer_type', {
    is: 'internal_trainer',
    then: () => Yup.string().required("Internal trainer selection is required"),
    otherwise: () => Yup.string().nullable()
  }),
  external_trainer: Yup.string().when('trainer_type', {
    is: 'external_trainer',
    then: () => Yup.string().required("External trainer profile is required"),
    otherwise: () => Yup.string().nullable()
  }),
});

export const courseValidationSchema = Yup.object().shape({
  course_name: Yup.string().required("Required"),
  // created_at: Yup.string().required("Required"),
  publisher: Yup.string().required("Required"),
  trainer_type: Yup.string().required("Required"),
  duration: Yup.number().required("Duration is required").positive("Duration must be positive").integer("Duration must be a whole number"),
  internal_trainer: Yup.string().when('trainer_type', {
    is: 'internal_trainer',
    then: () => Yup.string().required("Internal trainer selection is required"),
    otherwise: () => Yup.string().nullable()
  }),
  external_trainer: Yup.string().when('trainer_type', {
    is: 'external_trainer',
    then: () => Yup.string().required("External trainer profile is required"),
    otherwise: () => Yup.string().nullable()
  }),
  course_details: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
}); 