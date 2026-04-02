import React, { useEffect } from "react";
import { Formik, Form } from "formik";
import allowanceValidationSchema from '../../../../utils/validations/allowanceValidation';
import Modal from "../../../../components/common/Modal";
import FormikInputField from "../../../../components/common/FormikInputField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

const initialValues = {
  amount: '',
  requested_date: '',
  reason: '',
  is_repeatable: false,
};

const AllowanceRequestListForm = ({ onClose, open, id, allowanceData, handleSubmit, loading }) => {
  const [initialValues, setInitialValues] = React.useState({
    amount: '',
    requested_date: '',
    reason: '',
    is_repeatable: false,
  });

  useEffect(() => {
    if (id && allowanceData && allowanceData.length > 0) {
      const row = allowanceData.find(r => r.id === id);
      if (row) {
        setInitialValues({
          amount: row.amount || '',
          requested_date: row.requested_date || '',
          reason: row.reason || '',
          is_repeatable: row.is_repeatable || false,
        });
      }
    } else {
      setInitialValues(initialValues);
    }
  }, [id, allowanceData]);

  return (
    <Modal onClose={onClose} title="Request Allowance" open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={allowanceValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, isValid, isSubmitting }) => (
            <Form className="flex flex-col gap-5">
              <FormikInputField
                name="amount"
                label="Request Amount"
                type="number"
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
                required
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

              <div className="mt-2 flex justify-end gap-3">
                <SubmitButton 
                  title="Clear" 
                  type="button"
                  variant="outlined" 
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

export default AllowanceRequestListForm;
