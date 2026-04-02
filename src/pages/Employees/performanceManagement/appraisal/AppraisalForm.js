import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import Modal from "../../../../components/common/Modal";
import {
  useAllEmployees,
  useCreateApprasail,
} from "../../../../utils/hooks/api/appraisal";

const initialValues = {
  employee_id: "",
  type: "",
};

const validationSchema = Yup.object({
  employee_id: Yup.string().required("Employee is required"),
  // type: Yup.string().required('Appraisal type is required')
});


const APPRAISAL_TYPES = [
  { label: "Annual", value: "annual" },
  { label: "Probationary", value: "probationary" },
];

const AppraisalForm = ({ show, onClose, refetch }) => {
  const { employees, loading } = useAllEmployees();
  const { createAppraisal, loading: addLoading } = useCreateApprasail();

  const handleSubmit = async (values) => {
    const employee = employees.find(
      (employee) => employee.id === values.employee_id
    );

    await createAppraisal({
      ...values,
      organizational_unit_id: employee?.organizational_unit_id,
    });
    refetch();
    onClose();
  };

  return (
    <Modal title="Create New Appraisal" open={show} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => {
          const handleChange = (selected) => {
            const selectedEmployee = employees.find(
              (employee) => employee.id === selected
            );
            // console.log(
            //   { selectedEmployee },
            //   selectedEmployee?.employment_type?.probation_period
            // );
            if (selectedEmployee) {
              setFieldValue(
                "type",
                selectedEmployee?.employment_types?.probation_period == true
                  ? "probationary"
                  : "annual"
              );
            }
            setFieldValue("employee_id", selected);
          };
          return (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikSelectField
                name="employee_id"
                label="Employee"
                options={employees}
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${option?.candidates?.first_name} ${option?.candidates?.second_name} ${option?.candidates?.third_name} ${option?.candidates?.forth_name} ${option?.candidates?.family_name}`
                }
                selectKey="id"
                onChange={handleChange}
                disabled={loading}
                required
              />
              <FormikSelectField
                name="type"
                label="Appraisal Type"
                options={APPRAISAL_TYPES}
                disabled
              />
              {/* <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-md text-sm leading-relaxed">
                <strong>Note:</strong> If employee is on{" "}
                <strong>Probation</strong> employment type, then select{" "}
                <strong>Probationary</strong> type. If employee is now eligible
                for <strong>Annual</strong> type, first{" "}
                <strong>change the employment type</strong> if not already
                updated.
              </div> */}
              <div className="flex justify-end gap-4">
                <SubmitButton
                  title="Cancel"
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                />
                <SubmitButton
                  title="Add"
                  type="submit"
                  isLoading={addLoading}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default AppraisalForm;
