import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';

import AuthFormBackgroundContainer from '../../components/common/AuthFormBackgroundContainer'
import FormikInputField from '../../components/common/FormikInputField'
import { Link } from 'react-router-dom'
import SubmitButton from '../../components/common/SubmitButton'

const initialValues = {
  email: ''
}

const validationSchema = Yup.object({
  email: Yup.string().required('Username is required')
})

const SignIn = () => {
  const handleSubmit = values => 

  return (
    <AuthFormBackgroundContainer>
      <h2 className='text-xl font-bold text-center text-primary mb-2'>
        Forgot Password
      </h2>
      <p className='text-center text-gray-600 mb-6 text-sm'>
        Enter your email to receive a password reset link
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className='flex flex-col gap-4'>
            <FormikInputField
              label=''
              name='email'
              placeholder='Email'
              Icon={LocalPostOfficeOutlinedIcon}
              required
            />

            <SubmitButton size='lg' title='Submit' type='submit' />
          </Form>
        )}
      </Formik>

      <div className='mt-6 text-center text-sm'>
        Remember your password?{' '}
        <Link to='/sign-in' className='text-blue-600 font-medium'>
          Sign in
        </Link>
      </div>
    </AuthFormBackgroundContainer>
  )
}

export default SignIn
