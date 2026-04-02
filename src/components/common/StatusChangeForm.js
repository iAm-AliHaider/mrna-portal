import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../components/common/Modal";
import SubmitButton from "../../components/common/SubmitButton";
import FormikInputField from "../../components/common/FormikInputField";
import FormikSelectField from "../../components/common/FormikSelectField";
import { useUser } from "../../context/UserContext";

const StatusChangeForm = ({
  onClose,
  open,
  id,
  formData,
  handleSubmit,
  loading,
  isViewOnly = false,
  title = "Status Change",
  oldLabel = "Old Value",
  newLabel = "New Value",
  oldOptions = [],
  newOptions = [],
  oldValueKey = "old_value",
  newValueKey = "new_value",
}) => {
  const { user } = useUser();

  const defaultValues = {
    [oldValueKey]: null,
    [newValueKey]: null,
    effective_date: "",
    reason: "",
  };

  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          [oldValueKey]: row[oldValueKey] || null,
          [newValueKey]: row[newValueKey] || null,
          effective_date: row.effective_date || "",
          reason: row.reason || "",
        });
      }
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, formData]);

  return (
    <Modal
      onClose={onClose}
      title={id ? `Edit ${title}` : `${title} Request`}
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
            {isViewOnly && (
              <>
                <FormikInputField
                  name="old_value_display"
                  label={oldLabel}
                  type="text"
                  value={values[oldValueKey] || "N/A"}
                  disabled={true}
                />
                <FormikInputField
                  name="new_value_display"
                  label={newLabel}
                  type="text"
                  value={values[newValueKey] || "N/A"}
                  disabled={true}
                />
              </>
            )}

            {!isViewOnly && oldOptions.length > 0 && (
              <FormikSelectField
                name={oldValueKey}
                label={oldLabel}
                options={oldOptions}
                placeholder={`Select ${oldLabel}`}
                required
                disabled={!!id}
              />
            )}

            {!isViewOnly && (
              <FormikSelectField
                name={newValueKey}
                label={newLabel}
                options={newOptions}
                placeholder={`Select ${newLabel}`}
                required
              />
            )}

            <FormikInputField
              name="effective_date"
              label="Effective Date"
              type="date"
              disabled={isViewOnly}
              required
            />

            <FormikInputField
              name="reason"
              label="Reason"
              rows={4}
              disabled={isViewOnly}
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

export default StatusChangeForm;
