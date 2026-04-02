import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useEmployeesForDropdown } from "../../../../utils/hooks/api/companyInfo";
import { Divider } from "@mui/material";

const REASON_OPTIONS = [
  { label: "Resignation", value: "resignation" },
  { label: "Retirement", value: "retirement" },
  { label: "Termination", value: "termination" },
  { label: "End of Contract", value: "end_of_contract" },
  { label: "Contract Termination", value: "contract_termination" },
  { label: "Other", value: "other" },
];
const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];
const INTERVIEW_TYPE_OPTIONS = [
  { label: "Physical", value: "physical" },
  { label: "Online", value: "online" },
];

const ExitInterviewAdminForm = ({ onClose, open, id, formData, handleSubmit, loading, isViewOnly = false }) => {
  const { data: employees = [] } = useEmployeesForDropdown();
  const employeeOptions = employees.map((e) => ({
    label: e.employee_code ? `${e.employee_code} — ${e.full_name || `Employee ${e.id}`}` : `${e.full_name || `Employee ${e.id}`}`,
    value: e.id,
  }));

  const defaultValues = { employee_id: null, reason_for_leaving: "", interview_type: "physical", interviewer_name: "", interview_date: "", feedback: "", recommendations: "", status: "pending", hr_comments: "" };
  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = typeof id === "object" ? id : formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          employee_id: row.employee_id || null,
          reason_for_leaving: row.reason_for_leaving || "",
          interview_type: row.interview_type || "physical",
          interviewer_name: row.interviewer_name || "",
          interview_date: row.interview_date || "",
          feedback: row.feedback || "",
          recommendations: row.recommendations || "",
          status: row.status || "pending",
          hr_comments: row.hr_comments || "",
        });
      }
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, formData]);

  return (
    <Modal onClose={onClose} title={isViewOnly ? "Exit Interview" : id ? "Edit Exit Interview" : "New Exit Interview"} open={open}>
      <Formik enableReinitialize initialValues={initialValues} validateOnChange={false} onSubmit={(values, { setSubmitting }) => { handleSubmit(values, { setSubmitting }); }}>
        {({ isSubmitting, values }) => (
          <Form className="flex-1 overflow-y-auto space-y-6">
            {!isViewOnly && !id && (
              <FormikSelectField name="employee_id" label="Employee" options={employeeOptions} placeholder="Select employee" required />
            )}
            {isViewOnly && <FormikInputField name="employee_id" label="Employee ID" type="text" value={values.employee_id || "—"} disabled={true} />}
            <FormikSelectField name="reason_for_leaving" label="Reason for Leaving" options={REASON_OPTIONS} placeholder="Select reason" disabled={isViewOnly} required={!isViewOnly} />
            <FormikSelectField name="interview_type" label="Interview Type" options={INTERVIEW_TYPE_OPTIONS} disabled={isViewOnly} />
            <FormikInputField name="interviewer_name" label="Interviewer Name" type="text" disabled={isViewOnly} />
            <FormikInputField name="interview_date" label="Interview Date" type="date" disabled={isViewOnly} />
            <Divider />
            <FormikInputField name="feedback" label="Employee Feedback" placeholder="Employee's responses and comments" rows={5} type="text" disabled={isViewOnly} required={!isViewOnly} />
            <FormikInputField name="recommendations" label="Recommendations" placeholder="Employee's suggestions" rows={4} type="text" disabled={isViewOnly} />
            <Divider />
            {(isViewOnly || id) && <FormikSelectField name="status" label={isViewOnly ? "Status" : "Update Status"} options={STATUS_OPTIONS} />}
            <FormikInputField name="hr_comments" label="HR Comments (Internal)" placeholder="Confidential notes for HR records only" rows={3} type="text" disabled={isViewOnly} />
            <div className="mt-4 border-t p-4 flex justify-end space-x-2 bg-white">
              <SubmitButton variant="outlined" title="Close" type="button" onClick={onClose} />
              {!isViewOnly && <SubmitButton title={id ? "Update" : "Save Interview"} type="submit" isLoading={isSubmitting || loading} />}
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ExitInterviewAdminForm;
