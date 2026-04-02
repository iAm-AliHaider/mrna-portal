import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-hot-toast';

// Hook for fetching succession planning with pagination and filters
export function useSuccessionPlanning(page = 0, searchQuery = '', filters = {}, perPage = 10) {
  const [successionData, setSuccessionData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSuccessionPlanning = useCallback(async (isCancelled) => {
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from('succession_planning')
        .select(`*`, { count: 'exact' })
        .eq('is_deleted', false);

      if (searchQuery) {
        query = query.or(`position.ilike.%${searchQuery}%`);
      }

      if (filters.position) {
        query = query.eq('position', filters.position);
      }
      if (filters.succession_to) {
        query = query.eq('succession_to', filters.succession_to);
      }
     
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (isCancelled()) return;

      if (error) {
        setError(error);
        setSuccessionData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      setSuccessionData(data || []);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
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
        await fetchSuccessionPlanning(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchSuccessionPlanning]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchSuccessionPlanning(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchSuccessionPlanning]);

  return { successionData, totalPages, error, count, loading, refetch };
}

// Hook for fetching a single succession planning by ID
export function useSuccessionPlanningById(id) {
  const [successionPlanning, setSuccessionPlanning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuccessionPlanning = useCallback(async (isCancelled) => {
    if (!id) return;
    
    try {
      if(!isCancelled()) {
        setLoading(true);
        setError(null);
      }
      
      const { data, error } = await supabase
        .from("succession_planning")
        .select(`
          *,
          positions:position(name),
          successors:succession_to(
            candidates(first_name, family_name, employee_code)
          )
        `)
        .eq("id", Number(id))
        .eq('is_deleted', false)
        .single();

      if (isCancelled()) return;

      if (error) {
        setError(error);
        toast.error(`Error fetching succession planning: ${error.message}`);
        return;
      }

      setSuccessionPlanning(data);
    } catch (err) {
      if(!isCancelled()) {
        setError(err);
        toast.error(`Error fetching succession planning: ${err.message}`);
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
        await fetchSuccessionPlanning(() => isCancelled);
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [fetchSuccessionPlanning]);

  const refetch = useCallback(() => {
    let isCancelled = false;
    const executeFetch = async () => {
      if (!isCancelled) {
        await fetchSuccessionPlanning(() => isCancelled);
      }
    };
    executeFetch();
  }, [fetchSuccessionPlanning]);

  return { successionPlanning, loading, error, refetch };
}

// Hook for creating a new succession planning record
export function useCreateSuccessionPlanning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSuccessionPlanning = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('succession_planning')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error);
        toast.error(`Error creating succession planning: ${error.message}`);
        return { data: null, error: error };
      }

      toast.success('Succession planning created successfully!');
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Creation failed: ${err?.message || err}`);
      setLoading(false);
      return { data: null, error: err?.message || err };
    }
  }, []);

  return { createSuccessionPlanning, loading, error };
}

// Hook for updating an existing succession planning
export function useUpdateSuccessionPlanning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSuccessionPlanning = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('succession_planning')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setError(error);
        return { data: null, error: error };
      }

      toast.success('Succession planning updated successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Update failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { updateSuccessionPlanning, loading, error };
}

// Hook for soft deleting a succession planning
export function useDeleteSuccessionPlanning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteSuccessionPlanning = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('succession_planning');

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

      toast.success('Succession planning deleted successfully!');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.message || err);
      toast.error(`Deletion failed: ${err?.message || err}`);
      setLoading(false);
      return null;
    }
  }, []);

  return { deleteSuccessionPlanning, loading, error };
} 