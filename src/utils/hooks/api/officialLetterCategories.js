import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

// Fetch official letter categories
export function useOfficialLetterCategories(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [categoriesData, setCategoriesData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (isCancelled) => {
    try {
      if (!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('official_letters_categories')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (searchQuery) {
        query = query.ilike('category', `%${searchQuery}%`);
      }

      if (filters.category) query = query.ilike('category', `%${filters.category}%`);
      if (filters.notes) query = query.ilike('notes', `%${filters.notes}%`);

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setCategoriesData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setCategoriesData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      if (!isCancelled()) setError(err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;
    fetchCategories(() => isCancelled);
    return () => { isCancelled = true; };
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    fetchCategories(() => isCancelled);
  }, [fetchCategories]);

  return { categoriesData, totalPages, error, count, loading, refetch };
}

// Create new official letter category
export function useCreateOfficialLetterCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * payload fields:
   * category (text) - required
   * notes (text) - optional
   * created_by (int) - from user.id
   * updated_by (int) - from user.id
   */
  const createOfficialLetterCategory = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('official_letters_categories')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Creation failed: ${error.message}`);
        return { data: null, error: error };
      }

      toast.success('Official letter category created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createOfficialLetterCategory, loading, error };
}

// Update official letter category
export function useUpdateOfficialLetterCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateOfficialLetterCategory = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('official_letters_categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Update failed: ${error.message}`);
        return { data: null, error: error };
      }

      toast.success('Official letter category updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateOfficialLetterCategory, loading, error };
}

// Delete official letter category (soft delete)
export function useDeleteOfficialLetterCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteOfficialLetterCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('official_letters_categories');
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

      toast.success('Official letter category deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteOfficialLetterCategory, loading, error };
} 