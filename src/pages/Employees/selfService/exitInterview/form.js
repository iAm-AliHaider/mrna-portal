import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { Box, Alert } from "@mui/material";

const REASON_OPTIONS = [
  { label: "Resignation", value: "resignation" },
  { label: "Retirement", value: "retirement" },
  { label: "Termination", value: "termination" },
  { label: "End of Contract", value: "end_of_contract" },
  { label: "Contract Termination", value: "contract_termination" },
  { label: "Other", value: "other" },
];

const ExitInterviewForm = ({ onClose, open, id, formData, handleSubmit, loading, isViewOnly = false }) => {
  const defaultValues = { reason_for_leaving: "", feedback: "", recommendations: "" };
  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = typeof id === "object" ? id : formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          reason_for_leaving: row.reason_for_leaving || "",
          feedback: row.feedback || "",
          recommendations: row.recommendations || "",
        });
      }
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, formData]);

  return (
    <Modal onClose={onClose} title={isViewOnly ? "Exit Interview Details" : id ? "Edit Exit Interview" : "Exit Interview"} open={open}>
      <Formik enableReinitialize initialValues={initialValues} validateOnChange={false} onSubmit={(values, { setSubmitting }) => { handleSubmit(values, { setSubmitting }); }}>
        {({ isSubmitting, values }) => (
          <Form className="flex-1 overflow-y-auto space-y-6">
            {!isViewOnly && (
              <FormikSelectField name="reason_for_leaving" label="Reason for Leaving" options={REASON_OPTIONS} placeholder="Select reason" required />
            )}
            {isViewOnly && (
              <FormikInputField name="reason_for_leaving" label="Reason for Leaving" type="text" value={values.reason_for_leaving || "N/A"} disabled={true} />
            )}
            {!isViewOnly && (
              <Box mb={2}>
                <Alert severity="info">
                  Your responses are confidential and will be used to improve the workplace. Please be honest and constructive.
                </Alert>
              </Box>
            )}
            <FormikInputField name="feedback" label={isViewOnly ? "Feedback" : "Your Feedback"} placeholder="Share your experience — what worked well, what could be improved." rows={5} type="text" disabled={isViewOnly} required={!isViewOnly} />
            <FormikInputField name="recommendations" label="Recommendations" placeholder="What changes would you suggest to make this a better workplace?" rows={4} type="text" disabled={isViewOnly} />
            <div className="mt-4 border-t p-4 flex justify-end space-x-2 bg-white">
              <SubmitButton variant="outlined" title="Close" type="button" onClick={onClose} />
              {!isViewOnly && <SubmitButton title={id ? "Update" : "Submit Interview"} type="submit" isLoading={isSubmitting || loading} />}
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ExitInterviewForm;
