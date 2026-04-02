import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

// Fetch official letters
export function useOfficialLetters(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const { user } = useUser();
  const [officialLettersData, setOfficialLettersData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const employeeId = user?.id;
  const fetchLetters = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('official_letters')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .eq('employee_id', employeeId);

      if (searchQuery) {
        query = query.or(`reason.ilike.%${searchQuery}%`);
      }
      
      if (filters.status) query = query.eq('status', filters.status);

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setOfficialLettersData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setOfficialLettersData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [employeeId, page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchLetters(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchLetters]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchLetters(() => isCancelled);
  }, [fetchLetters]);

  return { officialLettersData, totalPages, error, count, loading, refetch };
}

// Create new official letter
export function useCreateOfficialLetter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const createOfficialLetter = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('official_letters')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Creation failed: ${error.message}`);
        return { data: null, error: error };
      }

      toast.success('Official letter created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createOfficialLetter, loading, error };
}