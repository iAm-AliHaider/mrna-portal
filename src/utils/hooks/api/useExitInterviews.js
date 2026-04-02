import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useExitInterviews(page = 0, searchQuery = "", filters = {}, perPage = 10, isAdmin = false) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = useCallback(async (isCancelled) => {
    try {
      setLoading(true);
      setError(null);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("exit_interviews")
        .select("*", { count: "exact" })
        .eq("is_deleted", false);

      if (!isAdmin && employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (searchQuery) {
        query = query.or(`reason_for_leaving.ilike.%${searchQuery}%,feedback.ilike.%${searchQuery}%`);
      }

      query = query.order("created_at", { ascending: false });
      const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

      if (isCancelled()) return;

      if (queryError) {
        setError(queryError);
        setData([]);
        setTotalPages(0);
        setCount(0);
        toast.error("Failed to fetch exit interviews");
        return;
      }

      const safeCount = totalCount ?? 0;
      setData(result || []);
      setCount(safeCount);
      setTotalPages(Math.ceil(safeCount / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage, employeeId, isAdmin]);

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

export function useCreateExitInterview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("exit_interviews")
        .insert([{ ...payload, created_by: user?.id, updated_by: user?.id }])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Exit interview submitted successfully!");
      return data;
    } catch (err) {
      const message = err.message || err;
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { create, loading, error };
}

export function useUpdateExitInterview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("exit_interviews")
        .update({ ...payload, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Exit interview updated!");
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { update, loading, error };
}

export function useDeleteExitInterview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { error: sbError } = await supabase
        .from("exit_interviews")
        .update({ is_deleted: true })
        .eq("id", id);
      if (sbError) throw sbError;
      toast.success("Exit interview deleted.");
      return true;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteRecord, loading, error };
}
