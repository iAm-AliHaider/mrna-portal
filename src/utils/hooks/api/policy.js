import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function usePoliciesList(
  page = 0,
  pageSize = 10,
  searchQuery = "",
) {
  const [policyData, setPolicyData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPolicies = useCallback(() => {
  let isCancelled = false;
  const loadPolicies = async () => {
    setLoading(true);
    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const {
        data,
        error: sbError,
        count: totalCount,
      } = await supabase
        .from("policy")
        .select("*", { count: "exact" })
        .ilike("name", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .range(from, to);

        if (sbError) throw sbError;

        if (!isCancelled) {
          setPolicyData(data || []);
          setCount(totalCount || 0);
          setTotalPages(Math.ceil((totalCount || 0) / pageSize));
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "An unexpected error occurred");
          toast.error(`Error loading policies: ${err.message || err}`);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

  loadPolicies();

  return () => {
    isCancelled = true;
  };
}, [page, pageSize, searchQuery]);

  useEffect(() => {
    let isCancelled = false
    if (!isCancelled) fetchPolicies()
    return () => {
      isCancelled = true
    }
  }, [fetchPolicies])

  return { policyData, totalPages, count, error, loading, refetch: fetchPolicies,
 };
}

export function usePolicyById(policyId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policyId == null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    supabase
      .from("policy")
      .select(
        `
          *
        `
      )
      .eq("id", policyId)
      .single()
      .then(({ data: row, error: sbError }) => {
        if (sbError) {
          throw sbError;
        }
        if (!isCancelled) {
          setData(row);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching policy by ID:", err);
        if (!isCancelled) {
          setError(err.message || "An unexpected error occurred");
          setData(null);
          toast.error(`Error loading policy: ${err.message || err}`);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [policyId]);

  return { data, error, loading };
}
