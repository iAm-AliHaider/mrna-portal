import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useCompensationDashboard() {
  const [data, setData] = useState({
    currentSalary: 0,
    bonuses: 0,
    deductions: 0,
    netPay: 0,
    salaryHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);

      // Get current salary slip
      const { data: salaryData } = await supabase
        .from("employee_salary_slip_reports")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get salary history
      const { data: historyData } = await supabase
        .from("salary_history")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_deleted", false)
        .order("effective_date", { ascending: false })
        .limit(12);

      setData({
        currentSalary: salaryData?.gross_salary || 0,
        bonuses: salaryData?.bonuses || 0,
        deductions: salaryData?.total_deductions || 0,
        netPay: salaryData?.net_salary || 0,
        salaryHistory: historyData || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useCompensationReview(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("compensation_reviews")
        .select(`
          *,
          employee:employees!compensation_reviews_employee_id_fkey(
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
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`reason.ilike.%${searchQuery}%`);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;
      if (error) throw error;

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      console.error(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  return { data, totalPages, loading, refetch: fetchData };
}

export function useCreateCompensationReview() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("compensation_reviews")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      toast.success("Compensation review submitted!");
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

export function useUpdateCompensationReview() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("compensation_reviews")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      toast.success("Compensation review updated!");
      return data;
    } catch (err) {
      toast.error(`Update failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading };
}
