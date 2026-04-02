import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import expenseValidationSchema from '../../../../utils/validations/expenseValidation';
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

const expenseTypeOptions = [
  { label: "Transport Allowance", value: "transport" },
  { label: "Dinner", value: "dinner" },
  { label: "Fuel", value: "fuel" },
  { label: "Other", value: "other" },
];

const defaultInitialValues = {
  // expense_type: '',
  amount: '',
  requested_date: '',
  reason: '',
  is_repeatable: false,
  // receipt: null,
};

const NewExpenseClaimForm = ({ onClose, open, id, expenseData, handleSubmit, loading }) => {
  const [initialValues, setInitialValues] = useState(defaultInitialValues);

  useEffect(() => {
    if (id && expenseData && expenseData.length > 0) {
      const row = expenseData.find(r => r.id === id);
      if (row) {
        setInitialValues({
          // expense_type: row.expense_type || '',
          amount: row.amount || '',
          requested_date: row.requested_date || '',
          reason: row.reason || '',
          is_repeatable: row.is_repeatable || false,
          // receipt: row.receipt || null,
        });
      }
    } else {
      setInitialValues(defaultInitialValues);
    }
  }, [id, expenseData]);

  return (
    <Modal onClose={onClose} title="Expense Claim Request" open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={expenseValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, isValid, isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* <FormikSelectField
                name="expense_type"
                label="Expense Type"
                placeholder={"Select"}
                options={expenseTypeOptions}
                required
              /> */}

              <FormikInputField
                name="amount"
                label="Amount"
                placeholder={0}
                type="number"
                step="0.01"
                required
              />

              <FormikInputField
                name="requested_date"
                label="Expense Date"
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
              />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Repeatable</span>
                <RadioGroup
                  name="is_repeatable"
                  value={values.is_repeatable}
                  onChange={handleChange}
                  className="flex !flex-row"
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value={false}
                    control={<Radio />}
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* <FileUploadField name="receipt" label="Attachment" /> */}

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton 
                  variant="outlined" 
                  title="Clear" 
                  type="button"
                  onClick={onClose}
                />
                <SubmitButton 
                  title="Send" 
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

export default NewExpenseClaimForm;
