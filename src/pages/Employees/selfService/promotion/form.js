import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useUser } from "../../../../context/UserContext";
import { useDesignations } from "../../../../utils/hooks/api/useDesignations";

const PromotionForm = ({
  onClose,
  open,
  id,
  formData,
  handleSubmit,
  loading,
  isViewOnly = false,
}) => {
  const { user } = useUser();
  const { data: designations = [] } = useDesignations();

  const defaultValues = {
    old_designation_id: null,
    new_designation_id: null,
    effective_date: "",
    reason: "",
  };

  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          old_designation_id: row.old_designation_id || null,
          new_designation_id: row.new_designation_id || null,
          effective_date: row.effective_date || "",
          reason: row.reason || "",
        });
      }
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, formData]);

  const designationOptions = (designations || []).map((d) => ({
    label: d.name || `Designation ${d.id}`,
    value: d.id,
  }));

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Promotion" : "Promotion Request"}
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
                  name="old_designation"
                  label="Current Designation"
                  type="text"
                  value={values.old_designation || "N/A"}
                  disabled={true}
                />
                <FormikInputField
                  name="new_designation"
                  label="New Designation"
                  type="text"
                  value={values.new_designation || "N/A"}
                  disabled={true}
                />
              </>
            )}

            {!isViewOnly && (
              <>
                <FormikSelectField
                  name="old_designation_id"
                  label="Current Designation"
                  options={designationOptions}
                  placeholder="Select Current Designation"
                  required
                  disabled={!!id}
                />

                <FormikSelectField
                  name="new_designation_id"
                  label="New Designation"
                  options={designationOptions}
                  placeholder="Select New Designation"
                  required
                />
              </>
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
              label="Reason for Promotion"
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

export default PromotionForm;
