import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../../supabaseClient";
import { useUser } from "../../../context/UserContext";

export function useLeaveAdjustment(page = 0, searchQuery = "", filters = {}, perPage = 10) {
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

        let query = supabase
          .from("leave_adjustments")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .eq("employee_id", employeeId);

        if (searchQuery) {
          query = query.or(`reason.ilike.%${searchQuery}%`);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        query = query.order("created_at", { ascending: false });
        const { data: result, error: queryError, count: totalCount } = await query.range(from, to);

        if (isCancelled()) return;

        if (queryError) {
          setError(queryError);
          setData([]);
          setTotalPages(0);
          setCount(0);
          toast.error("Failed to fetch leave adjustments");
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

export function useCreateLeaveAdjustment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("leave_adjustments")
        .insert([payload])
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Leave adjustment submitted successfully!");
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

export function useUpdateLeaveAdjustment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("leave_adjustments")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (sbError) throw sbError;
      toast.success("Leave adjustment updated!");
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

export function useDeleteLeaveAdjustment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { error: sbError } = await supabase
        .from("leave_adjustments")
        .update({ is_deleted: true })
        .eq("id", id);
      if (sbError) throw sbError;
      toast.success("Leave adjustment deleted successfully.");
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
