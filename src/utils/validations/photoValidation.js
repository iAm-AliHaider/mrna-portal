import * as Yup from 'yup';

const photoValidationSchema = Yup.object().shape({
  photo_url: Yup.mixed().required('Photo is required')
});

export default photoValidationSchema; 