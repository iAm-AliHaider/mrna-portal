import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useLearningPathways(page = 0, searchQuery = "", perPage = 20) {
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
        .from("learning_pathways")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;

      if (queryError) {
        setError(queryError);
        setData([]);
        toast.error("Failed to fetch learning pathways");
        return;
      }

      setData(result || []);
      setTotalPages(Math.ceil((totalCount ?? 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, perPage]);

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

export function useCreateLearningPathway() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("learning_pathways")
        .insert([payload])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Learning pathway created!");
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

export function useUpdateLearningPathway() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("learning_pathways")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Learning pathway updated!");
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}

export function useMyLearningPathway() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from("employee_learning_pathways")
        .select(`
          *,
          pathway:learning_pathways!employee_learning_pathways_pathway_id_fkey(
            id,
            name,
            description
          ),
          progress
        `)
        .eq("employee_id", employeeId)
        .eq("is_deleted", false);
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
