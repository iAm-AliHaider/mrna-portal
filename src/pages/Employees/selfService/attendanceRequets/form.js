// NewAttendanceRequestForm.js
import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";

// Options for requestType (late_in, early_out, missed_punch based on your schema)
const requestTypeOptions = [
  // { label: "Late In", value: "late_in" },
  // { label: "Early Out", value: "early_out" },
  { label: "Missed Punch", value: "missed_punch" },
  { label: "Personal Hours", value: "personal_hours" },
  { label: "Official Hours", value: "official_hours" },
];

// Options for checkType
const checkTypeOptions = [
  { label: "Check In", value: "check_in" },
  { label: "Check Out", value: "check_out" },
];

// Formik initial values
const initialValuesConst = {
  request_type: '',
  original_date: '',
  new_time: '',
  check_type: '',
  reason: '',
};
const todayStr = new Date().toISOString().split("T")[0];

// Validation schema
// const validationSchema = Yup.object({
//   request_type: Yup.string().required("Required"),
//   original_date: Yup.date()
//     .required("Required")
//     .max(new Date(), "Date cannot be in the future"),
//   new_time: Yup.string().required("Required"),
//   check_type: Yup.string().required("Required"),
//   reason: Yup.string().test('no-spaces', 'Spaces are not allowed', value => {
//     return !value || value.trim().length > 0;
//   }).required("Required"),
// });


// const validationSchema = Yup.object({
//   request_type: Yup.string().required("Required"),
//   original_date: Yup.date()
//     .required("Required")
//     .max(new Date(), "Date cannot be in the future"),

//   new_time: Yup.string().when("request_type", {
//     is: (val) => !["personal_hours", "official_hours"].includes(val),
//     then: (schema) => schema.required("Required"),
//     otherwise: (schema) => schema.notRequired()
//   }),

//   check_type: Yup.string().when("request_type", {
//     is: (val) => !["personal_hours", "official_hours"].includes(val),
//     then: (schema) => schema.required("Required"),
//     otherwise: (schema) => schema.notRequired()
//   }),

//   start_time: Yup.string().when("request_type", {
//     is: (val) => ["personal_hours", "official_hours"].includes(val),
//     then: (schema) => schema.required("Start time is required"),
//     otherwise: (schema) => schema.notRequired()
//   }),

//   end_time: Yup.string().when("request_type", {
//     is: (val) => ["personal_hours", "official_hours"].includes(val),
//     then: (schema) => schema.required("End time is required"),
//     otherwise: (schema) => schema.notRequired()
//   }),

//   reason: Yup.string()
//     .test("no-spaces", "Spaces are not allowed", (value) => {
//       return !value || value.trim().length > 0;
//     })
//     .required("Required")
// });
const getTimeDifferenceInHours = (start, end) => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return (endMinutes - startMinutes) / 60;
};

const validationSchema = Yup.object({
  request_type: Yup.string().required("Required"),
  original_date: Yup.date()
    .required("Required")
    .max(new Date(), "Date cannot be in the future"),

  new_time: Yup.string().when("request_type", {
    is: (val) => !["personal_hours", "official_hours"].includes(val),
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired()
  }),

  check_type: Yup.string().when("request_type", {
    is: (val) => !["personal_hours", "official_hours"].includes(val),
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired()
  }),

  start_time: Yup.string().when("request_type", {
    is: (val) => ["personal_hours", "official_hours"].includes(val),
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.notRequired()
  }),

  end_time: Yup.string().when("request_type", {
    is: (val) => ["personal_hours", "official_hours"].includes(val),
    then: (schema) =>
      schema
        .required("End time is required")
        .test(
          "is-after-start",
          "End time must be after start time",
          function (end_time) {
            const { start_time, request_type } = this.parent;
            if (
              !start_time ||
              !end_time ||
              !["personal_hours", "official_hours"].includes(request_type)
            )
              return true;
            return end_time > start_time;
          }
        )
        .test(
          "max-4-hours",
          "Personal hours cannot exceed 4 hours",
          function (end_time) {
            const { start_time, request_type } = this.parent;
            if (
              !start_time ||
              !end_time ||
              request_type !== "personal_hours"
            )
              return true;

            const diff = getTimeDifferenceInHours(start_time, end_time);
            return diff <= 4;
          }
        ),
    otherwise: (schema) => schema.notRequired()
  }),

  reason: Yup.string()
    .test("no-spaces", "Spaces are not allowed", (value) => {
      return !value || value.trim().length > 0;
    })
    .required("Required")
});


const NewAttendanceRequestForm = ({ onClose, open, id, attendanceData, handleSubmit, loading }) => {
  const [initialValues, setInitialValues] = React.useState(initialValuesConst);
  useEffect(() => {
    if (id && attendanceData && attendanceData.length > 0) {
      const row = attendanceData.find(r => r.id === id);
      if (row) {
        setInitialValues(row);
      }
    } else {
      setInitialValues(initialValuesConst);
    }
  }, [id, attendanceData]);

  // Function to get check type options based on request type
  const getCheckTypeOptions = (requestType) => {
    switch (requestType) {
      case 'late_in':
        return [{ label: "Check In", value: "check_in" }];
      case 'early_out':
        return [{ label: "Check Out", value: "check_out" }];
      case 'missed_punch':
        return checkTypeOptions; // Both options
      default:
        return []; // No options when no request type is selected
    }
  };

  return (
    <Modal onClose={onClose} title="Attendance Request" open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ isValid, isSubmitting, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Request Type */}
              <FormikSelectField
                name="request_type"
                label="Request Type"
                options={requestTypeOptions}
                placeholder="Select"
                required
              />
              {/* Attendance Date (no future dates) */}
              <FormikInputField
                name="original_date"
                label="Select Date (Get Attendance)"
                type="date"
                required
                max="2100-12-31"
              />

              <div className="grid grid-cols-2 gap-4">
                {!["personal_hours", "official_hours"].includes(values.request_type) && (
                  <>
                    <FormikInputField
                      name="new_time"
                      label="New Time"
                      type="time"
                      required
                    />
                    <FormikSelectField
                      name="check_type"
                      label="Check Type"
                      options={getCheckTypeOptions(values.request_type)}
                      placeholder={
                        values.request_type ? "Select" : "Select Request Type First"
                      }
                      required
                      disabled={!values.request_type}
                    />
                  </>
                )}

                {["personal_hours", "official_hours"].includes(values.request_type) && (
                  <>
                    <FormikInputField
                      name="start_time"
                      label="Start Time"
                      type="time"
                      required
                    />
                    <FormikInputField
                      name="end_time"
                      label="End Time"
                      type="time"
                      required
                    />
                  </>
                )}
              </div>

              {/* Reason */}
              <FormikInputField
                name="reason"
                label="Reason"
                textarea
                rows={3}
                placeholder="Add Reason"
                required
              />

              {/* Buttons */}
              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Close"
                  type="button"
                  onClick={onClose}
                />
                <SubmitButton
                  title="Send Change Request"
                  type="submit"
                  isLoading={isSubmitting || loading}
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewAttendanceRequestForm;