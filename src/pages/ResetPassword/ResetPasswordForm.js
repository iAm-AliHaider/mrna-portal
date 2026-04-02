import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { Link } from "react-router-dom";
import AuthFormBackgroundContainer from "../../components/common/AuthFormBackgroundContainer";
import SubmitButton from "../../components/common/SubmitButton";
import FormikInputField from "../../components/common/FormikInputField";

const initialValues = {
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[#?!@$%^&*-]/, "Must contain a special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPassword = () => {
  const handleSubmit = (values) => {
  };

  return (
    <AuthFormBackgroundContainer>
      <h2 className="text-xl font-bold text-center text-[#3f3f9b] mb-2">
        Set New Password
      </h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Secure your account with new password
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="flex flex-col gap-4">
            <FormikInputField
              name="password"
              type="password"
              placeholder="Password"
            />
            <FormikInputField
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
            />

            {/* Password rules */}
            <div className="text-sm text-gray-700 mt-2">
              <p className="mb-1 font-medium">It’s better to have:</p>
              <ul className="list-disc ml-5 space-y-1 text-gray-600">
                <li>Must have at least 6 characters.</li>
                <li>Upper & Lower case letters</li>
                <li>Include at least a symbol (#$&)</li>
                <li>Include at least a number</li>
              </ul>
            </div>

            <SubmitButton size="lg" title="Reset Password" type="submit" fullWidth className="mt-4" />
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center text-sm">
        Back to Login?{" "}
        <Link to="/sign-in" className="text-blue-600 font-medium">
          Click here
        </Link>
      </div>
    </AuthFormBackgroundContainer>
  );
};

export default ResetPassword;
