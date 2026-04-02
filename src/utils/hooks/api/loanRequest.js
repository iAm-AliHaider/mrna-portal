import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { supaBasegetAllCall } from '../../common';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

export function useLoanRequests(page = 0, searchQuery = '', filters = {}, perPage = 10, employeeId) {
  const [loanData, setLoanData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loanOptions, setLoanOptions] = useState([]);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const currentEmployeeId = employeeId || user?.id;

  const fetchLoans = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      // Fetch all loan types
      const loanTypes = await supaBasegetAllCall('loan_types') || [];

      let query = supabase
        .from('loan_requests')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);
        if (currentEmployeeId) {
          query = query.eq('employee_id', currentEmployeeId);
        }

      if (searchQuery) {
        query = query.or(`reason.ilike.%${searchQuery}%`);
      }

      if (filters.request_date) {
        query = query.eq('request_date', filters.request_date);
      }
      if (filters.created_from) {
        query = query.gte('created_at', filters.created_from);
      }
      if (filters.created_to) {
        query = query.lte('created_at', filters.created_to);
      }
      if (filters.min_amount) {
        query = query.gte('requested_amount', filters.min_amount);
      }
      if (filters.max_amount) {
        query = query.lte('requested_amount', filters.max_amount);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setLoanData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      // Map loan_type_id to name
      const mappedData = (data || []).map(row => {
        const type = loanTypes.find(t => t.id === row.loan_type_id);
        return {
          ...row,
          loan_type_name: type ? type.name : row.loan_type_id
        };
      });

      if(error) {
        setError(error);
        setLoanData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setLoanData(mappedData || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setLoanOptions(
        (data || []).map((r) => ({
          label: r.reason || `Request #${r.id}`,
          value: r.id,
        }))
      );
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [currentEmployeeId, page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchLoans(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchLoans]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchLoans(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchLoans]);
  

  return { loanData, totalPages, loanOptions, error, count, loading, refetch };
}

export function useCreateLoanRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLoanRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Loan request created successfully!');
      setLoading(false);
      return  data
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createLoanRequest, loading, error };
}

export function useUpdateLoanRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLoanRequest = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Loan request updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateLoanRequest, loading, error };
}

export function useDeleteLoanRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteLoanRequest = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('loan_requests');

      if (Array.isArray(id)) {
        query = query.update({ is_deleted: true }).in('id', id);
      } else {
        query = query.update({ is_deleted: true }).eq('id', id);
      }

      const { data, error } = await query.select();

      if (error) {
        setError(error);
        toast.error(`Deletion failed: ${error.message}`);
        return null;
      }

      toast.success('Loan request deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteLoanRequest, loading, error };
}

