import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast"; // or your preferred toast library
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";
import { format } from "date-fns";

export function useLeaveRequests(
  page = 0,
  searchQuery = "",
  filters = {},
  perPage = 10
) {
  const [leaveData, setLeaveData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchLeaves = useCallback(
    async (isCancelled) => {
      if (!employeeId || isCancelled()) return;

      try {
        setLoading(true);
        setError(null);

        const from = page * perPage;
        const to = from + perPage - 1;

        let query = supabase
          .from("leave_requests")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .eq("employee_id", employeeId);

        if (searchQuery) {
          query = query.or(
            `reason.ilike.%${searchQuery}%,leave_type.ilike.%${searchQuery}%`
          );
        }

        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.leave_from) {
          const fromDate = new Date(filters.leave_from);
          fromDate.setHours(0, 0, 0, 0);
          query = query.gte("start_date", fromDate.toISOString());
        }
        if (filters.leave_to) {
          const toDate = new Date(filters.leave_to);
          toDate.setHours(23, 59, 59, 999);
          query = query.lte("end_date", toDate.toISOString());
        }
        if (filters.is_start_half_day) {
          query = query.eq("is_start_half_day", filters.is_start_half_day);
        }
        if (filters.is_end_half_day) {
          query = query.eq("is_end_half_day", filters.is_end_half_day);
        }

        query = query.order("created_at", { ascending: false });

        // Execute paginated query with count
        const {
          data,
          error: queryError,
          count: totalCount,
        } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setLeaveData([]);
          setTotalPages(0);
          setCount(0);
          toast.error("Failed to fetch leave requests");
          return;
        }

        const safeCount = totalCount ?? 0;
        const safeTotalPages = Math.ceil(safeCount / perPage);

        setLeaveData(data || []);
        setCount(safeCount);
        setTotalPages(safeTotalPages);
      } catch (err) {
        if (!isCancelled()) setError(err);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, searchQuery, filters, perPage, employeeId]
  );

  useEffect(() => {
    let isCancelled = false;
    fetchLeaves(() => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [fetchLeaves]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchLeaves(() => isCancelled);
  }, [fetchLeaves]);

  return {
    leaveData,
    totalPages,
    error,
    count,
    loading,
    refetch,
  };
}

// CREATE HOOK
export function useCreateLeaveRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLeaveRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data: existing, error: checkError } = await supabase
        .from("leave_requests")
        .select("id")
        .eq("employee_id", payload.employee_id)
        .eq("is_deleted", false)
        .or(
          `and(start_date.lte.${payload.end_date},end_date.gte.${payload.start_date})`
        );

      if (checkError) throw checkError;

      if (existing.length > 0 && !payload.reference_leave_id) {
        throw new Error("You already have a leave request for these dates.");
      }
      if (payload.reference_leave_id) {
        const { data: existingCancelation, error: checkErrorCancelation } =
          await supabase
            .from("leave_requests")
            .select("id")
            .eq("employee_id", payload.employee_id)
            .eq("is_deleted", false)
            .eq("reference_leave_id", payload.reference_leave_id);
        if (checkErrorCancelation) throw checkErrorCancelation;

        if (existingCancelation && existingCancelation.length > 0) {
          throw new Error(
            "You already have a Leave cancelation request for this leave."
          );
        }
      }
      const { data, error: sbError } = await supabase
        .from("leave_requests")
        .insert([payload])
        .select()
        .single();

      if (sbError) throw sbError;

      toast.success("Leave request created successfully!");
      return data;
    } catch (err) {
      const message = err.message || err;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createLeaveRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateLeaveRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLeaveRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from("leave_requests")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (sbError) {
        throw sbError;
      }

      toast.success("Leave request updated successfully!");
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateLeaveRequest, loading, error };
}

// DELETE HOOK
export function useDeleteLeaveRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteLeaveRequest = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("leave_requests");

      if (Array.isArray(ids)) {
        query = query.delete().in("id", ids);
      } else {
        query = query.delete().eq("id", ids);
      }

      const { error: sbError, data } = await query;

      if (sbError) {
        throw sbError;
      }

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} leave requests successfully.`
          : "Leave request deleted successfully."
      );
      setLoading(false);
      return data;
    } catch (err) {
      if (err.code === "23503") {
        toast.error("Cannot delete leave request: referenced by other records");
        return null;
      }
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteLeaveRequest, loading, error };
}

export function useTodayApprovedLeave() {
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchLeaves = useCallback(async () => {
    if (!employeeId) {
      setLeave(null);
      return;
    }

    setLoading(true);
    setError(null);

    const today = format(new Date(), "yyyy-MM-dd");

    try {
      const { data, error: rpcError } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("employee_id", employeeId)
        .lte("start_date", today)
        .gte("end_date", today)
        .eq("status", "approved")
        .eq("is_manager_approve", "approved")
        .eq("is_hr_approve", "approved")
        .eq("is_hr_manager_approve", "approved")
        .single();

      if (rpcError) {
        setError(rpcError);
        console.error("Error fetching leave requests:", rpcError);
      } else {
        setLeave(data ?? null);
      }
    } catch (err) {
      setError(err);
      console.error("Unexpected error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return {
    isOnLeave: !!leave,
    leaveRecord: leave,
    loading,
    error,
  };
}
