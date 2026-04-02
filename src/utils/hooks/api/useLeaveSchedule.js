import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useLeaveSchedule(page = 0, searchQuery = "", filters = {}, perPage = 50) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(
    async (isCancelled) => {
      if (!employeeId || isCancelled()) return;
      try {
        setLoading(true);
        setError(null);
        const from = page * perPage;
        const to = from + perPage - 1;

        // Get department employees
        const { data: empData } = await supabase
          .from("employees")
          .select("organizational_unit_id")
          .eq("id", employeeId)
          .single();

        if (!empData?.organizational_unit_id) {
          setData([]);
          return;
        }

        // Get department employee IDs
        const { data: deptEmps } = await supabase
          .from("employees")
          .select("id")
          .eq("organizational_unit_id", empData.organizational_unit_id)
          .eq("is_deleted", false);

        const deptEmpIds = (deptEmps || []).map((e) => e.id);
        if (deptEmpIds.length === 0) {
          setData([]);
          return;
        }

        let query = supabase
          .from("leave_requests")
          .select(`
            *,
            employee:employees!leave_requests_employee_id_fkey(
              id,
              employee_code,
              candidates:candidates!employees_candidate_id_fkey(
                first_name,
                second_name,
                third_name,
                forth_name,
                family_name
              )
            )
          `, { count: "exact" })
          .eq("is_deleted", false)
          .in("employee_id", deptEmpIds);

        if (searchQuery) {
          query = query.or(`reason.ilike.%${searchQuery}%,leave_type.ilike.%${searchQuery}%`);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.month) {
          query = query.gte("start_date", `${filters.month}-01`);
          query = query.lte("start_date", `${filters.month}-31`);
        }

        query = query.order("start_date", { ascending: true });
        const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setData([]);
          toast.error("Failed to fetch leave schedule");
          return;
        }

        setData(result || []);
        setCount(totalCount ?? 0);
        setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
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
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
  }, [fetchData]);

  return { data, totalPages, error, count, loading, refetch };
}
