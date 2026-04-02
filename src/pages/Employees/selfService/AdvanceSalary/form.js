import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import REQUEST_STATUS from "../../../../utils/enums/requestStatus";
import advanceSalaryValidationSchema from "../../../../utils/validations/advanceSalaryValidation";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast";

const NewAdvanceSalaryForm = ({
  onClose,
  open,
  id,
  advanceSalaryData,
  handleSubmit,
  loading,
}) => {
  const [initialValues, setInitialValues] = React.useState({
    amount: 0,
    requested_date: "",
    reason: "",
  });
  const { user } = useUser();

  // console.log("hello", user);

  useEffect(() => {
    if (id && advanceSalaryData && advanceSalaryData.length > 0) {
      const row = advanceSalaryData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          amount: row.amount || user.total_salary || 0,
          requested_date: row.requested_date || "",
          reason: row.reason || "",
        });
      }
    } else {
      setInitialValues(initialValues);
    }

    if(user && !advanceSalaryData){
      setInitialValues(prev => ({
  ...prev,
  amount: user.total_salary || 0
}));
    }
  }, [id, advanceSalaryData, user?.total_salary]);

  return (
    <Modal onClose={onClose} title="Advance Salary Request" open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
initialValues={{
    ...initialValues,
    amount: user?.total_salary || 0,   // 👈 force amount from user
  }}
            validationSchema={advanceSalaryValidationSchema}
          onSubmit={(values, actions) => {
            // const basic = Number(user?.basic_salary || 0);
            // const requestedAmount = Number(values.amount);

            // if (requestedAmount > basic) {
            //   actions.setSubmitting(false); // prevent loading state
            //   toast.error("Requested amount cannot exceed your basic salary.");
            //   return;
            // }

            handleSubmit(values, actions);
          }}
        >
          {({ isValid, isSubmitting, dirty }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikInputField
                name="amount"
                label="Request Amount"
                type="number"
                value={user.total_salary}
                disabled
                required
              />

              <FormikInputField
                name="requested_date"
                label="Requested Date"
                type="date"
                required
                max="2100-12-31"
              />

              <FormikInputField
                name="reason"
                label="Reason"
                textarea
                rows={3}
                placeholder="Add Reason"
                required
              />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Clear"
                  type="button"

                  // isLoading={isSubmitting}
                />
                <SubmitButton
                  title="Save"
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

export default NewAdvanceSalaryForm;
