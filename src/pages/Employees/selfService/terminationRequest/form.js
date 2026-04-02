import React, { useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { addDays, format, parseISO, isValid as isValidDate } from "date-fns";

import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import FormikSelectField from "../../../../components/common/FormikSelectField";

import resignationValidationSchema from "../../../../utils/validations/resignationValidation";
import {
  useEmployees,
  useEmploymentType,
} from "../../../../utils/hooks/api/terminationRequests";
import { useUser } from "../../../../context/UserContext";
import { ROLES } from "../../../../utils/constants";

/** Auto-fills last_working_date when effected_date (and selected employee) are set */
const AutoFillLastWorkingDate = ({ employees, employmentTypeById }) => {
  const { values, setFieldValue } = useFormikContext();

  React.useEffect(() => {
    // console.log("🔥 AutoFill useEffect triggered with values:", {
    //   effected_date: values.effected_date,
    //   employee_id: values.employee_id,
    //   all_values: values,
    // });

    const effected = values.effected_date;
    const selectedEmployeeId = values.employee_id;

    // Clear last working date if either field is empty
    if (!effected || !selectedEmployeeId) {
      setFieldValue("last_working_date", "");
      return;
    }

    // Validate the effected date
    const effectedDate = parseISO(effected);
    if (!isValidDate(effectedDate)) {
      setFieldValue("last_working_date", "");
      return;
    }

    // Find selected employee and its employment type
    const employee = employees.find(
      (e) => String(e.id) === String(selectedEmployeeId)
    );

    if (!employee) {
      setFieldValue("last_working_date", "");
      return;
    }

    const typeId = employee?.employment_type_id;
    const matchedType = typeId != null ? employmentTypeById[typeId] : null;

    const rawDays = matchedType?.resignation_notice_period;
    const noticeDays = Number.isFinite(Number(rawDays)) ? Number(rawDays) : 0;

    const computed = addDays(effectedDate, noticeDays);
    setFieldValue("last_working_date", format(computed, "yyyy-MM-dd"));
  }, [
    values.effected_date,
    values.employee_id,
    employees,
    employmentTypeById,
    setFieldValue,
  ]);

  return null;
};

const NewTerminationRequestForm = ({
  open,
  onClose,
  id = null,
  handleSubmit,
  loading,
}) => {
  const { user } = useUser();
  const userRole = user?.role;

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: employees = [], loading: employeesLoading } = useEmployees();
  const { data: employmentTypeData = [] } = useEmploymentType();

  // Build a quick lookup { [employment_type_id]: { id, resignation_notice_period, ... } }
  const employmentTypeById = useMemo(() => {
    const map = {};
    (employmentTypeData || []).forEach((t) => {
      if (t?.id != null) map[t.id] = t;
    });
    return map;
  }, [employmentTypeData]);

  // Filter employees to only those whose employment_type_id exists in employmentTypeData
  const filteredEmployees = useMemo(() => {
    if (
      !Array.isArray(employees) ||
      !Array.isArray(employmentTypeData) ||
      employmentTypeData.length === 0
    ) {
      return [];
    }
    const validIds = new Set(employmentTypeData.map((t) => t.id));
    return employees.filter((e) => validIds.has(e?.employment_type_id));
  }, [employees, employmentTypeData]);

  const initialValues = {
    subject: "",
    employee_id: "",
    termination: "",
    effected_date: "",
    attachment: "",
    last_working_date: "", // auto-filled after effected_date is chosen
    successor_id: null,
    organizational_unit_id : null
  };

  // Helper remains (used on initial employee select if you still want to prefill)
  // const computeLastWorkingDay = (selectedEmployee) => {
  //   const typeId = selectedEmployee?.employment_type_id;
  //   const matchedType = typeId != null ? employmentTypeById[typeId] : null;

  //   const noticeDaysRaw = matchedType?.resignation_notice_period;
  //   const noticeDays = Number.isFinite(Number(noticeDaysRaw))
  //     ? Number(noticeDaysRaw)
  //     : 0;

  //   const resultDate = addDays(new Date(), noticeDays);
  //   return format(resultDate, "dd-mm-yyyy");
  // };

  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Termination Request" : "New Termination Request"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={resignationValidationSchema(
            userRole,
            "termination"
          )}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* Auto-fill LWD when effected_date changes (and employee is selected) */}
              <AutoFillLastWorkingDate
                employees={filteredEmployees}
                employmentTypeById={employmentTypeById}
              />

              <FormikInputField name="subject" label="Subject" required />

              <FormikSelectField
                name="employee_id"
                label="Select Employee"
                options={filteredEmployees}
                required
                loading={employeesLoading}
                onChange={(selectedEmployee) => {
                  // Only set the employee_id, let AutoFillLastWorkingDate handle the rest
                  setFieldValue("employee_id", selectedEmployee);

                  if(selectedEmployee){
 const fullEmployee =
                    filteredEmployees.find((e) => e.id === selectedEmployee);

                  setFieldValue("organizational_unit_id", fullEmployee.organizational_unit_id);
                  }
                  else{
                                      setFieldValue("organizational_unit_id", "");

                  }


                 

                }}
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
              />

              <FormikInputField
                name="termination"
                label="Termination Reason"
                textarea
                rows={4}
                required
              />

              <FormikInputField
                name="effected_date"
                label="Effected Date"
                type="date"
                required
                max="9999-12-31"
              />

              <FormikInputField
                name="today"
                label="Created At"
                value={today}
                type="date"
                disabled
                InputProps={{ readOnly: true }}
              />

              <FormikInputField
                name="last_working_date"
                label="Last Working Day"
                type="date"
                disabled
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

export default NewTerminationRequestForm;
