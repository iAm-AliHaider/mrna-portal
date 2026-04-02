import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export function useAllowanceRequests(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [allowanceData, setAllowanceData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchAllowance = useCallback(async (isCancelled) => {

    if (!employeeId || isCancelled()) return;
    try {
      setLoading(true);
      setError(null);
      const from = page * perPage;
      const to = from + perPage - 1;
      let query = supabase
        .from('allowance_requests')
        .select('*', { count: 'exact' })
        .eq('type', 'allowance')
        .eq('is_deleted', false)
        .eq('created_by', employeeId);

      if (searchQuery) {
        query = query.or(`reason.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.from_date) {
        query = query.gte('requested_date', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('requested_date', filters.to_date);
      }
      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        setError(error);
        setAllowanceData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }
      setAllowanceData(data || []);
      setCount(count || 0); // set count
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage, employeeId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAllowance(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchAllowance]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchAllowance(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchAllowance, employeeId]);

  return { 
    allowanceData, 
    totalPages, 
    error, 
    count, 
    loading,
    refetch 
  };
}

// CREATE HOOK
export function useCreateAllowanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAllowanceRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('allowance_requests')
        .insert([{ ...payload, type: 'allowance' }])
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Allowance request created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createAllowanceRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateAllowanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateAllowanceRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('allowance_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Allowance request updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateAllowanceRequest, loading, error };
}

// DELETE HOOK
export function useDeleteAllowanceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAllowanceRequest = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('allowance_requests');

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
          ? `Deleted ${ids.length} allowance requests successfully.`
          : 'Allowance request deleted successfully.'
      );
      setLoading(false);
      return data;
    } catch (err) {
      if (err.code === '23503') {
        toast.error('Cannot delete allowance request: referenced by other records');
        return null;
      }
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteAllowanceRequest, loading, error };
}

export function useExpenseRequests(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [expenseData, setExpenseData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;

  const fetchExpense = useCallback(async (isCancelled) => {
    if (!employeeId || isCancelled()) return;
    try {
      setLoading(true);
      setError(null);

      const from = page * perPage;
      const to = from + perPage - 1;
      let query = supabase
        .from('allowance_requests')
        .select('*', { count: 'exact' })
        .eq('type', 'expense')
        .eq('is_deleted', false)
        .eq('created_by', employeeId);

      if (searchQuery) {
        query = query.or(`reason.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.from_date) {
        query = query.gte('requested_date', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('requested_date', filters.to_date);
      }
      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        setError(error);
        setExpenseData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }
      setExpenseData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage, employeeId ]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchExpense(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchExpense, employeeId]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (employeeId && !isCancelled) {
        await fetchExpense(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchExpense, employeeId ]);

  return { 
    expenseData, 
    totalPages, 
    error, 
    count, 
    loading,
    refetch 
  };
}

// CREATE HOOK
export function useCreateExpenseRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createExpenseRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('allowance_requests')
        .insert([{ ...payload, type: 'expense' }])
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Expense request created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createExpenseRequest, loading, error };
}

// UPDATE HOOK
export function useUpdateExpenseRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateExpenseRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('allowance_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (sbError) {
        throw sbError;
      }
      
      toast.success('Expense request updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Update failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateExpenseRequest, loading, error };
}

// DELETE HOOK
export function useDeleteExpenseRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteExpenseRequest = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('allowance_requests');

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
          ? `Deleted ${ids.length} expense requests successfully.`
          : 'Expense request deleted successfully.'
      );
      setLoading(false);
      return data;
    } catch (err) {
      if (err.code === '23503') {
        toast.error('Cannot delete expense request: referenced by other records');
        return null;
      }
      setError(err.message || err);
      toast.error(`Deletion failed: ${err.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteExpenseRequest, loading, error };
} 