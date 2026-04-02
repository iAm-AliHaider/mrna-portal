import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import offBoardingRequestValidationSchema from "../../../../utils/validations/offBoardingRequestValidation";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { useGetSpecificEmploymentTypeEmployees } from "../../../../utils/hooks/api/offBoardingRequests";
import { supabase } from "../../../../supabaseClient";

const REQUEST_TYPE_OPTIONS = [
  { id: "contract_request", label: "Contract Request" },
  { id: "resignation_request", label: "Resignation Request" },
  { id: "termination_request", label: "Termination Request" },
];

export const useGetEmployeesByRequestType = (requestType) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestType) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // Map request type to table name
        const tableNameMap = {
          contract_request: "end_contract_request",
          resignation_request: "resignation_request",
          termination_request: "termination_request",
        };

        const tableName = tableNameMap[requestType];
        if (!tableName) {
          setEmployees([]);
          setLoading(false);
          return;
        }

        // Call the specific table and get employee details
        // Use the specific foreign key relationship for employee_id
        const response = await supabase
          .from(tableName)
          .select(
            `
          employee_id,
          last_working_date,
          effected_date,
          employees!${tableName}_employee_id_fkey(
          id,
          employee_code,
          candidates(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          )
        )`
          )
          .eq("status", "approved");

        if (response.error) {
          throw response.error;
        }


        // Transform the data to match your expected format
        const transformedEmployees =
          response.data?.map((item) => ({
            id: item.employees.id,
            employee_code: item.employees.employee_code,
            candidates: item.employees.candidates,
            last_working_date: item.last_working_date,
            effected_date: item.effected_date
          })) || [];


        setEmployees(transformedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [requestType]);

  return { employees, loading };
};

const OffBoardingRequestForm = ({
  open,
  onClose,
  handleSubmit,
  employment_type_ids,
  selected = null,
}) => {
  const [selectedRequestType, setSelectedRequestType] = useState(
    selected?.request_type || ""
  );

  // Hook call
  const { employees, loading: employeesLoading } =
    useGetEmployeesByRequestType(selectedRequestType);

  const initialValues = {
    request_type: selected?.request_type || "",
    employee_id: selected?.employee_id || "",
    reason: selected?.reason || "",
    termination_date: selected?.termination_date || "",
    last_working_date: selected?.last_working_date || "",
  };

  return (
    <Modal
      onClose={onClose}
      title={
        selected ? "Edit Off-Boarding Request" : "New Off-Boarding Request"
      }
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={offBoardingRequestValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              <FormikSelectField
                name="request_type"
                label="Request Type"
                options={REQUEST_TYPE_OPTIONS}
                required
                getOptionLabel={(option) => option.label}
                selectKey="id"
                onChange={(value) => {
                  setSelectedRequestType(value); // keep local state
                  setFieldValue("request_type", value); // sync with Formik
                  setFieldValue("employee_id", ""); // reset employee
                }}
              />

              {selectedRequestType && employeesLoading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Loading employees...</span>
                </div>
              )}

              <FormikSelectField
                name="employee_id"
                label="Employee"
                options={employees}
                required
                getOptionLabel={(option) =>
                  `${option?.employee_code} - ${
                    option?.candidates?.first_name || ""
                  } ${option?.candidates?.second_name || ""} ${
                    option?.candidates?.third_name || ""
                  } ${option?.candidates?.forth_name || ""} ${
                    option?.candidates?.family_name || ""
                  }`
                }
                selectKey="id"
                disabled={!!selected || !selectedRequestType}
                placeholder={
                  employeesLoading
                    ? "Loading employees..."
                    : !selectedRequestType
                    ? "Please select request type first"
                    : "Select Employee"
                }
                onChange={(value) => {
                  const selectedEmp = employees.find((e) => e.id === value);
                  setFieldValue("employee_id", value);
                  setFieldValue(
                    "last_working_date",
                    selectedEmp?.last_working_date || ""
                  );
                   setFieldValue(
                    "termination_date",
                    selectedEmp?.effected_date || ""
                  );
                }}
              />

              <FormikInputField
                name="last_working_date"
                label="Last Working Date"
                type="date"
                required
              />

              <FormikInputField
                name="reason"
                label="Reason"
                rows={3}
                placeholder="Add Reason"
                required
              />

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton
                  type="button"
                  variant="outlined"
                  title="Cancel"
                  onClick={onClose}
                />
                <SubmitButton title="Save" type="submit" isLoading={false} />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default OffBoardingRequestForm;
