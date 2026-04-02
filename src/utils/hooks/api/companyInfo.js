import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

// Fetch company info with manager details
export function useCompanyInfo() {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch company info with manager details using joins
      const { data, error: sbError } = await supabase
        .from("company_info")
        .select(
          `
          *,
          general_manager:general_manager_id(
            id,
            candidate:candidate_id(
              id,
              first_name,
              family_name,
              telephone,
              mobile
            )
          ),
          hr_manager:hr_manager_id(
            id,
            candidate:candidate_id(
              id,
              first_name,
              family_name,
              telephone,
              mobile
            )
          ),
          finance_manager:finance_manager_id(
            id,
            candidate:candidate_id(
              id,
              first_name,
              family_name,
              telephone,
              mobile
            )
          )
        `
        )
        .single();

      if (sbError && sbError.code !== "PGRST116") throw sbError; // PGRST116 is "no rows returned"

      setCompanyData(data || null);
      setError(null);
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Error loading company information: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchCompanyInfo();
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchCompanyInfo]);

  return {
    companyData,
    loading,
    error,
    refetch: fetchCompanyInfo,
  };
}

// Fetch employees for dropdown options
export function useEmployeesForDropdown() {
  const [employees, setEmployees] = useState([]);
  const [hrManagers, setHrManagers] = useState([]);
  const [financeManagers, setFinanceManagers] = useState([]);
  const [generalManagers, setGeneralManagers] = useState([]);
  const [companyHRs, setCompanyHRs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployeesForDropdown = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: employeesData, error: sbError } = await supabase
        .from("employees")
        .select(
          `
          id,
          role_columns,
          work_email,
          candidate:candidate_id(
            id,
            first_name,
            family_name,
            telephone,
            mobile
          )
        `
        )
        .eq("is_deleted", false);

      if (sbError) throw sbError;

      // Helper to check if employee has any of the desired roles
      const hasRole = (emp, rolesToMatch) => {
        const roles = emp?.role_columns?.roles || [];
        return roles.some((role) => rolesToMatch.includes(role));
      };

      // Filter HR managers (both "hr" and "hr_manager")
      const hrManagerEmployees =
        employeesData?.filter((emp) => hasRole(emp, ["hr", "hr_manager"])) ||
        [];

      const hrEmployees =
        employeesData?.filter((emp) => hasRole(emp, ["hr"])) || [];

      // Filter Finance managers
      const financeManagerEmployees =
        employeesData?.filter((emp) => hasRole(emp, ["manager"])) || [];

      // Filter General Managers (has "manager" role)
      const generalManagerEmployees =
        employeesData?.filter((emp) => hasRole(emp, ["manager"])) || [];

      // Map HR options
      const hrManagerOptions = hrManagerEmployees.map((emp) => ({
        label:
          `${emp.candidate?.first_name || ""} ${
            emp.candidate?.family_name || ""
          }`.trim() || `Employee #${emp.id}`,
        value: emp.id.toString(),
        phone: emp.candidate?.telephone || emp.candidate?.mobile || "",
      }));

      // Map HRs
      const orgHRs = hrEmployees.map((emp) => ({
        label:
          `${emp.candidate?.first_name || ""} ${
            emp.candidate?.family_name || ""
          }`.trim() || `Employee #${emp.id}`,
        value: emp.id.toString(),
        phone: emp.candidate?.telephone || emp.candidate?.mobile || "",
        email: emp.work_email,
      }));

      // Map Finance options
      const financeManagerOptions = financeManagerEmployees.map((emp) => ({
        label:
          `${emp.candidate?.first_name || ""} ${
            emp.candidate?.family_name || ""
          }`.trim() || `Employee #${emp.id}`,
        value: emp.id.toString(),
        phone: emp.candidate?.telephone || emp.candidate?.mobile || "",
      }));

      // Map General Manager options
      const generalManagerOptions = generalManagerEmployees.map((emp) => ({
        label:
          `${emp.candidate?.first_name || ""} ${
            emp.candidate?.family_name || ""
          }`.trim() || `Employee #${emp.id}`,
        value: emp.id.toString(),
        phone: emp.candidate?.telephone || emp.candidate?.mobile || "",
      }));

      setGeneralManagers(generalManagerOptions);
      setHrManagers(hrManagerOptions);
      setFinanceManagers(financeManagerOptions);
      setEmployees(employeesData || []);
      setCompanyHRs(orgHRs);
      setError(null);
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Error loading employees: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchEmployeesForDropdown();
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchEmployeesForDropdown]);

  return {
    employees,
    hrManagers,
    financeManagers,
    generalManagers,
    companyHRs,
    loading,
    error,
    refetch: fetchEmployeesForDropdown,
  };
}

// Create or update company info
export function useUpdateCompanyInfo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCompanyInfo = useCallback(async (payload, existingId = null) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (existingId) {
        // Update existing record
        const { data, error: sbError } = await supabase
          .from("company_info")
          .update(payload)
          .eq("id", existingId)
          .select()
          .single();

        if (sbError) throw sbError;
        result = data;
        toast.success("Company information updated successfully!");
      } else {
        // Create new record
        const { data, error: sbError } = await supabase
          .from("company_info")
          .insert([payload])
          .select()
          .single();

        if (sbError) throw sbError;
        result = data;
        toast.success("Company information created successfully!");
      }

      setLoading(false);
      return result;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Failed to save company information: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    updateCompanyInfo,
    loading,
    error,
  };
}
