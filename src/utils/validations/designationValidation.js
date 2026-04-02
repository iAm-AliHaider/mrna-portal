import * as Yup from 'yup';

const designationValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Designation name is required')
    .min(2, 'Designation name must be at least 2 characters')
    .max(100, 'Designation name must not exceed 100 characters')
    .trim()
    .matches(/^[a-zA-Z\s]+$/, 'Designation name can only contain letters and spaces'),
  
  code: Yup.string()
    .required('Designation code is required')
    .min(2, 'Designation code must be at least 2 characters')
    .max(20, 'Designation code must not exceed 20 characters')
    .trim()
    .matches(/^[A-Z0-9]+$/, 'Designation code can only contain uppercase letters and numbers'),
  
  department_id: Yup.string()
    .required('Department is required')
    .test('not-empty', 'Please select a department', value => value && value !== ''),
  
  job_description: Yup.string()
    .required('Job description is required')
    .min(10, 'Job description must be at least 10 characters')
    .max(1000, 'Job description must not exceed 1000 characters')
    .trim()
    .test('no-spaces', 'Spaces are not allowed', value => {
      return !value || value.trim().length > 0;
    }),
  
});

export default designationValidationSchema; 