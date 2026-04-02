import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../components/common/FormikInputField";
import SubmitButton from "../../components/common/SubmitButton";
import Modal from "../../components/common/Modal";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const ChangePasswordModal = ({ open, onCancel, onSubmit }) => {
  return (
    <Modal
      title="Change Password"
      open={open}
      footer={null}
      onCancel={onCancel}
      centered
    >
      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          onSubmit(values.password); // send only password to parent
          actions.resetForm();
        }}
      >
        {() => (
          <Form className="space-y-4">
            <FormikInputField
              name="password"
              label="New Password"
              type="password"
              required
            />
            <FormikInputField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SubmitButton label="Change Password" />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ChangePasswordModal;
