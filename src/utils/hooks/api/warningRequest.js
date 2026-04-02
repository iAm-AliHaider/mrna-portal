import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

export function useWarningRequests(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [warningData, setWarningData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const fetchWarnings = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('warning_letter')
        .select(`*, employee: employees!warning_letter_employee_id_fkey(*, candidate: candidates!employees_candidate_id_fkey (
          *
        ))`, { count: 'exact' })
        .eq('is_deleted', false)
        .neq('created_by', user?.id);   

      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,warning.ilike.%${searchQuery}%`);
      }        

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.from_date) {
        query = query.gte('effected_date', filters.from_date);
      }

      if (filters.to_date) {
        query = query.lte('effected_date', filters.to_date);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setWarningData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setWarningData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) {
        setError(err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
    }, [page, perPage, searchQuery, filters, user?.id]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchWarnings(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchWarnings]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchWarnings(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchWarnings]);

  return {
    warningData,
    totalPages,
    error,
    count,
    loading,
    refetch
  };
}

export function useCreateWarningRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createWarningRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase
        .from('warning_letter')
        .insert([payload])
        .select()
        .single();

      if (sbError) throw sbError;

      toast.success('Warning letter created successfully!');
      return data;
    } catch (err) {
      setError(err.message || err);
      toast.error(`Creation failed: ${err.message || err}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createWarningRequest, loading, error };
} 

export function useMyWarningsList(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [warningData, setWarningData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const employeeId = user?.id;


  const fetchWarnings = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }

      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('warning_letter')
        .select(`*`, { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId)

      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,warning.ilike.%${searchQuery}%`);
      }        

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.from_date) {
        query = query.gte('effected_date', filters.from_date);
      }

      if (filters.to_date) {
        query = query.lte('effected_date', filters.to_date);
      }

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setWarningData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setWarningData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) {
        setError(err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, [page, perPage, searchQuery, filters, employeeId]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchWarnings(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchWarnings]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchWarnings(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchWarnings, employeeId]);

  return {
    warningData,
    totalPages,
    error,
    count,
    loading,
    refetch
  };
}