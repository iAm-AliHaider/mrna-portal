// src/utils/hooks/api/useLoanRequestsData.js
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

const useLoanRequestsData = (params) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no params, reset state and skip the fetch
    if (!params) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Now it's safe to destructure
    const { employeeId, month, year } = params;

    // If any required field is missing, bail out
    if (!employeeId || !month || !year) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchLoanRequests = async () => {
      setLoading(true);

      // Build date range for the given month/year
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const endDate = new Date(y, m, 0)
        .toISOString()
        .split("T")[0];
      const { data: rows, error: fetchError } = await supabase
        .from("loan_requests")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("request_date", startDate)
        .lte("request_date", endDate)
        .order("request_date", { ascending: false })
        .limit(100);
      if (fetchError) setError(fetchError);
      else setData(rows);

      setLoading(false);
    };

    fetchLoanRequests();
  }, [params]);

  return { data, loading, error };
};

export default useLoanRequestsData;
