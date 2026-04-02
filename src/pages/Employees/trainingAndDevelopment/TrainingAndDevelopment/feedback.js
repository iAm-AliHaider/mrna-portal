"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";

const courseOptions = [
  { label: "Marketing", value: "marketing" },
  { label: "Business Development", value: "business_development" },
  { label: "App Training", value: "app_training" },
  { label: "Leadership Skills", value: "leadership_skills" },
  { label: "Technical Skills", value: "technical_skills" },
];

const initialValues = {
  courseName: "",
  suggestion: "",
};

const validationSchema = Yup.object({
  courseName: Yup.string().required("Required"),
  suggestion: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }).required("Required"),
});

const Feedback = ({ onClose, open }) => {
  return (
    <Modal onClose={onClose} title="Feedback" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {() => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikSelectField
                name="courseName"
                label="Select Course*"
                options={courseOptions}
                required
                placeholder="Select"
              />

              <FormikInputField
                name="suggestion"
                label="Suggestion*"
                textarea
                rows={3}
                required
                placeholder="Enter your suggestion"
              />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  onClick={onClose}
                  type="button"
                />
                <SubmitButton title="Submit" type="submit" />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default Feedback;