import React, { useState } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import warningValidationSchema from "../../../../utils/validations/warningValidation";
import { format } from "date-fns";
import { useEmployeesData } from "../../../../utils/hooks/api/emplyees";
import FormikSelectField from "../../../../components/common/FormikSelectField";

const NewWarningRequestForm = ({
  open,
  onClose,
  id = null,
  handleSubmit,
  loading,
}) => {
  const initialValues = {
    effected_date: "",
    subject: "",
    warning: "",
    attachment: "",
    employee_id: "",
  };

  const { data, loading: empLoading } = useEmployeesData(false);

  // const [initialValuesState, setInitialValues] = useState(initialValues)
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Warning Letter" : "New Warning Letter"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={warningValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, isSubmitting }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikInputField name="subject" label="Subject" required />

              <FormikInputField
                name="warning"
                label="Warning"
                textarea
                rows={4}
                required
              />
              <FormikSelectField
                name="employee_id"
                label="Employee"
                required
                options={data}
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${
                    option?.first_name || ""
                  } ${option?.second_name || ""} ${
                    option?.third_name || ""
                  } ${option?.forth_name || ""} ${
                    option?.family_name || ""
                  }`
                }
                loading={empLoading}
                selectKey="id"
              />
              <FormikInputField
                name="effected_date"
                label="Effected Date"
                type="date"
                required
              />
              <FormikInputField
                name="today"
                label="Created At"
                value={today}
                type="date"
                disabled
                InputProps={{ readOnly: true }}
              />
              <FormikFileUpload name="attachment" label="Attachment" />
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

export default NewWarningRequestForm;
