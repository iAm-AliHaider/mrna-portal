import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { toast } from "react-hot-toast";
import { useUser } from "../../../context/UserContext";

export const useOffBoardingRequests = ({
  page = 0,
  rowsPerPage = 10,
  searchQuery = "",
  status = "",
  // filters = {}
}) => {
  const [offBoardingData, setOffBoardingData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchOffBoardingRequests = useCallback(async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError(null);

      // Apply pagination
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;

      const { data, error } = await supabase.rpc(
        "get_offboarding_requests_filtered_by_first_name",
        {
          p_first_name: searchQuery || null,
          p_status: status || null,
          p_employment_type_ids: null,
          p_created_by: employeeId || null,
          p_from: from,
          p_to: to,
        }
      );

      if (error) {
        setError(error);
        setOffBoardingData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setOffBoardingData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / rowsPerPage));
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, status, employeeId]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      await fetchOffBoardingRequests();
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetchOffBoardingRequests]);

  return {
    offBoardingData,
    totalPages,
    error,
    count,
    loading,
    refetch: fetchOffBoardingRequests,
  };
};

export const useCreateOffBoardingRequest = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const createOffBoardingRequest = async (values) => {
    try {
      setLoading(true);
      if (!employeeId) throw new Error("Current user not found.");
      const payload = {
        ...values,
        created_by: employeeId,
        updated_by: employeeId,
        status: "pending",
        is_deleted: false,
        created_at: new Date().toISOString().split("T")[0],
      };
      const { error } = await supabase
        .from("offboarding_requests")
        .insert([payload]);

      if (error) throw error;

      toast.success("Off-boarding request created successfully");
    } catch (error) {
      console.error("Error creating off-boarding request:", error);
      toast.error("Failed to create off-boarding request");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createOffBoardingRequest, loading };
};

export const useUpdateOffBoardingRequest = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;
  const updateOffBoardingRequest = async (values) => {
    try {
      setLoading(true);
      if (!employeeId) throw new Error("Current user not found.");

      const { employee, employee_info, id, ...rest } = values;

      const payload = {
        ...rest,
        updated_by: employeeId,
        updated_at: new Date().toISOString().split("T")[0],
      };
      const { error } = await supabase
        .from("offboarding_requests")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      toast.success("Off-boarding request updated successfully");
    } catch (error) {
      console.error("Error updating off-boarding request:", error);
      toast.error("Failed to update off-boarding request");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateOffBoardingRequest, loading };
};

export const useDeleteOffBoardingRequest = () => {
  const [loading, setLoading] = useState(false);

  const deleteOffBoardingRequest = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("offboarding_requests")
        .update({ is_deleted: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Off-boarding request deleted successfully");
    } catch (error) {
      console.error("Error deleting off-boarding request:", error);
      toast.error("Failed to delete off-boarding request");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteOffBoardingRequest, loading };
};

export function useFinalEmploymentCalls() {
  const { user } = useUser();
  const employeeId = user?.id?.toString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligible, setEligible] = useState([]);

  useEffect(() => {
    if (!employeeId) {
      setEligible([]);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from("final_employment_calls")
      .select(
        `
        employment_type_id,
        termination_submitters,
        termination_cancellation_approvers
      `
      )
      .then(({ data: rows, error: sbError }) => {
        if (isCancelled) return;
        if (sbError) throw sbError;

        const list = rows
          .map((row) => {
            const submits = Array.isArray(row.termination_submitters)
              ? row.termination_submitters.map((o) => String(o.employee))
              : [];
            const cancels = Array.isArray(
              row.termination_cancellation_approvers
            )
              ? row.termination_cancellation_approvers.map((o) =>
                  String(o.employee)
                )
              : [];

            return {
              employmentTypeId: row.employment_type_id,
              canCreateRequest: submits.includes(employeeId),
              canCancelRequest: cancels.includes(employeeId),
            };
          })
          // only keep those where user actually appears in one of the lists
          .filter((r) => r.canCreateRequest || r.canCancelRequest);

        setEligible(list);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("useFinalEmploymentCalls error", err);
          setError(err.message || err);
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [employeeId]);

  const canCreateAny = eligible.some((r) => r.canCreateRequest);
  const canCancelAny = eligible.some((r) => r.canCancelRequest);

  return {
    loading,
    error,
    eligibleToCreate: eligible.filter((r) => r.canCreateRequest),
    eligibleToCancel: eligible.filter((r) => r.canCancelRequest),
    canCreateAny,
    canCancelAny,
  };
}

export const useGetSpecificEmploymentTypeEmployees = (employment_type_ids) => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      if (!employeeId || !employment_type_ids?.length > 0) return;

      setLoading(true);
      try {
        const { data: employees, error } = await supabase
          .from("employees")
          .select(
            `
            id,
            candidate_id,
            employee_code,
            candidates:candidates!employees_candidate_id_fkey(
              first_name,
              second_name,
              third_name,
              forth_name,
              family_name
            )
          `
          )
          // .in('employment_type_id', employment_type_ids)
          .eq("is_deleted", false)
          .neq("id", employeeId)
          .eq("role_columns", JSON.stringify({ roles: ["employee"] }));

        if (error) throw error;

        setEmployees(employees);
      } catch (err) {
        setError(err);
        console.error("Error fetching organizational unit employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, [employeeId, employment_type_ids]);

  return { employees, loading, error };
};
