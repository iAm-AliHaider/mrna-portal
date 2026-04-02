"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useGetTypedTrainingsAndCourses } from "../../../../utils/hooks/api/trainingAndDevelopment";
import { trainingAndDevelopmentAdminValidationSchema } from "../../../../utils/validations/trainingAndDevelopmentAdmin";
import { useUser } from "../../../../context/UserContext";

const typeOptions = [
  { label: "Course", value: "course" },
  { label: "Training", value: "training" },
];

// Use strings to avoid falsy/clearing issues with Select/Autocomplete
const mandatoryOptions = [
  // { label: "All", value: "all" },
  { label: "Mandatory", value: "true" },
  { label: "Not Mandatory", value: "false" },
];

const initialValues = {
  type: "",
  course_id: "",
  required_date: "",
  determine_need: "",
  // store as string: 'all' | 'true' | 'false'
  mandatory: "all",
  attachment_path: null,
};

// ---- helpers --------------------------------------------------------------

const includesId = (arr, id) =>
  Array.isArray(arr) && arr.some((x) => String(x) === String(id));

const toLabel = (it) =>
  String(
    it?.name ??
      it?.course_name ??
      it?.training_name ??
      it?.title ??
      `#${it?.id ?? ""}`
  );

const isPastDate = (iso) => {
  if (!iso) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  return d < today;
};

// Normalize DB truthy/falsy to strict boolean or null
const toDbBool = (v) => {
  if (v === true || v === false) return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return null; // null/undefined/unknown
};

// --------------------------------------------------------------------------

const TrainingAndDevelopmentForm = ({ onClose, open, handleSubmit, loading }) => {
  const [selectedType, setSelectedType] = useState("");
  const { user } = useUser();

  // Fetch all trainings/courses for the selected type
  const { data: allItems = [], loading: loadingOptions } =
    useGetTypedTrainingsAndCourses(selectedType);

  return (
    <Modal onClose={onClose} title="Apply for Training / Course" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={trainingAndDevelopmentAdminValidationSchema}
          // onSubmit={handleSubmit}
          onSubmit={(values, formikHelpers) => {
    // ✅ Inject selectedType before sending to parent handleSubmit
    handleSubmit({ ...values, selectedType }, formikHelpers);
  }}
        >
          {({ values, setFieldValue, isValid, isSubmitting }) => {
            // 1) Targeting: items visible to this user
            const visibleItems = allItems.filter(
              (item) =>
                includesId(item?.employee_ids, user?.id) ||
                includesId(item?.department_ids, user?.department) ||
                includesId(item?.branch_ids, user?.branch_id) ||
                (item?.employee_ids && item?.employee_ids.length === 0) ||
                (item?.department_ids && item?.department_ids.length === 0) ||
                (item?.department_ids && item?.branch_ids.length === 0)
            ); 

            // 2) Mandatory filter:
            //    - 'true'  => only is_mandatory === true
            //    - 'false' => is_mandatory === false OR null/undefined
            //    - 'all'   => no filter
            const filtered = visibleItems.filter((it) => {
              const sel = values.mandatory; // 'all' | 'true' | 'false'
              if (sel === "all") return true;

              const dbVal = toDbBool(it?.is_mandatory); // true | false | null
              if (sel === "true") return dbVal === true;
              if (sel === "false") return dbVal === false || dbVal === null;
              return true;
            });

            // 3) Build options with guaranteed string labels
            const trainingOptions = filtered.map((it) => ({
              value: it.id,
              label: toLabel(it),
            }));

            const selected = allItems.find(
              (c) => String(c.id) === String(values.course_id)
            );
            const courseDateValid = selected ? isPastDate(selected?.created_at) : true;
            const showDateError = Boolean(values.course_id) && !courseDateValid;

            return (
              <Form className="flex-1 overflow-y-auto space-y-6">
                {showDateError && (
                  <div className="text-red-500 text-sm mt-2 bg-red-50 p-3 rounded-md border border-red-200">
                    You cannot apply for this {values.type || "record"} as the start date
                    is today or in the future. Please select one that has already started.
                  </div>
                )}

                {/* Type */}
                <FormikSelectField
                  name="type"
                  label="Type"
                  options={typeOptions}
                  required
                  value={values.type}
                  placeholder="Select Type"
                  onChange={(val) => {
                    setFieldValue("type", val);
                    setSelectedType(val);
                    // reset dependent fields
                    setFieldValue("course_id", "");
                    setFieldValue("required_date", "");
                  }}
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

                {/* Course/Training (depends on type + filters) */}
                {!!values.type && (
                  <FormikSelectField
                    name="course_id"
                    label={`Select ${values.type === "training" ? "Training" : "Course"}`}
                    options={trainingOptions}
                    required
                    placeholder={`Select ${values.type === "training" ? "Training" : "Course"}`}
                    disabled={loadingOptions}
                    // Make sure label is always string
                    getOptionLabel={(opt) => (opt?.label ?? "").toString()}
                    // Tell the field which key stores the value (so Formik can keep a primitive id)
                    selectKey="value"
                    onChange={(val) => {
                      setFieldValue("course_id", val);
                      const sel = allItems.find(
                        (c) => String(c.id) === String(val)
                      );
                      const dateStr = sel?.created_at
                        ? String(sel.created_at).split("T")[0]
                        : "";
                      setFieldValue("required_date", dateStr);
                    }}
                  />
                )}

                <FormikInputField
                  name="required_date"
                  label="Start Date"
                  type="date"
                  required
                  placeholder="YYYY-MM-DD"
                  disabled
                />

                <FormikInputField
                  name="determine_need"
                  label="Why do you need this training/course?"
                  textarea
                  rows={3}
                  required
                  placeholder="Please explain why you need this training/course"
                />

                <FileUploadField name="attachment_path" label="Attachment" />

                <div className="mt-5 flex justify-end space-x-2 bg-white">
                  <SubmitButton
                    variant="outlined"
                    title="Cancel"
                    onClick={onClose}
                    type="button"
                  />
                  <SubmitButton
                    title="Submit"
                    type="submit"
                    isLoading={isSubmitting || loading}
                    disabled={!isValid || isSubmitting || loading || !courseDateValid}
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

export default TrainingAndDevelopmentForm;
