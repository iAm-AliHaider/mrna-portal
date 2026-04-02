import React from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useCompanyEmployees } from "../../../../utils/hooks/api/candidates";
import { getInterviewValidationSchema } from "../../../../utils/validationSchemas";
import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
const InterviewScheduleForm = ({
  onClose,
  open,
  currentData,
  reportType,
  handleSubmit,
  scheduleLoading = false,
  setOtherInterviewers,
  otherInterviewers,
}) => {
  const { employees, loading } = useCompanyEmployees();
  const { accounts: branches = [], loading: branchesLoading } =
    useGetAllBranches();
  const validationSchema = getInterviewValidationSchema(reportType);

  const dateFieldName = `${reportType}_date`;
  const timeFieldName = `${reportType}_time`;
  const interviewerFieldName =
    reportType === "first_interview"
      ? "interviewer_id"
      : `${reportType.split("_")[0]}_interviewer_id`;

  const scheduleInterviewFields = `is_${reportType}_scheduled`;
  const interviewTypeField = `${reportType}_type`;
  const interviewUrlField = `${reportType}_url`;
  const interviewLocationField = `${reportType}_location`;
  const panelMembersField = `${reportType}_panel_members`;

  let initialValues = {
    [timeFieldName]: null,
    [dateFieldName]: null,
    [interviewerFieldName]: null,
    [scheduleInterviewFields]: true,
    [interviewTypeField]: "",
    [interviewUrlField]: "",
    [interviewLocationField]: "",
    [panelMembersField]: [],
  };

  if (currentData) {
    initialValues = {
      [timeFieldName]: currentData[timeFieldName] || null,
      [dateFieldName]: currentData[dateFieldName] || null,
      [interviewerFieldName]: currentData[interviewerFieldName] || null,
      [scheduleInterviewFields]: currentData[scheduleInterviewFields] || true,
      [interviewTypeField]: currentData[interviewTypeField] || "",
      [interviewUrlField]: currentData[interviewUrlField] || "",
      [interviewLocationField]: currentData[interviewLocationField] || "",
      [panelMembersField]:
        currentData[panelMembersField] &&
        currentData[panelMembersField].length > 0
          ? currentData[panelMembersField].map((emp) => emp.id)
          : [],
    };
  }

  // console.log(branches)

  return (
    <Modal onClose={onClose} title="Interview Schedule" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <FormikInputField
                  name={timeFieldName}
                  label="Time"
                  type="time"
                  required={true}
                />
                <FormikInputField
                  name={dateFieldName}
                  label="Date"
                  type="date"
                  max="2100-12-31"
                  required={true}
                />
              </div>

              <FormikSelectField
                name={interviewerFieldName}
                label="Interviewer"
                type="text"
                placeholder="Interviewer"
                options={employees}
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${option?.candidates?.full_name}` ||
                  ""
                }
                selectKey="id"
                disabled={loading}
                required={true}
              />

              <FormikMultiSelectField
                name={panelMembersField}
                label="Panel Members (Max 2)"
                options={employees.filter(
                  (emp) => emp.id !== values[interviewerFieldName]
                )}
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${option?.candidates?.full_name}` ||
                  ""
                }
                selectKey="id"
                placeholder="Select panel members"
                required={false}
                disabled={!values[interviewerFieldName]}
                onChange={(selectedIds) => {
                  setFieldValue(panelMembersField, selectedIds);
                  const selectedObjects = employees
                    .filter((emp) => selectedIds.includes(emp.id))
                    .map((emp) => ({
                      id: emp.id,
                      name:
                        `${emp?.employee_code} - ${emp?.candidates?.full_name}` ||
                        "",
                      email: emp?.work_email || null,
                    }));
                  setOtherInterviewers(selectedObjects);
                }}
              />

              <FormikSelectField
                name={interviewTypeField}
                label="Interview Type"
                options={[
                  { label: "Online", value: "online" },
                  { label: "Physical", value: "physical" },
                ]}
                placeholder="Select Interview Type"
                required
                onChange={(val) => {
                  // val should be the *value* ('online'|'physical'), not the whole option
                  setFieldValue(interviewTypeField, val);
                  setFieldValue(interviewUrlField, "");
                  setFieldValue(interviewLocationField, "");
                }}
              />

              {values[interviewTypeField] === "online" && (
                <FormikInputField
                  name={interviewUrlField}
                  label="Interview URL"
                  placeholder="https://meet.example.com"
                  type="url"
                  required
                />
              )}
              {values[interviewTypeField] === "physical" && (
                <FormikSelectField
                  name={interviewLocationField}
                  label="Location"
                  placeholder="Select branch..."
                  options={branches}
                  getOptionLabel={(option) => option?.name || ""}
                  selectKey="id"
                  required
                  loading={branchesLoading}
                />
              )}

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  onClick={onClose}
                />
                <SubmitButton
                  title="Submit"
                  type="submit"
                  isLoading={isSubmitting || scheduleLoading}
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

export default InterviewScheduleForm;
