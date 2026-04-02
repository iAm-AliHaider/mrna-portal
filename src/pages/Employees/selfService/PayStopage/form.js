import React, { useEffect } from "react";
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import REQUEST_STATUS from "../../../../utils/enums/requestStatus";
import advanceSalaryValidationSchema from "../../../../utils/validations/advanceSalaryValidation";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast";
import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";
import SelectField from "../../../../components/common/SelectField";
import FormikSelectField from "../../../../components/common/FormikSelectField";

const NewPayStopageForm = ({
  onClose,
  open,
  id,
  advanceSalaryData,
  handleSubmit,
  loading,
}) => {
  const [initialValues, setInitialValues] = React.useState({
    employee_id: "",
    amount: "",
    requested_date: "",
    reason: "",
    is_releasable: false,
  });
  const { user } = useUser();
  const { employees, loading: employeesLoading } =
    useCompanyEmployeesWithoutMyId();

  useEffect(() => {
    if (id && advanceSalaryData && advanceSalaryData.length > 0) {
      const row = advanceSalaryData.find((r) => r.id === id);
      if (row) {
        setInitialValues({
          employee_id: row.employee_id || "",
          amount: row.amount || "",
          requested_date: row.requested_date || "",
          reason: row.reason || "",
          is_releasable: row.is_releasable ?? false,
        });
      }
    } else {
      setInitialValues({
        employee_id: "",
        amount: "",
        requested_date: "",
        reason: "",
        is_releasable: false,
      });
    }
  }, [id, advanceSalaryData]);

  return (
    <Modal onClose={onClose} title="Pay Stopage Request" open={open}>
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={advanceSalaryValidationSchema}
          onSubmit={(values, actions) => {
            const basic = Number(user?.basic_salary || 0);
            const requestedAmount = Number(values.amount);

            if (requestedAmount > basic) {
              actions.setSubmitting(false); // prevent loading state
              toast.error("Requested amount cannot exceed your basic salary.");
              return;
            }

            handleSubmit(values, actions);
          }}
        >
          {({ isValid, isSubmitting, setFieldValue, dirty }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Employee Selection */}
              <FormikSelectField
                name="employee_id"
                label="Employee"
                required
                options={employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp?.employee_code} - ${
                    emp?.candidates?.first_name || ""
                  } ${emp?.candidates?.second_name || ""} ${
                    emp?.candidates?.third_name || ""
                  } ${emp?.candidates?.forth_name || ""} ${
                    emp?.candidates?.family_name || ""
                  }`,
                }))}
                onChange={(selectedEmployee) => {
                  // KEEPING YOUR ORIGINAL SELECTION LOGIC EXACTLY THE SAME:
                  setFieldValue("employee_id", selectedEmployee);
                  
                  if(selectedEmployee){
                    const fullEmployee =
                    employees.find((e) => e.id === selectedEmployee);

                      setFieldValue("organizational_unit_id", fullEmployee.organizational_unit_id);
                  }
                  else{
                    setFieldValue("organizational_unit_id", "");
                  }
                }}
                disabled={employeesLoading}
              />

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
                placeholder="Add Reason"
                required
              />

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_releasable"
                    // Formik will handle checked state automatically
                  />
                  Release
                </label>
              </div>

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

export default NewPayStopageForm;
