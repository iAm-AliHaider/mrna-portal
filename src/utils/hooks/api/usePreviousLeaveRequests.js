import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

/**
 * Fetch employee's previous approved leave requests for reference dropdown.
 * Returns list sorted by end_date descending (most recent first).
 */
export function usePreviousLeaveRequests(employeeId = null) {
  const { user } = useUser();
  const empId = employeeId || user?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!empId) return;
    setLoading(true);
    setError(null);

    const { data: result, error: err } = await supabase
      .from("leave_requests")
      .select(`
        id,
        leave_type,
        start_date,
        end_date,
        created_at,
        status,
        employee:candidates!leave_requests_employee_id_fkey(
          first_name,
          second_name,
          third_name,
          forth_name,
          family_name
        )
      `)
      .eq("employee_id", empId)
      .eq("status", "approved")
      .order("end_date", { ascending: false })
      .limit(20);

    if (err) {
      setError(err);
      setData([]);
    } else {
      setData(result || []);
    }

    setLoading(false);
  }, [empId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Fetch employee's active loans (not rejected, not settled).
 * Used in the asset/loan summary panel on leave request form.
 */
export function useEmployeeActiveLoans(employeeId = null) {
  const { user } = useUser();
  const empId = employeeId || user?.id;

  const [data, setData] = useState({ loans: [], assets: [], loading: false, error: null });

  const fetchData = useCallback(async () => {
    if (!empId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    // Fetch active loans
    const { data: loanResult, error: loanErr } = await supabase
      .from("loan_requests")
      .select("id, loan_type, requested_amount, approved_amount, status, created_at")
      .eq("employee_id", empId)
      .not("status", "in", "('rejected','settled','cancelled')")
      .order("created_at", { ascending: false });

    // Fetch unreturned assets
    const { data: assetResult, error: assetErr } = await supabase
      .from("assets_transactions")
      .select(`
        id,
        transaction_type,
        status,
        asset:assets_asset_id_fkey(name, asset_code, category:asset_categories(name))
      `)
      .eq("employee_id", empId)
      .is("return_date", null)
      .not("transaction_type", "eq", "takeback");

    setData({
      loans: loanResult || [],
      assets: assetResult || [],
      loading: false,
      error: loanErr || assetErr || null,
    });
  }, [empId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}
