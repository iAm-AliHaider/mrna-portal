import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";
import { supabase } from "../../../../supabaseClient";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import TiptapField from "../../../../components/TextEditor";
import { useUser } from "../../../../context/UserContext";

const priorityOptions = [
  { label: "Mandatory", value: "true" },
  { label: "Non mandatory", value: "false" },
];

const REQUIRED_ONE_MSG =
  "Select at least one of Organization, Department, Branch, or Employee";

const validationSchema = Yup.object().shape({
  active_date: Yup.date()
    .required("Active date is required")
    .test("is-today-or-future", "Active date must be today or in the future", (value) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(value);
      sel.setHours(0, 0, 0, 0);
      return sel >= today;
    }),
  expiry_date: Yup.date()
    .required("Expiry date is required")
    .when("active_date", (active_date, schema) =>
      schema.test(
        "is-after-or-same",
        "Expiry date must be the same or after the active date",
        function (expiry_date) {
          if (!active_date || !expiry_date) return false;
          const start = new Date(active_date).setHours(0, 0, 0, 0);
          const end = new Date(expiry_date).setHours(0, 0, 0, 0);
          return end >= start;
        }
      )
    ),

  title: Yup.string().required("Title is required"),
  reference_no: Yup.string().notRequired(),
  description: Yup.string()
    .optional()
    .test("no-spaces", "Spaces-only are not allowed", (val) => !val || val.trim().length > 0),

  // One-of-four validator repeated on each field so the error can anchor where user is interacting
  for_organization: Yup.boolean().test("one-of-four", REQUIRED_ONE_MSG, function (org) {
    const { department_id, branch_id, employee_id } = this.parent;
    const hasDept = Array.isArray(department_id) && department_id.length > 0;
    const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
    const hasOrg = org === true;
    const hasEmp = Array.isArray(employee_id) && employee_id.length > 0;
    if (hasOrg || hasDept || hasBranch || hasEmp) return true;
    return this.createError({ path: "for_organization", message: " " });
  }),

  department_id: Yup.array()
    .of(Yup.mixed())
    .test("one-of-four", REQUIRED_ONE_MSG, function (dept) {
      const { for_organization, branch_id, employee_id } = this.parent;
      const hasOrg = for_organization === true;
      const hasDept = Array.isArray(dept) && dept.length > 0;
      const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
      const hasEmp = Array.isArray(employee_id) && employee_id.length > 0;
      if (hasOrg || hasDept || hasBranch || hasEmp) return true;
      return this.createError({ path: "department_id", message: REQUIRED_ONE_MSG });
    }),

  branch_id: Yup.mixed().test("one-of-four", REQUIRED_ONE_MSG, function (branch) {
    const { for_organization, department_id, employee_id } = this.parent;
    const hasOrg = for_organization === true;
    const hasDept = Array.isArray(department_id) && department_id.length > 0;
    const hasBranch = Array.isArray(branch) ? branch.length > 0 : Boolean(branch);
    const hasEmp = Array.isArray(employee_id) && employee_id.length > 0;
    if (hasOrg || hasDept || hasBranch || hasEmp) return true;
    return this.createError({ path: "branch_id", message: REQUIRED_ONE_MSG });
  }),

  // Include employee_id in the same "one-of-four" rule
  employee_id: Yup.array()
    .of(Yup.mixed())
    .test("one-of-four", REQUIRED_ONE_MSG, function (emps) {
      const { for_organization, department_id, branch_id } = this.parent;
      const hasEmp = Array.isArray(emps) && emps.length > 0;
      const hasOrg = for_organization === true;
      const hasDept = Array.isArray(department_id) && department_id.length > 0;
      const hasBranch = Array.isArray(branch_id) ? branch_id.length > 0 : Boolean(branch_id);
      if (hasOrg || hasDept || hasBranch || hasEmp) return true;
      return this.createError({ path: "employee_id", message: REQUIRED_ONE_MSG });
    }),
});

const generateReferenceNo = () => {
  const random = Math.floor(Math.random() * 99999) + 1;
  const padded = String(random).padStart(5, "0");
  return `ANN-${padded}`;
};

const Announcmentform = ({ onClose, open, showPriority, handleSubmit }) => {
  const [referenceNo, setReferenceNo] = useState(generateReferenceNo());
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const { user } = useUser();
  const employeeId = user?.id;

  const initialValues = {
    is_mandatory: "false",
    active_date: "",
    expiry_date: "",
    title: "",
    description: "",
    attachment_path: null,
    for_organization: false,
    reference_no: referenceNo,
    branch_id: "",
    department_id: [],
    employee_id: [], // ✅ include employees in form state
  };

  useEffect(() => {
    const fetchContracts = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase.from("organizational_units").select("id, name");
      if (!error) {
        setDepartments(data.map((d) => ({ label: d.name, value: d.id.toString() })));
      } else {
        console.error("Error fetching departments:", error.message);
      }
      setLoadingDepartments(false);
    };

    const fetchBranches = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .eq("is_deleted", false);
      if (!error) {
        setBranches(data.map((d) => ({ label: d.name, value: d.id.toString() })));
      } else {
        console.error("Error fetching branches:", error.message);
      }
      setLoadingDepartments(false);
    };

    const fetchEmployees = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*, candidates:candidates!employees_candidate_id_fkey(*)")
        .eq("is_deleted", false)
        .neq("id", employeeId);

      if (!error) {
        const employeeOptions = data.map((emp) => ({
          value: emp.id,
          label:
            `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
              emp.candidates?.second_name || ""
            } ${emp.candidates?.third_name || ""} ${emp.candidates?.forth_name || ""} ${
              emp.candidates?.family_name || ""
            }`
              .replace(/\s+/g, " ")
              .trim() || `Employee #${emp.id}`,
        }));
        setEmployees(employeeOptions);
      } else {
        console.error("Error fetching employees:", error.message);
      }
      setLoadingDepartments(false);
    };

    fetchBranches();
    fetchContracts();
    fetchEmployees();
  }, [employeeId]);

  return (
    <Modal onClose={onClose} title="Announcements" open={open}>
      <div className="flex flex-col">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {showPriority && (
                <FormikSelectField
                  name="is_mandatory"
                  label="Priority"
                  options={priorityOptions}
                  required={false}
                />
              )}

              <div className="grid gap-4 grid-cols-2">
                <FormikInputField
                  name="active_date"
                  label="Active Date"
                  type="date"
                  required
                  max="2100-12-31"
                />
                <FormikInputField
                  name="expiry_date"
                  label="Expiry Date"
                  type="date"
                  required
                  max="2100-12-31"
                />
              </div>

              <FormikInputField name="title" label="Title" type="text" required />

              <TiptapField name="description" label="Description" />

              <FileUploadField name="attachment_path" label="Attachment" />

              {/* Organization toggle */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <FormikCheckbox
                  label="Organization"
                  name="for_organization"
                  handleChange={(value) => {
                    setFieldValue("for_organization", value);
                    if (value) {
                      setFieldValue("department_id", []);
                      setFieldValue("branch_id", "");
                      setFieldValue("employee_id", []);
                    }
                  }}
                />
              </div>

              {/* Branch (hidden when org OR department chosen OR employees chosen) */}
              <div
                className="grid grid-cols gap-4 mt-4"
                style={{
                  display:
                    values.for_organization ||
                    (Array.isArray(values.department_id) && values.department_id.length > 0) ||
                    (Array.isArray(values.employee_id) && values.employee_id.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikSelectField
                  name="branch_id"
                  label="Branch"
                  options={branches}
                  disabled={loadingDepartments}
                  placeholder="Select"
                />
              </div>

              {/* Departments (hidden when org OR branch chosen OR employees chosen) */}
              <div
                className="grid grid-cols gap-4 mt-4"
                style={{
                  display:
                    values.for_organization ||
                    (values.branch_id && String(values.branch_id).length > 0) ||
                    (Array.isArray(values.employee_id) && values.employee_id.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="department_id"
                  label="Departments"
                  options={departments}
                  disabled={loadingDepartments}
                  placeholder="Select"
                />
              </div>

              {/* Employees (hidden when org OR branch chosen OR department chosen) */}
              <div
                className="grid grid-cols gap-4 mt-4"
                style={{
                  display:
                    values.for_organization ||
                    (values.branch_id && String(values.branch_id).length > 0) ||
                    (Array.isArray(values.department_id) && values.department_id.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="employee_id"
                  label="Employees"
                  options={employees}
                  disabled={loadingDepartments}
                  // optional: when selecting employees, clear others
                  handleChange={(list) => {
                    setFieldValue("employee_id", list);
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("for_organization", false);
                      setFieldValue("department_id", []);
                      setFieldValue("branch_id", "");
                    }
                  }}
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 bg-white">
                <SubmitButton variant="outlined" title="Cancel" type="button" onClick={onClose} />
                <SubmitButton title="Submit" type="submit" isLoading={isSubmitting} disabled={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default Announcmentform;
