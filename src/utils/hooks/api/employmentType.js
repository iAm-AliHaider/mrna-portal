import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

export function useEmploymentTypeList(
  page = 0,
  pageSize = 10,
  searchQuery = ""
) {
  const [employmentTypeData, setEmploymentTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Wrap fetch logic in useCallback so it can be called manually
  const fetchEmploymentTypes = useCallback(async () => {
    setLoading(true);
    const from = page * pageSize;
    const to = from + pageSize - 1;
    try {
      const {
        data,
        error: sbError,
        count: totalCount,
      } = await supabase
        .from("employment_types")
        .select("*", { count: "exact" })
        .ilike("employment_type ", `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (sbError) throw sbError;

      setEmploymentTypes(data || []);
      setCount(totalCount || 0);
      setTotalPages(Math.ceil((totalCount || 0) / pageSize));
      setError(null);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      toast.error(`Error loading policies: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchEmploymentTypes();
  }, [fetchEmploymentTypes]);

  return {
    employmentTypeData,
    totalPages,
    count,
    error,
    loading,
    refetch: fetchEmploymentTypes,
  };
}

export function useEmploymentTypesById(employmentTypesId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employmentTypesId == null) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    supabase
      .from("employment_types")
      .select(
        `
          *
        `
      )
      .eq("id", employmentTypesId)
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
        console.error("Error fetching employment_types by ID:", err);
        if (!isCancelled) {
          setError(err.message || "An unexpected error occurred");
          setData(null);
          toast.error(`Error loading employment_types: ${err.message || err}`);
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
  }, [employmentTypesId]);

  return { data, error, loading };
}
