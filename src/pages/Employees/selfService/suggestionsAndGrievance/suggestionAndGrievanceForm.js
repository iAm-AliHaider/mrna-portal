import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useBranchEmployees } from "../../../../utils/hooks/api/branchEmployees";
import { useUser } from "../../../../context/UserContext";
import { useCreateSuggestionsAndGrievance } from "../../../../utils/hooks/api/suggestionsAndGrievance";
import suggestionsAndGrievanceValidationSchema from "../../../../utils/validations/suggestionsAndGrievanceValidation";
import FormikMultiSelectField from "../../../../components/common/FormikMultiSelectField";
import { toast } from "react-hot-toast";
import { useAllEmployees } from "../../../../utils/hooks/api/appraisal";
import { useCompanyEmployeesWithoutMyId } from "../../../../utils/hooks/api/emplyees";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { supabase } from "../../../../supabaseClient";
import { useGetAllBranches } from "../../../../utils/hooks/api/organizationalStructure";
import { useGenericFlowEmployees } from "../../../../utils/hooks/api/genericApprovalFlow";
import { transactionEmailSender } from "../../../../utils/helper";


const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Suggestions & Grievances", href: "/self/suggestions-grievance" },
  { title: "Add Suggestion & Grievance" },
];

const reportTypeOptions = [
  { label: "Suggestion", value: "suggestion" },
  { label: "Grievance", value: "grievance" },
];
const urgencyOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];
const categoryOptions = [
  { label: "Workspace Issues", value: "workspace_issues" },
  { label: "Policy Suggestions", value: "policy_suggestions" },
  { label: "Team Conflicts", value: "team_conflicts" },
  { label: "Other", value: "other" },
];
// const priorityOptions = [
//   { label: "Low", value: "low" },
//   { label: "Medium", value: "medium" },
//   { label: "High", value: "high" },
// ];

const initialValues = {
  report_type: "",
  employees_involved: [],
  department_id: [],
  branch_id: [],
  witnesses: [],
  description: "",
  urgency: "",
  category: "",
  action_expected: "",
  action_taken: "",
  resolution_notes: "",
  resolution_date: "",
  status: "pending",
  review_notes: "",
  attachment: null,
  reporter_employee_id: "",
  closed_date: "",
  escalation_level: "",
  // assigned_to_id: "",
  created_by: "",
  updated_by: "",
};

const SuggestionsAndGrievanceForm = () => {
  const navigate = useNavigate();
  const { employees, loading: employeesLoading } =
    useCompanyEmployeesWithoutMyId();
  const { user } = useUser();
  const { createSuggestionsAndGrievance, loading } =
    useCreateSuggestionsAndGrievance();

  const [departments, setDepartments] = useState([]);
  // const [branches, setBranches] = useState([]);
  const { accounts: branches = [], loading: loadingBranches } =
    useGetAllBranches();
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Transform employee data to match the expected format for dropdowns
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label:
      `${emp?.employee_code || ""} - ${emp.candidates?.first_name || ""} ${
        emp.candidates?.second_name || ""
      } ${emp.candidates?.third_name || ""} ${
        emp.candidates?.forth_name || ""
      } ${emp.candidates?.family_name || ""}`.trim() || `Employee #${emp.id}`,
  }));

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("organizational_units")
        .select("id, name")
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      if (!error && data) {
        setDepartments(
          data.map((d) => ({ label: d.name, value: d.id.toString() }))
        );
      } else {
        toast.error("Failed to load departments", error?.message);
      }
      setLoadingDepartments(false);
    };
    fetchDepartments();
  }, []);


        const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();


  return (
    <PageWrapperWithHeading
      title="Add Suggestion & Grievance"
      items={breadcrumbItems}
    >
      <Formik
        initialValues={{
          ...initialValues,
          reporter_employee_id: user?.id || "",
          created_by: user?.id || "",
          updated_by: user?.id || "",
        }}
        validationSchema={suggestionsAndGrievanceValidationSchema}
        onSubmit={async (values, { setSubmitting, isSubmitting }) => {
          if (isSubmitting || loading) return; // Prevent double submit
          setSubmitting(true);
          const payload = {
            ...values,
            employees_involved: Array.isArray(values.employees_involved)
              ? values.employees_involved.map((v) => (v.value ? v.value : v))
              : values.employees_involved,
            department_id: Array.isArray(values.department_id)
              ? values.department_id.map((v) => (v.value ? v.value : v))
              : values.department_id,
            branch_id: Array.isArray(values.branch_id)
              ? values.branch_id.map((v) => (v.value ? v.value : v))
              : values.branch_id,
            witnesses: Array.isArray(values.witnesses)
              ? values.witnesses.map((v) => (v.value ? v.value : v))
              : values.witnesses,
            assigned_to_id:
              values.assigned_to_id?.value || values.assigned_to_id || null,
            report_date: new Date().toISOString().split("T")[0],
            closed_date: new Date().toISOString().split("T")[0],
            resolution_date: values.resolution_date || null,
            resolution_notes: values.resolution_notes || "",
            attachment: values.attachment || null,
            created_by: user?.id || "",
            updated_by: user?.id || "",
            reporter_employee_id: user?.id || "",
            status: "pending",
            is_deleted: false,
            status_workflow: workflow_employees
          };


          const result = await createSuggestionsAndGrievance(payload);
          await transactionEmailSender(user, payload, "New Suggestion & Grievance Request", `New Suggestion & Grievance Request`);
          
          setSubmitting(false);
          if (result && !result.error) {
            navigate("/self/suggestions-grievance");
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-6 bg-white p-6 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelectField
                name="report_type"
                label="Report Type"
                options={reportTypeOptions}
                required
              />
              <FormikSelectField
                name="urgency"
                label="Urgency"
                options={urgencyOptions}
                required
              />
              <FormikSelectField
                name="category"
                label="Category"
                options={categoryOptions}
                required
              />
              {/* <FormikSelectField
                name="priority"
                label="Priority"
                options={priorityOptions}
                required
              /> */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.department_id) &&
                      values.department_id.length > 0) ||
                    (Array.isArray(values.branch_id) &&
                      values.branch_id.length > 0)
                      ? "none"
                      : "block",
                }}
              >
              <FormikMultiSelectField
                name="employees_involved"
                label="Employees Involved"
                placeholder="Select"
                options={employeeOptions}
                required={values.report_type === "grievance"}
                disabled={employeesLoading}
              />
              </div>

              {/* Branch (hide if department(s) or employee(s) chosen) */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.department_id) &&
                      values.department_id.length > 0) ||
                    (Array.isArray(values.employee_id) &&
                      values.employee_id.length > 0)
                      ? "none"
                      : "block",
                }}
              >
                <FormikMultiSelectField
                  name="branch_id"
                  label="Branches"
                  options={branches.map((b) => ({
                    label: b.name,
                    value: String(b.id),
                  }))}
                  disabled={loadingBranches}
                  placeholder="Select"
                  handleChange={(list) => {
                    setFieldValue("branch_id", list);
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("department_id", []);
                      setFieldValue("employee_id", []);
                    }
                  }}
                />
              </div>

              {/* Departments (hide if branch(es) or employee(s) chosen) */}
              <div
                className="grid grid-cols gap-4 mt-0"
                style={{
                  display:
                    (Array.isArray(values.branch_id) &&
                      values.branch_id.length > 0) ||
                    (Array.isArray(values.employee_id) &&
                      values.employee_id.length > 0)
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
                  handleChange={(list) => {
                    setFieldValue("department_id", list);
                    if (Array.isArray(list) && list.length > 0) {
                      setFieldValue("branch_id", []);
                      setFieldValue("employee_id", []);
                    }
                  }}
                />
              </div>

              <FormikMultiSelectField
                name="witnesses"
                label="Witnesses"
                options={employeeOptions}
                required={values.report_type === "grievance"}
                disabled={employeesLoading}
              />
              <FormikSelectField
                name="escalation_level"
                label="Escalation Level"
                options={employeeOptions}
                isLoading={employeesLoading}
                required
              />
              {/* <FormikSelectField
                name="assigned_to_id"
                label="Assigned To"
                options={employeeOptions}
                isLoading={employeesLoading}
              /> */}
              <FormikInputField
                name="action_taken"
                label="Action Taken"
                multiline
                rows={2}
              />

              <FormikInputField
                name="resolution_notes"
                label="Resolution Notes"
                multiline
                rows={2}
              />

              <FormikInputField
                name="resolution_date"
                label="Resolution Date"
                type="date"
                max="2100-12-31"
              />

              <FileUploadField
                label="Attachement"
                type="file"
                name="attachment"
                onChange={(url) => setFieldValue("attachment", url)}
              />
            </div>
            <FormikInputField
              name="description"
              label="Description"
              multiline
              rows={3}
              required
            />
            <FormikInputField
              name="action_expected"
              label="Action Expected"
              multiline
              rows={2}
              required
            />
            {/* <FormikInputField name="review_notes" label="Review Notes" multiline rows={2} /> */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikInputField name="report_date" label="Report Date" type="date" required />
              <FormikInputField name="closed_date" label="Closed Date" type="date" />
            </div> */}
            {/* <input type="hidden" name="status" value="pending" />
            <input type="hidden" name="reporter_employee_id" value={user?.id || ""} />
            <input type="hidden" name="created_by" value={user?.id || ""} />
            <input type="hidden" name="updated_by" value={user?.id || ""} /> */}
            <div className="flex justify-end">
              <SubmitButton
                isLoading={isSubmitting || loading}
                label="Submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default SuggestionsAndGrievanceForm;
