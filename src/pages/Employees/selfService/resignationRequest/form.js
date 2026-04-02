import React, { useMemo, useEffect, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { addDays, format, parseISO, isValid as isValidDate } from "date-fns";

import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikFileUpload from "../../../../components/common/FormikFileUpload";
import FormikSelectField from "../../../../components/common/FormikSelectField";

import resignationValidationSchema from "../../../../utils/validations/resignationValidation";
import { useEmployees, useEmploymentType } from "../../../../utils/hooks/api/resignationRequest";
import { useUser } from "../../../../context/UserContext";
import { ROLES } from "../../../../utils/constants";

/** Watches effected_date and fills last_working_date = effected_date + notice_period */
const AutoFillLastWorkingDay = ({ empTypeId, employmentTypeById }) => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    const effected = values?.effected_date;
    const matchedType = empTypeId != null ? employmentTypeById[empTypeId] : null;
    const raw = matchedType?.resignation_notice_period;
    const noticeDays = Number.isFinite(Number(raw)) ? Number(raw) : 0;

    if (!effected) {
      setFieldValue("last_working_date", "", false);
      return;
    }

    const base = parseISO(String(effected));
    if (!isValidDate(base)) {
      setFieldValue("last_working_date", "", false);
      return;
    }

    const computed = addDays(base, noticeDays);
    setFieldValue("last_working_date", format(computed, "yyyy-MM-dd"), false);
  }, [values?.effected_date, empTypeId, employmentTypeById, setFieldValue]);

  return null;
};

const NewResignationRequestForm = ({
  open,
  onClose,
  id = null,
  handleSubmit,
  loading,
  isOnBehalf
}) => {
  const { user } = useUser();
  const emp_type_id = user?.employment_type_id;

  const today = format(new Date(), "yyyy-MM-dd");

  // const { data: employmentTypeData = [] } = useEmploymentType();
  // const { data: employees = [], loading: employeesLoading } = useEmployees();



  // // Fast lookup by employment type id
  // const employmentTypeById = useMemo(() => {
  //   const map = {};
  //   (employmentTypeData || []).forEach((t) => {
  //     if (t?.id != null) map[t.id] = t;
  //   });
  //   return map;
  // }, [employmentTypeData]);

  const [userRole, setUserRole] = useState(user?.role)


  const { data: employees = [], loading: employeesLoading } = useEmployees();
  // const { data: employees = [], loading: employeesLoading } = useEmployees();

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
    effected_date: "",
    subject: "",
    resignation: "",
    attachment: "",
    last_working_date: "", // auto-filled after selecting effected_date
    successor_id: null,
    created_by: user?.id || null
  };

  useEffect(()=> {
    if(user){
      setUserRole(user?.role)
    }
  }, [user])




  return (
    <Modal
      onClose={onClose}
      title={id ? "Edit Resignation Request" :  isOnBehalf ? "New On Behalf Resignation Request" : "New Resignation Request"}
      open={open}
    >
      <div className="flex flex-col">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={resignationValidationSchema(userRole, "resignation", isOnBehalf)}
          onSubmit={handleSubmit}
        >
          {({ errors, isSubmitting, setFieldValue, values }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">

                {/* <pre style={{ background: "#f4f4f4", padding: "8px" }}>
        {JSON.stringify(errors, null, 2)}
      </pre> */}

              {/* Auto-fill last_working_date once effected_date is chosen */}
              <AutoFillLastWorkingDay
                empTypeId={emp_type_id}
                employmentTypeById={employmentTypeById}
              />

              {/* {isOnBehalf && (
<FormikSelectField
                name="employee_id"
                label="Select Employee"
                options={filteredEmployees}
                required
                loading={employeesLoading}
                onChange={(selectedEmployee) => {
                  // Only set the employee_id, let AutoFillLastWorkingDate handle the rest
                  setFieldValue("employee_id", selectedEmployee);
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
              )} */}


{isOnBehalf && (
  <FormikSelectField
    name="employee_id"
    label="Select Employee"
    options={filteredEmployees}
    required
    loading={employeesLoading}
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
    onChange={(selected) => {
  // 1) Normalize to an employee object
  const selectedId =
    typeof selected === "object" ? selected?.id : selected;

  const selectedEmp =
    typeof selected === "object" && selected?.role_columns
      ? selected
      : (filteredEmployees || []).find(e => String(e?.id) === String(selectedId));

  // 2) Persist the selected employee id in the form
  setFieldValue("employee_id", selectedId);
  setFieldValue("organizational_unit_id", selectedEmp?.organizational_unit_id)

  // 3) Extract roles from role_columns
  const roles = Array.isArray(selectedEmp?.role_columns?.roles)
    ? selectedEmp.role_columns.roles
    : [];

    if(roles && roles.length==1){
      if(roles[0] === ROLES.EMPLOYEE)
        setUserRole(ROLES.EMPLOYEE);
    }else if (roles){
      setUserRole(roles[1])
    }

  // 4) Store roles in Formik (use whatever field names you prefer)
  // setFieldValue("selected_employee_roles", roles, false);
  // setFieldValue("selected_employee_primary_role", roles[0] || null, false);
}}
  />
)}

               

              <FormikInputField name="subject" label="Subject" required />

              <FormikInputField
                name="resignation"
                label="Resignation"
                textarea
                rows={4}
                required
              />

              <FormikInputField
                name="effected_date"
                label="Effected Date"
                type="date"
                max="9999-12-31"
                required
              />

              <FormikInputField
                name="today"
                label="Created At"
                type="date"
                value={today}
                disabled
                InputProps={{ readOnly: true }}
              />

              <FormikInputField
                name="last_working_date"
                label="Last Working Day"
                type="date"
                value={values.last_working_date || ""}
                disabled
                InputProps={{ readOnly: true }}
              />

              {userRole && userRole !== ROLES.EMPLOYEE && (
                <FormikSelectField
                  name="successor_id"
                  label="Successor"
                  options={employees}
                  required
                  loading={employeesLoading}
                  getOptionLabel={(option) =>
                    `${option?.employee_code} - ${option?.candidates?.first_name || ""} ${
                      option?.candidates?.second_name || ""
                    } ${option?.candidates?.third_name || ""} ${
                      option?.candidates?.forth_name || ""
                    } ${option?.candidates?.family_name || ""}`
                  }
                  selectKey="id"
                />
              )}

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

export default NewResignationRequestForm;
