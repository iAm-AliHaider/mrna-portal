import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useUser } from "../../../../context/UserContext";

const OfficialHoursPermissionForm = ({
  onClose,
  open,
  id,
  formData,
  handleSubmit,
  loading,
  isViewOnly = false,
}) => {
  const { user } = useUser();

  const defaultValues = {
    permission_date: "",
    permission_time_from: "",
    permission_time_to: "",
    reason: "",
  };

  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          permission_date: row.permission_date || "",
          permission_time_from: row.permission_time_from || "",
          permission_time_to: row.permission_time_to || "",
          reason: row.reason || "",
        });
      }
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, formData]);

  const permissionTypeOptions = [
    { label: "Late Arrival", value: "late_arrival" },
    { label: "Early Departure", value: "early_departure" },
    { label: "Both", value: "both" },
  ];

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Official Hours Permission" : "Official Hours Permission"}
      open={open}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validateOnChange={false}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, { setSubmitting });
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="flex-1 overflow-y-auto space-y-6">
            <FormikInputField
              name="permission_date"
              label="Permission Date"
              type="date"
              disabled={isViewOnly}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormikInputField
                name="permission_time_from"
                label="Time From"
                type="time"
                disabled={isViewOnly}
                required
              />
              <FormikInputField
                name="permission_time_to"
                label="Time To"
                type="time"
                disabled={isViewOnly}
                required
              />
            </div>

            <FormikInputField
              name="reason"
              label="Reason"
              rows={4}
              disabled={isViewOnly}
              required
            />

            <div className="mt-4 border-t p-4 flex justify-end space-x-2 bg-white">
              <SubmitButton
                variant="outlined"
                title="Close"
                type="button"
                onClick={onClose}
              />
              {!isViewOnly && (
                <SubmitButton
                  title={id ? "Update Request" : "Submit Request"}
                  type="submit"
                  isLoading={isSubmitting || loading}
                />
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default OfficialHoursPermissionForm;
