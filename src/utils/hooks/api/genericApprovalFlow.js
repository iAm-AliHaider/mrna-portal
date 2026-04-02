// hooks/useOrgEmployees.js
import { useEffect, useState, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";

// WORKFLOW / work flow / workflow class
export const useGenericFlowEmployees = () => {
  const { user } = useUser();
  const [workflow_employees, setWorkflowEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkflowEmployees = useCallback(async () => {
    if (!user?.organizational_unit_id) {
      setWorkflowEmployees([]);
      return;
    }

    setLoadingEmployees(true);
    setError(null);

    try {
     
      
//       const { data, error } = await supabase
//   .from("employees")
//   .select(`
//     id,
//     employee_code,
//     organizational_unit_id,
//     role_columns,
//     candidates:candidate_id (
//       first_name,
//       second_name,
//       third_name,
//       forth_name,
//       family_name
//     )
//   `);

// if (error) throw error;

// // Helper to format full name
// const formatName = (emp) => {
//   if (!emp) return "";
//   const empName = [
//     emp.candidates?.first_name,
//     emp.candidates?.second_name,
//     emp.candidates?.third_name,
//     emp.candidates?.forth_name,
//     emp.candidates?.family_name,
//   ]
//     .filter(Boolean)
//     .join(" ")
//     .trim();

//   return empName || emp.employee_code || `Employee ${emp.id}`;
// };

// // Split employees into same-org vs global
// const sameOrg = (data || []).filter(
//   (emp) => emp.organizational_unit_id === user.organizational_unit_id
// );
// const allEmployees = data || [];

// // Find by role
// const managerEmp = sameOrg.find((emp) =>
//   emp.role_columns?.roles?.includes("manager")
// );
// const hodEmp = sameOrg.find((emp) =>
//   emp.role_columns?.roles?.includes("hod")
// );
// const hrEmp = allEmployees.find((emp) =>
//   emp.role_columns?.roles?.includes("hr")
// );
// const hrManagerEmp = allEmployees.find((emp) =>
//   emp.role_columns?.roles?.includes("hr_manager")
// );

// // Build final ordered list
// const employeesList = [
//   managerEmp
//     ? { name: formatName(managerEmp), role: "manager", status: "pending" }
//     : { name: "Manager", role: "manager", status: "approved" },

//   hodEmp
//     ? { name: formatName(hodEmp), role: "hod", status: "pending" }
//     : { name: "HOD", role: "hod", status: "approved" },

//   hrEmp
//     ? { name: formatName(hrEmp), role: "hr", status: "pending" }
//     : { name: "HR", role: "hr", status: "pending" },

//   hrManagerEmp
//     ? { name: formatName(hrManagerEmp), role: "hr_manager", status: "pending" }
//     : { name: "HR Manager", role: "hr_manager", status: "pending" },
// ];


const { data, error } = await supabase
  .from("employees")
  .select(`
    id,
    employee_code,
    organizational_unit_id,
    role_columns,
    work_email,
    candidates:candidate_id (
      first_name,
      second_name,
      third_name,
      forth_name,
      family_name
    )
  `);

if (error) throw error;

// Helper to format full name
const formatName = (emp) => {
  if (!emp) return "";
  const empName = [
    emp.candidates?.first_name,
    // emp.candidates?.second_name,
    // emp.candidates?.third_name,
    // emp.candidates?.forth_name,
    // emp.candidates?.family_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return empName || emp.employee_code || `Employee ${emp.id}`;
};

// Split employees into same-org vs global
const sameOrg = (data || []).filter(
  (emp) => emp.organizational_unit_id === user.organizational_unit_id
);
const allEmployees = data || [];

// Find by role
const managerEmp = sameOrg.find((emp) =>
  emp.role_columns?.roles?.includes("manager")
);
const hodEmp = sameOrg.find((emp) =>
  emp.role_columns?.roles?.includes("hod")
);
const hrEmp = allEmployees.find((emp) =>
  emp.role_columns?.roles?.includes("hr")
);
const hrManagerEmp = allEmployees.find((emp) =>
  emp.role_columns?.roles?.includes("hr_manager")
);

// Base employees list (pending/approved fallback)
let employeesList = [
  managerEmp
    ? { id: managerEmp.id, name: formatName(managerEmp), email: managerEmp.work_email, role: "manager", status: "pending" }
    : { id: null, name: "Manager", role: "manager", status: "approved" },

  hodEmp
    ? { id: hodEmp.id, name: formatName(hodEmp), email: hodEmp.work_email, role: "hod", status: "pending" }
    : { id: null, name: "HOD", role: "hod", status: "approved" },

  hrEmp
    ? { id: hrEmp.id, name: formatName(hrEmp), email: hrEmp.work_email, role: "hr", status: "pending" }
    : { id: null, name: "HR", role: "hr", status: "approved" },

  hrManagerEmp
    ? { id: hrManagerEmp.id, name: formatName(hrManagerEmp), email: hrManagerEmp.work_email, role: "hr_manager", status: "pending" }
    : { id: null, name: "HR Manager", role: "hr_manager", status: "approved" },
];



const myRole = user?.role; // directly from user.role


if (myRole === "hr_manager") {
  // Top level → approve everything
  employeesList = employeesList.map((emp) => ({
    ...emp,
    status: "approved",
  }));
} else if (myRole === "hr") {
  // Approve manager, hod, and hr itself
  employeesList = employeesList.map((emp) =>
    ["manager", "hod", "hr"].includes(emp.role)
      ? { ...emp, status: "approved" }
      : emp
  );
} else if (myRole === "hod") {
  // Approve both manager and hod
  employeesList = employeesList.map((emp) =>
    ["manager", "hod"].includes(emp.role)
      ? { ...emp, status: "approved" }
      : emp
  );
} else if (myRole === "manager") {
  // Only manager is approved
  employeesList = employeesList.map((emp) =>
    emp.role === "manager"
      ? { ...emp, status: "approved" }
      : emp
  );
}


    setWorkflowEmployees(employeesList);
    } catch (err) {
      console.error("Error fetching employees:", err.message || err);
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoadingEmployees(false);
    }
  }, [user?.organizational_unit_id]);

  useEffect(() => {
    fetchWorkflowEmployees();
  }, [fetchWorkflowEmployees]);

  return { workflow_employees, loadingEmployees, error, refetch: fetchWorkflowEmployees };
};
