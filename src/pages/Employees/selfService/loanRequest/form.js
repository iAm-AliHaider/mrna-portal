import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { duration, Typography } from "@mui/material";
import loanValidationSchema from "../../../../utils/validations/loanValidation";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useLoanTypes } from "../../../../utils/hooks/api/loanTypes";
import { useUser } from "../../../../context/UserContext";
import { toast } from "react-hot-toast";

const NewLoanRequestForm = ({
  open,
  onClose,
  id,
  loanData,
  handleSubmit,
  loading,
}) => {
  const { user } = useUser();
  const { loanTypes, loading: loanTypesLoading } = useLoanTypes();


  

  const initialValues = {
    loan_type_id: "",
    request_date: "",
    requested_amount: "",
    reason: "",
    notes: "",
    duration: "",
  };

  const [initialValuesState, setInitialValues] = useState(initialValues);
  const [selectedLoanTypeName, setSelectedLoanTypeName] = useState("");

  useEffect(() => {
    if (id && loanData && loanData.length > 0) {
      const row = loanData.find((l) => l.id === id);
      if (row) {
        setInitialValues({
          loan_type_id: row.loan_type_id || "",
          request_date: row.request_date || "",
          requested_amount: row.requested_amount || "",
          reason: row.reason || "",
          notes: row.notes || "",
          duration: row.duration || "",
        });
      }
    } else {
      setInitialValues(initialValues);
    }
  }, [id, loanData]);

  // Convert loan types to options format for the select field
  const loanTypeOptions = loanTypes.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  const validateLoanLogic = (values) => {
    const basic = Number(user?.basic_salary || 0);
    const amount = Number(values.requested_amount);
    const duration = Number(values.duration);
    const loanName = selectedLoanTypeName.toLowerCase();
    const monthlyInstallment = amount / duration;
    if (loanName.includes("interest-free")) {
      if (amount > 2 * basic) {
        toast.error("Interest-Free Loan cannot exceed 2x basic salary");
        return false;
      }
      if (monthlyInstallment > 0.33 * basic) {
        toast.error("Monthly installment exceeds 33% of basic salary");
        return false;
      }
      if (duration > 12) {
        toast.error("Interest-Free Loan duration cannot exceed 12 months");
        return false;
      }
      // } else {
      //   // With interest: amount can be anything, duration must meet 33% limit
      //   if (monthlyInstallment > 0.33 * basic) {
      //     toast.error("Monthly installment exceeds 33% of basic salary");
      //     return false;
      //   }
    }

    return true;
  };

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Loan Request" : "New Loan Request"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValuesState}
          validationSchema={loanValidationSchema}
          onSubmit={(values, actions) => {
            if (!validateLoanLogic(values)) {
              actions.setSubmitting(false); // ✅ STOP loading state
              return;
            }
            handleSubmit(values, actions); // 🟢 continue normally
          }}
        >
          {({ isValid, setFieldValue, isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikSelectField
                name="loan_type_id"
                label="Loan Type"
                options={loanTypeOptions}
                required
                loading={loanTypesLoading}
                onChange={(value) => {
                  const data = loanTypeOptions.find((item) => {
                    return item.value == value && item;
                  });
                  setSelectedLoanTypeName(data?.label);
                  setFieldValue("loan_type_id", value);
                }}
              />

              <FormikInputField
                name="request_date"
                label="Loan Request Date"
                type="date"
                required
                max="2100-12-31"
              />

              <FormikInputField
                name="requested_amount"
                label="Total Loan Amount"
                type="number"
                // onChange={(value) => {
                //   setFieldValue("requested_amount", value);
                //   // validateLoanLogic(value);
                // }}
                required
              />

              <FormikInputField
                name="duration"
                label="Duration In Terms of Months"
                type="number"
                inputProps={{ max: 60, min: 0 }}
                required
              />

              <FormikInputField
                name="reason"
                label="Description"
                textarea
                rows={3}
                placeholder="Add Description"
              />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  variant="outlined"
                  title="Clear"
                  type="button"
                  onClick={onClose}
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

export default NewLoanRequestForm;
