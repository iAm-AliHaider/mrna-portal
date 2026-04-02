"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";
import { trainingValidationSchema } from "../../../../utils/validations/trainingAndDevelopment";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";
import { useDepartments } from "../../../../utils/hooks/api/useDepartments";
import { parseISO, isValid, differenceInCalendarDays } from "date-fns";
import { addDays, format } from "date-fns";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";

const trainerTypeOptions = [
  { label: "Internal Trainer", value: "internal_trainer" },
  { label: "External Trainer", value: "external_trainer" },
  { label: "Online Training", value: "online_trainer" },
];

const mendatoryOptions = [
  { label: "Mandatory", value: "true" },
  { label: "Not Mandatory", value: "false" },
];

const initialValues = {
  course_name: "",
  created_at: "",
  course_details: "",
  end_at: "",
  employees_ids: [],
  department_ids: [],
  branch_ids: [],
  attachment_path: null,
  publisher: "",
  trainer_type: "",
  internal_trainer: null,
  external_trainer: "",
  duration: "",
  is_budgeted: false,
  upload_certificate_date: null,
};

const TrainingsForm = ({
  onClose,
  open,
  handleSubmit,
  loading,
  editingData,
  isEditing,
}) => {
  const [selectedTrainerType, setSelectedTrainerType] = useState("");
  const { employees, loading: loadingEmployees } =
    useCompanyEmployeesWithoutMyId();
  const { accounts: branches = [], loading: loadingBranches } =
    useGetAllBranches();
  const { departments: departmentsOptions, loading: loadingDepartments } =
    useDepartments();

  useEffect(() => {
    if (editingData && isEditing) {
      setSelectedTrainerType(
        editingData.internal_trainer ? "internal_trainer" : "external_trainer"
      );
    }
  }, [editingData, isEditing]);

  const getInitialValues = () => {
    if (editingData && isEditing) {
      return {
        course_name: editingData.course_name || "",
        created_at: editingData.created_at
          ? editingData.created_at.split("T")[0]
          : "",
        end_at: editingData.end_at ? editingData.end_at.split("T")[0] : "",
        employees_ids: Array.isArray(editingData.employees_ids)
          ? editingData.employees_ids.map((v) => v?.value ?? v)
          : editingData.employees_ids ?? [],
        department_ids: Array.isArray(editingData.department_ids)
          ? editingData.department_ids.map((v) => v?.value ?? v)
          : editingData.department_ids ?? [],
        branch_ids: Array.isArray(editingData.branch_ids)
          ? editingData.branch_ids.map((v) => v?.value ?? v)
          : editingData.branch_ids ?? [],
        course_details: editingData.course_details || "",
        attachment_path: editingData.attachment_path || null,
        publisher: editingData.publisher || "",
        trainer_type: editingData.internal_trainer
          ? "internal_trainer"
          : "external_trainer",
        internal_trainer: editingData.internal_trainer || null,
        external_trainer: editingData.external_trainer || "",
        duration: editingData.duration || "",
        is_budgeted: editingData.is_budgeted || "",
        upload_certificate_date: editingData.upload_certificate_date || null,
      };
    }
    return initialValues;
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        value: emp.id,
        label:
          `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
            emp.candidates?.second_name || ""
          } ${emp.candidates?.third_name || ""} ${
            emp.candidates?.forth_name || ""
          } ${emp.candidates?.family_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || `Employee #${emp.id}`,
      })),
    [employees]
  );

  function handleEndDateChange(endStr, startStr, setFieldValue) {
    setFieldValue("end_at", endStr);

    const start = parseISO(startStr || "");
    const end = parseISO(endStr || "");

    if (isValid(start) && isValid(end)) {
      const days = differenceInCalendarDays(end, start) + 1; // inclusive
      setFieldValue("duration", Math.max(days, 0));
    } else {
      setFieldValue("duration", "");
    }
  }

  return (
    <Modal
      onClose={onClose}
      title={isEditing ? "Edit Training" : "Add Training"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={trainingValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={!!isEditing}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Trainer Type */}
              <FormikSelectField
                name="is_mandatory"
                label="Mandatory / Non-Mendatory"
                options={mendatoryOptions}
                required
                onChange={(value) => {
                  setFieldValue("is_mandatory", value);
                }}
                value={values.is_mandatory}
                placeholder="Select"
              />

              <FormikSelectField
                name="trainer_type"
                label="Trainer Type"
                options={trainerTypeOptions}
                required
                onChange={(value) => {
                  setFieldValue("trainer_type", value);
                  setSelectedTrainerType(value);
                  setFieldValue("internal_trainer", "");
                  setFieldValue("external_trainer", "");
                }}
                value={values.trainer_type}
                placeholder="Select Trainer Type"
              />

              {values.trainer_type === "internal_trainer" && (
                <FormikSelectField
                  name="internal_trainer"
                  label="Select Internal Trainer"
                  options={employeeOptions}
                  required
                  placeholder="Select Internal Trainer"
                  loading={loadingEmployees}
                />
              )}

              {values.trainer_type === "external_trainer" && (
                <FormikInputField
                  name="external_trainer"
                  label="External Trainer Profile"
                  required
                  placeholder="Enter external trainer profile"
                />
              )}

              {/* Employees (hide if departments OR branches chosen) */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.department_ids) &&
                      values.department_ids.length > 0) ||
                    (Array.isArray(values.branch_ids) &&
                      values.branch_ids.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="employees_ids"
                  label="Employees"
                  placeholder="Select"
                  options={employeeOptions}
                  disabled={loadingEmployees}
                  handleChange={(list) => {
                    setFieldValue("employees_ids", list);
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("department_ids", []);
                      setFieldValue("branch_ids", []);
                    }
                  }}
                />
              </div>

              {/* Branches (hide if departments OR employees chosen) */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.department_ids) &&
                      values.department_ids.length > 0) ||
                    (Array.isArray(values.employees_ids) &&
                      values.employees_ids.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="branch_ids"
                  label="Branches"
                  options={branches.map((b) => ({
                    label: b.name,
                    value: String(b.id),
                  }))}
                  disabled={loadingBranches}
                  placeholder="Select"
                  handleChange={(list) => {
                    setFieldValue("branch_ids", list); // ✅ plural & correct key
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("department_ids", []); // ✅ clear others
                      setFieldValue("employees_ids", []);
                    }
                  }}
                />
              </div>

              {/* Departments (hide if branches OR employees chosen) */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.branch_ids) &&
                      values.branch_ids.length > 0) ||
                    (Array.isArray(values.employees_ids) &&
                      values.employees_ids.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="department_ids"
                  label="Departments"
                  options={departmentsOptions}
                  disabled={loadingDepartments}
                  placeholder="Select"
                  handleChange={(list) => {
                    setFieldValue("department_ids", list); // ✅ correct key
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("branch_ids", []); // ✅ clear others
                      setFieldValue("employees_ids", []);
                    }
                  }}
                />
              </div>

              <FormikInputField
                name="course_name"
                label="Enter Training Name"
                type="text"
                required
                placeholder="Enter training name"
              />

              <FormikInputField
                name="created_at"
                label="Start Date"
                type="date"
                placeholder="MM/DD/YYYY"
                max="2100-12-31"
              />

              <FormikInputField
                name="end_at"
                label="End Date"
                type="date"
                placeholder="MM/DD/YYYY"
                min={values.created_at}
                max="2100-12-31"
                onChange={(e) =>
                  handleEndDateChange(
                    e.target.value,
                    values.created_at,
                    setFieldValue
                  )
                }
              />

              <FormikInputField
                name="duration"
                label="Duration"
                type="number"
                required
                placeholder="Enter duration in hours"
              />

              <FormikInputField
                name="upload_certificate_date"
                label="Certificate Upload Date"
                type="date"
                placeholder="MM/DD/YYYY"
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
              />

              <FormikInputField
                name="course_details"
                label="Training Details"
                textarea
                rows={3}
                placeholder="Enter training details"
              />

              <FormikInputField
                name="publisher"
                label="Publisher"
                required
                placeholder="Enter publisher name"
              />

              <FileUploadField name="attachment_path" label="Attachment" />

              <FormikCheckbox
                name="is_budgeted"
                label="Budgeted"
              />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  onClick={onClose}
                  type="button"
                />
                <SubmitButton
                  title={isEditing ? "Update" : "Submit"}
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

export default TrainingsForm;
