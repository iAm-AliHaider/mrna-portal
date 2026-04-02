"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useGetTypedTrainingsAndCourses } from "../../../../utils/hooks/api/trainingAndDevelopment";

import { trainingAndDevelopmentAdminValidationSchema } from "../../../../utils/validations/trainingAndDevelopmentAdmin";

const typeOptions = [
  { label: "Course", value: "course" },
  { label: "Training", value: "training" },
];

const initialValues = {
  type: "",
  course_id: "",
  required_date: "",
  determine_need: "",
  attachment_path: null,
};

// Use strings to avoid falsy/clearing issues with Select/Autocomplete
const mandatoryOptions = [
  // { label: "All", value: "all" },
  { label: "Mandatory", value: "true" },
  { label: "Not Mandatory", value: "false" },
];

// Normalize DB truthy/falsy to strict boolean or null
const toDbBool = (v) => {
  if (v === true || v === false) return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return null; // null/undefined/unknown
};

const TrainingAndCoursesForm = ({ onClose, open, handleSubmit, loading }) => {
  const [selectedType, setSelectedType] = useState("");
  const { data, loading: loadingOptions } =
    useGetTypedTrainingsAndCourses(selectedType);

  // Function to check if course date is today or in the future
  const isCourseDateValid = (courseDate) => {
    if (!courseDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const courseStartDate = new Date(courseDate);
    return courseStartDate >= today;
  };

  return (
    <Modal onClose={onClose} title="Apply for Training / Course" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={trainingAndDevelopmentAdminValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isValid, isSubmitting }) => {
            // Check if the selected course date is valid
            const selectedCourse = data.find(
              (course) => course.id === parseInt(values.course_id)
            );
            const courseDateValid = selectedCourse
              ? isCourseDateValid(selectedCourse.created_at)
              : true;
            const showDateError = values.course_id && !courseDateValid;

            // 2) Mandatory filter:
            //    - 'true'  => only is_mandatory === true
            //    - 'false' => is_mandatory === false OR null/undefined
            //    - 'all'   => no filter
            const filteredOtpions = data.filter((it) => {
              const sel = values.mandatory; // 'all' | 'true' | 'false'
              if (sel === "all") return true;

              const dbVal = toDbBool(it?.is_mandatory); // true | false | null
              if (sel === "true") return dbVal === true;
              if (sel === "false") return dbVal === false || dbVal === null;
              return true;
            });

            // 3) Build options with guaranteed string labels
            // const trainingOptions = filtered.map((it) => ({
            //   value: it.id,
            //   label: toLabel(it),
            // }));

            return (
              <Form className="flex-1 overflow-y-auto space-y-6">
                {/* Error message for invalid course date */}
                {showDateError && (
                  <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-md border border-red-200">
                    You cannot apply for this course/training as the start date
                    is in the past. Please select a course that starts today or
                    in the future.
                  </div>
                )}
                {/* Type select field */}
                <FormikSelectField
                  name="type"
                  label="Type"
                  options={typeOptions}
                  required
                  onChange={(value) => {
                    setFieldValue("type", value);
                    setSelectedType(value);
                    setFieldValue("course_id", "");
                    setFieldValue("required_date", "");
                  }}
                  value={values.type}
                  placeholder="Select Type"
                />

                {/* Mandatory filter (string values to avoid falsy clearing) */}
                <FormikSelectField
                  name="mandatory"
                  label="Mandatory / Non-Mandatory"
                  options={mandatoryOptions}
                  value={values.mandatory} // 'all' | 'true' | 'false'
                  placeholder="Select"
                  // don't use isClearable; we have an explicit 'All' option
                  onChange={(val) => {
                    setFieldValue("mandatory", val); // val is one of the strings above
                    setFieldValue("course_id", "");
                    setFieldValue("required_date", "");
                  }}
                />

                {/* Dynamic options based on type */}
                {values.type && (
                  <FormikSelectField
                    name="course_id"
                    label={`Select ${
                      values.type === "training" ? "Training" : "Course"
                    }`}
                    options={filteredOtpions}
                    required
                    placeholder={`Select ${
                      values.type === "training" ? "Training" : "Course"
                    }`}
                    getOptionLabel={(o) => o.course_name}
                    selectKey="id"
                    disabled={loadingOptions}
                    onChange={(value) => {
                      setFieldValue("course_id", value);
                      // Find the selected course and set its date
                      const selectedCourse = filteredOtpions.find(
                        (course) => course.id === parseInt(value)
                      );
                      if (selectedCourse && selectedCourse.created_at) {
                        // Convert the date to YYYY-MM-DD format for the date input
                        const dateStr = selectedCourse.created_at.split("T")[0];
                        setFieldValue("required_date", dateStr);
                      }
                    }}
                  />
                )}

                <FormikInputField
                  name="required_date"
                  label="Start Date"
                  type="date"
                  placeholder="MM/DD/YYYY"
                  disabled={true}
                />

                <FormikInputField
                  name="determine_need"
                  label="Why do you need this training/course?"
                  textarea
                  rows={3}
                  required
                  placeholder="Please explain why you need this training/course"
                />

                <FileUploadField
                  name="attachment_path"
                  label="Attachment"
                  required={false}
                />

                {/* {error && (
                  <div className="text-red-500 text-sm mt-2">{error}</div>
                )} */}

                <div className="mt-5 flex justify-end space-x-2 bg-white">
                  <SubmitButton
                    variant="outlined"
                    title="Cancel"
                    onClick={onClose}
                    type="button"
                    // isLoading={isSubmitting}
                  />
                  <SubmitButton
                    title="Submit"
                    type="submit"
                    isLoading={isSubmitting || loading}
                    disabled={
                      !isValid || isSubmitting || loading || !courseDateValid
                    }
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default TrainingAndCoursesForm;
