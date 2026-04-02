import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export function useAdvanceSalaryRequests(page = 0, searchQuery = '', filters = {}, perPage = 10, type = 'advance_salary') {
  const [advanceSalaryData, setAdvanceSalaryData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id;

  const fetchAdvanceSalary = useCallback(async (isCancelled) => {
    if (!employeeId || isCancelled()) return;

    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('advance_salary')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId)
        .eq('type', type);

      if (searchQuery) {
        query = query.or(
          `reason.ilike.%${searchQuery}%`
        );
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.requested_date) {
        query = query.eq('requested_date', filters.requested_date);
      }

      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from);
      }

      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to);
      }

      if (filters.min_amount) {
        query = query.gte('amount', filters.min_amount);
      }

      if (filters.max_amount) {
        query = query.lte('amount', filters.max_amount);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setAdvanceSalaryData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setAdvanceSalaryData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, perPage, searchQuery, filters, employeeId, type]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAdvanceSalary(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchAdvanceSalary, employeeId]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAdvanceSalary(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchAdvanceSalary, employeeId]);

  return {
    advanceSalaryData,
    totalPages,
    error,
    count,
    loading,
    refetch
  };
}

// CREATE HOOK
export function useCreateAdvanceSalaryRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAdvanceSalaryRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('advance_salary')
        .insert([payload])
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Advance salary request created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createAdvanceSalaryRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateAdvanceSalaryRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAdvanceSalaryRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('advance_salary')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Advance salary request updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateAdvanceSalaryRequest, loading, error };
}

// DELETE HOOK
export function useDeleteAdvanceSalaryRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAdvanceSalaryRequest = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('advance_salary');

      if (Array.isArray(ids)) {
        query = query.update({ is_deleted: true }).in('id', ids);
      } else {
        query = query.update({ is_deleted: true }).eq('id', ids);
      }

      const { error: sbError, data } = await query;

      if (sbError) {
        throw sbError;
      }

      toast.success(
        Array.isArray(ids)
          ? `Deleted ${ids.length} advance salary requests successfully.`
          : 'Advance salary request deleted successfully.'
      );
      setLoading(false);
      return data;
    } catch (err) {
      if (err.code === '23503') {
        toast.error('Cannot delete advance salary request: referenced by other records');
        return null;
      }
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteAdvanceSalaryRequest, loading, error };
} 