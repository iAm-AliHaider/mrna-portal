import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../supabaseClient';
import { useUser } from '../../../context/UserContext';

export function usePayStopageRequests(page = 0, searchQuery = '', filters = {}, perPage = 10, type = 'advance_salary') {
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
        .select(`
          *,
          employee:employees!advance_salary_employee_id_fkey(
            id,
            candidate_id,
            candidate:candidates!employees_candidate_id_fkey(
              full_name
            )
          )
        `, { count: 'exact' })
        .eq('is_deleted', false)
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