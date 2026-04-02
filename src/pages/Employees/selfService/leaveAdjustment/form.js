import React from "react";
import { Formik, Form } from "formik";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import CustomTable from "../../../../components/tables/customeTable";
import { useEmployeeLeaveQuota } from "../../../../utils/hooks/api/useEmployeeLeaveQuota";
import { useUser } from "../../../../context/UserContext";

const LeaveAdjustmentForm = ({
  onClose,
  open,
  id,
  formData,
  handleSubmit,
  loading,
  isViewOnly = false,
}) => {
  const { user } = useUser();
  const employeeId = user?.id;
  const { data: leaveQuotas = [] } = useEmployeeLeaveQuota(employeeId);

  const defaultValues = {
    leave_type_id: null,
    adjustment_days: "",
    reason: "",
  };

  const [initialValues, setInitialValues] = React.useState(defaultValues);

  React.useEffect(() => {
    if (id && formData?.length) {
      const row = formData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          leave_type_id: row.leave_type_id || null,
          adjustment_days: row.adjustment_days || "",
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
      title={id ? "Edit Leave Adjustment" : "Leave Adjustment Request"}
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
              <FormikInputField
                name="leave_type"
                label="Leave Type"
                type="text"
                value={values.leave_type || "N/A"}
                disabled={true}
              />
            )}

            {!isViewOnly && (
              <FormikSelectField
                name="leave_type_id"
                label="Select Leave Type"
                options={
                  leaveQuotas.map((q) => ({
                    label: q.leave_type ? q.leave_type.name : `Leave Type ${q.leave_type_id}`,
                    value: q.leave_type_id || q.id,
                  })) || []
                }
                placeholder="Select Leave Type"
                required
              />
            )}

            <FormikInputField
              name="adjustment_days"
              label="Adjustment Days (+/-)"
              type="number"
              placeholder="Enter positive for addition, negative for deduction"
              disabled={isViewOnly}
              required
            />

            <FormikInputField
              name="reason"
              label="Reason"
              rows={4}
              disabled={isViewOnly}
            />

            {/* Leave quota summary */}
            {!isViewOnly && leaveQuotas.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-2 text-sm text-gray-600">
                  Your Leave Quotas
                </div>
                <CustomTable
                  headers={["Leave Type", "Allowed", "Availed", "Remaining"]}
                  data={leaveQuotas.map((q) => ({
                    "Leave Type": q.leave_type ? q.leave_type.name : "Unknown",
                    Allowed: q.leave_type?.days_allowed ?? "-",
                    Availed: q.availed_leaves ?? "-",
                    Remaining: (q.leave_type?.days_allowed ?? 0) - (q.availed_leaves ?? 0),
                  }))}
                  showCheckbox={false}
                />
              </div>
            )}

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

export default LeaveAdjustmentForm;
