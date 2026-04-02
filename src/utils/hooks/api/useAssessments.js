import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useAssessments(page = 0, searchQuery = "", filters = {}, perPage = 20) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      setError(null);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("assessments")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%`);
      }
      if (filters.assessment_type) {
        query = query.eq("assessment_type", filters.assessment_type);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;

      if (queryError) {
        setError(queryError);
        setData([]);
        toast.error("Failed to fetch assessments");
        return;
      }

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchData]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchData(() => isCancelled);
  }, [fetchData]);

  return { data, totalPages, loading, error, refetch };
}

export function useCreateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("assessments")
        .insert([payload])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Assessment created!");
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

  return { create, loading, error };
}

export function useMyAssessments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from("assessment_results")
        .select(`
          *,
          assessment:assessments!assessment_results_assessment_id_fkey(
            id,
            title,
            assessment_type,
            passing_score
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_deleted", false)
        .order("taken_at", { ascending: false });
      if (error) throw error;
      setData(result || []);
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

export function useSubmitAssessment() {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("assessment_results")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      toast.success("Assessment submitted!");
      return data;
    } catch (err) {
      toast.error(err.message || "Failed to submit assessment");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading };
}
