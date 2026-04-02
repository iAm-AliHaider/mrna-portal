// hooks/useEmployeesWithCandidates.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useEmployeesData(useFilters = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useUser();

  const userFilters = useMemo(
    () => ({
      branchId: user?.branch_id,
      unitId: user?.organizational_unit_id,
      isReady: Boolean(user),
    }),
    [user?.branch_id, user?.organizational_unit_id, user]
  );

  // Memoize the data transformation function
  const transformData = useCallback((rows) => {
    return rows.map((emp) => {
      const { candidates, ...employeeFields } = emp;
      const cand = Array.isArray(candidates)
        ? candidates[0] || {}
        : candidates || {};

      return {
        candidate_id: cand.id || null,
        ...cand,
        ...employeeFields,
      };
    });
  }, []);

  const fetchCombined = useCallback(async () => {
    if (!userFilters.isReady) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          company_id,
          created_at,
          profile_image,
          candidates:candidates!employees_candidate_id_fkey(*)
        `
        )
        .eq("user_status", "active")
        .eq("is_deleted", false)
        .neq("id", user?.id);


      // if (userFilters.branchId && useFilters) {
      //   query = query.eq("branch_id", userFilters.branchId);
      // }


      if (useFilters) {
  if (userFilters.branchId != null) {
    query = query.eq("branch_id", userFilters.branchId);
  }

}

      if (userFilters.unitId && useFilters) {
        query = query.eq("organizational_unit_id", userFilters.unitId);
      }


      const { data: rows, error: fetchError } = await query.order("id", {
        ascending: true,
      });

      if (fetchError) {
        throw new Error(fetchError.message || "Failed to fetch employees");
      }

      // Transform and set data
      const transformed = transformData(rows || []);
      setData(transformed);
    } catch (err) {
      console.error("Error fetching employees with candidates:", err);
      setError(err.message || "An unexpected error occurred");
      setData([]); // Reset data on error
    } finally {
      setLoading(false);
    }
  }, [
    userFilters.branchId,
    userFilters.unitId,
    userFilters.isReady,
    transformData,
    useFilters,
  ]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchCombined();
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchCombined]);

  return {
    data,
    loading,
    error,
    refetch: fetchCombined,
  };
}

export const useCompanyEmployees = () => {
  const { user } = useUser();
  const companyId = user?.company_id;
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCompanyEmployees = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          candidate_id,
          role_columns,
          created_at,
          candidates:candidates!employees_candidate_id_fkey(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          ),
          organizational_unit_id
        `
        )
        .eq("company_id", companyId)
        .eq("is_deleted", false);

      if (error) throw error;

      // Return raw data so the form can transform it as needed
      setEmployees(data || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching company employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanyEmployees();
  }, [companyId]);

  return { employees, loading, error, getCompanyEmployees };
};

// export const useCompanyEmployeesWithoutMyId = () => {
//   const { user } = useUser();
//   const employeeId = user?.id;
//   const myRole = user?.role;
//     const myOrganizational_unit_id = user?.organizational_unit_id;

//   const companyId = user?.company_id;
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const getCompanyEmployees = async () => {
//     if (!companyId) return;

//     console.log("================4444", myRole)

//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('employees')
//         .select(`
//           id,
//           candidate_id,
//           created_at,
//           employee_code,
//           organizational_unit_id,
//           candidates:candidates!employees_candidate_id_fkey(
//             first_name,
//             second_name,
//             third_name,
//             forth_name,
//             family_name
//           )
//         `)
//         .eq('company_id', companyId)
//         .eq('is_deleted', false)
//         .neq('id', employeeId)

//       if (error) throw error;

//       // Return raw data so the form can transform it as needed
//       setEmployees(data || []);
//     } catch (err) {
//       setError(err);
//       console.error('Error fetching company employees:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getCompanyEmployees();
//   }, [companyId]);

//   return { employees, loading, error, getCompanyEmployees };
// };

export const useCompanyEmployeesWithoutMyId = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const myRole = user?.role;
  const myOrganizational_unit_id = user?.organizational_unit_id;
  const companyId = user?.company_id;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCompanyEmployees = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      let query = supabase
        .from("employees")
        .select(
          `
          id,
          candidate_id,
          created_at,
          employee_code,
          organizational_unit_id,
          candidates:candidates!employees_candidate_id_fkey(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          )
        `
        )
        .eq("company_id", companyId)
        .eq("is_deleted", false)
        .neq("id", employeeId);

      // ✅ If role is manager, filter further by organizational_unit_id
      if (myRole === "manager" && myOrganizational_unit_id) {
        query = query.eq("organizational_unit_id", myOrganizational_unit_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEmployees(data || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching company employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanyEmployees();
  }, [companyId, myRole, myOrganizational_unit_id]);

  return { employees, loading, error, getCompanyEmployees };
};

export const useCompanyManagers = () => {
  const { user } = useUser();
  const companyId = user?.company_id;
  const [managers, setManagers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCompanyManagers = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      // First get the company info to get manager IDs
      const { data: companyInfo, error: companyError } = await supabase
        .from("company_info")
        .select(
          `
          general_manager_id,
          hr_manager_id,
          finance_manager_id
        `
        )
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;

      const managerData = {};

      // Fetch HR Manager (CHRO)
      if (companyInfo?.hr_manager_id) {
        const { data: hrManager, error: hrError } = await supabase
          .from("employees")
          .select(
            `
            id,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              family_name
            )
          `
          )
          .eq("id", companyInfo.hr_manager_id)
          .eq("is_deleted", false)
          .single();

        if (!hrError && hrManager) {
          managerData.chro_manager = {
            id: hrManager.id,
            name:
              `${hrManager.candidates?.first_name || ""} ${
                hrManager.candidates?.family_name || ""
              }`.trim() || `Manager #${hrManager.id}`,
          };
        }
      }

      // Fetch General Manager (MD)
      if (companyInfo?.general_manager_id) {
        const { data: generalManager, error: gmError } = await supabase
          .from("employees")
          .select(
            `
            id,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              family_name
            )
          `
          )
          .eq("id", companyInfo.general_manager_id)
          .eq("is_deleted", false)
          .single();

        if (!gmError && generalManager) {
          managerData.md_manager = {
            id: generalManager.id,
            name:
              `${generalManager.candidates?.first_name || ""} ${
                generalManager.candidates?.family_name || ""
              }`.trim() || `Manager #${generalManager.id}`,
          };
        }
      }

      setManagers(managerData);
    } catch (err) {
      setError(err);
      console.error("Error fetching company managers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompanyManagers();
  }, [companyId]);

  return { managers, loading, error, getCompanyManagers };
};

export function useGetDepartmentManager() {
  const [manager, setManager] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchManager = useCallback(async (organizationalUnitId) => {
    setLoading(true);
    setError(null);

    try {
      if (!organizationalUnitId) {
        setManager(null);
        setLoading(false);
        return;
      }

      // Primary: JSONB contains on the whole object (most robust)
      let { data, error: qErr } = await supabase
        .from("employees")
        .select("*")
        .eq("organizational_unit_id", organizationalUnitId)
        .eq("is_deleted", false)
        .contains("role_columns", { roles: ["manager"] })
        .limit(1);

      // Fallback: if nothing matched (or backend doesn’t support that form), fetch and filter in JS
      if (!qErr && (!data || data.length === 0)) {
        const res = await supabase
          .from("employees")
          .select("id, role_columns, organizational_unit_id, is_deleted")
          .eq("organizational_unit_id", organizationalUnitId)
          .eq("is_deleted", false);

        if (!res.error) {
          const found = (res.data || []).find(
            (row) =>
              row?.role_columns &&
              Array.isArray(row.role_columns.roles) &&
              row.role_columns.roles.includes("manager")
          );
          data = found ? [found] : [];
        } else {
          qErr = res.error;
        }
      }

      if (qErr) {
        setError(qErr);
        console.error(
          "Error fetching department manager:",
          qErr.message || qErr
        );
        setManager(null);
        return null;
      } else {
        // setManager(data && data.length > 0 ? data[0] : null);
        const managerData = data && data.length > 0 ? data[0] : null;
        setManager(managerData);
        return managerData;
      }
    } catch (err) {
      setError(err);
      setManager(null);
      console.error("Unexpected error:", err.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { manager, loading, error, fetchManager };
}

export function useGetDepartmentHeads() {
  const [heads, setHeads] = useState({ manager: null, hod: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartmentHeads = useCallback(async (organizationalUnitId) => {
    setLoading(true);
    setError(null);

    try {
      if (!organizationalUnitId) {
        setHeads({ manager: null, hod: null });
        setLoading(false);
        return { manager: null, hod: null };
      }

      let { data, error: qErr } = await supabase
        .from("employees")
        .select(
          `
          id,
          employee_code,
          candidate_id,
          role_columns,
          created_at,
          candidates:candidates!employees_candidate_id_fkey(
            first_name,
            second_name,
            third_name,
            forth_name,
            family_name
          ),
          organizational_unit_id
        `
        )
        .eq("organizational_unit_id", organizationalUnitId)
        .eq("is_deleted", false);

      if (qErr) {
        console.error("Error fetching department heads:", qErr.message);
        setError(qErr);
        setHeads({ manager: null, hod: null });
        return { manager: null, hod: null };
      }

      const employees = data || [];

      const findByRole = (role) =>
        employees.find(
          (row) =>
            row?.role_columns &&
            Array.isArray(row.role_columns.roles) &&
            row.role_columns.roles.includes(role)
        );

      const managerData = findByRole("manager") || null;
      const hodData = findByRole("hod") || null;

      const result = { manager: managerData, hod: hodData };
      setHeads(result);
      return result;
    } catch (err) {
      console.error("Unexpected error fetching heads:", err);
      setError(err);
      setHeads({ manager: null, hod: null });
      return { manager: null, hod: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return { heads, loading, error, fetchDepartmentHeads };
}
