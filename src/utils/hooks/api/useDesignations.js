import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { supaBasegetAllCall } from '../../common';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';

// Hook for fetching designations with pagination and filters
export function useDesignations(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [designationsData, setDesignationsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [designationNames, setDesignationNames] = useState([]);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchDesignations = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('designations')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
      }

      if (filters.designation_code) {
        query = query.eq('code', filters.designation_code);
      }
      if (filters.from_date) {
        query = query.gte('created_at', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('created_at', filters.to_date);
      }

      query = query.order('created_at', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setDesignationsData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setDesignationsData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setDesignationNames(
        (data || []).map((d) => ({ label: d.name, value: d.id }))
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
  }, [page, searchQuery, filters, perPage]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDesignations(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDesignations]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDesignations(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDesignations]);

  return { designationsData, totalPages, designationNames, error, count, loading, refetch };
}

// Hook for fetching a single designation by ID
export function useDesignation(id) {
  const [designation, setDesignation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDesignation = useCallback(async (isCancelled) => {
    if (!id) return;
    
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      
      const { data, error } = await supabase
        .from("designations")
        .select("*")
        .eq("id", Number(id))
        .eq('is_deleted', false)
        .single();

      if (isCancelled()) return;

      if (error) {
        setError(error);
        toast.error(`Error fetching designation: ${error.message}`);
        return;
      }

      setDesignation(data);
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
        toast.error(`Error fetching designation: ${err.message}`);
      }
    } finally {
      if(!isCancelled()) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDesignation(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchDesignation]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchDesignation(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchDesignation]);

  return { designation, loading, error, refetch };
}

// Hook for creating a new designation
export function useCreateDesignation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDesignation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('designations')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Designation created successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { createDesignation, loading, error };
}

// Hook for updating an existing designation
export function useUpdateDesignation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDesignation = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('designations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Designation updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateDesignation, loading, error };
}

// Hook for soft deleting a designation
export function useDeleteDesignation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteDesignation = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('designations');

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

      toast.success('Designation deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteDesignation, loading, error };
}