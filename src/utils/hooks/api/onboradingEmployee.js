import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useOnboardingEmployees() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async (isCancelled) => {
    if (!isCancelled) {
      setLoading(true);
      setError(null);
    }

    try {
      const { data: rows, error: fetchError } = await supabase
        .from("employment_types")
        .select("*")

      if (fetchError) {
        throw fetchError;
      }

      if (!isCancelled) {
        setData(rows || []);
        setLoading(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message || err);
        setLoading(false);
        toast.error(`Error loading candidates: ${err.message || err}`);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetchEmployees(isCancelled);

    return () => {
      isCancelled = true;
    };
  }, [fetchEmployees]);

  return {
    data,
    loading,
    error,
    refetch: fetchEmployees,
  };
}
